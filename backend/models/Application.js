const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: {
    type: String,
    enum: ['APPLIED','SCREENING','SHORTLISTED','INTERVIEW','TECHNICAL','OFFER','HIRED','REJECTED','WITHDRAWN'],
    default: 'APPLIED'
  },

  coverLetter: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  answers: [{
    question: String,
    answer: String
  }],

  // AI Matching
  aiMatchScore: { type: Number, default: 0, min: 0, max: 100 },
  aiMatchDetails: {
    skillsMatch: { type: Number, default: 0 },
    experienceMatch: { type: Number, default: 0 },
    educationMatch: { type: Number, default: 0 },
    overallFit: { type: String, default: '' },
    strengths: [String],
    gaps: [String],
    recommendation: { type: String, default: '' }
  },
  aiAnalyzed: { type: Boolean, default: false },
  aiVerdict: {
    summary: String,
    verdict: { type: String, enum: ['HIRE', 'CONSIDER', 'REJECT'] },
    confidence: Number,
    keyStrengths: [String],
    potentialRisks: [String],
    generatedAt: { type: Date, default: Date.now }
  },

  // Recruiter notes
  recruiterNotes: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  tags: [String],

  // Interview scheduling
  interviews: [{
    type: { type: String, enum: ['PHONE','VIDEO','ONSITE','TECHNICAL','ZOOM','GOOGLE_MEET'], default: 'VIDEO' },
    scheduledAt: Date,
    duration: Number,
    meetingLink: String,
    notes: String,
    status: { type: String, enum: ['SCHEDULED','COMPLETED','CANCELLED','RESCHEDULED'], default: 'SCHEDULED' },
    feedback: String,
    rating: Number,
    candidateFeedback: String,
    candidateRating: Number
  }],

  // Offer details
  offerDetails: {
    salary: Number,
    joiningDate: Date,
    offerLetterUrl: String,
    expiresAt: Date,
    accepted: Boolean
  },

  // Timeline
  timeline: [{
    status: String,
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now }
  }],

  isViewed: { type: Boolean, default: false },
  viewedAt: Date,
  withdrawnReason: { type: String, default: '' }

}, { timestamps: true });

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ recruiter: 1, status: 1 });
applicationSchema.index({ aiMatchScore: -1 });

module.exports = mongoose.model('Application', applicationSchema);
