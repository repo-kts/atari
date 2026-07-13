const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const ROOT = path.resolve(__dirname, '..');
const prisma = require('../config/prisma.js');
const aboutKvkRepository = require('../repositories/forms/aboutKvkRepository.js');
const soilWaterRepository = require('../repositories/forms/soilWaterRepository.js');
const districtLevelDataRepository = require('../repositories/forms/districtLevelDataRepository.js');
const reportCacheInvalidationService = require('../services/reports/reportCacheInvalidationService.js');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('affected forms have nullable storage for their specified Other values', () => {
    const infrastructure = read('prisma/kvk/about-kvk/infra_schema.prisma');
    const soilWater = read('prisma/kvk/soil_water_testing/analysis_details_schema.prisma');
    const district = read('prisma/kvk/performance-indicators/district-village/district_level_schema.prisma');

    assert.match(
        infrastructure,
        /^\s*sourceOfFundingOther\s+String\?\s+@map\("source_of_funding_other"\)/m,
    );
    assert.match(
        soilWater,
        /^\s*samplesAnalysedThroughOther\s+String\?\s+@map\("samples_analysed_through_other"\)/m,
    );
    assert.match(
        district,
        /^\s*accountTypeOther\s+String\?\s+@map\("account_type_other"\)/m,
    );
});

test('Infrastructure funding Other is exposed by the form and both API allow-lists', () => {
    const form = read('../frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx');
    const api = read('../frontend/src/services/aboutKvkApi.ts');
    const repository = read('repositories/forms/aboutKvkRepository.js');
    const extractor = read('../frontend/src/utils/fieldValueExtractorUtils.ts');

    assert.match(form, /sourceOfFundingOther/);
    assert.match(api, /'sourceOfFundingOther'/);
    assert.match(repository, /'sourceOfFundingOther'/);
    assert.match(extractor, /sourceOfFundingOther\s*\|\|\s*item\.sourceOfFunding/);
});

test('Infrastructure funding persists specified Other text and rejects an empty value', async () => {
    const originalCreate = prisma.kvkInfrastructure.create;
    const originalFindFirst = prisma.fundingSourceMaster.findFirst;
    let captured;

    prisma.fundingSourceMaster.findFirst = async () => ({ name: 'Others', isOther: true });
    prisma.kvkInfrastructure.create = async (args) => {
        captured = args;
        return args.data;
    };

    const baseData = {
        kvkId: 1,
        infraMasterId: 1,
        notYetStarted: false,
        completedPlinthLevel: true,
        completedLintelLevel: true,
        completedRoofLevel: true,
        totallyCompleted: true,
        plinthAreaSqM: 100,
        underUse: true,
        sourceOfFunding: 'Others',
        fundingAgencyName: 'Agency',
    };

    try {
        await aboutKvkRepository.create('kvk-infrastructure', {
            ...baseData,
            sourceOfFundingOther: '  CSR Fund  ',
        });
        assert.equal(captured.data.sourceOfFundingOther, 'CSR Fund');

        await assert.rejects(
            () => aboutKvkRepository.create('kvk-infrastructure', {
                ...baseData,
                sourceOfFundingOther: '   ',
            }),
            /sourceOfFundingOther is required/,
        );
    } finally {
        prisma.kvkInfrastructure.create = originalCreate;
        prisma.fundingSourceMaster.findFirst = originalFindFirst;
    }
});

test('Soil & Water samples-through Other is exposed and preferred in reports', () => {
    const form = read('../frontend/src/pages/dashboard/shared/forms/SoilWaterTestingForms.tsx');
    const repository = read('repositories/forms/soilWaterRepository.js');
    const report = read('repositories/reports/soilWaterAnalysisReport/soilWaterAnalysisReportRepository.js');

    assert.match(form, /samplesAnalysedThroughOther/);
    assert.match(repository, /samples_analysed_through_other/);
    assert.match(report, /samplesAnalysedThroughOther\s*\|\|\s*r\.samplesAnalysedThrough/);
});

test('Soil & Water persists specified samples-through text and rejects an empty value', async () => {
    const originalQuery = prisma.$queryRawUnsafe;
    let captured;
    prisma.$queryRawUnsafe = async (sql, ...values) => {
        captured = { sql, values };
        return [];
    };

    const baseData = {
        kvkId: 1,
        reportingYear: '2026-01-01',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        analysisId: 1,
        samplesAnalysedThrough: 'Other',
    };

    try {
        await soilWaterRepository.createAnalysis({
            ...baseData,
            samplesAnalysedThroughOther: '  Mobile lab  ',
        });
        assert.match(captured.sql, /samples_analysed_through_other/);
        assert.ok(captured.values.includes('Mobile lab'));

        await assert.rejects(
            () => soilWaterRepository.createAnalysis({
                ...baseData,
                samplesAnalysedThroughOther: '   ',
            }),
            /samplesAnalysedThroughOther is required/,
        );
    } finally {
        prisma.$queryRawUnsafe = originalQuery;
    }
});

test('District Level account type uses the master Other flag and exposes a specify input', () => {
    const form = read('../frontend/src/pages/dashboard/shared/forms/performance-indicators/DistrictAndVillageForms.tsx');
    const repository = read('repositories/forms/districtLevelDataRepository.js');
    const report = read('repositories/reports/districtLevelDataReportRepository.js');
    const template = read('services/reports/formsTemplate/districtVillageTemplates/districtLevelDataTemplate.js');

    assert.match(form, /flagKey:\s*'isOther'/);
    assert.match(form, /accountTypeOther/);
    assert.match(repository, /accountTypeOther/);
    assert.match(report, /accountTypeDisplay/);
    assert.match(template, /accountTypeDisplay\s*\|\|\s*row\.items/);
});

test('District Level persists specified account type text and rejects an empty value', async () => {
    const originalCreate = prisma.districtLevelData.create;
    const originalFindFirst = prisma.accountTypeMaster.findFirst;
    const originalInvalidate = reportCacheInvalidationService.invalidateDataSourceForKvk;
    let captured;

    prisma.accountTypeMaster.findFirst = async () => ({ accountType: 'Other', isOther: true });
    prisma.districtLevelData.create = async (args) => {
        captured = args;
        return args.data;
    };
    reportCacheInvalidationService.invalidateDataSourceForKvk = async () => {};

    const baseData = {
        kvkId: 1,
        reportingYear: '2026-01-01',
        items: 'Other',
        information: 'Details',
    };

    try {
        await districtLevelDataRepository.create({
            ...baseData,
            accountTypeOther: '  Custom district indicator  ',
        });
        assert.equal(captured.data.accountTypeOther, 'Custom district indicator');

        await assert.rejects(
            () => districtLevelDataRepository.create({
                ...baseData,
                accountTypeOther: '   ',
            }),
            /accountTypeOther is required/,
        );
    } finally {
        prisma.districtLevelData.create = originalCreate;
        prisma.accountTypeMaster.findFirst = originalFindFirst;
        reportCacheInvalidationService.invalidateDataSourceForKvk = originalInvalidate;
    }
});
