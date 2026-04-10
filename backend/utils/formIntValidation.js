/**
 * Safe parsing for INT columns (PostgreSQL signed 32-bit).
 * Prevents phone-sized values from being stored in year / count fields.
 */

const { ValidationError } = require('./errorHandler.js');

const PG_INT32_MAX = 2147483647;

/**
 * @param {*} value
 * @param {string} [fieldLabel]
 * @returns {number}
 * @throws {ValidationError}
 */
function parseYearOfEstablishment(value, fieldLabel = 'Year of establishment') {
  const raw = String(value ?? '').trim();
  if (raw === '') {
    throw new ValidationError(`${fieldLabel} is required`, fieldLabel);
  }
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) {
    throw new ValidationError(`${fieldLabel} must be a valid year`, fieldLabel);
  }
  const y = new Date().getFullYear();
  if (n < 1800 || n > y + 1) {
    throw new ValidationError(`${fieldLabel} must be between 1800 and ${y + 1}`, fieldLabel);
  }
  return n;
}

/**
 * Non-negative integer suitable for "members" style counts; stays within INT32.
 * @param {*} value
 * @param {string} [fieldLabel]
 * @param {number} [max=999999]
 * @returns {number}
 * @throws {ValidationError}
 */
function parseBoundedCountInt(value, fieldLabel = 'Count', max = 999999) {
  const raw = String(value ?? '').trim();
  if (raw === '') {
    throw new ValidationError(`${fieldLabel} is required`, fieldLabel);
  }
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) {
    throw new ValidationError(`${fieldLabel} must be a valid number`, fieldLabel);
  }
  if (n < 0) {
    throw new ValidationError(`${fieldLabel} cannot be negative`, fieldLabel);
  }
  if (n > max) {
    throw new ValidationError(`${fieldLabel} cannot exceed ${max}`, fieldLabel);
  }
  if (n > PG_INT32_MAX) {
    throw new ValidationError(`${fieldLabel} is out of range`, fieldLabel);
  }
  return n;
}

module.exports = {
  parseYearOfEstablishment,
  parseBoundedCountInt,
  PG_INT32_MAX,
};
