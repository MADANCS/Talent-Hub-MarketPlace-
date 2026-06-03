const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'hr@demo.com';
    const password = '123456';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('User found:', user.email);
    console.log('Hashed Password in DB:', user.password);

    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (isMatch) {
      console.log('✅ Login logic works correctly on backend.');
    } else {
      console.log('❌ Login logic failed on backend.');
    }

    process.exit();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testLogin();
