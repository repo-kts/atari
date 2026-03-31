const { ValidationError } = require('./errorHandler.js');

const INTEGER_PATTERN = /^\d+$/;
const STRICT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[Tt].*)?$/;

function toDate(input) {
    if (input instanceof Date) {
        return Number.isNaN(input.getTime()) ? null : new Date(input.getTime());
    }

    if (typeof input === 'string' || typeof input === 'number') {
        const parsed = new Date(input);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }

    return null;
}

function toIsoDate(date) {
    return date.toISOString().split('T')[0];
}

function isStrictDateString(value) {
    return typeof value === 'string' && STRICT_DATE_PATTERN.test(value.trim());
}

function parseReportingYearDate(input) {
    if (input === null || input === undefined || input === '') return null;

    if (input instanceof Date) {
        if (Number.isNaN(input.getTime())) {
            throw new ValidationError('Invalid reportingYear date');
        }
        return new Date(input.getTime());
    }

    if (typeof input !== 'string' || !isStrictDateString(input)) {
        throw new ValidationError('Invalid reportingYear date');
    }

    const parsed = new Date(input.trim());
    if (Number.isNaN(parsed.getTime())) {
        throw new ValidationError('Invalid reportingYear date');
    }

    return parsed;
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
    return toIsoDate(date);
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPositiveInteger(value) {
    if (typeof value === 'number') {
        return Number.isInteger(value) && value > 0;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return INTEGER_PATTERN.test(trimmed) && parseInt(trimmed, 10) > 0;
    }

    return false;
}

function parsePositiveInteger(value) {
    if (!isPositiveInteger(value)) return null;
    return typeof value === 'number' ? value : parseInt(value.trim(), 10);
}

function normalizeYearName(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

function parseStrictDate(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (!isStrictDateString(value)) return null;

    const parsed = new Date(value.trim());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveReportingYearId(inputValue, yearRows = []) {
    if (!Array.isArray(yearRows) || yearRows.length === 0) {
        return null;
    }

    const numericInput = parsePositiveInteger(inputValue);
    if (numericInput !== null) {
        const idMatch = yearRows.find((row) => row && row.yearId === numericInput);
        if (idMatch) return idMatch.yearId;
    }

    const parsedInputDate = parseStrictDate(inputValue);
    if (!parsedInputDate) return null;

    const inputIsoDate = toIsoDate(parsedInputDate).toLowerCase();

    const normalizedRows = yearRows
        .filter((row) => row && row.yearId !== undefined && row.yearId !== null)
        .map((row) => {
            const normalizedName = normalizeYearName(row.yearName).toLowerCase();
            const rowDate = toDate(row.yearName);
            const rowIsoDate = rowDate ? toIsoDate(rowDate).toLowerCase() : '';

            return {
                yearId: row.yearId,
                normalizedName,
                rowIsoDate,
            };
        });

    const matched = normalizedRows.find(
        (row) =>
            row.rowIsoDate === inputIsoDate ||
            row.normalizedName === inputIsoDate ||
            row.normalizedName.startsWith(`${inputIsoDate}t`) ||
            row.normalizedName.startsWith(inputIsoDate)
    );

    return matched ? matched.yearId : null;
}

function normalizeReportingYearPayload(payload, yearRows = [], options = {}) {
    const { stripUnresolvedLegacyFields = false } = options;

    if (!isPlainObject(payload)) {
        return { changed: false, resolvedId: null };
    }

    const hasReportingYearField =
        payload.reportingYearId !== undefined ||
        payload.yearId !== undefined ||
        payload.reportingYear !== undefined ||
        payload.year !== undefined;

    if (!hasReportingYearField) {
        return { changed: false, resolvedId: null };
    }

    const rawValue =
        payload.reportingYearId ??
        payload.yearId ??
        payload.reportingYear ??
        payload.year;

    const resolvedId = resolveReportingYearId(rawValue, yearRows);
    let changed = false;

    if (resolvedId !== null) {
        if (payload.reportingYearId !== resolvedId) {
            payload.reportingYearId = resolvedId;
            changed = true;
        }

        if (
            payload.yearId !== undefined ||
            payload.reportingYear !== undefined ||
            payload.year !== undefined
        ) {
            if (payload.yearId !== resolvedId) {
                payload.yearId = resolvedId;
                changed = true;
            }
        }
    } else if (stripUnresolvedLegacyFields && typeof rawValue === 'string') {
        const trimmedRaw = rawValue.trim();
        const isLegacyString =
            trimmedRaw !== '' &&
            !INTEGER_PATTERN.test(trimmedRaw) &&
            !STRICT_DATE_PATTERN.test(trimmedRaw);

        if (
            isLegacyString &&
            payload.reportingYearId === undefined &&
            payload.yearId === undefined
        ) {
            if (Object.prototype.hasOwnProperty.call(payload, 'reportingYear')) {
                delete payload.reportingYear;
                changed = true;
            }
            if (
                Object.prototype.hasOwnProperty.call(payload, 'year') &&
                typeof payload.year === 'string'
            ) {
                delete payload.year;
                changed = true;
            }
        }
    }

    return { changed, resolvedId };
}

function formatReportingYearLabel(value) {
    if (value === null || value === undefined || value === '') return '';

    if (isPlainObject(value)) {
        if (value.yearName !== undefined) {
            return formatReportingYearLabel(value.yearName);
        }
        return '';
    }

    const date = toDate(value);
    if (date) {
        return toIsoDate(date);
    }

    return '';
}

module.exports = {
    parseReportingYearDate,
    ensureNotFutureDate,
    normalizeDateRange,
    formatReportingYear,
    resolveReportingYearId,
    normalizeReportingYearPayload,
    formatReportingYearLabel,
    isStrictDateString,
};
