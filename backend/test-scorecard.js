const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Interview = require('./models/Interview');

dotenv.config();

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const appId = '6a0819a349f289cc7a2920ed';
    console.log(`\n1. Searching for Interview with application ID: ${appId}...`);
    
    let interview = await Interview.findOne({ application: appId });
    if (interview) {
      console.log('FOUND! Interview Session details:');
      console.log('  ID:', interview._id);
      console.log('  Application:', interview.application);
      console.log('  Status:', interview.status);
      console.log('  Recruiter:', interview.recruiter);
    } else {
      console.log('No interview found with application ID', appId);
    }

    console.log('\n2. Listing all Interview sessions in DB:');
    const all = await Interview.find({});
    console.log(`Total interviews: ${all.length}`);
    all.forEach(i => {
      console.log(`  Session ID: ${i._id} | Application ID: ${i.application} | Status: ${i.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
