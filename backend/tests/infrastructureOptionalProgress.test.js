const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const ROOT = path.resolve(__dirname, '..');
const prisma = require('../config/prisma.js');
const aboutKvkRepository = require('../repositories/forms/aboutKvkRepository.js');
const aboutKvkService = require('../services/forms/aboutKvkService.js');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('BLA-53 infrastructure progress fields are optional in service validation', () => {
    const validRequiredData = {
        kvkId: 1,
        infraMasterId: 1,
        totalAreaSqM: 0,
        underUse: false,
        sourceOfFunding: 'ICAR',
    };

    assert.doesNotThrow(() => {
        aboutKvkService.validateRequiredFields('kvk-infrastructure', validRequiredData);
    });

    assert.throws(
        () => aboutKvkService.validateRequiredFields('kvk-infrastructure', {
            ...validRequiredData,
            sourceOfFunding: '',
        }),
        /Missing required fields: sourceOfFunding/,
    );
});

test('BLA-53 repository can create infrastructure without progress values', async () => {
    const originalInfraMasterFindUnique = prisma.kvkInfrastructureMaster.findUnique;
    const originalFundingSourceFindFirst = prisma.fundingSourceMaster.findFirst;
    const originalCreate = prisma.kvkInfrastructure.create;
    let capturedData;

    prisma.kvkInfrastructureMaster.findUnique = async () => ({ isOther: false });
    prisma.fundingSourceMaster.findFirst = async () => ({ isOther: false });
    prisma.kvkInfrastructure.create = async ({ data }) => {
        capturedData = data;
        return data;
    };

    try {
        await aboutKvkRepository.create('kvk-infrastructure', {
            kvkId: 1,
            infraMasterId: 2,
            totalAreaSqM: 100,
            underUse: true,
            sourceOfFunding: 'ICAR',
        });

        for (const optionalField of [
            'notYetStarted',
            'completedPlinthLevel',
            'completedLintelLevel',
            'completedRoofLevel',
            'totallyCompleted',
            'plinthAreaSqM',
        ]) {
            assert.equal(capturedData[optionalField], undefined);
        }
    } finally {
        prisma.kvkInfrastructureMaster.findUnique = originalInfraMasterFindUnique;
        prisma.fundingSourceMaster.findFirst = originalFundingSourceFindFirst;
        prisma.kvkInfrastructure.create = originalCreate;
    }
});

test('BLA-53 nullable infrastructure columns and migration stay aligned', () => {
    const schema = read('prisma/kvk/about-kvk/infra_schema.prisma');
    const migration = read('prisma/migrations/20260722000000_make_infrastructure_progress_optional/migration.sql');

    for (const field of [
        'notYetStarted',
        'completedPlinthLevel',
        'completedLintelLevel',
        'completedRoofLevel',
        'totallyCompleted',
    ]) {
        assert.match(schema, new RegExp(`^\\s*${field}\\s+Boolean\\?`, 'm'));
    }
    assert.match(schema, /^\s*plinthAreaSqM\s+Float\?\s+@map/m);

    for (const column of [
        'not_yet_started',
        'completed_plinth_level',
        'completed_lintel_level',
        'completed_roof_level',
        'totally_completed',
        'plinth_area_sqm',
    ]) {
        assert.match(migration, new RegExp(`ALTER COLUMN "${column}" DROP NOT NULL`));
    }
    assert.match(migration, /ALTER COLUMN "plinth_area_sqm" DROP DEFAULT/);
});

test('BLA-53 form keeps only the unaffected infrastructure fields mandatory', () => {
    const form = read('../frontend/src/pages/dashboard/shared/forms/AboutKvkForms.tsx');
    const infrastructureSection = form.slice(
        form.indexOf('entityType === ENTITY_TYPES.KVK_INFRASTRUCTURE'),
        form.indexOf('entityType === ENTITY_TYPES.KVK_VEHICLES'),
    );

    for (const optionalLabel of [
        'Completed upto plinth level',
        'Plinth Area (m²)',
        'Completed upto lintel level',
        'Completed upto roof level',
        'Not Yet Started',
        'Totally Completed',
    ]) {
        assert.doesNotMatch(
            infrastructureSection,
            new RegExp(`label="${optionalLabel.replace(/[()²]/g, '\\$&')}"\\s+required`),
        );
    }

    for (const requiredLabel of [
        'Name of Infrastructure',
        'Under use or not',
        'Total Area (m²)',
        'Source of Funding',
    ]) {
        assert.match(
            infrastructureSection,
            new RegExp(`label="${requiredLabel.replace(/[()²]/g, '\\$&')}"\\s+required`),
        );
    }
});
