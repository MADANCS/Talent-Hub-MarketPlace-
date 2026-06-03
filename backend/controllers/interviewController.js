const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { generateInterviewQuestion, generateCodingChallenge, analyzeInterviewCode } = require('../utils/aiService');

// ─── Agora Token ────────────────────────────────────────────────────────────
const generateAgoraToken = async (req, res) => {
  try {
    const { channelName } = req.body;
    if (!channelName) return res.status(400).json({ success: false, message: 'Channel name is required' });

    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appID || !appCertificate) {
      if (process.env.NODE_ENV === 'development') {
        return res.json({ success: true, token: 'mock_token', isMock: true });
      }
      return res.status(500).json({ success: false, message: 'Agora credentials not configured' });
    }

    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Code Execution via Piston API (free, no key needed) ────────────────────
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python:     { language: 'python',     version: '3.10.0'  },
  java:       { language: 'java',       version: '15.0.2'  },
  cpp:        { language: 'c++',        version: '10.2.0'  },
  c:          { language: 'c',          version: '10.2.0'  },
  go:         { language: 'go',         version: '1.16.2'  },
  rust:       { language: 'rust',       version: '1.50.0'  },
  typescript: { language: 'typescript', version: '5.0.3'   },
  php:        { language: 'php',        version: '8.2.3'   },
  ruby:       { language: 'ruby',       version: '3.0.1'   },
  sql:        { language: 'sqlite3',    version: '3.36.0'  },
};

const executeCode = async (req, res) => {
  const { code, language = 'javascript', stdin = '' } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

  const lang = LANGUAGE_MAP[language.toLowerCase()];
  if (!lang) return res.status(400).json({ success: false, message: `Unsupported language: ${language}` });

  try {
    const startTime = Date.now();
    const response = await axios.post(PISTON_URL, {
      language: lang.language,
      version: lang.version,
      files: [{ name: `solution.${language}`, content: code }],
      stdin,
      run_timeout: 10000, // 10s max
      compile_timeout: 15000,
    }, { timeout: 20000 });

    const runtime = Date.now() - startTime;
    const { run, compile } = response.data;

    res.json({
      success: true,
      stdout: run?.stdout || '',
      stderr: (compile?.stderr || '') + (run?.stderr || ''),
      exitCode: run?.code ?? 0,
      signal: run?.signal,
      runtime,
      language
    });
  } catch (error) {
    // Fallback: if Piston is down, run JS locally for JavaScript
    if (language === 'javascript') {
      try {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(String).join(' ')),
          error: (...args) => logs.push('ERROR: ' + args.map(String).join(' ')),
          warn: (...args) => logs.push('WARN: ' + args.map(String).join(' ')),
        };
        const runner = new Function('console', code);
        runner(customConsole);
        return res.json({ success: true, stdout: logs.join('\n') || 'Executed (no output)', stderr: '', exitCode: 0, runtime: 0, language, fallback: true });
      } catch (jsErr) {
        return res.json({ success: true, stdout: '', stderr: jsErr.message, exitCode: 1, runtime: 0, language, fallback: true });
      }
    }
    res.status(500).json({ success: false, message: 'Code execution service unavailable', error: error.message });
  }
};

