const express = require('express');
const router = express.Router();

// Mock admin credentials for demonstration purposes
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; 
const DEMO_TOKEN = 'mock-admin-token-12345'; // A dummy token

/**
 * @route POST /api/auth/login
 * @desc Admin login route
 * @access Public
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // In a real application, you would generate a JWT here
    res.json({
      success: true,
      message: 'Login successful',
      token: DEMO_TOKEN,
      user: { id: 'admin-1', username: ADMIN_USERNAME, role: 'admin' },
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Admin logout route (client-side token removal)
 * @access Public (token invalidated client-side)
 */
router.post('/logout', (req, res) => {
  // For a real application, server-side logout might involve token blacklisting
  // For this demo, client-side token removal is sufficient
  res.json({ success: true, message: 'Logout successful' });
});

module.exports = router;
