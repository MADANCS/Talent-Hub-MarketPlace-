const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');

async function testHttpDelete() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find recruiter
  const recruiter = await User.findOne({ role: 'RECRUITER' });
  if (!recruiter) return console.log("No recruiter");
  
  // Generate a token for the recruiter
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  // 1. Create job via HTTP API
  console.log("Creating job via API...");
  const createRes = await axios.post('http://localhost:5050/api/jobs', {
    title: 'HTTP Test Job',
    description: 'Testing terminate',
    company: 'Test Company',
    location: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    salaryMin: 50000,
    salaryMax: 100000,
    skills: ['React']
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const jobId = createRes.data.job._id;
  console.log("Created job ID:", jobId);
  
  // 2. Delete job via HTTP API
  console.log("Deleting job via API...");
  try {
    const delRes = await axios.delete(`http://localhost:5050/api/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Delete response:", delRes.data);
  } catch (err) {
    console.log("Delete failed:", err.response?.data || err.message);
  }
  
  process.exit(0);
}

testHttpDelete().catch(console.error);
