const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('BLA-49 adds total area and optional description to infrastructure storage', () => {
    const schema = read('backend/prisma/kvk/about-kvk/infra_schema.prisma');
    const migration = read('backend/prisma/migrations/20260721010000_consolidate_land_into_infrastructure/migration.sql');

    assert.match(schema, /totalAreaSqM\s+Float\s+@default\(0\)\s+@map\("total_area_sqm"\)/);
    assert.match(schema, /description\s+String\?/);
    assert.match(migration, /ADD COLUMN "total_area_sqm" DOUBLE PRECISION NOT NULL DEFAULT 0/);
    assert.match(migration, /ADD COLUMN "description" TEXT/);
    assert.doesNotMatch(migration, /DROP TABLE|DELETE FROM "kvk_land_details"/);
});

test('BLA-49 infrastructure form and list expose the requested fields', () => {
    const form = read('frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx');
    const fields = read('frontend/src/constants/fieldNames.ts');

    assert.match(form, /label="Total Area \(m²\)"[\s\S]*?required/);
    assert.match(form, /label="Description"[\s\S]*?placeholder="Enter description \(optional\)"/);
    const nameIndex = form.indexOf('label="Name of Infrastructure"');
    const descriptionIndex = form.indexOf('label="Description"', nameIndex);
    const plinthIndex = form.indexOf('label="Completed upto plinth level"', nameIndex);
    const completedIndex = form.indexOf('label="Totally Completed"', nameIndex);
    const totalAreaIndex = form.indexOf('label="Total Area (m²)"', nameIndex);
    const underUseIndex = form.indexOf('label="Under use or not"', nameIndex);
    assert.ok(nameIndex < descriptionIndex && descriptionIndex < plinthIndex, 'Description should sit with the infrastructure name');
    assert.ok(completedIndex < totalAreaIndex && totalAreaIndex < underUseIndex, 'Total area should sit below Totally Completed');

    const group = fields.match(/INFRASTRUCTURE_DETAILS:\s*\[([\s\S]*?)\]\s*as const/);
    assert.ok(group, 'Infrastructure list field group should exist');
    assert.deepEqual(
        [...group[1].matchAll(/FIELD_NAMES\.([A-Z0-9_]+)/g)].map((match) => match[1]),
        ['KVK', 'INFRA_MASTER_NAME', 'UNDER_USE', 'SOURCE_OF_FUNDING', 'FUNDING_AGENCY_SPECIFY', 'TOTAL_AREA_SQ_M'],
    );
});

test('BLA-49 hides Land Details and Land Item Master navigation while retaining their implementations', () => {
    const { getSectionConfig } = require('../config/reportConfig.js');
    const { REPORT_INDEX_TAXONOMY } = require('../config/reportIndexTaxonomy.js');
    const infrastructure = getSectionConfig('1.5');
    const reportFields = infrastructure.fields.map((field) => field.displayName);

    assert.deepEqual(reportFields, [
        'KVK',
        'Name of Infrastructure',
        'Under use or not',
        'Source of Funding',
        'Funding Agency Name',
        'Total Area (m²)',
    ]);
    assert.equal(getSectionConfig('1.10'), undefined);
    assert.equal(
        REPORT_INDEX_TAXONOMY['1'].groups.flatMap((group) => group.features).some((feature) => feature.sectionId === '1.10'),
        false,
    );

    const routes = read('backend/routes/forms/aboutKvkRoutes.js');
    const form = read('frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx');
    const masters = read('frontend/src/config/route/allMasters.ts');
    const mastersTab = read('frontend/src/pages/dashboard/masters/AboutKvkMastersTab.tsx');
    const masterForm = read('frontend/src/pages/dashboard/shared/forms/OtherMastersForms.tsx');
    const masterApi = read('frontend/src/services/otherMastersApi.ts');
    assert.match(routes, /router\.get\('\/land-details'/);
    assert.match(form, /entityType === ENTITY_TYPES\.KVK_LAND_DETAILS/);
    assert.match(masters, /BLA-49: Land Item Master is intentionally hidden/);
    assert.match(mastersTab, /\/\/ \{ label: 'Land Item Master'/);
    assert.match(masterForm, /entityType === ENTITY_TYPES\.LAND_ITEM_MASTER/);
    assert.match(masterApi, /\/land-item-master/);
});
