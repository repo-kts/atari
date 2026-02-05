const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { loginRateLimiter, refreshRateLimiter } = require('../middleware/rateLimiter.js');
const { authenticateToken } = require('../middleware/auth.js');

// POST /api/auth/login - Login endpoint with rate limiting
router.post('/login', loginRateLimiter, authController.login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshRateLimiter, authController.refresh);

// POST /api/auth/logout - Logout endpoint
router.post('/logout', authController.logout);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authenticateToken, authController.me);

module.exports = router;
