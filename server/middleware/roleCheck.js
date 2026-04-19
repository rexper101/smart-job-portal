/**
 * Role-Based Access Control Middleware
 * Restricts routes to users with specified roles
 */

/**
 * authorize - Factory function that returns middleware for role checking
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'recruiter')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Role '${req.user.role}' is not authorized for this action. Required: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = { authorize };
