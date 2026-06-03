const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { getRecruiterAnalytics } = require('./controllers/userController');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find a recruiter
  const User = require('./models/User');
  const recruiter = await User.findOne({ role: 'RECRUITER' });
  
  if (!recruiter) {
    console.log("No recruiter found.");
    process.exit(0);
  }
  
  console.log("Testing with recruiter:", recruiter._id);
  
  const req = { user: { _id: recruiter._id } };
  const res = {
    json: (data) => console.log(JSON.stringify(data, null, 2)),
    status: (code) => {
      console.log('Status code:', code);
      return { json: (data) => console.log('Error:', data) };
    }
  };
  
  await getRecruiterAnalytics(req, res);
  process.exit(0);
}

test().catch(console.error);
