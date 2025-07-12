// backend/controllers/user/authController.js

const { PrismaClient } = require('../../generated/prisma');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../../utils/jwt'); // Adjust path as needed

const prisma = new PrismaClient();

/**
 * @desc User Registration
 * @route POST /api/user/auth/register
 * @access Public
 */
const userRegister = async (req, res) => {
  const { username, email, password } = req.body;

  // Input validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user already exists with the given username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this username or email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with default role 'USER'
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER', // Default role for new registrations
      },
    });

    // Generate JWT token
    // UPDATED: generateToken now only expects userId and role
    const token = generateToken(newUser.id, newUser.role);

    // Set JWT as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Protect against CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send success response
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc User Login
 * @route POST /api/user/auth/login
 * @access Public
 */
const userLogin = async (req, res) => {
  const { username, password } = req.body; // Can also accept email for login

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Find the user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }, // Allow login with email as well
        ],
        role: 'USER', // Ensure the user has the USER role
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Compare provided password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    // UPDATED: generateToken now only expects userId and role
    const token = generateToken(user.id, user.role);

    // Set JWT as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Protect against CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send success response
    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * @desc User Logout
 * @route POST /api/user/auth/logout
 * @access Private (requires authentication to clear cookie)
 */
const userLogout = (req, res) => {
  // Clear the token cookie
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Set expiry to a past date to clear the cookie immediately
  });

  res.status(200).json({ message: 'User logged out successfully' });
};

/**
 * @desc Verify User Token and Return User Data
 * @route GET /api/user/auth/verify
 * @access Private (requires token in cookie)
 */
const userVerify = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify the token
    // Ensure process.env.JWT_SECRET is set in your environment variables
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    // Find the user by ID from the decoded token
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: { // Select only necessary fields to send back
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If token is valid and user exists, send user data
    res.status(200).json({
      message: 'User verified successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    res.status(500).json({ message: 'Server error during token verification' });
  }
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  userVerify,
};
