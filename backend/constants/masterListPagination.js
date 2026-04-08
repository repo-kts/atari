/**
 * Master list pagination — used by admin “get all” endpoints.
 * Keeps single-request payloads bounded while allowing large product / FLD crop lists.
 */

/** Hard cap per request (abuse / memory guard). */
const MAX_MASTER_LIST_PAGE_SIZE = 10000;

/**
 * Default when `?limit=` is omitted — large enough for seeded product (~3k) and FLD crop (~1.3k) masters.
 */
const DEFAULT_MASTER_LIST_PAGE_SIZE = 5000;

/**
 * @param {string|number|undefined|null} limit - Raw query limit
 * @param {number} [fallback=DEFAULT_MASTER_LIST_PAGE_SIZE]
 * @returns {number} Clamped page size in [1, MAX_MASTER_LIST_PAGE_SIZE]
 */
function normalizeListLimit(limit, fallback = DEFAULT_MASTER_LIST_PAGE_SIZE) {
  if (limit === undefined || limit === null || limit === '') {
    return fallback;
  }
  const n = parseInt(String(limit), 10);
  if (Number.isNaN(n) || n < 1) {
    return fallback;
  }
  return Math.min(n, MAX_MASTER_LIST_PAGE_SIZE);
}

module.exports = {
  MAX_MASTER_LIST_PAGE_SIZE,
  DEFAULT_MASTER_LIST_PAGE_SIZE,
  normalizeListLimit,
};
