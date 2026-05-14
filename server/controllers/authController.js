const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { generateOTP } = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // If unverified user exists, delete and re-create
    if (userExists && !userExists.isVerified) {
      await User.deleteOne({ email });
    }

    const otp = generateOTP();
    const user = await User.create({ 
      name, 
      email, 
      password,
      isVerified: false,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
    });

    console.log(`📧 Sending verification OTP to ${email}: ${otp}`);

    const message = `Welcome to CredFlow!\n\nYour email verification OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share it with anyone.`;
    
    let emailSent = false;
    try {
      await sendEmail({
        email: user.email,
        subject: 'CredFlow - Verify Your Email',
        message
      });
      emailSent = true;
      console.log('✅ Verification email sent');
    } catch (emailError) {
      console.error('⚠️ Email Error:', emailError.message);
    }

    await ActivityLog.create({ userId: user._id, action: 'REGISTER', details: 'Account created, pending email verification' });

    res.status(201).json({
      message: 'Account created! Please verify your email.',
      email: user.email,
      requiresVerification: true,
      otp: emailSent ? undefined : otp,
      emailSent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    await ActivityLog.create({ userId: user._id, action: 'LOGIN', details: 'User logged in' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      monthlyBudget: user.monthlyBudget,
      phoneNumber: user.phoneNumber,
      occupation: user.occupation,
      bio: user.bio,
      currency: user.currency,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`🔍 Email verification attempt for: ${email}, OTP: ${otp}`);

    const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    await ActivityLog.create({ userId: user._id, action: 'EMAIL_VERIFIED', details: 'Email verified successfully' });

    console.log(`✅ Email verified for: ${email}`);

    // Return token so user is automatically logged in after verification
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('🔥 VerifyEmail Error:', error);
    res.status(500).json({ message: error.message });
  }
};


// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`🔍 Password reset requested for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`🔑 Generated OTP: ${otp} (Valid for 10 mins)`);

    const message = `Your CredFlow password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share it with anyone.`;
    
    let emailSent = false;
    try {
      console.log('📧 Attempting to send email...');
      await sendEmail({
        email: user.email,
        subject: 'CredFlow - Password Reset OTP',
        message
      });
      console.log('✅ Email sent successfully');
      emailSent = true;
    } catch (emailError) {
      console.error('⚠️ Email Service Error:', emailError.message);
    }

    // Always return OTP in response so frontend can show it as fallback
    res.json({ 
      message: emailSent 
        ? 'OTP sent to your email' 
        : 'Email service unavailable. Use the OTP shown below.',
      otp: emailSent ? undefined : otp,
      emailSent 
    });
  } catch (error) {
    console.error('🔥 ForgotPassword Controller Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    if (newPassword) {
      user.password = newPassword;
    }
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    res.json({ message: 'Password reset successful', token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const updateData = {};
    const fields = ['name', 'monthlyBudget', 'phoneNumber', 'occupation', 'bio', 'currency', 'avatar'];
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: false } // Disable validators temporarily to ensure save
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    // Explicitly construct the response to be 100% sure
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      phoneNumber: updatedUser.phoneNumber,
      occupation: updatedUser.occupation,
      bio: updatedUser.bio,
      currency: updatedUser.currency,
      monthlyBudget: updatedUser.monthlyBudget,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
