// backend/routes/user/auth.user.js

const express = require('express');
const router = express.Router();
const {
  userRegister,
  userLogin,
  userLogout, // Import userLogout
  userVerify, // Import userVerify
} = require('../../controllers/user/authController'); // Adjust path as needed

// You might have a middleware for protecting routes, for example:
// const { protect } = require('../../middleware/authMiddleware');

/**
 * @route POST /api/user/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', userRegister);

/**
 * @route POST /api/user/auth/login
 * @desc Authenticate a user and get token
 * @access Public
 */
router.post('/login', userLogin);

/**
 * @route POST /api/user/auth/logout
 * @desc Log out a user by clearing the token cookie
 * @access Public (though it clears a private cookie)
 */
router.post('/logout', userLogout);

/**
 * @route GET /api/user/auth/verify
 * @desc Verify user token and return user data
 * @access Public (it checks for a token, but doesn't require prior authentication middleware)
 */
router.get('/verify', userVerify);


module.exports = router;
