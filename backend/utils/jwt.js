// backend/utils/jwt.js

const jwt = require('jsonwebtoken');

/**
 * Generates a JWT.
 * @param {string} id - The user's ID to include in the payload (corresponds to User.id).
 * @param {string} role - The user's role to include in the payload (corresponds to User.role).
 * @returns {string} The generated JSON Web Token.
 */
const generateToken = (id, role) => {
  const payload = {
    id, // Using id to match the name in the User model's id field
    role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

/**
 * Verifies a JWT and returns the decoded payload if valid.
 * Throws an error if invalid or expired.
 * @param {string} token - The JWT to verify.
 * @returns {Object} Decoded payload containing userId and role.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
