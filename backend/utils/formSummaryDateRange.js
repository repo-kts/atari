const { ValidationError } = require('./errorHandler.js');

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseBoundary(value, label, endOfDay) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || !DATE_ONLY_PATTERN.test(value)) {
    throw new ValidationError(`${label} must be a valid date`, label);
  }

  const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
  const parsed = new Date(`${value}${suffix}`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new ValidationError(`${label} must be a valid date`, label);
  }
  return parsed;
}

function parseSummaryDateRange(fromDate, toDate) {
  const gte = parseBoundary(fromDate, 'fromDate', false);
  const lte = parseBoundary(toDate, 'toDate', true);

  if (!gte && !lte) return null;
  if (gte && lte && gte.getTime() > lte.getTime()) {
    throw new ValidationError('From date cannot be after To date', 'fromDate');
  }

  return {
    ...(gte ? { gte } : {}),
    ...(lte ? { lte } : {}),
  };
}

module.exports = { parseSummaryDateRange };
