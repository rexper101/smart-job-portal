/**
 * Auth Controller
 * Handles user registration, login, and profile retrieval
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─── Helper: Send token response ──────────────────────────────────────────────
const sendTokenResponse = (res, statusCode, message, user) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      location: user.location,
      createdAt: user.createdAt,
    },
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────
/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please log in.',
      });
    }

    // Prevent self-assignment of admin role
    const assignedRole = role === 'admin' ? 'user' : (role || 'user');

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({ name, email, password, role: assignedRole });

    sendTokenResponse(res, 201, 'Account created successfully! Welcome aboard 🎉', user);
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
/**
 * @desc    Authenticate user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user and explicitly select the password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare entered password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(res, 200, `Welcome back, ${user.name}! 👋`, user);
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
/**
 * @desc    Get the currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'skills', 'location', 'phone', 'website'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
