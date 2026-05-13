require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const promote = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'sky143c@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }
    user.role = 'admin';
    await user.save();
    console.log(`SUCCESS: ${email} is now an ADMIN!`);
    
    // Verify
    const check = await User.findOne({ email });
    console.log('Verification:', check.email, 'Role:', check.role);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

promote();
