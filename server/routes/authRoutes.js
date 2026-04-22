const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',             register);
router.post('/verify-email',         verifyEmail);
router.post('/resend-otp',           resendOTP);
router.post('/login',                login);
router.post('/forgot-password',      forgotPassword);
router.put('/reset-password',        resetPassword);
router.get('/me',                    protect, getMe);
router.put('/profile',               protect, updateProfile);

module.exports = router;