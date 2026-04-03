const test = require('node:test');
const assert = require('node:assert/strict');

const {
    resolveReportingYearId,
    normalizeReportingYearPayload,
    formatReportingYearLabel,
} = require('../utils/reportingYearUtils.js');

const YEAR_ROWS = [
    { yearId: 1, yearName: '2023-04-01T00:00:00.000Z' },
    { yearId: 2, yearName: '2024-01-01T00:00:00.000Z' },
    { yearId: 3, yearName: '2024-04-01T00:00:00.000Z' },
];

test('resolveReportingYearId resolves a valid numeric ID directly', () => {
    assert.equal(resolveReportingYearId('2', YEAR_ROWS), 2);
});

test('resolveReportingYearId rejects legacy fiscal-year strings', () => {
    assert.equal(resolveReportingYearId('2024-25', YEAR_ROWS), null);
});

test('resolveReportingYearId resolves date-like year names by date prefix', () => {
    assert.equal(resolveReportingYearId('2024-04-01', YEAR_ROWS), 3);
});

test('resolveReportingYearId rejects year-only values (strict date mode)', () => {
    assert.equal(resolveReportingYearId('2023', YEAR_ROWS), null);
});

test('normalizeReportingYearPayload sets reportingYearId/yearId from date reportingYear string', () => {
    const payload = { reportingYear: '2024-04-01' };
    const result = normalizeReportingYearPayload(payload, YEAR_ROWS);

    assert.equal(result.resolvedId, 3);
    assert.equal(payload.reportingYearId, 3);
    assert.equal(payload.yearId, 3);
});

test('normalizeReportingYearPayload strips unresolved legacy reportingYear strings when configured', () => {
    const payload = { reportingYear: 'not-a-real-year' };
    normalizeReportingYearPayload(payload, YEAR_ROWS, { stripUnresolvedLegacyFields: true });

    assert.equal(payload.reportingYear, undefined);
});

test('formatReportingYearLabel returns ISO date for date-like strings', () => {
    assert.equal(formatReportingYearLabel('2024-04-01T00:00:00.000Z'), '2024-04-01');
});

test('formatReportingYearLabel rejects non-date strings in strict mode', () => {
    assert.equal(formatReportingYearLabel('2024-25'), '');
});
