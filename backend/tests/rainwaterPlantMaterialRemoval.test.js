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

test('rainwater harvesting reports omit plant material from every output path', () => {
    const section = getSectionConfig('4.14');
    assert.ok(section, 'rainwater harvesting report section should exist');
    assert.equal(
        section.fields.some((field) => field.dbField === 'plantMaterial'),
        false,
    );

    const html = renderRainwaterHarvestingSection.call(
        reportTemplateService,
        section,
        [{
            trainingProgrammes: 12,
            demonstrations: 1,
            plantMaterial: 987654321,
            farmerVisits: 3,
            officialVisits: 4,
        }],
        'section-4-14',
        false,
        {},
    );

    assert.doesNotMatch(html, /plant material/i);
    assert.doesNotMatch(html, /987654321/);

    const reportRepository = read('repositories/reports/rainwaterHarvestingReport/index.js');
    assert.doesNotMatch(reportRepository, /plantMaterial/);

    const exportController = read('controllers/exportController.js');
    const exportBuilder = exportController.match(
        /function buildRainwaterHarvestingTabularData[\s\S]*?\n}\n\n/,
    );
    assert.ok(exportBuilder, 'rainwater harvesting export builder should exist');
    assert.doesNotMatch(exportBuilder[0], /plant material|plantMaterial/i);
});
