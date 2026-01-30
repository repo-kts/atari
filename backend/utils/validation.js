/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Optional: Add more complexity requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize string input (trim only). Blocklist-based sanitization was removed:
 * it is insufficient for XSS (bypassable via encoded chars, mixed case,
 * whitespace, etc.). This API serves JSON with Content-Type: application/json;
 * XSS prevention relies on that and on context-aware output encoding at
 * render time (frontend). Use a vetted library (e.g. DOMPurify/sanitize-html)
 * where output is injected into HTML.
 *
 * @param {string} input - String to normalize
 * @returns {string} Trimmed string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return String(input);
  }
  return input.trim();
}

/**
 * Validate role ID
 * @param {number} roleId - Role ID to validate
 * @returns {boolean} True if roleId is valid
 */
function validateRoleId(roleId) {
  const validRoleIds = [1, 2, 3, 4, 5, 6]; // Based on seeded roles
  return typeof roleId === 'number' && validRoleIds.includes(roleId);
}

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateRoleId,
};