// ─── AI Code Analysis ────────────────────────────────────────────────────────
const analyzeInterview = async (req, res) => {
  try {
    const { code, question, language = 'javascript' } = req.body;
    const analysis = await analyzeInterviewCode(code, question, language);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Generate AI Interview Question ──────────────────────────────────────────
const generateQuestion = async (req, res) => {
  try {
    const { context, type = 'technical', difficulty = 'medium' } = req.body;
    const question = await generateInterviewQuestion({ context, type, difficulty });
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Generate AI Coding Challenge ────────────────────────────────────────────
const generateChallenge = async (req, res) => {
  try {
    const { context, difficulty = 'medium', language = 'javascript' } = req.body;
    const challenge = await generateCodingChallenge({ context, difficulty, language });
    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create Interview Session ─────────────────────────────────────────────────
const createInterviewSession = async (req, res) => {
  try {
    const {
      applicationId, scheduledAt, duration = 60,
      type = 'LIVE', title = 'Technical Interview', round = 1
    } = req.body;

    const application = await Application.findById(applicationId)
      .populate('applicant', 'name email')
      .populate('job', 'title company');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const agoraChannel = `interview_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    const inviteToken = uuidv4();

    const interview = await Interview.create({
      application: applicationId,
      job: application.job._id,
      candidate: application.applicant._id,
      recruiter: req.user._id,
      title,
      type,
      round,
      scheduledAt: new Date(scheduledAt),
      duration,
      agoraChannel,
      inviteToken,
      inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      participants: [
        { user: req.user._id, role: 'RECRUITER' },
        { user: application.applicant._id, role: 'CANDIDATE' }
      ],
      timeline: [{ event: 'CREATED', description: 'Interview session created', timestamp: new Date() }]
    });

    // Notify candidate via Socket.io
    if (req.io) {
      req.io.to(String(application.applicant._id)).emit('interview_scheduled', {
        interviewId: interview._id,
        title: interview.title,
        scheduledAt: interview.scheduledAt,
        jobTitle: application.job.title,
        recruiterName: req.user.name
      });
    }

    res.status(201).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Interview Session ────────────────────────────────────────────────────
const getInterviewSession = async (req, res) => {
  try {
    let interview = await Interview.findById(req.params.id)
      .populate('candidate', 'name email avatar skills experience')
      .populate('recruiter', 'name email avatar company designation')
      .populate('job', 'title company skills')
      .populate('application', 'status aiMatchScore');

    if (!interview) {
      interview = await Interview.findOne({ application: req.params.id })
        .populate('candidate', 'name email avatar skills experience')
        .populate('recruiter', 'name email avatar company designation')
        .populate('job', 'title company skills')
        .populate('application', 'status aiMatchScore');
    }

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Access check
    const userId = String(req.user._id);
    const isParticipant =
      String(interview.candidate._id) === userId ||
      String(interview.recruiter._id) === userId ||
      req.user.role === 'ADMIN';

    if (!isParticipant) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Session Status ────────────────────────────────────────────────────
const updateSessionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    let interview = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      interview = await Interview.findById(req.params.id);
      if (!interview) {
        interview = await Interview.findOne({ application: req.params.id });
      }
    } else {
      interview = await Interview.findOne({ agoraChannel: req.params.id });
    }
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    interview.status = status;

    if (status === 'ACTIVE' && !interview.startedAt) {
      interview.startedAt = new Date();
      interview.timeline.push({ event: 'STARTED', description: 'Session started', timestamp: new Date() });
    }
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      interview.endedAt = new Date();
      if (interview.startedAt) {
        interview.actualDuration = Math.round((interview.endedAt - interview.startedAt) / 60000);
      }
      interview.timeline.push({ event: status, description: notes || `Session ${status.toLowerCase()}`, timestamp: new Date() });
    }

    await interview.save();

    // Notify participants
    if (req.io) {
      req.io.to(`interview_room_${interview.agoraChannel}`).emit('session_status_changed', { status, notes });
    }

    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Submit / Update Scorecard ────────────────────────────────────────────────
const submitScorecard = async (req, res) => {
  try {
    const { criteria, overallRating, recommendation, privateNotes, sharedFeedback } = req.body;
    let interview = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      interview = await Interview.findById(req.params.id);
      if (!interview) {
        interview = await Interview.findOne({ application: req.params.id });
      }
    } else {
      interview = await Interview.findOne({ agoraChannel: req.params.id });
    }
    
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    if (String(interview.recruiter) !== String(req.user._id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only the recruiter can submit scorecard' });
    }

    interview.scorecard = {
      completedBy: req.user._id,
      criteria: criteria || [
        { name: 'Problem Solving', score: 0, weight: 2 },
        { name: 'Code Quality',   score: 0, weight: 2 },
        { name: 'Communication',  score: 0, weight: 1 },
        { name: 'Technical Depth',score: 0, weight: 2 },
        { name: 'Culture Fit',    score: 0, weight: 1 },
      ],
      overallRating,
      recommendation,
      privateNotes,
      sharedFeedback,
      submittedAt: new Date()
    };

    interview.timeline.push({ event: 'SCORECARD_SUBMITTED', description: 'Recruiter submitted scorecard', timestamp: new Date() });
    await interview.save();

    res.json({ success: true, scorecard: interview.scorecard });
  } catch (error) {
    console.error("DEBUG submitScorecard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Save Code Snapshot ───────────────────────────────────────────────────────
const saveCodeSnapshot = async (req, res) => {
  try {
    const { code, language, label, executionResult } = req.body;
    let interview = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      interview = await Interview.findById(req.params.id);
      if (!interview) {
        interview = await Interview.findOne({ application: req.params.id });
      }
    } else {
      interview = await Interview.findOne({ agoraChannel: req.params.id });
    }
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    interview.codeSnapshots.push({ code, language, label, executionResult, savedBy: req.user._id });
    interview.currentCode = code;
    interview.currentLanguage = language;
    await interview.save();

    res.json({ success: true, snapshot: interview.codeSnapshots[interview.codeSnapshots.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Generate Full AI Post-Interview Report ───────────────────────────────────
const generateAIReport = async (req, res) => {
  try {
    let interview = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      interview = await Interview.findById(req.params.id)
        .populate('candidate', 'name skills experience')
        .populate('job', 'title skills requiredSkills');
      if (!interview) {
        interview = await Interview.findOne({ application: req.params.id })
          .populate('candidate', 'name skills experience')
          .populate('job', 'title skills requiredSkills');
      }
    } else {
      interview = await Interview.findOne({ agoraChannel: req.params.id })
        .populate('candidate', 'name skills experience')
        .populate('job', 'title skills requiredSkills');
    }

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const latestSnapshot = interview.codeSnapshots[interview.codeSnapshots.length - 1];
    const code = latestSnapshot?.code || interview.currentCode;
    const context = `
      Job: ${interview.job?.title}
      Candidate: ${interview.candidate?.name}
      Skills: ${interview.candidate?.skills?.join(', ')}
      Duration: ${interview.actualDuration || 0} minutes
      Questions Asked: ${interview.questions?.map(q => q.text).join('; ')}
      Chat Messages: ${interview.chatMessages?.length || 0}
    `;

    const analysis = await analyzeInterviewCode(code, context, interview.currentLanguage);

    interview.aiEvaluation = {
      ...analysis,
      generatedAt: new Date()
    };

    interview.timeline.push({ event: 'AI_REPORT_GENERATED', description: 'AI post-interview report generated', timestamp: new Date() });
    await interview.save();

    res.json({ success: true, evaluation: interview.aiEvaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Recruiter's Interviews ───────────────────────────────────────────────
const getMyInterviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = req.user.role === 'CANDIDATE'
      ? { candidate: req.user._id }
      : { recruiter: req.user._id };

    if (status) query.status = status;

    const interviews = await Interview.find(query)
      .populate('candidate', 'name email avatar')
      .populate('recruiter', 'name email avatar company')
      .populate('job', 'title company')
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.json({ success: true, interviews, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add Chat Message ─────────────────────────────────────────────────────────
const addChatMessage = async (req, res) => {
  try {
    const { message, type = 'text' } = req.body;
    let interview = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      interview = await Interview.findById(req.params.id);
      if (!interview) {
        interview = await Interview.findOne({ application: req.params.id });
      }
    } else {
      interview = await Interview.findOne({ agoraChannel: req.params.id });
    }
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const chatMsg = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message,
      type,
      timestamp: new Date()
    };

    interview.chatMessages.push(chatMsg);
    await interview.save();

    // Broadcast via socket
    if (req.io) {
      req.io.to(`interview_room_${interview.agoraChannel}`).emit('interview_chat_message', chatMsg);
    }

    res.json({ success: true, message: chatMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateAgoraToken,
  executeCode,
  analyzeInterview,
  generateQuestion,
  generateChallenge,
  createInterviewSession,
  getInterviewSession,
  updateSessionStatus,
  submitScorecard,
  saveCodeSnapshot,
  generateAIReport,
  getMyInterviews,
  addChatMessage
};
