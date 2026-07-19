const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildCalendarYearRange,
  buildReportingYearClause,
} = require('../utils/dashboardScope.js');

test('dashboard reporting-year range follows the selected calendar year', () => {
  const { start, endExclusive } = buildCalendarYearRange(2025);

  assert.equal(start.toISOString(), '2025-01-01T00:00:00.000Z');
  assert.equal(endExclusive.toISOString(), '2026-01-01T00:00:00.000Z');
});

test('OFT dashboard clause matches reporting year with start-date legacy fallback', () => {
  const clause = buildReportingYearClause(2025, 'oftStartDate');
  const expectedRange = {
    gte: new Date('2025-01-01T00:00:00.000Z'),
    lt: new Date('2026-01-01T00:00:00.000Z'),
  };

  assert.deepEqual(clause, {
    OR: [
      { reportingYear: expectedRange },
      { reportingYear: null, oftStartDate: expectedRange },
    ],
  });
  assert.doesNotMatch(JSON.stringify(clause), /expectedCompletionDate/);
});

test('FLD dashboard clause uses the same reporting year as its list', () => {
  assert.deepEqual(buildReportingYearClause(2025, 'startDate'), {
    OR: [
      {
        reportingYear: {
          gte: new Date('2025-01-01T00:00:00.000Z'),
          lt: new Date('2026-01-01T00:00:00.000Z'),
        },
      },
      {
        reportingYear: null,
        startDate: {
          gte: new Date('2025-01-01T00:00:00.000Z'),
          lt: new Date('2026-01-01T00:00:00.000Z'),
        },
      },
    ],
  });
  assert.deepEqual(buildReportingYearClause('all', 'startDate'), {});
});
