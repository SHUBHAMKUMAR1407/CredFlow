require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if demo user exists
    let user = await User.findOne({ email: 'demo@credflow.com' });
    if (!user) {
      user = await User.create({
        name: 'Demo Admin',
        email: 'demo@credflow.com',
        password: 'demo123',
        role: 'admin',
        isVerified: true,
        monthlyBudget: 50000
      });
      console.log('SUCCESS: Demo admin created! email: demo@credflow.com, pass: demo123');
    } else {
      user.password = 'demo123'; // reset it just in case
      user.role = 'admin';
      await user.save();
      console.log('SUCCESS: Demo admin updated! email: demo@credflow.com, pass: demo123');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

createDemo();
