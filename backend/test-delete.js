const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Job = require('./models/Job');
const User = require('./models/User');
const { deleteJob } = require('./controllers/jobController');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find a recruiter
  const recruiter = await User.findOne({ role: 'RECRUITER' });
  
  if (!recruiter) {
    console.log("No recruiter found.");
    process.exit(0);
  }
  
  // Create a dummy job
  const job = await Job.create({
    title: 'Test Job to Delete',
    description: 'Blah blah',
    company: 'Test Co',
    recruiter: recruiter._id,
    status: 'ACTIVE'
  });
  
  console.log("Created job:", job._id);
  
  const req = { 
    user: { _id: recruiter._id, role: 'RECRUITER' },
    params: { id: job._id }
  };
  
  const res = {
    json: (data) => console.log('Response:', data),
    status: (code) => {
      console.log('Status code:', code);
      return { json: (data) => console.log('Error:', data) };
    }
  };
  
  await deleteJob(req, res);
  
  const check = await Job.findById(job._id);
  console.log("Job still exists?", !!check);
  
  process.exit(0);
}

test().catch(console.error);
