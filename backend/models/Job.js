const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  skills: [{ type: String }],
  
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companySize: { type: String, default: '' },
  industry: { type: String, default: '' },

  location: { type: String, default: 'Remote' },
  isRemote: { type: Boolean, default: false },
  jobType: { type: String, enum: ['Full-time','Part-time','Contract','Freelance','Internship'], default: 'Full-time' },
  
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  salaryCurrency: { type: String, default: 'INR' },
  salaryPeriod: { type: String, enum: ['Hourly','Monthly','Yearly'], default: 'Yearly' },
  showSalary: { type: Boolean, default: true },

  experienceLevel: { type: String, enum: ['Entry','Mid','Senior','Lead','Executive'], default: 'Mid' },
  experienceYears: { type: Number, default: 0 },
  educationRequired: { type: String, default: '' },

  status: { type: String, enum: ['DRAFT','ACTIVE','PAUSED','CLOSED','EXPIRED'], default: 'ACTIVE' },
  featured: { type: Boolean, default: false },
  urgent: { type: Boolean, default: false },

  applicationDeadline: { type: Date },
  applicationCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  // AI-generated fields
  aiKeywords: [String],
  aiEmbedding: [Number], // vector embedding for semantic search
  aiSummary: { type: String, default: '' },
  
  tags: [String],
  benefits: [String],
  
  questions: [{
    question: String,
    type: { type: String, enum: ['text','multiple_choice','yes_no'], default: 'text' },
    options: [String],
    required: { type: Boolean, default: false }
  }]
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, recruiter: 1 });
jobSchema.index({ location: 1, jobType: 1 });

module.exports = mongoose.model('Job', jobSchema);
