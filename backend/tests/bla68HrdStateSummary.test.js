const test = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');
const JSZip = require('jszip');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const {
    buildHrdStateSummary,
    renderHrdProgrammesSection,
} = require('../services/reports/formsTemplate/achievementTemplates/hrdProgrammesTemplate.js');
const {
    generateHrdProgrammesExcelBuffer,
    generateHrdProgrammesWordBuffer,
} = require('../utils/hrdProgrammesPageExport.js');

const records = [
    {
        hrdProgramId: 'bihar-1',
        kvkId: 101,
        kvkName: 'KVK Arwal',
        stateName: 'Bihar',
        kvkStaffId: 1,
        staffName: 'Dr. A',
        courseName: 'Monitoring',
        startDate: '2026-01-01',
        endDate: '2026-01-03',
        organizer: 'ICAR',
        venue: 'Patna',
    },
    {
        hrdProgramId: 'bihar-2',
        kvkId: 101,
        kvkName: 'KVK Arwal',
        stateName: 'Bihar',
        kvkStaffId: 2,
        staffName: 'Dr. B',
        courseName: 'Monitoring',
        startDate: '2026-01-01',
        endDate: '2026-01-03',
        organizer: 'ICAR',
        venue: 'Patna',
    },
    {
        hrdProgramId: 'bihar-3',
        kvkId: 102,
        kvkName: 'KVK Bhagalpur',
        stateName: 'Bihar',
        kvkStaffId: 3,
        staffName: 'Dr. C',
        courseName: 'Soil management',
        startDate: '2026-02-10',
        endDate: '2026-02-10',
        organizer: 'ATARI',
        venue: 'Bhagalpur',
    },
    {
        hrdProgramId: 'jharkhand-1',
        kvkId: 201,
        kvkName: 'KVK Bokaro',
        stateName: 'Jharkhand',
        kvkStaffId: 4,
        staffName: 'Dr. D',
        courseName: 'AMS workshop',
        startDate: '2026-03-15',
        endDate: '2026-03-19',
        organizer: 'ATARI',
        venue: 'Ranchi',
    },
];

test('BLA-68 builds state-wise HRD metrics and a final total', () => {
    const payload = buildHrdStateSummary(records);

    assert.equal(payload.layout, 'state');
    assert.deepEqual(payload.rows, [
        {
            stateName: 'Bihar',
            noOfKvks: 2,
            noOfProgrammes: 2,
            personnelAttended: 3,
            totalDurationDays: 4,
        },
        {
            stateName: 'Jharkhand',
            noOfKvks: 1,
            noOfProgrammes: 1,
            personnelAttended: 1,
            totalDurationDays: 5,
        },
    ]);
    assert.deepEqual(payload.grandTotal, {
        stateName: 'Total',
        noOfKvks: 3,
        noOfProgrammes: 3,
        personnelAttended: 4,
        totalDurationDays: 9,
    });
});

test('BLA-68 aggregated HTML replaces KVK detail blocks with the state summary', () => {
    const html = renderHrdProgrammesSection.call(
        {
            _escapeHtml: (value) => String(value),
            _generateEmptySection: () => 'EMPTY',
        },
        { id: '2.11.A', title: 'Human Resources Development' },
        records,
        'section-2-11-a',
        false,
        { isAggregatedView: true },
    );

    assert.match(html, /No\. of HRD programmes/);
    assert.match(html, /No\. of personnel attended/);
    assert.match(html, /Total duration \(days\)/);
    assert.match(html, />Bihar</);
    assert.match(html, />Jharkhand</);
    assert.match(html, />Total</);
    assert.doesNotMatch(html, /KVK Arwal/);
    assert.doesNotMatch(html, /Name of Staff and designation/);
});

test('BLA-68 keeps the existing detailed table for KVK reports', () => {
    const html = renderHrdProgrammesSection.call(
        {
            _escapeHtml: (value) => String(value),
            _generateEmptySection: () => 'EMPTY',
        },
        { id: '2.11.A', title: 'Human Resources Development' },
        records.slice(0, 2),
        'section-2-11-a',
        false,
        { isAggregatedView: false },
    );

    assert.match(html, /KVK Arwal/);
    assert.match(html, /Name of Staff and designation/);
    assert.match(html, /Monitoring/);
    assert.doesNotMatch(html, /No\. of HRD programmes/);
});

test('BLA-68 aggregated Excel and Word exports contain the state summary', async () => {
    const excelBuffer = await generateHrdProgrammesExcelBuffer('HRD', records, {
        isAggregatedReport: true,
    });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
    const sheet = workbook.getWorksheet('HRD');

    assert.deepEqual(sheet.getRow(3).values.slice(1), [
        'State',
        'No. of KVKs',
        'No. of HRD programmes',
        'No. of personnel attended',
        'Total duration (days)',
    ]);
    assert.deepEqual(sheet.getRow(6).values.slice(1), ['Total', 3, 3, 4, 9]);

    const wordBuffer = await generateHrdProgrammesWordBuffer('HRD', records, {
        isAggregatedReport: true,
    });
    const wordArchive = await JSZip.loadAsync(wordBuffer);
    const documentXml = await wordArchive.file('word/document.xml').async('string');

    assert.match(documentXml, /No\. of HRD programmes/);
    assert.match(documentXml, /No\. of personnel attended/);
    assert.match(documentXml, /Total duration \(days\)/);
    assert.match(documentXml, />Bihar</);
    assert.match(documentXml, />Jharkhand</);
    assert.doesNotMatch(documentXml, /Name of Staff and designation/);
});
