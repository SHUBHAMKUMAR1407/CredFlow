require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if demo user exists
    let user = await User.findOne({ email: 'admin@credflow.com' });
    if (!user) {
      user = await User.create({
        name: 'Super Admin',
        email: 'admin@credflow.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        monthlyBudget: 50000
      });
      console.log('SUCCESS: Admin created! email: admin@credflow.com, pass: admin123');
    } else {
      user.password = 'admin123'; // reset it just in case
      user.role = 'admin';
      await user.save();
      console.log('SUCCESS: Admin updated! email: admin@credflow.com, pass: admin123');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

createDemo();
