const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const authController = require('../controllers/authController.js');
const { loginRateLimiter, refreshRateLimiter } = require('../middleware/rateLimiter.js');
const { authenticateToken } = require('../middleware/auth.js');
=======
const authController = require('../controllers/authController');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');
>>>>>>> my-merged-work

// POST /api/auth/login - Login endpoint with rate limiting
router.post('/login', loginRateLimiter, authController.login);

// POST /api/auth/refresh - Refresh access token
<<<<<<< HEAD
router.post('/refresh', refreshRateLimiter, authController.refresh);
=======
router.post('/refresh', authController.refresh);
>>>>>>> my-merged-work

// POST /api/auth/logout - Logout endpoint
router.post('/logout', authController.logout);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authenticateToken, authController.me);

module.exports = router;
