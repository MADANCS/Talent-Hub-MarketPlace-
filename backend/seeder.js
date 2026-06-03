const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    console.log('Cleared existing data.');

    // Create Demo Users
    const users = await User.create([
      {
        name: 'Demo Candidate',
        email: 'user@demo.com',
        password: '123456',
        role: 'CANDIDATE',
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'CSS'],
        location: 'New York, NY',
        bio: 'Passionate full-stack developer with 3 years of experience.',
        isOpenToWork: true,
        profileCompleteness: 85
      },
      {
        name: 'Demo Recruiter',
        email: 'hr@demo.com',
        password: '123456',
        role: 'RECRUITER',
        company: 'TechFlow Solutions',
        designation: 'Senior HR Manager',
        industry: 'Software',
        subscription: { plan: 'PRO', status: 'ACTIVE' }
      },
      {
        name: 'Super Admin',
        email: 'admin@demo.com',
        password: '123456',
        role: 'ADMIN'
      }
    ]);

    console.log('✅ Demo Users Created!');

    // Create a Sample Job
    await Job.create({
      title: 'Senior Full Stack Developer',
      company: 'TechFlow Solutions',
      recruiter: users[1]._id,
      location: 'Remote',
      jobType: 'Full-time',
      experienceLevel: 'Senior',
      salaryMin: 80000,
      salaryMax: 120000,
      description: 'We are looking for a Senior Full Stack Developer to join our core team. You will work on cutting-edge technologies and lead high-impact projects.',
      skills: ['React', 'Node.js', 'MongoDB', 'System Design'],
      requirements: ['5+ years of experience', 'Strong CS fundamentals', 'Experience with cloud platforms'],
      status: 'ACTIVE'
    });

    console.log('✅ Sample Job Created!');
    console.log('\nSeeding complete! You can now log in.');
    process.exit();

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
