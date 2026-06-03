const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  senderRole: { type: String, enum: ['CANDIDATE', 'RECRUITER', 'ADMIN'] },
  message: { type: String, required: true },
  type: { type: String, enum: ['text', 'code', 'system'], default: 'text' },
  timestamp: { type: Date, default: Date.now }
});

const codeSnapshotSchema = new mongoose.Schema({
  code: String,
  language: { type: String, default: 'javascript' },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  label: String,
  executionResult: {
    stdout: String,
    stderr: String,
    exitCode: Number,
    runTime: Number
  },
  timestamp: { type: Date, default: Date.now }
});

const whiteboardEventSchema = new mongoose.Schema({
  type: { type: String, enum: ['draw', 'erase', 'clear', 'text', 'shape'] },
  data: mongoose.Schema.Types.Mixed,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const scorecardCriteriaSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Problem Solving"
  score: { type: Number, min: 0, max: 10, default: 0 },
  weight: { type: Number, default: 1 },
  notes: String
});

const scorecardSchema = new mongoose.Schema({
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  criteria: [scorecardCriteriaSchema],
  overallRating: { type: Number, min: 0, max: 10, default: 0 },
  recommendation: {
    type: String,
    enum: ['STRONG_HIRE', 'HIRE', 'MAYBE', 'NO_HIRE', 'STRONG_NO_HIRE', 'PENDING'],
    default: 'PENDING'
  },
  privateNotes: String,
  sharedFeedback: String, // Shared with candidate
  submittedAt: Date
});

const aiEvaluationSchema = new mongoose.Schema({
  overallScore: { type: Number, min: 0, max: 100 },
  technicalScore: { type: Number, min: 0, max: 100 },
  communicationScore: { type: Number, min: 0, max: 100 },
  problemSolvingScore: { type: Number, min: 0, max: 100 },
  codeQualityRating: { type: Number, min: 0, max: 10 },
  complexity: String,
  strengths: [String],
  improvements: [String],
  verdict: String,
  behavioralInsights: String,
  recommendedNextSteps: [String],
  keywordsMentioned: [String],
  sentimentScore: { type: Number, min: -1, max: 1 },
  generatedAt: { type: Date, default: Date.now },
  model: { type: String, default: 'gemini-pro' }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['technical', 'behavioral', 'coding', 'situational', 'custom'], default: 'technical' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  askedAt: Date,
  candidateResponse: String,
  aiAnalysis: String,
  score: { type: Number, min: 0, max: 10 }
});

const interviewSchema = new mongoose.Schema({
  // Core references
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Session metadata
  title: { type: String, default: 'Technical Interview' },
  type: {
    type: String,
    enum: ['LIVE', 'ZOOM', 'GOOGLE_MEET', 'PHONE', 'ASYNC'],
    default: 'LIVE'
  },
  round: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['SCHEDULED', 'LOBBY', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },

  // Scheduling
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  meetingLink: String,
  agoraChannel: String,
  agoraToken: String,
  agoraTokenExpiry: Date,

  // Participants
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['CANDIDATE', 'RECRUITER', 'OBSERVER'] },
    joinedAt: Date,
    leftAt: Date,
    isOnline: { type: Boolean, default: false }
  }],

  // Session timestamps
  startedAt: Date,
  endedAt: Date,
  actualDuration: Number, // minutes

  // Code editor state
  currentCode: { type: String, default: '// Write your solution here...\nfunction solve(input) {\n  \n}\n' },
  currentLanguage: { type: String, default: 'javascript' },
  codeSnapshots: [codeSnapshotSchema],

  // Whiteboard
  whiteboardEnabled: { type: Boolean, default: true },
  whiteboardHistory: [whiteboardEventSchema],

  // Chat
  chatMessages: [chatMessageSchema],

  // Questions asked
  questions: [questionSchema],

  // Current challenge/problem
  activeProblem: {
    title: String,
    description: String,
    examples: [{ input: String, output: String, explanation: String }],
    constraints: [String],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    tags: [String],
    starterCode: mongoose.Schema.Types.Mixed // {javascript: '...', python: '...'}
  },

  // Recording
  recording: {
    isEnabled: { type: Boolean, default: false },
    isRecording: { type: Boolean, default: false },
    startedAt: Date,
    url: String,
    duration: Number,
    storageProvider: { type: String, enum: ['local', 's3', 'agora'], default: 'agora' },
    consentGiven: { type: Boolean, default: false }
  },

  // Scorecard (filled by recruiter)
  scorecard: scorecardSchema,

  // AI evaluation (generated post-session)
  aiEvaluation: aiEvaluationSchema,

  // Milestones / timeline events
  timeline: [{
    event: String,
    description: String,
    timestamp: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed
  }],

  // Candidate pre-interview
  candidateChecks: {
    cameraWorking: { type: Boolean, default: false },
    micWorking: { type: Boolean, default: false },
    networkGood: { type: Boolean, default: false },
    completedWarmup: { type: Boolean, default: false }
  },

  // Flags
  isMock: { type: Boolean, default: false },
  isScreenShareActive: { type: Boolean, default: false },
  hasCandidateJoined: { type: Boolean, default: false },
  hasRecruiterJoined: { type: Boolean, default: false },

  // Post-interview
  candidateFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    wouldRecommend: Boolean,
    submittedAt: Date
  },

  // Invite token for secure room access
  inviteToken: { type: String, unique: true, sparse: true },
  inviteExpiresAt: Date

}, { timestamps: true });

// Indexes for performance
interviewSchema.index({ application: 1 });
interviewSchema.index({ candidate: 1 });
interviewSchema.index({ recruiter: 1 });
interviewSchema.index({ scheduledAt: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ agoraChannel: 1 });

// Virtual: duration in seconds
interviewSchema.virtual('actualDurationSeconds').get(function () {
  if (this.startedAt && this.endedAt) {
    return Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  return 0;
});

// Virtual: overall scorecard score
interviewSchema.virtual('overallScorecardScore').get(function () {
  if (!this.scorecard?.criteria?.length) return 0;
  const weighted = this.scorecard.criteria.reduce((sum, c) => sum + (c.score * c.weight), 0);
  const totalWeight = this.scorecard.criteria.reduce((sum, c) => sum + c.weight, 0);
  return totalWeight > 0 ? Math.round((weighted / totalWeight) * 10) / 10 : 0;
});

interviewSchema.set('toJSON', { virtuals: true });
interviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Interview', interviewSchema);
