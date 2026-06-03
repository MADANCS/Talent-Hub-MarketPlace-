const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateAIMatch } = require('../utils/helpers');
const { createZoomMeeting, createGoogleMeet } = require('../utils/meetingService');
const { sendInterviewInvitation } = require('../utils/emailService');
const { synthesizeInterviewVerdict } = require('../utils/aiService');

// @desc   Apply for a job
// @route  POST /api/applications
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, answers } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });

    const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this job' });

    const candidate = await User.findById(req.user._id);

    // AI Match calculation
    const aiMatchDetails = await calculateAIMatch(job, candidate);
    const aiMatchScore = aiMatchDetails.score;

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      recruiter: job.recruiter,
      coverLetter,
      answers: answers || [],
      resumeUrl: candidate.resumeUrl,
      aiMatchScore,
      aiMatchDetails,
      aiAnalyzed: true,
      timeline: [{ status: 'APPLIED', note: 'Application submitted', changedBy: req.user._id }]
    });

    // Increment job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Gamification update for candidate
    candidate.gamification.experience += 20; // XP for applying
    const totalApps = await Application.countDocuments({ candidate: req.user._id });
    if (totalApps === 0 && !candidate.gamification.badges.some(b => b.name === 'First Steps')) {
      candidate.gamification.badges.push({
        name: 'First Steps',
        icon: '🚀',
        description: 'Initiated first mission deployment'
      });
    }
    const newLevel = Math.floor(candidate.gamification.experience / 100) + 1;
    if (newLevel > candidate.gamification.level) {
      candidate.gamification.level = newLevel;
    }
    await candidate.save();

    // Add Gamification XP
    const { addExperience } = require('../utils/gamificationService');
    await addExperience(req.user._id, 100, 'Applied for a job');

    // Notify recruiter
    await Notification.create({
      recipient: job.recruiter,
      sender: req.user._id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application Received',
      message: `${candidate.name} applied for "${job.title}" with ${aiMatchScore}% AI match score`,
      data: { applicationId: application._id, jobId, aiMatchScore },
      link: `/recruiter/applications/${application._id}`,
      priority: aiMatchScore >= 75 ? 'HIGH' : 'NORMAL'
    });

    // Notify candidate
    await Notification.create({
      recipient: req.user._id,
      type: 'APPLICATION_RECEIVED',
      title: 'Application Submitted! ✅',
      message: `Your application for "${job.title}" at ${job.company} has been submitted successfully.`,
      data: { applicationId: application._id },
      link: `/candidate/applications`
    });

    const populated = await Application.findById(application._id)
      .populate('job', 'title company location jobType')
      .populate('candidate', 'name email avatar');

    // Emit real-time event for live feed
    if (req.io) {
      req.io.emit('new_talent_activity', {
        id: application._id,
        name: candidate.name,
        action: `Applied for ${job.title}`,
        time: 'Just now'
      });
    }

    res.status(201).json({ success: true, message: 'Application submitted successfully', application: populated });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get candidate's applications
