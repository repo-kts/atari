const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ExcelJS = require('exceljs');
const JSZip = require('jszip');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(
    path.resolve(ROOT, relativePath),
    'utf8',
);

const reportTemplateService = require('../services/reports/reportTemplateService.js');
const reportExcelService = require('../services/reports/reportExcelService.js');
const reportWordService = require('../services/reports/reportWordService.js');

const STATE_WISE_TITLE = 'State Wise Details of Farmers';
const TRIAL_FIELD_LABEL = 'No. of Trial/Replication/Farmer';

function buildSectionsData() {
    const records = [
        {
            title: 'Seed treatment trial',
            numberOfTrialReplication: 5,
            numberOfLocation: 2,
            oftSubjectId: 1,
            oftSubject: { subjectName: 'Crop Production' },
            oftThematicArea: { thematicAreaName: 'Seed Management' },
            kvk: {
                kvkName: 'KVK Patna',
                state: { stateName: 'Bihar' },
            },
            farmersGeneralM: 8,
            farmersGeneralF: 4,
        },
        {
            title: 'Water management trial',
            numberOfTrialReplication: 3,
            numberOfLocation: 1,
            oftSubjectId: 1,
            oftSubject: { subjectName: 'Crop Production' },
            oftThematicArea: { thematicAreaName: 'Water Management' },
            kvk: {
                kvkName: 'KVK Ranchi',
                state: { stateName: 'Jharkhand' },
            },
            farmersGeneralM: 6,
            farmersGeneralF: 2,
        },
    ];

    return {
        '2.2': { data: { records, subjects: [] } },
        '2.2.1': { data: { records, subjects: [] } },
        '2.3': { data: records },
    };
}

test('BLA-62 uses the renamed OFT labels in all user-facing sources', () => {
    const stateWiseSources = [
        read('../frontend/src/config/reportIndexTaxonomy.ts'),
        read('config/reportIndexTaxonomy.js'),
        read('config/reportConfig.js'),
    ];
    const trialFieldSources = [
        read('../frontend/src/pages/dashboard/shared/forms/OftFldForms.tsx'),
        read('services/reports/formsTemplate/oftTemplates/oftSummaryTemplate.js'),
        read('services/reports/formsTemplate/oftTemplates/oftDetailCardsTemplate.js'),
    ];

    for (const source of stateWiseSources) {
        assert.match(source, new RegExp(STATE_WISE_TITLE));
        assert.doesNotMatch(source, /State Wise OFT Details/i);
    }
    for (const source of trialFieldSources) {
        assert.match(source, new RegExp(TRIAL_FIELD_LABEL.replaceAll('/', '\\/')));
        assert.doesNotMatch(source, /No\. of Trial\/Replications?(?!\/Farmer)/i);
    }
});

test('BLA-62 preserves the existing OFT payload and database field', () => {
    const formRepository = read('repositories/forms/oftRepository.js');
    const schema = read('prisma/kvk/achievements/oft_schema.prisma');

    assert.match(formRepository, /numberOfTrialReplication/);
    assert.match(schema, /numberOfTrialReplication Int/);
    assert.match(schema, /@map\("number_of_trial_replication"\)/);
});

test('comprehensive reports render both renamed OFT labels', async () => {
    const html = await reportTemplateService.generateReportHTML(
        { kvkId: null, kvkName: 'Patna Zone', isAggregatedView: true },
        buildSectionsData(),
        { year: 2026 },
        'Report Admin',
    );

    assert.match(html, new RegExp(STATE_WISE_TITLE));
    assert.match(html, new RegExp(TRIAL_FIELD_LABEL.replaceAll('/', '\\/')));
    assert.doesNotMatch(html, /State Wise OFT Details/i);
    assert.doesNotMatch(html, /No\. of Trial\/Replications?(?!\/Farmer)/i);
});

test('Excel and Word reports render both renamed OFT labels', async () => {
    const kvkInfo = {
        kvkId: null,
        kvkName: 'Patna Zone',
        isAggregatedView: true,
    };
    const excelBuffer = await reportExcelService.generateReportExcel(
        kvkInfo,
        buildSectionsData(),
        { year: 2026 },
        'Report Admin',
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
    const excelText = workbook.worksheets.flatMap(
        (worksheet) => worksheet.getSheetValues().flat(),
    ).filter(Boolean).join(' ');

    assert.match(excelText, new RegExp(STATE_WISE_TITLE));
    assert.match(excelText, new RegExp(TRIAL_FIELD_LABEL.replaceAll('/', '\\/')));

    const wordBuffer = await reportWordService.generateReportWord(
        kvkInfo,
        buildSectionsData(),
        { year: 2026 },
        'Report Admin',
    );
    const zip = await JSZip.loadAsync(wordBuffer);
    const documentXml = await zip.file('word/document.xml').async('string');
    const wordText = documentXml
        .replace(/<w:tab\/>/g, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ');

    assert.match(wordText, new RegExp(STATE_WISE_TITLE));
    assert.match(wordText, new RegExp(TRIAL_FIELD_LABEL.replaceAll('/', '\\/')));
});
