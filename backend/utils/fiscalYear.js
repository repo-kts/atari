/**
 * The reporting (fiscal) year runs April–March, so Jan–Mar belongs to the
 * previous year's FY. E.g. Feb 2027 → 2026 (FY 2026-27).
 * @returns {number} The current fiscal year
 */
function getCurrentFiscalYear() {
  const now = new Date();
  return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
}

module.exports = { getCurrentFiscalYear };
