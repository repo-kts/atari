const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('BLA-50 adds the Demo Unit name master and migrates existing names', () => {
  const masterSchema = read('backend/prisma/superadmin/masters/demo_unit_name.prisma');
  const migration = read('backend/prisma/migrations/20260721000000_demo_unit_master_status/migration.sql');

  assert.match(masterSchema, /model DemoUnitNameMaster/);
  assert.match(masterSchema, /demoUnitName\s+String\s+@unique/);
  assert.match(migration, /CREATE TABLE "demo_unit_name_master"/);
  assert.match(migration, /SELECT DISTINCT BTRIM\("demo_unit_name"\)/);
});

test('BLA-50 form uses master-backed name and Functional status options', () => {
  const form = read('frontend/src/pages/dashboard/shared/forms/performance-indicators/InfrastructurePerformanceForms.tsx');
  const demoBlock = form.slice(
    form.indexOf('{/* 1. Performance of Demonstration Units */}'),
    form.indexOf('{/* 2. Performance of Instructional Farm (Crops) */}'),
  );

  assert.match(demoBlock, /MasterDataDropdown[\s\S]*label="Name of Demo Unit"/);
  assert.match(demoBlock, /label="Status"/);
  assert.match(form, /value: 'Functional'/);
  assert.match(form, /value: 'Non-Functional'/);

  for (const retiredLabel of [
    'Variety/Breed',
    'Produce',
    'Quantity',
    'Cost of Inputs',
    'Gross Income',
    'Remarks',
  ]) {
    assert.doesNotMatch(demoBlock, new RegExp(`label="${retiredLabel}"`));
  }
});

test('BLA-50 report and download output contain Status and omit retired fields', () => {
  const template = read('backend/services/reports/formsTemplate/projectTemplates/demonstrationUnitTemplate.js');
  const exportController = read('backend/controllers/exportController.js');
  const exportBlock = exportController.slice(
    exportController.indexOf('function buildDemonstrationUnitTabularData'),
    exportController.indexOf('function buildInstructionalFarmCropTabularData'),
  );

  assert.match(template, /<th>Status<\/th>/);
  assert.match(template, /record\.status/);
  assert.match(exportBlock, /'Status'/);
  assert.match(exportBlock, /row\.status/);

  for (const retiredLabel of [
    'Variety\/Breed',
    'Produce',
    'Qty\\.',
    'Cost of Inputs',
    'Gross Income',
    'Remarks',
  ]) {
    assert.doesNotMatch(template, new RegExp(retiredLabel));
    assert.doesNotMatch(exportBlock, new RegExp(retiredLabel));
  }
});