// @route  GET /api/applications/my-applications
const getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { candidate: req.user._id };
    if (status) query.status = status;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('job', 'title company location jobType salaryMin salaryMax companyLogo')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const stats = {
      total: await Application.countDocuments({ candidate: req.user._id }),
      applied: await Application.countDocuments({ candidate: req.user._id, status: 'APPLIED' }),
      shortlisted: await Application.countDocuments({ candidate: req.user._id, status: 'SHORTLISTED' }),
      interview: await Application.countDocuments({ candidate: req.user._id, status: 'INTERVIEW' }),
      hired: await Application.countDocuments({ candidate: req.user._id, status: 'HIRED' }),
      rejected: await Application.countDocuments({ candidate: req.user._id, status: 'REJECTED' })
    };

    res.json({ success: true, applications, stats, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get applications for a job (recruiter)
// @route  GET /api/applications/job/:jobId
const getJobApplications = async (req, res) => {
  try {
    const { status, sort = '-aiMatchScore', page = 1, limit = 20 } = req.query;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const query = { job: req.params.jobId };
    if (status) query.status = status;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('candidate', 'name email avatar skills experience education location phone resumeUrl linkedinUrl githubUrl')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, applications, total, pages: Math.ceil(total / limit), currentPage: Number(page), job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update application status
// @route  PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, note, interviewDetails, offerDetails } = req.body;
    const application = await Application.findById(req.params.id).populate('job candidate');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const prevStatus = application.status;
    application.status = status;
    
    // Add to timeline
    application.timeline.push({ 
      status, 
      note: note || `Status transitioned from ${prevStatus} to ${status}`, 
      changedBy: req.user._id 
    });

    // Special handling for specific statuses
    if (status === 'INTERVIEW' && interviewDetails) {
      application.interviews.push({
        ...interviewDetails,
        status: 'SCHEDULED'
      });
    }

    if (status === 'OFFER' && offerDetails) {
      application.offerDetails = {
        ...offerDetails,
        accepted: false
      };
    }

    await application.save();

    // Notify candidate with realistic messaging
    const notifMap = {
      SCREENING: { title: '🔍 Application Review', msg: `Your application for "${application.job.title}" is now being reviewed.` },
      SHORTLISTED: { title: '🚀 Great News!', msg: `You've been shortlisted for "${application.job.title}". Expect an interview invitation soon.` },
      INTERVIEW: { title: '📅 Interview Scheduled', msg: `An interview round has been scheduled for "${application.job.title}".` },
      TECHNICAL: { title: '💻 Technical Evaluation', msg: `You've moved to the technical assessment stage for "${application.job.title}".` },
      OFFER: { title: '🎊 Official Offer Received', msg: `Congratulations! ${application.job.company} has extended an offer to you for "${application.job.title}".` },
      HIRED: { title: '✅ Mission Success: Hired', msg: `Welcome to the team! Your application for "${application.job.title}" is complete.` },
      REJECTED: { title: 'Application Update', msg: `Thank you for your interest in "${application.job.title}". We've decided to move forward with other candidates.` }
    };

    if (notifMap[status]) {
      await Notification.create({
        recipient: application.candidate._id,
        sender: req.user._id,
        type: 'APPLICATION_STATUS_CHANGE',
        title: notifMap[status].title,
        message: notifMap[status].msg,
        data: { applicationId: application._id, status },
        priority: ['OFFER', 'HIRED', 'SHORTLISTED'].includes(status) ? 'HIGH' : 'NORMAL'
      });
    }

    // Real-time update for candidate if connected
    if (req.io) {
      req.io.to(application.candidate._id.toString()).emit('application_update', {
        applicationId: application._id,
        status,
        message: notifMap[status]?.msg
      });
    }

    res.json({ success: true, message: `Application updated to ${status}`, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Add recruiter note to application
// @route  PATCH /api/applications/:id/notes
const updateApplicationNotes = async (req, res) => {
  try {
    const { recruiterNotes, rating, tags } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    
    // Authorization check
    const job = await Job.findById(application.job);
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (recruiterNotes !== undefined) application.recruiterNotes = recruiterNotes;
    if (rating !== undefined) application.rating = rating;
    if (tags !== undefined) application.tags = tags;

    await application.save();
    res.json({ success: true, message: 'Assessment updated', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Schedule or update interview
// @route  POST /api/applications/:id/interviews
const scheduleInterview = async (req, res) => {
  try {
    const { type, scheduledAt, duration, meetingLink, notes } = req.body;
    const application = await Application.findById(req.params.id).populate('job candidate');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Authorization
    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    let finalMeetingLink = meetingLink;

    // Generate link if provider is Zoom or Google
    if (type === 'ZOOM') {
      const zoomMeeting = await createZoomMeeting(
        `Interview: ${application.candidate.name} - ${application.job.title}`,
        scheduledAt,
        duration
      );
      finalMeetingLink = zoomMeeting.join_url;
    } else if (type === 'GOOGLE_MEET') {
      const googleMeeting = await createGoogleMeet(
        `Interview: ${application.candidate.name} - ${application.job.title}`,
        scheduledAt,
        duration
      );
      finalMeetingLink = googleMeeting.hangoutLink;
    } else if (type === 'VIDEO' && !finalMeetingLink) {
      // Internal Agora Meet - ensure absolute URL for emails
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      finalMeetingLink = `${clientUrl}/interview/${application._id}`;
    }

    const newInterview = {
      type: type || 'VIDEO',
      scheduledAt,
      duration,
      meetingLink: finalMeetingLink,
      notes,
      status: 'SCHEDULED'
    };

    application.interviews.push(newInterview);
    application.status = 'INTERVIEW';
    application.timeline.push({ 
      status: 'INTERVIEW', 
      note: `New ${type} interview scheduled for ${new Date(scheduledAt).toLocaleString()}`, 
      changedBy: req.user._id 
    });

    await application.save();

    // Create corresponding document in the Interview collection for tracking the session
    const Interview = require('../models/Interview');
    const { v4: uuidv4 } = require('uuid');
    const agoraChannel = `interview_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const inviteToken = uuidv4();

    await Interview.create({
      application: application._id,
      job: application.job._id,
      candidate: application.candidate._id,
      recruiter: req.user._id,
      title: `Technical Interview - Round ${application.interviews.length}`,
      type: type === 'VIDEO' ? 'LIVE' : (type || 'LIVE'),
      round: application.interviews.length,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      agoraChannel,
      inviteToken,
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      participants: [
        { user: req.user._id, role: 'RECRUITER' },
        { user: application.candidate._id, role: 'CANDIDATE' }
      ],
      timeline: [{ event: 'CREATED', description: 'Interview session created', timestamp: new Date() }]
    });

    // Send Email Notification
    await sendInterviewInvitation(
      application.candidate.email,
      req.user.name,
      application.job.title,
      application.job.company,
      newInterview
    );

    // Notify candidate
    await Notification.create({
      recipient: application.candidate._id,
      sender: req.user._id,
      type: 'INTERVIEW_SCHEDULED',
      title: '📅 New Interview Round',
      message: `Your ${type} interview for "${application.job.title}" has been scheduled.`,
      data: { applicationId: application._id, scheduledAt, meetingLink: finalMeetingLink },
      link: '/candidate/applications',
      priority: 'HIGH'
    });

    res.json({ success: true, message: 'Interview scheduled successfully', application, meetingLink: finalMeetingLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Withdraw application
// @route  PUT /api/applications/:id/withdraw
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, candidate: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (['HIRED', 'REJECTED'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw at this stage' });
    }
    application.status = 'WITHDRAWN';
    application.withdrawnReason = req.body.reason || '';
    application.timeline.push({ status: 'WITHDRAWN', note: req.body.reason || 'Withdrawn by candidate', changedBy: req.user._id });
    await application.save();
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all applications (recruiter)
// @route  GET /api/applications/recruiter
const getRecruiterApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { recruiter: req.user._id };
    if (status) query.status = status;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('job', 'title company')
      .populate('candidate', 'name email avatar skills location')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const stats = {
      total: await Application.countDocuments({ recruiter: req.user._id }),
      applied: await Application.countDocuments({ recruiter: req.user._id, status: 'APPLIED' }),
      shortlisted: await Application.countDocuments({ recruiter: req.user._id, status: 'SHORTLISTED' }),
      interview: await Application.countDocuments({ recruiter: req.user._id, status: 'INTERVIEW' }),
      hired: await Application.countDocuments({ recruiter: req.user._id, status: 'HIRED' })
    };

    res.json({ success: true, applications, stats, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   AI Generate interview questions
// @route  POST /api/applications/:id/generate-questions
const generateInterviewQuestions = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name skills bio')
      .populate('job', 'title description skills');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
      return res.json({ 
        success: true, 
        questions: [
          "Can you walk us through your experience with React?",
          "How do you handle state management in large scale applications?",
          "Tell us about a challenging technical problem you solved recently."
        ]
      });
    }

    const { Anthropic } = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `
      As an expert interviewer, generate 5 targeted interview questions for a candidate applying for the "${application.job.title}" role.
      
      Candidate Profile:
      - Name: ${application.candidate.name}
      - Skills: ${application.candidate.skills.join(', ')}
      - Bio: ${application.candidate.bio}
      
      Job Requirements:
      - Title: ${application.job.title}
      - Key Skills: ${application.job.skills.join(', ')}
      
      The questions should be a mix of technical and behavioral, focusing on the overlap between the candidate's skills and the job requirements.
      Return ONLY a raw JSON array of strings. Do not include markdown formatting or any other text.
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const text = response.content[0].text;
    const jsonStr = text.replace(/```json|```/g, "").trim();
    
    res.json({ success: true, questions: JSON.parse(jsonStr) });
  } catch (error) {
    console.error('Claude AI Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   AI Generate Cover Letter
// @route  POST /api/applications/generate-cover-letter
const generateCoverLetter = async (req, res) => {
  try {
    const { jobId } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    
    const candidate = await User.findById(req.user._id);

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      return res.json({ 
        success: true, 
        coverLetter: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in ${candidate.skills.slice(0,3).join(', ')}, I am confident in my ability to contribute effectively to your team.\n\nThank you for your time and consideration.\n\nSincerely,\n${candidate.name}` 
      });
    }

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Write a professional, compelling, and tailored cover letter for a candidate applying for a job.
    
    Candidate Name: ${candidate.name}
    Candidate Skills: ${candidate.skills.join(', ')}
    Candidate Bio: ${candidate.bio || 'Experienced professional.'}
    
    Job Title: ${job.title}
    Company Name: ${job.company}
    Job Skills Required: ${job.skills.join(', ')}
    
    Keep the cover letter under 300 words. Do not include placeholders like "[Your Phone Number]".
    Make it sound confident, highlighting how the candidate's specific skills match the job requirements.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ success: true, coverLetter: response.text() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update interview feedback
// @route  PUT /api/applications/:id/interviews/:interviewId
const updateInterviewFeedback = async (req, res) => {
  try {
    const { rating, feedback, technicalSkills, cultureFit, status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Authorization
    const job = await Job.findById(application.job);
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const interview = application.interviews.id(req.params.interviewId);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    if (rating !== undefined) interview.rating = rating;
    if (feedback !== undefined) interview.feedback = feedback;
    if (status !== undefined) interview.status = status;
    
    // Custom fields (we can store them in a notes object or meta if we had it, but for now we'll append to feedback)
    if (technicalSkills || cultureFit) {
      const extra = `\n[Scores: Technical: ${technicalSkills || 'N/A'}, Culture: ${cultureFit || 'N/A'}]`;
      if (!interview.feedback.includes('[Scores:')) {
        interview.feedback += extra;
      }
    }

    application.timeline.push({ 
      status: application.status, 
      note: `Interview evaluation completed for ${interview.type} round. Rating: ${rating}/5`, 
      changedBy: req.user._id 
    });

    await application.save();

    res.json({ success: true, message: 'Evaluation saved successfully', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   AI Synthesis of interview results
// @route  POST /api/applications/:id/ai-verdict
const generateAIVerdict = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate job')
      .populate('interviews');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Authorization
    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const verdict = await synthesizeInterviewVerdict(
      application.candidate,
      application.job,
      application.interviews,
      application.recruiterNotes
    );

    application.aiVerdict = verdict;
    await application.save();

    res.json({ success: true, verdict });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update interview candidate feedback
// @route  PUT /api/applications/:id/interviews/:interviewId/candidate-feedback
const updateInterviewCandidateFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Authorization
    if (application.candidate.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const interview = application.interviews.id(req.params.interviewId);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    interview.candidateRating = rating;
    interview.candidateFeedback = feedback;

    await application.save();

    res.json({ success: true, message: 'Your feedback has been logged. Thank you!', application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get Application by ID
// @route  GET /api/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'name email skills bio experience education avatar');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check ownership
    const isCandidate = application.candidate._id.toString() === req.user.id;
    const isRecruiter = application.recruiter.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isCandidate && !isRecruiter && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getApplicationById,
  applyForJob, 
  getMyApplications, 
  getJobApplications, 
  updateApplicationStatus, 
  withdrawApplication, 
  getRecruiterApplications, 
  generateInterviewQuestions, 
  generateCoverLetter,
  updateApplicationNotes,
  scheduleInterview,
  updateInterviewFeedback,
  generateAIVerdict,
  updateInterviewCandidateFeedback
};

