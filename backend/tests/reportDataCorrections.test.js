const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const prisma = require('../config/prisma.js');
const assetsReportRepository = require('../repositories/reports/aboutkvkReport/assetsReportRepository.js');
const {
    buildCategoryGroupedPagePayload,
    pageRowFromRecord,
} = require('../repositories/reports/productionSupplyPageReport/productionSupplyPageReportRepository.js');
const {
    buildPayloadFromRecords,
} = require('../repositories/reports/fldStateCategoryReport/fldStateCategoryReportRepository.js');

test('vehicle status report maps funding agency and custom Other labels', async () => {
    const originalFindMany = prisma.kvkVehicleDetail.findMany;
    prisma.kvkVehicleDetail.findMany = async () => [{
        reportingYear: new Date('2025-01-01T00:00:00.000Z'),
        kvkId: 73,
        kvk: { kvkId: 73, kvkName: 'Kvk Bhagalpur' },
        vehicle: {
            vehicleName: 'Sumo Gold',
            registrationNo: 'BR01ER0125',
            yearOfPurchase: 2005,
            totalCost: 450000,
        },
        totalRun: '25000',
        repairingCost: 3000,
        vehicleStatus: { statusLabel: 'Other' },
        vehicleStatusOther: 'Temporarily unavailable',
        assetFundingSource: { name: 'Other' },
        assetFundingSourceOther: 'Community contribution',
        fundingAgencyName: 'Local committee',
    }];

    try {
        const [row] = await assetsReportRepository.getKvkVehicleDetails(73, { year: 2025 });
        assert.equal(row.presentStatus, 'Temporarily unavailable');
        assert.equal(row.sourceOfFunding, 'Community contribution');
        assert.equal(row.fundingAgencyName, 'Local committee');
    } finally {
        prisma.kvkVehicleDetail.findMany = originalFindMany;
    }
});

test('equipment details report falls back to funding from the latest detail in the selected period', async () => {
    const originalFindMany = prisma.kvkEquipment.findMany;
    let capturedArgs;
    prisma.kvkEquipment.findMany = async (args) => {
        capturedArgs = args;
        return [{
            equipmentId: 1,
            equipmentName: 'Desktop Computer',
            kvk: { kvkId: 73, kvkName: 'Kvk Bhagalpur' },
            equipmentMaster: null,
            assetFundingSource: null,
            assetFundingSourceOther: null,
            equipmentDetails: [{
                reportingYear: new Date('2025-05-07T00:00:00.000Z'),
                equipmentStatus: { statusLabel: 'Working' },
                equipmentStatusOther: '',
                assetFundingSource: { name: 'ICAR' },
                assetFundingSourceOther: '',
                fundingAgencyName: 'ATARI',
            }],
        }];
    };

    try {
        const [row] = await assetsReportRepository.getKvkEquipments(73, { year: 2025 });
        assert.ok(capturedArgs.include.equipmentDetails.where.reportingYear);
        assert.equal(row.sourceOfFunding, 'ICAR');
        assert.equal(row.fundingAgencyName, 'ATARI');
        assert.equal(row.presentStatus, 'Working');
    } finally {
        prisma.kvkEquipment.findMany = originalFindMany;
    }
});

test('equipment status report maps funding agency and custom Other labels', async () => {
    const originalFindMany = prisma.kvkEquipmentDetail.findMany;
    prisma.kvkEquipmentDetail.findMany = async () => [{
        reportingYear: new Date('2025-01-01T00:00:00.000Z'),
        kvkId: 73,
        kvk: { kvkId: 73, kvkName: 'Kvk Bhagalpur' },
        equipment: {
            equipmentName: 'Desktop Computer',
            yearOfPurchase: 2024,
            totalCost: 140000,
            equipmentMaster: null,
        },
        equipmentStatus: { statusLabel: 'Other' },
        equipmentStatusOther: 'Awaiting parts',
        assetFundingSource: { name: 'Other' },
        assetFundingSourceOther: 'Community contribution',
        fundingAgencyName: 'Local committee',
    }];

    try {
        const [row] = await assetsReportRepository.getKvkEquipmentRecords(73, { year: 2025 });
        assert.equal(row.presentStatus, 'Awaiting parts');
        assert.equal(row.sourceOfFunding, 'Community contribution');
        assert.equal(row.fundingAgencyName, 'Local committee');
    } finally {
        prisma.kvkEquipmentDetail.findMany = originalFindMany;
    }
});

test('production quantity does not invent Kg when the product has no unit', () => {
    const row = pageRowFromRecord({ quantity: 20, unit: '' });
    assert.equal(row.quantityLabel, '20');
});

test('production totals distinguish blank, single, and genuinely mixed units', () => {
    const base = {
        productCategory: 'Category',
        productType: 'Type',
        product: 'Product',
        speciesName: 'Variety',
        value: 1,
    };

    const blank = buildCategoryGroupedPagePayload([
        { ...base, quantity: 10, unit: '' },
        { ...base, quantity: 20, unit: '' },
    ]);
    assert.equal(blank.categories[0].productTypeGroups[0].subtotal.quantityLabel, '30');

    const single = buildCategoryGroupedPagePayload([
        { ...base, quantity: 10, unit: 'Litre' },
        { ...base, quantity: 20, unit: 'Litre' },
    ]);
    assert.equal(single.categories[0].productTypeGroups[0].subtotal.quantityLabel, '30 Litre');

    const mixed = buildCategoryGroupedPagePayload([
        { ...base, quantity: 10, unit: 'Kg' },
        { ...base, quantity: 20, unit: 'Litre' },
    ]);
    assert.equal(mixed.categories[0].productTypeGroups[0].subtotal.quantityLabel, '30 (mixed units)');
});

test('FLD oilseed result values survive category and crop aggregation', () => {
    const fldResult = {
        demoYield: 40,
        checkYield: 35,
        increasePercent: 14.29,
        demoGrossCost: 12000,
        demoGrossReturn: 17000,
        demoNetReturn: 5000,
        demoBcr: 1.42,
        checkGrossCost: 15000,
        checkGrossReturn: 17000,
        checkNetReturn: 2000,
        checkBcr: 1.13,
    };
    const payload = buildPayloadFromRecords([{
        stateName: 'Bihar',
        sectorName: 'Crop Production',
        categoryName: 'Oilseeds of Crop Production',
        resultTemplate: 'crop-economics',
        cropName: 'Other Oil Seeds',
        thematicAreaName: 'Integrated Nutrient Management',
        fldName: 'Mustard production',
        noOfDemonstration: 6,
        areaHa: 10,
        farmers: 50,
        fldResult,
    }]);

    const result = payload.sectionB[0].cropGroups[0].rows[0].fldResult;
    assert.equal(result.demoYield, 40);
    assert.equal(result.checkYield, 35);
    assert.ok(Math.abs(result.increasePercent - 14.29) < 0.000001);
    assert.equal(result.demoGrossCost, 12000);
    assert.equal(result.demoGrossReturn, 17000);
    assert.equal(result.demoNetReturn, 5000);
    assert.equal(result.demoBcr, 1.42);
    assert.equal(result.checkGrossCost, 15000);
    assert.equal(result.checkGrossReturn, 17000);
    assert.equal(result.checkNetReturn, 2000);
    assert.equal(result.checkBcr, 1.13);
});
