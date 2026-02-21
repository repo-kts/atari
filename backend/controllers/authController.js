// Controller layer - handles HTTP requests/responses for authentication
require('dotenv').config();
const authService = require('../services/authService.js');

/**
 * Get cookie options based on environment
 * Handles Safari, incognito, and cross-origin cookie requirements
 */
function getCookieOptions(maxAge) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = !isProduction;
  
  // In production (cross-origin), need SameSite=None + Secure
  // In development (same-origin), use SameSite=Lax for better compatibility
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // HTTPS required in production
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: maxAge,
    path: '/',
  };

  // Only set domain in production for cross-domain cookies
  // Don't set domain in development to avoid issues with localhost
  if (isProduction && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  // Safari ITP (Intelligent Tracking Prevention) compatibility
  // Partitioned attribute helps with Safari cross-site cookies
  if (isProduction) {
    cookieOptions.partitioned = true;
  }

  return cookieOptions;
}

function getClearCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  if (isProduction && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  if (isProduction) {
    options.partitioned = true;
  }

  return options;
}

const authController = {
  /**
   * POST /api/auth/login
   * Login user with email and password
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login(email, password);

      // Set HTTP-only cookies for tokens
      const accessCookieOptions = getCookieOptions(60 * 60 * 1000); // 1 hour
      const refreshCookieOptions = getCookieOptions(7 * 24 * 60 * 60 * 1000); // 7 days

      res.cookie('accessToken', result.accessToken, accessCookieOptions);
      res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  refresh: async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      // Set new access token cookie
      const accessCookieOptions = getCookieOptions(60 * 60 * 1000); // 1 hour

      res.cookie('accessToken', result.accessToken, accessCookieOptions);

      // If refresh token was rotated, set new refresh token cookie
      if (result.refreshToken !== refreshToken) {
        const refreshCookieOptions = getCookieOptions(7 * 24 * 60 * 60 * 1000); // 7 days
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      res.status(200).json({
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      // Clear cookies on error (must match set options for browser to remove them)
      const clearOpts = getClearCookieOptions();
      res.clearCookie('accessToken', clearOpts);
      res.clearCookie('refreshToken', clearOpts);
      res.status(401).json({ error: error.message });
    }
  },

  /**
   * POST /api/auth/logout
   * Logout user by revoking refresh token
   */
  logout: async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookies (must match set options for browser to remove them)
      const clearOpts = getClearCookieOptions();
      res.clearCookie('accessToken', clearOpts);
      res.clearCookie('refreshToken', clearOpts);

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      // Clear cookies even if there's an error
      const clearOpts = getClearCookieOptions();
      res.clearCookie('accessToken', clearOpts);
      res.clearCookie('refreshToken', clearOpts);
      res.status(200).json({ message: 'Logout successful' });
    }
  },

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   */
  me: async (req, res) => {
    try {
      // User is attached to req by authenticateToken middleware
      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};

module.exports = authController;
