const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const {
  buildKvkGroupedDetailPayload,
} = require('../repositories/reports/worldSoilDayReport/worldSoilDayReportRepository.js');
const {
  renderWorldSoilDayPageReportSection,
} = require('../services/reports/formsTemplate/achievementTemplates/worldSoilDayPageReportTemplate.js');

function record(kvkName, id = 1) {
  return {
    worldSoilCelebrationId: id,
    kvkName,
    stateName: 'Bihar',
    activitiesConducted: 1,
    soilHealthCardDistributed: 2,
    farmersBenefitted: 3,
    vipCount: 0,
    vipNames: '',
    participants: 4,
  };
}

test('single-KVK World Soil Day reports label their summary row Total', () => {
  const records = [
    record('KVK Bhagalpur'),
    record('KVK Bhagalpur', 2),
  ];
  const payload = buildKvkGroupedDetailPayload(records);

  assert.equal(payload.isMultiKvk, false);
  assert.equal(payload.groups[0].subtotal.label, 'Total');

  const html = renderWorldSoilDayPageReportSection.call(
    { _escapeHtml: (value) => String(value) },
    { id: '1.6.C', title: 'World Soil Day' },
    { records },
    'section-1-6-c',
    false,
  );
  assert.match(html, />Total</);
  assert.doesNotMatch(html, /Sub-total/);
});

test('multi-KVK World Soil Day reports use Total for every KVK and retain a grand total', () => {
  const payload = buildKvkGroupedDetailPayload([
    record('KVK Bhagalpur'),
    record('KVK Patna', 2),
  ]);

  assert.equal(payload.isMultiKvk, true);
  assert.equal(payload.groups[0].subtotal.label, 'Total');
  assert.equal(payload.groups[1].subtotal.label, 'Total');
  assert.equal(payload.grandTotal.label, 'Grand Total (all KVKs)');
});
