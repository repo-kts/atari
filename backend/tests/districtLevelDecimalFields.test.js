const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { validateFormRobustness } = require('../middleware/validateFormRobustness.js');
const prisma = require('../config/prisma.js');
const districtLevelDataRepository = require('../repositories/forms/districtLevelDataRepository.js');
const reportCacheInvalidationService = require('../services/reports/reportCacheInvalidationService.js');
const {
    buildDistrictLevelDataTabularData,
} = require('../services/reports/formsTemplate/districtVillageTemplates/districtLevelDataTemplate.js');

function validate(body) {
    let forwarded;
    validateFormRobustness({ body }, {}, (error) => {
        forwarded = error;
    });
    if (forwarded) throw forwarded;
}

test('District Level climate fields accept decimal temperatures', () => {
    assert.doesNotThrow(() => validate({
        maxTemp: '42.75',
        minTemp: '4.6',
    }));
});

test('District Level crop fields accept decimal production and productivity', () => {
    assert.doesNotThrow(() => validate({
        production: '35.5',
        productivity: '12.25',
    }));
});

test('unrelated whole-number fields still reject decimals', () => {
    assert.throws(
        () => validate({ number: '2.5' }),
        /Field "number" must be a whole number/,
    );
});

test('District Level create stores decimal measurements without truncation', async () => {
    const originalAccountTypeFindFirst = prisma.accountTypeMaster.findFirst;
    const originalCreate = prisma.districtLevelData.create;
    const originalInvalidate = reportCacheInvalidationService.invalidateDataSourceForKvk;
    let captured;

    prisma.accountTypeMaster.findFirst = async () => ({ isOther: false });
    prisma.districtLevelData.create = async (args) => {
        captured = args.data;
        return args.data;
    };
    reportCacheInvalidationService.invalidateDataSourceForKvk = async () => {};

    try {
        await districtLevelDataRepository.create({
            kvkId: 1,
            reportingYear: '2026-01-01',
            items: 'Mean yearly temperature, rainfall, humidity of the district',
            information: 'Climate readings',
            maxTemp: '42.75',
            minTemp: '4.6',
            production: '35.5',
            productivity: '12.25',
        });

        assert.equal(captured.maxTemp, 42.75);
        assert.equal(captured.minTemp, 4.6);
        assert.equal(captured.production, 35.5);
        assert.equal(captured.productivity, 12.25);
    } finally {
        prisma.accountTypeMaster.findFirst = originalAccountTypeFindFirst;
        prisma.districtLevelData.create = originalCreate;
        reportCacheInvalidationService.invalidateDataSourceForKvk = originalInvalidate;
    }
});

test('District Level export displays stored decimal measurements', () => {
    const table = buildDistrictLevelDataTabularData([{
        items: 'Mean yearly temperature, rainfall, humidity of the district',
        maxTemp: 42.75,
        minTemp: 4.6,
        production: 35.5,
        productivity: 12.25,
    }]);

    assert.equal(table.rows[0][6], '35.5');
    assert.equal(table.rows[0][7], '12.25');
    assert.equal(table.rows[0][10], '42.75');
    assert.equal(table.rows[0][11], '4.6');
});
