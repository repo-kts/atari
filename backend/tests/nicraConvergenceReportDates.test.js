const test = require('node:test');
const assert = require('node:assert/strict');

const {
  renderNicraConvergenceReportSection,
} = require('../services/reports/formsTemplate/projectTemplates/nicraConvergenceReportTemplate.js');

function render(records) {
  return renderNicraConvergenceReportSection.call(
    { _escapeHtml: (value) => String(value) },
    { id: '2.43', title: 'NICRA – Convergence Programme' },
    records,
    'section-2-43',
    false,
  );
}

test('NICRA Convergence reports format Prisma Date objects as calendar dates', () => {
  const html = render([{
    kvkName: 'KVK Bhagalpur',
    startDate: new Date('2025-04-01T00:00:00.000Z'),
    endDate: new Date('2025-12-31T00:00:00.000Z'),
    developmentSchemeProgramme: 'District programme',
    natureOfWork: 'Coordination',
    amountRs: 100,
  }]);

  assert.match(html, />01-04-2025</);
  assert.match(html, />31-12-2025</);
  assert.doesNotMatch(html, /GMT|Coordinated Universal Time/);
});

test('NICRA Convergence reports preserve date-only and ISO timestamp values', () => {
  const html = render([
    {
      kvkName: 'KVK Bhagalpur',
      startDate: '2025-04-01',
      endDate: '2025-12-31T00:00:00.000Z',
      developmentSchemeProgramme: 'District programme',
      natureOfWork: 'Coordination',
      amountRs: 100,
    },
  ]);

  assert.match(html, />01-04-2025</);
  assert.match(html, />31-12-2025</);
});
