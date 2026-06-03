const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['CANDIDATE', 'RECRUITER', 'ADMIN'],
    default: 'CANDIDATE'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 2000 },

  // Candidate-specific fields
  skills: [{ type: String }],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    field: String,
    from: Date,
    to: Date,
    grade: String
  }],
  resumeUrl: { type: String, default: '' },
  resumeText: { type: String, default: '' }, // Extracted text for AI matching
  aiMatchScore: { type: Number, default: 0 },
  portfolioUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  expectedSalary: { type: Number, default: 0 },
  jobPreferences: {
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'], default: 'Full-time' },
    remotePreference: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Any'], default: 'Any' },
    preferredLocations: [String],
    preferredIndustries: [String]
  },
  isOpenToWork: { type: Boolean, default: true },
  profileCompleteness: { type: Number, default: 0 },

  // Recruiter-specific fields
  company: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companySize: { type: String, default: '' },
  industry: { type: String, default: '' },
  designation: { type: String, default: '' },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['FREE', 'PRO', 'ENTERPRISE'], default: 'FREE' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'CANCELLED'], default: 'ACTIVE' },
    startDate: Date,
    endDate: Date,
    razorpaySubscriptionId: String,
    razorpayCustomerId: String
  },

  // Auth & Security
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerifyToken: String,

  // 2FA Security
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },

  // Notifications
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    jobAlerts: { type: Boolean, default: true },
    applicationUpdates: { type: Boolean, default: true },
    messages: { type: Boolean, default: true }
  },

  // Stats
  profileViews: { type: Number, default: 0 },
  searchAppearances: { type: Number, default: 0 },

  // Gamification Engine
  gamification: {
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    rank: { type: String, default: 'Initiate' },
    badges: [{ 
      name: String, 
      icon: String, 
      description: String, 
      earnedAt: { type: Date, default: Date.now } 
    }],
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  },

  // Saved Jobs (Bookmarks)
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Push Notifications
  expoPushToken: { type: String, select: false },
  fcmToken: { type: String, select: false }

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
  let score = 0;
  if (this.name) score += 10;
  if (this.email) score += 10;
  if (this.phone) score += 5;
  if (this.location) score += 5;
  if (this.bio) score += 10;
  if (this.avatar) score += 5;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 10;
  if (this.resumeUrl) score += 10;
  if (this.linkedinUrl) score += 3;
  if (this.githubUrl) score += 2;
  this.profileCompleteness = score;
  return score;
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerifyToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
