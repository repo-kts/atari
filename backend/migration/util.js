/** Shared transform helpers for module specs. */

/**
 * Parse old-site dates to an ISO string (round-trips cleanly as JSON to the UI
 * and back, and Prisma accepts ISO-8601 for DateTime). Handles both shapes seen
 * in the data: yyyy-mm-dd (dob) and dd-mm-yyyy (date_of_joining).
 */
function parseDate(value) {
    if (value == null) return null;
    const s = String(value).trim();
    if (!s || s.toLowerCase() === 'n/a') return null;
    let m;
    // bare year e.g. "2025" -> Jan 1 of that year
    if (/^\d{4}$/.test(s)) return new Date(Date.UTC(+s, 0, 1)).toISOString();
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) {
        return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toISOString();
    }
    if ((m = s.match(/^(\d{2})-(\d{2})-(\d{4})/))) {
        return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])).toISOString();
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Decode the handful of HTML entities the old site emits in labels. */
function decodeEntities(value) {
    if (value == null) return value;
    return String(value)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .trim();
}

/** Pull the src out of an <img …> blob; return null for "N/A"/empty/non-urls. */
function extractImgSrc(value) {
    if (value == null) return null;
    const s = String(value);
    const m = s.match(/src="([^"]+)"/i);
    if (m) return m[1];
    if (!s.trim() || s.trim().toLowerCase() === 'n/a') return null;
    return /^https?:\/\//.test(s.trim()) ? s.trim() : null;
}

/** Old site stores booleans as "Yes"/"No" (also 1/0). -> JS boolean. */
function toBool(value) {
    if (typeof value === 'boolean') return value;
    const s = String(value ?? '').trim().toLowerCase();
    return s === 'yes' || s === '1' || s === 'true' || s === 'y';
}

/** "N/A"/empty -> null, else the trimmed string. */
function cleanText(value) {
    if (value == null) return null;
    const s = String(value).trim();
    return !s || s.toLowerCase() === 'n/a' ? null : s;
}

/**
 * Old OFT dates are often yyyy-mm (month inputs). Returns ISO string for the
 * 1st of that month (UTC), or null.
 */
function parseYearMonth(value) {
    if (value == null) return null;
    const s = String(value).trim();
    const m = s.match(/^(\d{4})-(\d{2})$/);
    if (!m) return parseDate(value);
    return new Date(Date.UTC(+m[1], +m[2] - 1, 1)).toISOString();
}

/** Strip HTML tags — used for progress_status badge text. */
function stripHtml(value) {
    if (value == null) return '';
    return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = {
    parseDate,
    parseYearMonth,
    decodeEntities,
    extractImgSrc,
    cleanText,
    toBool,
    stripHtml,
};
