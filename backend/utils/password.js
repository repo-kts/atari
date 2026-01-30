const bcrypt = require('bcrypt');

const DEFAULT_BCRYPT_ROUNDS = 12;
const parsedRounds = Number.parseInt(process.env.BCRYPT_ROUNDS ?? '', 10);
const BCRYPT_ROUNDS = Number.isFinite(parsedRounds)
  ? parsedRounds
  : DEFAULT_BCRYPT_ROUNDS;
if (BCRYPT_ROUNDS < 10 || BCRYPT_ROUNDS > 14) {
  throw new Error('BCRYPT_ROUNDS must be between 10 and 14');
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false;
  }

  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
};
