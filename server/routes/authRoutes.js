const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyOTP, verifyEmail, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const { upload } = require('../config/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/test', (req, res) => res.json({ message: 'Auth routes working' }));
router.post('/profile/avatar', protect, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary Error:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    console.log('File uploaded to Cloudinary:', req.file.path);
    res.json({ url: req.file.path });
  });
});

module.exports = router;
