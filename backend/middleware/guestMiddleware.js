// backend/middleware/guestMiddleware.js

const { verifyToken } = require('../utils/jwt'); // Adjust path as needed

/**
 * @desc Middleware to optionally identify a user.
 * If a valid token is present, it attaches the user's data to the request.
 * If no token is present or the token is invalid, it proceeds without error.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const guestMiddleware = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;

  // If no token exists, just proceed.
  if (!token) {
    return next();
  }

  try {
    // If a token exists, try to verify it
    const decoded = verifyToken(token);

    // Attach user payload to the request object
    // This allows subsequent middleware/route handlers to check for an optional user
    // (e.g., if (req.user) { ... })
    req.user = decoded;

  } catch (error) {
    // If the token is invalid (e.g., expired, malformed), we don't block the request.
    // We simply proceed without attaching the user data.
    // You might want to log this for debugging purposes.
    console.error('Guest middleware: Invalid token received -', error.message);
  }

  // Always proceed to the next middleware/route handler
  next();
};

module.exports = guestMiddleware;
