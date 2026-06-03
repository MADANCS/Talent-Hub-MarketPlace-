const mongoose = require('mongoose');
const Application = require('./models/Application');

async function fixLinks() {
  try {
    await mongoose.connect('mongodb://localhost:27017/talentmarketplace');
    console.log('Connected to MongoDB');

    const apps = await Application.find({ 'interviews.meetingLink': /jobsleuths.ai/ });
    console.log(`Found ${apps.length} applications with stale links`);

    for (const app of apps) {
      app.interviews.forEach(interview => {
        if (interview.meetingLink && interview.meetingLink.includes('jobsleuths.ai')) {
          // Replace with local path
          const appId = app._id.toString();
          interview.meetingLink = `http://localhost:5173/interview/${appId}`;
        }
      });
      await app.save();
    }

    console.log('Successfully updated all interview links to localhost.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixLinks();
