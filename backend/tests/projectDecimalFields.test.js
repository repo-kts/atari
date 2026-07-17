const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { validateFormRobustness } = require('../middleware/validateFormRobustness.js');
const prisma = require('../config/prisma.js');
const fpoManagementRepository = require('../repositories/forms/fpoManagementRepository.js');

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

test('project measurement and monetary fields accept decimal values', () => {
    assert.doesNotThrow(() => validate({
        landHolding: '5.5',
        areaCoveredUnderNaturalFarming: '10.25',
        fld_count: '4.75',
        areaHa: '8.5',
        financialPosition: '125000.75',
    }));
});

test('requested project inputs explicitly allow decimal steps', () => {
    const naturalFarmingForm = read('../frontend/src/pages/dashboard/shared/forms/projects/NaturalFarmingForms.tsx');
    const drmrForm = read('../frontend/src/pages/dashboard/shared/forms/projects/DrmrForms.tsx');
    const fpoForm = read('../frontend/src/pages/dashboard/shared/forms/projects/FpoForms.tsx');

    assert.match(naturalFarmingForm, /label="Land Holding \(ha\)"[\s\S]*?type="number"[\s\S]*?step="any"/);
    assert.match(naturalFarmingForm, /label="Area covered \(ha\) under Natural Farming"[\s\S]*?type="number"[\s\S]*?step="any"/);
    assert.match(drmrForm, /label="Area under FLDs\(Hectare\)"[\s\S]*?type="number"[\s\S]*?step="any"/);
    assert.match(fpoForm, /label="Area \(ha\)"[\s\S]*?type="number"[\s\S]*?step="any"/);
    assert.match(fpoForm, /label="Financial position \(Rupees in lakh\)"[\s\S]*?type="number"[\s\S]*?step="any"/);
});

test('FPO Management saves and returns decimal area and financial values', async () => {
    const originalQueryRawUnsafe = prisma.$queryRawUnsafe;
    const originalFindUnique = prisma.fpoManagement.findUnique;
    let insertArgs;

    prisma.$queryRawUnsafe = async (...args) => {
        insertArgs = args;
        return [{ fpo_management_id: 1 }];
    };
    prisma.fpoManagement.findUnique = async () => ({
        fpoManagementId: 1,
        kvkId: 1,
        fpoName: 'Test FPO',
        address: 'Address',
        registrationNumber: 'REG-1',
        registrationDate: new Date('2026-01-01'),
        proposedActivity: 'Activity',
        commodityIdentified: 'Commodity',
        areaHa: 10.25,
        totalBomMembers: 5,
        totalFarmersAttached: 10,
        financialPositionLakh: 125000.75,
        successIndicator: 'Success',
        reportingYear: new Date('2026-01-01'),
        kvk: { kvkName: 'Test KVK' },
    });

    try {
        const result = await fpoManagementRepository.create({
            reportingYear: '2026-01-01',
            fpoName: 'Test FPO',
            areaHa: '10.25',
            financialPosition: '125000.75',
        }, { kvkId: 1 });

        assert.equal(insertArgs[9], 10.25);
        assert.equal(insertArgs[12], 125000.75);
        assert.equal(result.areaHa, 10.25);
        assert.equal(result.financialPosition, 125000.75);
    } finally {
        prisma.$queryRawUnsafe = originalQueryRawUnsafe;
        prisma.fpoManagement.findUnique = originalFindUnique;
    }
});

test('FPO Management update preserves decimal area and financial values for editing', async () => {
    const originalExecuteRawUnsafe = prisma.$executeRawUnsafe;
    const originalFindUnique = prisma.fpoManagement.findUnique;
    let updateArgs;
    let findCount = 0;

    prisma.$executeRawUnsafe = async (...args) => {
        updateArgs = args;
        return 1;
    };
    prisma.fpoManagement.findUnique = async () => {
        findCount += 1;
        return {
            fpoManagementId: 1,
            kvkId: 1,
            fpoName: 'Test FPO',
            address: 'Address',
            registrationNumber: 'REG-1',
            registrationDate: new Date('2026-01-01'),
            proposedActivity: 'Activity',
            commodityIdentified: 'Commodity',
            areaHa: findCount === 1 ? 5 : 10.25,
            totalBomMembers: 5,
            totalFarmersAttached: 10,
            financialPositionLakh: findCount === 1 ? 100 : 125000.75,
            successIndicator: 'Success',
            reportingYear: new Date('2026-01-01'),
            kvk: { kvkName: 'Test KVK' },
        };
    };

    try {
        const result = await fpoManagementRepository.update(1, {
            areaHa: '10.25',
            financialPosition: '125000.75',
        });

        assert.equal(updateArgs[8], 10.25);
        assert.equal(updateArgs[11], 125000.75);
        assert.equal(result.areaHa, 10.25);
        assert.equal(result.financialPosition, 125000.75);
    } finally {
        prisma.$executeRawUnsafe = originalExecuteRawUnsafe;
        prisma.fpoManagement.findUnique = originalFindUnique;
    }
});

test('FPO Management area is represented in schema, API, view, and reports', () => {
    const schema = read('prisma/kvk/achievements/projects/fpo_cbbo/fpo_management_schema.prisma');
    const api = read('../frontend/src/services/fpoManagementApi.ts');
    const fields = read('../frontend/src/constants/fieldNames.ts');
    const reportRepository = read('repositories/reports/fpoReport/fpoCbboReportRepository.js');
    const reportTemplate = read('services/reports/formsTemplate/projectTemplates/fpoManagementDetailsTemplate.js');

    assert.match(schema, /^\s*areaHa\s+Float\?\s+@map\("area_ha"\)/m);
    assert.match(api, /areaHa\?: number/);
    assert.match(fields, /FPO_MANAGEMENT:[\s\S]*?FIELD_NAMES\.AREA_HA/);
    assert.match(reportRepository, /areaHa:\s*record\.areaHa/);
    assert.match(reportTemplate, /row\.areaHa/);
});
