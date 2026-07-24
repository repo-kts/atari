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
const prisma = require('../config/prisma.js');
const {
    getDrmrActivityData,
} = require('../repositories/reports/drmrReport/drmrActivityReportRepository.js');

function buildSectionsData() {
    return {
        '2.24': {
            data: [{
                kvkName: 'KVK Patna',
                reportingYear: '2026-01-01',
                activities: [
                    {
                        activityType: 'AWARENESS_CAMP',
                        specification: 'Soil health camp',
                        quantity: 4,
                        unit: 'No.',
                        generalM: 10,
                        generalF: 8,
                    },
                    {
                        activityType: 'OTHER',
                        specification: 'Mustard seed distribution',
                        quantity: 7,
                        unit: 'kg',
                        generalM: 5,
                        generalF: 3,
                    },
                ],
            }],
        },
    };
}

test('BLA-56 exposes both quantity fields in create/edit and list/view UI', () => {
    const form = read(
        '../frontend/src/pages/dashboard/shared/forms/projects/DrmrForms.tsx',
    );
    const fields = read('../frontend/src/constants/fieldNames.ts');
    const labels = read('../frontend/src/utils/exportUtils.ts');

    assert.match(
        form,
        /label="Quantity \(No\.\)"[\s\S]*?value=\{formData\.awareness_quantity/,
    );
    assert.match(
        form,
        /label="Quantity \(No\.\)"[\s\S]*?value=\{formData\.any_other_quantity/,
    );
    assert.match(fields, /AWARENESS_CAMPS_QUANTITY: 'awarenessCampsQuantity'/);
    assert.match(fields, /DRMR_ANY_OTHER_QUANTITY: 'drmrAnyOtherQuantity'/);
    assert.match(labels, /'awarenessCampsQuantity': 'Awareness Camps - Quantity \(No\.\)'/);
    assert.match(labels, /'drmrAnyOtherQuantity': 'Any Other - Quantity \(No\.\)'/);
});

test('BLA-56 uses the existing component quantity column without a migration', () => {
    const repository = read('repositories/forms/drmrActivityRepository.js');
    const schema = read(
        'prisma/kvk/achievements/projects/drmr/drmr_activity_schema.prisma',
    );

    assert.match(
        repository,
        /type: 'AWARENESS_CAMP'[\s\S]*?quantityKey: 'awareness_quantity'/,
    );
    assert.match(
        repository,
        /type: 'OTHER'[\s\S]*?quantityKey: 'any_other_quantity'/,
    );
    assert.match(schema, /quantity\s+Float\?\s+@map\("quantity"\)/);
});

test('DRMR report separates Name/Specification from Quantity', async () => {
    const html = await reportTemplateService.generateReportHTML(
        { kvkId: null, kvkName: 'Patna Zone', isAggregatedView: true },
        buildSectionsData(),
        { year: 2026 },
        'Report Admin',
    );

    assert.match(html, />Name\/Specification</);
    assert.match(
        html,
        /Awareness camps, exposure visit etc[\s\S]*?<td>Soil health camp<\/td>[\s\S]*?<td class="center">No\.<\/td>[\s\S]*?<td class="center">4<\/td>/,
    );
    assert.match(
        html,
        /Any other \(specify\)[\s\S]*?<td>Mustard seed distribution<\/td>[\s\S]*?<td class="center">kg<\/td>[\s\S]*?<td class="center">7<\/td>/,
    );
});

test('DRMR report repository maps specifications and quantities independently', async () => {
    const originalFindMany = prisma.drmrActivity.findMany;
    prisma.drmrActivity.findMany = async () => [{
        drmrActivityId: 1,
        kvkId: 1,
        kvk: {
            kvkName: 'KVK Patna',
            state: { stateName: 'Bihar' },
            district: { districtName: 'Patna' },
        },
        reportingYear: new Date('2026-01-01T00:00:00.000Z'),
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-12-31T00:00:00.000Z'),
        totalBudgetUtilized: 1000,
        components: [
            {
                activityType: 'AWARENESS_CAMP',
                specification: 'Soil health camp',
                quantity: 4,
                unit: 'No.',
            },
            {
                activityType: 'OTHER',
                specification: 'Mustard seed distribution',
                quantity: 7,
                unit: 'kg',
            },
        ],
    }];

    try {
        const [record] = await getDrmrActivityData(1);
        assert.equal(record.awareness_count, 'Soil health camp');
        assert.equal(record.awareness_quantity, 4);
        assert.equal(record.awarenessCampsQuantity, 4);
        assert.equal(record.any_other_count, 'Mustard seed distribution');
        assert.equal(record.any_other_quantity, 7);
        assert.equal(record.drmrAnyOtherQuantity, 7);
    } finally {
        prisma.drmrActivity.findMany = originalFindMany;
    }
});

test('Excel and Word DRMR reports include specifications and quantities', async () => {
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

    assert.match(excelText, /Name\/Specification/);
    assert.match(excelText, /Soil health camp/);
    assert.match(excelText, /Mustard seed distribution/);

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

    assert.match(wordText, /Name\/Specification/);
    assert.match(wordText, /Soil health camp/);
    assert.match(wordText, /Mustard seed distribution/);
});

test('standalone tabular exports keep specification and quantity separate', () => {
    const controller = read('controllers/exportController.js');

    assert.match(controller, /'Name\/Specification'/);
    assert.match(
        controller,
        /activityType: 'AWARENESS_CAMP'[\s\S]*?valueKey: 'awareness_quantity'[\s\S]*?specificationKey: 'awareness_count'/,
    );
    assert.match(
        controller,
        /activityType: 'OTHER'[\s\S]*?valueKey: 'any_other_quantity'[\s\S]*?specificationKey: 'any_other_count'/,
    );
});
