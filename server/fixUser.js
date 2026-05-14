require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fixUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    let user = await User.findOne({ email: 'sky143c@gmail.com' });
    if (user) {
      user.role = 'user';
      await user.save();
      console.log('SUCCESS: sky143c@gmail.com role changed back to user');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

fixUser();
