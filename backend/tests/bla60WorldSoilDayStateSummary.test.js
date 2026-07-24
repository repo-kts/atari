const test = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');
const JSZip = require('jszip');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const {
    buildStateSummaryFromRecords,
} = require('../repositories/reports/worldSoilDayReport/worldSoilDayReportRepository.js');
const {
    renderWorldSoilDayPageReportSection,
} = require('../services/reports/formsTemplate/achievementTemplates/worldSoilDayPageReportTemplate.js');
const {
    generateWorldSoilDayPageExcelBuffer,
    generateWorldSoilDayPageWordBuffer,
} = require('../utils/worldSoilDayPageExport.js');

const records = [
    {
        worldSoilCelebrationId: 1,
        kvkId: 101,
        kvkName: 'KVK Bhagalpur',
        stateName: 'Bihar',
        activitiesConducted: 2,
        generalM: 3,
        generalF: 4,
        obcM: 1,
        participants: 10,
    },
    {
        worldSoilCelebrationId: 2,
        kvkId: 101,
        kvkName: 'KVK Bhagalpur',
        stateName: 'Bihar',
        activitiesConducted: 1,
        generalM: 2,
        participants: 5,
    },
    {
        worldSoilCelebrationId: 3,
        kvkId: 201,
        kvkName: 'KVK Ranchi',
        stateName: 'Jharkhand',
        activitiesConducted: 4,
        scM: 6,
        stF: 2,
        participants: 12,
    },
    {
        worldSoilCelebrationId: 4,
        kvkName: 'KVK Gumla',
        stateName: 'Jharkhand',
        activitiesConducted: 1,
        participants: 3,
    },
];

test('BLA-60 aggregates World Soil Day into Bihar, Jharkhand, and Total rows', () => {
    const payload = buildStateSummaryFromRecords(records);

    assert.equal(payload.layout, 'state');
    assert.deepEqual(payload.rows, [
        {
            stateName: 'Bihar',
            noOfKvks: 1,
            activitiesConducted: 3,
            farmersBenefitted: 10,
            participants: 15,
        },
        {
            stateName: 'Jharkhand',
            noOfKvks: 2,
            activitiesConducted: 5,
            farmersBenefitted: 8,
            participants: 15,
        },
    ]);
    assert.deepEqual(payload.grandTotal, {
        stateName: 'Total',
        noOfKvks: 3,
        activitiesConducted: 8,
        farmersBenefitted: 18,
        participants: 30,
    });
});

test('BLA-60 keeps both state rows when one state has no records', () => {
    const payload = buildStateSummaryFromRecords(records.slice(0, 2));

    assert.deepEqual(payload.rows[1], {
        stateName: 'Jharkhand',
        noOfKvks: 0,
        activitiesConducted: 0,
        farmersBenefitted: 0,
        participants: 0,
    });
});

test('BLA-60 aggregated HTML uses only the consolidated state table', () => {
    const html = renderWorldSoilDayPageReportSection.call(
        { _escapeHtml: (value) => String(value) },
        { id: '2.15', title: 'World Soil Day celebration' },
        { records },
        'section-2-15',
        false,
        { isAggregatedView: true },
    );

    assert.match(html, />State</);
    assert.match(html, />Bihar</);
    assert.match(html, />Jharkhand</);
    assert.match(html, />Total</);
    assert.match(html, /No\. of activities conducted/);
    assert.match(html, /No\. of farmers benefited/);
    assert.doesNotMatch(html, /KVK Bhagalpur/);
    assert.doesNotMatch(html, /Soil Health Cards distributed/);
    assert.doesNotMatch(html, /Name\(s\) of VIP/);
});

test('BLA-60 standalone aggregated Excel and Word exports use the state payload', async () => {
    const payload = buildStateSummaryFromRecords(records);
    const excelBuffer = await generateWorldSoilDayPageExcelBuffer('World Soil Day', payload);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
    const sheet = workbook.getWorksheet('World Soil Day');

    assert.deepEqual(sheet.getRow(4).values.slice(1), [
        'State',
        'No. of KVKs',
        'No. of activities conducted',
        'No. of farmers benefited',
        'Total number of participants',
    ]);
    assert.deepEqual(sheet.getRow(7).values.slice(1), ['Total', 3, 8, 18, 30]);

    const wordBuffer = await generateWorldSoilDayPageWordBuffer('World Soil Day', payload);
    assert.ok(Buffer.isBuffer(wordBuffer));
    assert.ok(wordBuffer.length > 0);
    const wordArchive = await JSZip.loadAsync(wordBuffer);
    const documentXml = await wordArchive.file('word/document.xml').async('string');
    assert.match(documentXml, /No\. of activities conducted/);
    assert.match(documentXml, /No\. of farmers benefited/);
    assert.match(documentXml, />Bihar</);
    assert.match(documentXml, />Jharkhand</);
    assert.doesNotMatch(documentXml, /Soil Health Cards distributed/);
});
