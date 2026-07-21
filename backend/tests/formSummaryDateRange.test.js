const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { parseSummaryDateRange } = require('../utils/formSummaryDateRange.js');
const { resolveDateField } = require('../services/formSummaryService.js');

test('BLA-52 builds inclusive Form Summary date ranges', () => {
  assert.equal(parseSummaryDateRange(undefined, undefined), null);

  const range = parseSummaryDateRange('2025-04-01', '2026-03-31');
  assert.equal(range.gte.toISOString(), '2025-04-01T00:00:00.000Z');
  assert.equal(range.lte.toISOString(), '2026-03-31T23:59:59.999Z');

  assert.deepEqual(
    Object.keys(parseSummaryDateRange('2025-04-01', undefined)),
    ['gte'],
  );
  assert.deepEqual(
    Object.keys(parseSummaryDateRange(undefined, '2026-03-31')),
    ['lte'],
  );
});

test('BLA-52 rejects invalid or reversed Form Summary date ranges', () => {
  assert.throws(
    () => parseSummaryDateRange('2026-02-30', '2026-03-31'),
    /fromDate must be a valid date/,
  );
  assert.throws(
    () => parseSummaryDateRange('2026-04-01', '2026-03-31'),
    /From date cannot be after To date/,
  );
});

test('BLA-52 filters reportingYearDate-backed forms as well as reportingYear forms', () => {
  assert.equal(resolveDateField('rainwaterHarvesting'), 'reportingYear');
  assert.equal(resolveDateField('kvkBudgetUtilization'), 'reportingYearDate');
  assert.equal(resolveDateField('beneficiariesDetails'), 'reportingYearDate');
  assert.equal(resolveDateField('kvkBankAccount'), null);
});
