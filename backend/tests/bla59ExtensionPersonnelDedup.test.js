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

const {
    buildPayloadFromRecords,
} = require('../repositories/reports/trainingCapacityReport/trainingCapacityReportRepository.js');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const reportExcelService = require('../services/reports/reportExcelService.js');
const reportWordService = require('../services/reports/reportWordService.js');

const RETAINED_TYPE = 'Extension Functionaries/ Personnel';

function buildRecords() {
    const base = {
        kvkId: 1,
        stateName: 'Bihar',
        clienteleId: 1,
        clienteleName: 'Farmers',
        campusType: 'ON_CAMPUS',
        titleOfTraining: 'Extension methods',
        startDate: '2026-01-10',
        endDate: '2026-01-11',
        trainingAreaId: 10,
        trainingAreaName: 'Extension Personnel',
        thematicAreaName: 'Communication skills',
        generalM: 10,
        generalF: 12,
        obcM: 5,
        obcF: 7,
        scM: 8,
        scF: 9,
        stM: 6,
        stF: 5,
    };

    return [
        {
            ...base,
            trainingAchievementId: 1,
            trainingTypeId: 1,
            trainingTypeName: 'Extension Functionaries / Personnel',
            thematicAreaId: 100,
        },
        {
            ...base,
            trainingAchievementId: 2,
            trainingTypeId: 2,
            trainingTypeName: 'Extension Personnel',
            thematicAreaId: 101,
            thematicAreaName: 'Participatory methods',
        },
    ];
}

test('BLA-59 merges legacy personnel aliases into one retained training type', () => {
    const payload = buildPayloadFromRecords(buildRecords(), { year: 2026 });
    const extensionSections = payload.sections.filter(
        (section) => section.trainingTypeName === RETAINED_TYPE,
    );
    const extensionConsolidated = payload.kvkConsolidatedSections.filter(
        (section) => section.trainingTypeName === RETAINED_TYPE,
    );

    assert.equal(extensionSections.length, 1);
    assert.equal(extensionConsolidated.length, 1);
    assert.equal(
        payload.sections.some((section) => section.trainingTypeName === 'Extension Personnel'),
        false,
    );

    const [areaRow] = extensionConsolidated[0].rows.filter(
        (row) => row.kind === 'area',
    );
    const [subtotal] = extensionConsolidated[0].rows.filter(
        (row) => row.kind === 'subtotal',
    );
    assert.equal(areaRow.trainingAreaName, 'Extension Personnel');
    assert.equal(subtotal.courses, 2);
});

test('KVK and aggregated report HTML omit the artificial personnel heading', async () => {
    const payload = buildPayloadFromRecords(buildRecords(), { year: 2026 });
    const sectionsData = { '2.7': { data: { payload } } };
    const [kvkHtml, aggregatedHtml] = await Promise.all([
        reportTemplateService.generateReportHTML(
            { kvkId: 1, kvkName: 'KVK Patna', isAggregatedView: false },
            sectionsData,
            { year: 2026 },
            'Report Admin',
        ),
        reportTemplateService.generateReportHTML(
            { kvkId: null, kvkName: 'Patna Zone', isAggregatedView: true },
            sectionsData,
            { year: 2026 },
            'Report Admin',
        ),
    ]);

    for (const html of [kvkHtml, aggregatedHtml]) {
        assert.match(
            html,
            /<div class="tcap-type-heading">Extension Functionaries\/ Personnel<\/div>/,
        );
        assert.doesNotMatch(
            html,
            /<div class="tcap-type-heading">Extension Personnel<\/div>/,
        );
        assert.match(html, />Extension Personnel<\/td>/);
    }
});

test('Excel and Word keep only the valid personnel area under the retained type', async () => {
    const payload = buildPayloadFromRecords(buildRecords(), { year: 2026 });
    const sectionsData = { '2.7': { data: { payload } } };
    const kvkInfo = {
        kvkId: 1,
        kvkName: 'KVK Patna',
        isAggregatedView: false,
    };

    const excelBuffer = await reportExcelService.generateReportExcel(
        kvkInfo,
        sectionsData,
        { year: 2026 },
        'Report Admin',
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
    const cellValues = workbook.worksheets.flatMap(
        (worksheet) => worksheet.getSheetValues().flat(),
    ).filter((value) => typeof value === 'string').map((value) => value.trim());

    // The structured Excel writer omits the HTML block headings, but retains
    // the valid training-area row once in each A/B table. The old duplicate
    // type would add two more exact "Extension Personnel" rows.
    assert.equal(
        cellValues.filter((value) => value === 'Extension Personnel').length,
        2,
    );

    const wordBuffer = await reportWordService.generateReportWord(
        kvkInfo,
        sectionsData,
        { year: 2026 },
        'Report Admin',
    );
    const zip = await JSZip.loadAsync(wordBuffer);
    const documentXml = await zip.file('word/document.xml').async('string');
    const wordText = documentXml
        .replace(/<w:tab\/>/g, ' ')
        .replace(/<[^>]+>/g, '\n')
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean);

    assert.equal(
        wordText.filter((value) => value === 'Extension Personnel').length,
        2,
    );
});

test('training master seed retains one functionaries type and the personnel area', () => {
    const seed = read('scripts/seed-masters.js');
    const trainingTypeBlock = seed.match(
        /const TRAINING_TYPES = \[[\s\S]*?\];/,
    )?.[0] || '';

    assert.match(trainingTypeBlock, /'Extension Functionaries\/ Personnel'/);
    assert.doesNotMatch(trainingTypeBlock, /'Extension Personnel'/);
    assert.match(
        seed,
        /'Extension Functionaries\/ Personnel': \['Extension Personnel'\]/,
    );
});
