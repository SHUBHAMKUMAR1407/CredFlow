require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const listAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find().select('email name role');
    console.log('All Users in Database:');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

listAllUsers();
