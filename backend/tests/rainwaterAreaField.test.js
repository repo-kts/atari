const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { getSectionConfig } = require('../config/reportConfig.js');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const {
    renderRainwaterHarvestingSection,
} = require('../services/reports/formsTemplate/projectTemplates/rainwaterHarvestingTemplate.js');

const BACKEND_ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.resolve(BACKEND_ROOT, relativePath), 'utf8');
}

test('BLA-51 persists and reports Rain Water Harvesting area in hectares', () => {
    const schema = read('prisma/kvk/performance-indicators/infrastructure/rainwater_harvesting_schema.prisma');
    assert.match(schema, /^\s*areaHa\s+Float\s+@default\(0\)\s+@map\("area_ha"\)/m);

    const formRepository = read('repositories/forms/rainwaterHarvestingRepository.js');
    assert.match(formRepository, /areaHa:\s*parseFloat\(data\.areaHa \|\| 0\)/);
    assert.match(formRepository, /data\.areaHa !== undefined[\s\S]*?existing\.areaHa/);

    const reportRepository = read('repositories/reports/rainwaterHarvestingReport/index.js');
    assert.match(reportRepository, /areaHa:\s*record\.areaHa \|\| 0/);

    const section = getSectionConfig('4.14');
    assert.ok(section, 'rainwater harvesting report section should exist');
    assert.equal(
        section.fields.some((field) => field.dbField === 'areaHa' && field.displayName === 'Area (ha)'),
        true,
    );

    const html = renderRainwaterHarvestingSection.call(
        reportTemplateService,
        section,
        [{
            trainingProgrammes: 12,
            demonstrations: 1,
            areaHa: 8.75,
            farmerVisits: 3,
            officialVisits: 4,
        }],
        'section-4-14',
        false,
        {},
    );

    assert.match(html, /Area \(ha\)/);
    assert.match(html, />8\.75</);

    const exportController = read('controllers/exportController.js');
    const exportBuilder = exportController.match(
        /function buildRainwaterHarvestingTabularData[\s\S]*?\n}\n\n/,
    );
    assert.ok(exportBuilder, 'rainwater harvesting export builder should exist');
    assert.match(exportBuilder[0], /'Area \(ha\)'/);
    assert.match(exportBuilder[0], /row\.areaHa \?\? 0/);

    const migration = read(
        'prisma/migrations/20260721030000_add_rainwater_area_ha/migration.sql',
    );
    assert.match(
        migration,
        /ALTER TABLE "rainwater_harvesting"[\s\S]*ADD COLUMN "area_ha" DOUBLE PRECISION NOT NULL DEFAULT 0/,
    );
});
