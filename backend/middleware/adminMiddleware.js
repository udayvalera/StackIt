// backend/middleware/adminMiddleware.js

const { verifyToken } = require('../utils/jwt'); // Adjust path as needed

/**
 * @desc Middleware to protect admin routes and ensure user has ADMIN role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const adminMiddleware = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Check if the decoded token contains an admin role
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }

    // Attach user payload to the request object
    // This allows subsequent middleware/route handlers to access user info (e.g., req.user.userId, req.user.role)
    req.user = decoded;

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle token verification errors (e.g., invalid token, expired token)
    console.error('Admin middleware error:', error.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = adminMiddleware;
