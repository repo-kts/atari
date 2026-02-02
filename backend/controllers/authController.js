// Controller layer - handles HTTP requests/responses for authentication
const authService = require('../services/authService.js');

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
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 60 * 60 * 1000, // 1 hour for access token
        path: '/',
      };

      const refreshCookieOptions = {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
      };

      res.cookie('accessToken', result.accessToken, cookieOptions);
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
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
        path: '/',
      };

      res.cookie('accessToken', result.accessToken, cookieOptions);

      // If refresh token was rotated, set new refresh token cookie
      if (result.refreshToken !== refreshToken) {
        const refreshCookieOptions = {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
      }

      res.status(200).json({
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      // Clear cookies on error
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
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

      // Clear cookies
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      // Clear cookies even if there's an error
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
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
