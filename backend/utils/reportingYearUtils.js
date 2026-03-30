const { ValidationError } = require('./errorHandler.js');

function toDate(input) {
    if (input instanceof Date) return new Date(input.getTime());
    if (typeof input === 'string' || typeof input === 'number') {
        const parsed = new Date(input);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
}

function parseReportingYearDate(input) {
    if (input === null || input === undefined || input === '') return null;
    const date = toDate(input);
    if (!date) {
        throw new ValidationError('Invalid reportingYear date');
    }
    return date;
}

function ensureNotFutureDate(date) {
    if (!date) return;
    if (date.getTime() > Date.now()) {
        throw new ValidationError('Reporting year date cannot be in the future');
    }
}

function normalizeDateRange({ from, to }) {
    const gteDate = parseReportingYearDate(from);
    const lteDate = parseReportingYearDate(to);

    if (!gteDate && !lteDate) return {};

    if (gteDate) {
        gteDate.setHours(0, 0, 0, 0);
        ensureNotFutureDate(gteDate);
    }
    if (lteDate) {
        lteDate.setHours(23, 59, 59, 999);
        ensureNotFutureDate(lteDate);
    }
    if (gteDate && lteDate && gteDate.getTime() > lteDate.getTime()) {
        throw new ValidationError('reportingYearFrom cannot be greater than reportingYearTo');
    }

    return {
        ...(gteDate ? { gte: gteDate } : {}),
        ...(lteDate ? { lte: lteDate } : {}),
    };
}

function formatReportingYear(value) {
    const date = toDate(value);
    if (!date) return '';
    return String(date.getUTCFullYear());
}

module.exports = {
    parseReportingYearDate,
    ensureNotFutureDate,
    normalizeDateRange,
    formatReportingYear,
};
