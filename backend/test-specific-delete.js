const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');
const Job = require('./models/Job');

async function testHttpDelete() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const jobId = '6a1ffbdceef7169e0be0d30b'; // wqq13
  const job = await Job.findById(jobId);
  if (!job) {
    console.log("Job already deleted!");
    return process.exit(0);
  }
  
  // Find recruiter of the job
  const recruiter = await User.findById(job.recruiter);
  if (!recruiter) return console.log("No recruiter found for this job.");
  
  // Generate a token for the recruiter
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
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
