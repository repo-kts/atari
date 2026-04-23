const { ValidationError } = require('../utils/errorHandler.js');

function parseDateOnly(dateStr) {
    if (!dateStr) return null;

    if (dateStr instanceof Date) {
        if (isNaN(dateStr.getTime())) return null;
        return new Date(Date.UTC(
            dateStr.getUTCFullYear(),
            dateStr.getUTCMonth(),
            dateStr.getUTCDate()
        ));
    }

    if (typeof dateStr !== 'string') return null;
    const trimmed = dateStr.trim();
    if (!trimmed) return null;

    // Prefer the explicit date prefix from ISO-like values to avoid timezone drift.
    const datePrefix = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (datePrefix) {
        const [, y, m, d] = datePrefix;
        const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
        return isNaN(dt.getTime()) ? null : dt;
    }

    // Fallback for other valid date strings.
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return null;
    return new Date(Date.UTC(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate()
    ));
}

function todayDateOnly() {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function shouldAllowDecimal(key) {
    const k = String(key || '').toLowerCase();
    return (
        k.includes('ha') ||
        k.includes('area') ||
        k.includes('expenditure') ||
        k.includes('amount') ||
        k.includes('cost') ||
        k.includes('budget') ||
        k.includes('yield') ||
        k.includes('percentage') ||
        k.includes('percent') ||
        k.includes('return') ||
        k.includes('bcr') ||
        k.includes('quantity') ||
        k.includes('latitude') ||
        k.includes('longitude') ||
        // soil params
        k.includes('ph') ||
        k.includes('ec') ||
        k.includes('oc')
    );
}

function shouldAllowNegative(key) {
    const k = String(key || '').toLowerCase();
    // Geographic coordinates and economic delta fields can legitimately be negative.
    return (
        k.includes('latitude') ||
        k.includes('longitude') ||
        k.includes('netreturn') ||
        k.includes('net_return') ||
        k.includes('percent') ||
        k.includes('increase')
    );
}

function isValidNumberString(v) {
    if (typeof v === 'number') return Number.isFinite(v);
    if (typeof v !== 'string') return false;
    if (v.trim() === '') return false;
    // Validate numeric structure (sign/decimals enforced by other checks)
    return /^-?\d+(\.\d+)?$/.test(v.trim());
}

function validateNumbers(body) {
    for (const [key, value] of Object.entries(body || {})) {
        // Skip id fields
        if (key.toLowerCase().endsWith('id')) continue;
        if (value === null || value === undefined || value === '') continue;

        if (!isValidNumberString(value)) continue;

        const str = String(value).trim();
        const hasDecimals = str.includes('.');
        const num = Number(str);
        if (!Number.isFinite(num)) continue;

        if (hasDecimals && !shouldAllowDecimal(key)) {
            throw new ValidationError(`Field "${key}" must be a whole number`, key);
        }

        if (num < 0 && !shouldAllowNegative(key)) {
            throw new ValidationError(`Field "${key}" cannot be negative`, key);
        }
    }
}

function validateDateOrdering(body) {
    const keys = Object.keys(body || {});
    const normalize = (key) => String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const isStartKey = (key) => {
        const k = normalize(key);
        return k === 'startdate' || k === 'startdt' || (k.includes('start') && k.includes('date'));
    };
    const isEndKey = (key) => {
        const k = normalize(key);
        return k === 'enddate' || k === 'enddt' || (k.includes('end') && k.includes('date'));
    };

    const startKey = keys.find((k) => isStartKey(k) && !!parseDateOnly(body[k]));
    const endKey = keys.find((k) => isEndKey(k) && !!parseDateOnly(body[k]));
    if (!startKey || !endKey) return;

    const startDt = parseDateOnly(body[startKey]);
    const endDt = parseDateOnly(body[endKey]);
    if (!startDt || !endDt) return;

    if (endDt.getTime() < startDt.getTime()) {
        throw new ValidationError(`"${endKey}" cannot be before "${startKey}"`, endKey);
    }
}

function validateNoFutureDates(body) {
    const today = todayDateOnly();

    for (const [key, value] of Object.entries(body || {})) {
        if (!value || typeof value !== 'string') continue;
        // Heuristic: any key containing "date" could be a date field from frontend date input.
        if (!key.toLowerCase().includes('date')) continue;

        const dt = parseDateOnly(value);
        if (!dt) continue;

        // Allow future dates only for "target date"-type fields.
        if (String(key).toLowerCase().includes('target')) continue;

        if (dt.getTime() > today.getTime()) {
            throw new ValidationError(`"${key}" cannot be in the future`, key);
        }
    }
}

/**
 * Middleware for robust form validation:
 * - Numeric fields: block decimals for integer fields (heuristic-based)
 * - Date fields:
 *   - startDate/endDate ordering
 *   - no future dates except fields containing "target"
 */
function validateFormRobustness(req, res, next) {
    try {
        if (!req.body || typeof req.body !== 'object') return next();
        if (Array.isArray(req.body)) return next();

        validateNumbers(req.body);
        validateDateOrdering(req.body);
        validateNoFutureDates(req.body);

        next();
    } catch (err) {
        next(err);
    }
}

module.exports = { validateFormRobustness };
