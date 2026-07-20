const test = require('node:test');
const assert = require('node:assert/strict');

const { REGISTRY } = require('../config/formSummaryRegistry.js');

const REQUIRED_LINKS = {
  'about_kvk.staff_transferred': '/forms/about-kvk/staff-transferred',
  'achievements.soil_analysis': '/forms/achievements/soil-analysis',
  'projects.nf_demonstration':
    '/forms/achievements/projects/natural-farming/demonstration-information',
};

test('BLA-32 forms expose their canonical Form Summary links', () => {
  const entriesByKey = new Map(REGISTRY.map((entry) => [entry.key, entry]));

  for (const [key, expectedPath] of Object.entries(REQUIRED_LINKS)) {
    const entry = entriesByKey.get(key);
    assert.ok(entry, `${key} should be registered in Form Summary`);
    assert.equal(entry.path, expectedPath, `${key} should link to its form page`);
  }
});

test('BLA-32 Staff Transferred counts transfer history for both involved KVKs', () => {
  const entry = REGISTRY.find((item) => item.key === 'about_kvk.staff_transferred');

  assert.ok(entry);
  assert.equal(entry.model, 'staffTransferHistory');
  assert.deepEqual(entry.kvkFields, ['fromKvkId', 'toKvkId']);
  assert.equal(entry.where, undefined);
});
