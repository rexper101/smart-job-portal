const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendVerificationOTP, sendPasswordResetEmail } = require('../utils/sendEmail');

const sendTokenResponse = (res, statusCode, message, user) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true, message, token,
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, isEmailVerified: user.isEmailVerified,
      bio: user.bio, skills: user.skills,
      location: user.location, createdAt: user.createdAt,
    },
  });
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(409).json({ success: false, message: 'Email already registered. Please log in.' });

    const user = await User.create({ name, email, password });
    const otp = user.generateVerificationOTP();
    await user.save({ validateBeforeSave: false });

    try { await sendVerificationOTP(user.email, user.name, otp); } catch (e) { console.error('Email error:', e.message); }

    res.status(201).json({
      success: true,
      message: `Account created! OTP sent to ${email}`,
      userId: user._id,
      requiresVerification: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+emailVerificationOTP +emailVerificationExpire');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified.' });
    if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    if (user.emailVerificationExpire < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });

    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationExpire = null;
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(res, 200, '🎉 Email verified! Welcome to SmartHire!', user);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Already verified.' });
    const otp = user.generateVerificationOTP();
    await user.save({ validateBeforeSave: false });
    await sendVerificationOTP(user.email, user.name, otp);
    res.json({ success: true, message: 'New OTP sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isEmailVerified) {
      const otp = user.generateVerificationOTP();
      await user.save({ validateBeforeSave: false });
      try { await sendVerificationOTP(user.email, user.name, otp); } catch (e) {}
      return res.status(403).json({
        success: false,
        message: 'Please verify your email. OTP resent.',
        requiresVerification: true,
        userId: user._id,
      });
    }
    sendTokenResponse(res, 200, `Welcome back, ${user.name}! 👋`, user);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide your email.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetURL);
      res.json({ success: true, message: 'Password reset link sent to your email!' });
    } catch (e) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token.' });

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    sendTokenResponse(res, 200, 'Password reset successfully!', user);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'skills', 'location', 'phone', 'website'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, verifyEmail, resendOTP, login, forgotPassword, resetPassword, getMe, updateProfile };