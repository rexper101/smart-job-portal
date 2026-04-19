/**
 * Auth Routes
 * POST /api/auth/register  - Create new account
 * POST /api/auth/login     - Login and receive JWT
 * GET  /api/auth/me        - Get current user profile
 * PUT  /api/auth/profile   - Update profile
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.put('/profile',   protect, updateProfile);

module.exports = router;
