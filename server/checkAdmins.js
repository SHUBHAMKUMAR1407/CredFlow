require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admins = await User.find({ role: 'admin' }).select('email name role');
    console.log('Current Admins in Database:');
    console.log(JSON.stringify(admins, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkAdmins();
