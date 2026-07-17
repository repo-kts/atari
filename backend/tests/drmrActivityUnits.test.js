const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const prisma = require('../config/prisma.js');
const drmrActivityRepository = require('../repositories/forms/drmrActivityRepository.js');
const {
    DRMR_ACTIVITY_ROWS,
} = require('../repositories/reports/drmrReport/drmrActivityReportRepository.js');

const ROOT = path.resolve(__dirname, '..');
const FIXED_NUMBER_TYPES = new Set([
    'AWARENESS_CAMP',
    'LITERATURE_DISTRIBUTION',
    'KISAN_MELA',
]);

function basePayload(overrides = {}) {
    return {
        reportingYear: '2026-01-01',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        totalBudget: 1000,
        fld_count: '5.5',
        awareness_count: 'Camp',
        lecture_count: 2,
        kisan_mela_count: 1,
        any_other_count: 'Custom activity',
        any_other_count_unit: 'kg',
        ...overrides,
    };
}

test('DRMR create enforces No. for fixed activities and preserves an allowed Other unit', async () => {
    const originalCreate = prisma.drmrActivity.create;
    let capturedComponents;

    prisma.drmrActivity.create = async (args) => {
        capturedComponents = args.data.components.create;
        return {
            drmrActivityId: 1,
            kvkId: args.data.kvkId,
            kvk: { kvkName: 'Test KVK' },
            reportingYear: args.data.reportingYear,
            startDate: args.data.startDate,
            endDate: args.data.endDate,
            totalBudgetUtilized: args.data.totalBudgetUtilized,
            components: capturedComponents,
        };
    };

    try {
        const result = await drmrActivityRepository.create(basePayload({
            awareness_count_unit: 'N/A',
            lecture_count_unit: 'N/A',
            kisan_mela_count_unit: 'N/A',
        }), { kvkId: 1 });

        for (const activityType of FIXED_NUMBER_TYPES) {
            const component = capturedComponents.find((item) => item.activityType === activityType);
            assert.equal(component.unit, 'No.');
        }
        assert.equal(
            capturedComponents.find((item) => item.activityType === 'OTHER').unit,
            'kg',
        );
        assert.equal(
            capturedComponents.find((item) => item.activityType === 'FRONTLINE_DEMONSTRATION').quantity,
            5.5,
        );
        assert.equal(result.awareness_count_unit, 'No.');
        assert.equal(result.lecture_count_unit, 'No.');
        assert.equal(result.kisan_mela_count_unit, 'No.');
        assert.equal(result.any_other_count_unit, 'kg');
    } finally {
        prisma.drmrActivity.create = originalCreate;
    }
});

test('DRMR rejects unsupported Any Other units', async () => {
    await assert.rejects(
        () => drmrActivityRepository.create(
            basePayload({ any_other_count_unit: 'gallon' }),
            { kvkId: 1 },
        ),
        /Any Other unit must be one of: ha, kg, lt, No\./,
    );
});

test('DRMR edit mapping clears a legacy unsupported Any Other unit', async () => {
    const originalFindFirst = prisma.drmrActivity.findFirst;
    prisma.drmrActivity.findFirst = async () => ({
        drmrActivityId: 1,
        kvkId: 1,
        reportingYear: new Date('2026-01-01T00:00:00.000Z'),
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        totalBudgetUtilized: 1000,
        components: [{
            activityType: 'OTHER',
            specification: 'Legacy activity',
            unit: 'N/A',
        }],
    });

    try {
        const result = await drmrActivityRepository.findById(1);
        assert.equal(result.any_other_count_unit, '');
    } finally {
        prisma.drmrActivity.findFirst = originalFindFirst;
    }
});

test('DRMR update saves an allowed Any Other unit and re-enforces fixed units', async () => {
    const originalFindFirst = prisma.drmrActivity.findFirst;
    const originalUpdate = prisma.drmrActivity.update;
    let capturedComponents;

    prisma.drmrActivity.findFirst = async () => ({
        drmrActivityId: 1,
        kvkId: 1,
        reportingYear: new Date('2026-01-01T00:00:00.000Z'),
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-01-02T00:00:00.000Z'),
        totalBudgetUtilized: 1000,
    });
    prisma.drmrActivity.update = async (args) => {
        capturedComponents = args.data.components.create;
        return {
            drmrActivityId: 1,
            kvkId: 1,
            reportingYear: args.data.reportingYear,
            startDate: args.data.startDate,
            endDate: args.data.endDate,
            totalBudgetUtilized: args.data.totalBudgetUtilized,
            components: capturedComponents,
        };
    };

    try {
        const result = await drmrActivityRepository.update(
            1,
            basePayload({ any_other_count_unit: 'lt' }),
        );
        assert.equal(result.any_other_count_unit, 'lt');
        assert.equal(result.awareness_count_unit, 'No.');
        assert.equal(result.lecture_count_unit, 'No.');
        assert.equal(result.kisan_mela_count_unit, 'No.');
    } finally {
        prisma.drmrActivity.findFirst = originalFindFirst;
        prisma.drmrActivity.update = originalUpdate;
    }
});

test('DRMR reports use No. for the three fixed-number activities', () => {
    for (const row of DRMR_ACTIVITY_ROWS.filter((item) => FIXED_NUMBER_TYPES.has(item.activityType))) {
        assert.equal(row.unitFallback, 'No.');
    }
});

test('DRMR form renders fixed No. units and an allowed-unit dropdown for Any Other', () => {
    const form = fs.readFileSync(
        path.resolve(ROOT, '../frontend/src/pages/dashboard/shared/forms/projects/DrmrForms.tsx'),
        'utf8',
    );

    assert.match(form, /value="No\."/);
    assert.match(
        form,
        /label="Unit"[\s\S]*?value=\{formData\.any_other_count_unit[\s\S]*?options=\{DRMR_OTHER_UNIT_OPTIONS\}/,
    );
});
