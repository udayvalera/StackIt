// backend/controllers/admin/authController.js

const { PrismaClient } = require('../../generated/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../utils/jwt');

const prisma = new PrismaClient();

/**
 * @desc Admin Login
 * @route POST /api/admin/auth/login
 * @access Public
 */
const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Find the admin user by username and role
    const admin = await prisma.user.findUnique({
      where: {
        username: username,
        role: 'ADMIN', // Ensure the user has the ADMIN role
      },
    });

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with hashed password in the database
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    // Note: The generateToken function expects userId, employeeId, and role.
    // Since employeeId is not part of the User model in this schema, we pass null.
    const token = generateToken(admin.id, admin.role);

    // Set JWT as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Protect against CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send success response
    res.status(200).json({
      message: 'Admin logged in successfully',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  adminLogin,
};
