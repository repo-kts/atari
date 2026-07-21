const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { validateFormRobustness } = require('../middleware/validateFormRobustness.js');
const prisma = require('../config/prisma.js');
const craDetailsRepository = require('../repositories/forms/craDetailsRepository.js');
const craReportRepository = require('../repositories/reports/craReport/craReportRepository.js');
const {
    renderCraDetailsStateWiseSection,
} = require('../services/reports/formsTemplate/projectTemplates/craDetailsStateWiseTemplate.js');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function validate(body) {
    let forwarded;
    validateFormRobustness({ body }, {}, (error) => {
        forwarded = error;
    });
    if (forwarded) throw forwarded;
}

function craRecord(systemProductivity) {
    return {
        craDetailsId: 1,
        kvkId: 1,
        reportingYear: new Date('2026-01-01T00:00:00.000Z'),
        seasonId: null,
        seasonOther: null,
        interventions: 'Climate resilient practice',
        croppingSystem: 'Rice–Wheat',
        croppingSystemId: null,
        croppingSystemOther: null,
        farmingSystemId: null,
        farmingSystemOther: null,
        areaInAcre: 10.5,
        generalM: 1,
        generalF: 2,
        obcM: 0,
        obcF: 0,
        scM: 0,
        scF: 0,
        stM: 0,
        stF: 0,
        cropYield: 40.25,
        systemProductivity,
        totalReturn: 1000.5,
        farmerPracticeYield: 35.75,
        kvk: {
            kvkName: 'Test KVK',
            state: { stateId: 1, stateName: 'Bihar' },
        },
        season: null,
        farmingSystem: null,
    };
}

test('BLA-55 robustness validation accepts decimal system productivity', () => {
    assert.doesNotThrow(() => validate({ systemProductivity: '45.55' }));
    assert.doesNotThrow(() => validate({ systemProductivityQha: '32.75' }));

    assert.throws(
        () => validate({ numberOfFarmers: '2.5' }),
        /Field "numberOfFarmers" must be a whole number/,
    );
});

test('BLA-55 CRA form explicitly presents system productivity as a decimal input', () => {
    const form = read('../frontend/src/pages/dashboard/shared/forms/projects/CraForms.tsx');

    assert.match(
        form,
        /label="System productivity \(q\/ha\)"[\s\S]*?type="number"[\s\S]*?step="0\.01"[\s\S]*?systemProductivity/,
    );
});

test('BLA-55 CRA create saves decimal system productivity', async () => {
    const originalCreate = prisma.craDetails.create;
    let capturedData;

    prisma.craDetails.create = async ({ data }) => {
        capturedData = data;
        return craRecord(data.systemProductivity);
    };

    try {
        const result = await craDetailsRepository.create({
            kvkId: 1,
            reportingYear: '2026-01-01',
            systemProductivity: '45.55',
        });

        assert.equal(capturedData.systemProductivity, 45.55);
        assert.equal(result.systemProductivity, 45.55);
    } finally {
        prisma.craDetails.create = originalCreate;
    }
});

test('BLA-55 CRA edit and view preserve decimal system productivity', async () => {
    const originalFindFirst = prisma.craDetails.findFirst;
    const originalUpdate = prisma.craDetails.update;
    let capturedData;

    prisma.craDetails.findFirst = async () => craRecord(45.55);
    prisma.craDetails.update = async ({ data }) => {
        capturedData = data;
        return craRecord(data.systemProductivity);
    };

    try {
        const updated = await craDetailsRepository.update(1, {
            systemProductivity: '32.75',
        });
        const viewed = await craDetailsRepository.findById(1);

        assert.equal(capturedData.systemProductivity, 32.75);
        assert.equal(updated.systemProductivity, 32.75);
        assert.equal(viewed.systemProductivity, 45.55);
    } finally {
        prisma.craDetails.findFirst = originalFindFirst;
        prisma.craDetails.update = originalUpdate;
    }
});

test('BLA-55 CRA report data and HTML preserve decimal system productivity', async () => {
    const originalFindMany = prisma.craDetails.findMany;
    prisma.craDetails.findMany = async () => [craRecord(45.55)];

    try {
        const reportData = await craReportRepository.getCraDetailsData(1);
        assert.equal(reportData[0].systemProductivity, 45.55);

        const html = renderCraDetailsStateWiseSection.call({
            _escapeHtml: (value) => String(value),
            _generateEmptySection: () => '',
        }, { id: '1.1', title: 'CRA Details' }, reportData, 'cra-details', true);

        assert.match(html, />45\.55<\/td>/);
    } finally {
        prisma.craDetails.findMany = originalFindMany;
    }
});
