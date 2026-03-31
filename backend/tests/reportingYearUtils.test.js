const test = require('node:test');
const assert = require('node:assert/strict');

const {
    resolveReportingYearId,
    normalizeReportingYearPayload,
    formatReportingYearLabel,
} = require('../utils/reportingYearUtils.js');

const YEAR_ROWS = [
    { yearId: 1, yearName: '2023-24' },
    { yearId: 2, yearName: '2024-25' },
    { yearId: 3, yearName: '2024-04-01T00:00:00.000Z' },
];

test('resolveReportingYearId resolves a valid numeric ID directly', () => {
    assert.equal(resolveReportingYearId('2', YEAR_ROWS), 2);
});

test('resolveReportingYearId resolves exact legacy year-name strings', () => {
    assert.equal(resolveReportingYearId('2024-25', YEAR_ROWS), 2);
});

test('resolveReportingYearId resolves date-like year names by date prefix', () => {
    assert.equal(resolveReportingYearId('2024-04-01', YEAR_ROWS), 3);
});

test('resolveReportingYearId resolves start-year values to matching fiscal rows', () => {
    assert.equal(resolveReportingYearId('2023', YEAR_ROWS), 1);
});

test('normalizeReportingYearPayload sets reportingYearId/yearId from legacy reportingYear string', () => {
    const payload = { reportingYear: '2024-25' };
    const result = normalizeReportingYearPayload(payload, YEAR_ROWS);

    assert.equal(result.resolvedId, 2);
    assert.equal(payload.reportingYearId, 2);
    assert.equal(payload.yearId, 2);
});

test('normalizeReportingYearPayload strips unresolved legacy reportingYear strings when configured', () => {
    const payload = { reportingYear: 'not-a-real-year' };
    normalizeReportingYearPayload(payload, YEAR_ROWS, { stripUnresolvedLegacyFields: true });

    assert.equal(payload.reportingYear, undefined);
});

test('formatReportingYearLabel returns start year for date-like strings', () => {
    assert.equal(formatReportingYearLabel('2024-04-01T00:00:00.000Z'), '2024');
});

test('formatReportingYearLabel preserves fiscal year strings', () => {
    assert.equal(formatReportingYearLabel('2024-25'), '2024-25');
});
