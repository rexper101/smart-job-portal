/**
 * Generate JWT Token
 * Signs a JSON Web Token with the user's ID as payload
 */

const jwt = require('jsonwebtoken');

/**
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
