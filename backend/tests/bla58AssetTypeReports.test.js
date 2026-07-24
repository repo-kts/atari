const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const prisma = require('../config/prisma.js');
const reportTemplateService = require('../services/reports/reportTemplateService.js');
const {
    getSectionConfig,
} = require('../config/reportConfig.js');
const assetsReportRepository = require('../repositories/reports/aboutkvkReport/assetsReportRepository.js');

test('vehicle reports fetch and flatten vehicle type for base and status rows', async () => {
    const originalVehicles = prisma.kvkVehicle.findMany;
    const originalDetails = prisma.kvkVehicleDetail.findMany;
    let vehicleQuery;
    let detailQuery;

    prisma.kvkVehicle.findMany = async (args) => {
        vehicleQuery = args;
        return [{
            vehicleId: 1,
            kvkId: 7,
            kvk: { kvkName: 'KVK Patna' },
            vehicleType: { name: 'Other', isOther: true },
            vehicleTypeOther: 'Mobile soil testing van',
            vehicleName: 'Van 01',
            vehicleDetails: [],
        }];
    };
    prisma.kvkVehicleDetail.findMany = async (args) => {
        detailQuery = args;
        return [{
            reportingYear: new Date('2026-01-01T00:00:00.000Z'),
            kvkId: 7,
            kvk: { kvkName: 'KVK Patna' },
            vehicle: {
                vehicleType: { name: 'Utility Vehicle', isOther: false },
                vehicleTypeOther: null,
                vehicleName: 'Bolero',
                registrationNo: 'BR-01-1234',
                yearOfPurchase: 2024,
                totalCost: 900000,
            },
            vehicleStatus: { statusLabel: 'Working' },
            assetFundingSource: { name: 'ICAR' },
            totalRun: '1200',
        }];
    };

    try {
        const [vehicle] = await assetsReportRepository.getKvkVehicles(7);
        const [detail] = await assetsReportRepository.getKvkVehicleDetails(7, { year: 2026 });

        assert.deepEqual(vehicleQuery.include.vehicleType.select, { name: true, isOther: true });
        assert.deepEqual(
            detailQuery.include.vehicle.select.vehicleType.select,
            { name: true, isOther: true },
        );
        assert.equal(vehicle.vehicleTypeName, 'Mobile soil testing van');
        assert.equal(detail.vehicleTypeName, 'Utility Vehicle');
    } finally {
        prisma.kvkVehicle.findMany = originalVehicles;
        prisma.kvkVehicleDetail.findMany = originalDetails;
    }
});

test('equipment reports fetch and flatten equipment type for base and status rows', async () => {
    const originalEquipment = prisma.kvkEquipment.findMany;
    const originalDetails = prisma.kvkEquipmentDetail.findMany;
    let equipmentQuery;
    let detailQuery;

    prisma.kvkEquipment.findMany = async (args) => {
        equipmentQuery = args;
        return [{
            equipmentId: 1,
            kvkId: 7,
            kvk: { kvkName: 'KVK Patna' },
            equipmentType: { name: 'Other', isOther: true },
            equipmentTypeOther: 'Weather sensor',
            equipmentName: 'Sensor 01',
            equipmentMaster: null,
            equipmentDetails: [],
        }];
    };
    prisma.kvkEquipmentDetail.findMany = async (args) => {
        detailQuery = args;
        return [{
            reportingYear: new Date('2026-01-01T00:00:00.000Z'),
            kvkId: 7,
            kvk: { kvkName: 'KVK Patna' },
            equipment: {
                equipmentType: { name: 'Laboratory Equipment', isOther: false },
                equipmentTypeOther: null,
                equipmentName: 'Spectrometer',
                yearOfPurchase: 2025,
                totalCost: 350000,
                equipmentMaster: null,
            },
            equipmentStatus: { statusLabel: 'Working' },
            assetFundingSource: { name: 'ICAR' },
        }];
    };

    try {
        const [equipment] = await assetsReportRepository.getKvkEquipments(7);
        const [detail] = await assetsReportRepository.getKvkEquipmentRecords(7, { year: 2026 });

        assert.deepEqual(equipmentQuery.include.equipmentType.select, { name: true, isOther: true });
        assert.deepEqual(
            detailQuery.include.equipment.select.equipmentType.select,
            { name: true, isOther: true },
        );
        assert.equal(equipment.equipmentTypeName, 'Weather sensor');
        assert.equal(detail.equipmentTypeName, 'Laboratory Equipment');
    } finally {
        prisma.kvkEquipment.findMany = originalEquipment;
        prisma.kvkEquipmentDetail.findMany = originalDetails;
    }
});

test('vehicle and equipment report configs expose separate type and name columns', () => {
    const fields = (sectionId) => getSectionConfig(sectionId).fields
        .map(({ dbField, displayName }) => [dbField, displayName]);

    assert.deepEqual(fields('1.6').slice(0, 3), [
        ['kvk.kvkName', 'KVK'],
        ['vehicleTypeName', 'Vehicle Type'],
        ['vehicleName', 'Name of vehicle'],
    ]);
    assert.deepEqual(fields('1.7').slice(0, 4), [
        ['reportingYear', 'Year'],
        ['kvk.kvkName', 'KVK'],
        ['vehicleTypeName', 'Vehicle Type'],
        ['vehicleName', 'Vehicle Name'],
    ]);
    assert.deepEqual(fields('1.8').slice(0, 3), [
        ['kvk.kvkName', 'KVK'],
        ['equipmentTypeName', 'Equipment Type'],
        ['equipmentName', 'Equipment Name'],
    ]);
    assert.deepEqual(fields('1.9').slice(0, 4), [
        ['reportingYear', 'Year'],
        ['kvk.kvkName', 'KVK'],
        ['equipmentTypeName', 'Equipment Type'],
        ['equipmentName', 'Equipment Name'],
    ]);
});

test('PDF templates render type and name as distinct populated columns', async () => {
    const vehicleHtml = await reportTemplateService.generateStandaloneCustomTemplateHTML(
        'about-kvk-vehicles',
        [{
            kvkName: 'KVK Patna',
            vehicleTypeName: 'Utility Vehicle',
            vehicleName: 'Bolero',
            registrationNo: 'BR-01-1234',
            yearOfPurchase: 2024,
            totalCost: 900000,
        }],
        { sectionId: '1.6', title: 'Vehicle Details' },
    );
    const equipmentHtml = await reportTemplateService.generateStandaloneCustomTemplateHTML(
        'about-kvk-equipment-records',
        [{
            reportingYear: 2026,
            kvkName: 'KVK Patna',
            equipmentTypeName: 'Laboratory Equipment',
            equipmentName: 'Spectrometer',
            yearOfPurchase: 2025,
            totalCost: 350000,
            presentStatus: 'Working',
        }],
        { sectionId: '1.9', title: 'Equipment Status' },
    );

    assert.match(vehicleHtml, /<th>Vehicle Type<\/th>/);
    assert.match(vehicleHtml, /<th>Name of vehicle<\/th>/);
    assert.match(vehicleHtml, />Utility Vehicle<\/td>/);
    assert.match(vehicleHtml, />Bolero<\/td>/);
    assert.match(equipmentHtml, /<th>Equipment Type<\/th>/);
    assert.match(equipmentHtml, /<th>Equipment Name<\/th>/);
    assert.match(equipmentHtml, />Laboratory Equipment<\/td>/);
    assert.match(equipmentHtml, />Spectrometer<\/td>/);

    const vehicleStatusHtml = await reportTemplateService.generateStandaloneCustomTemplateHTML(
        'about-kvk-vehicle-details',
        [{
            reportingYear: 2026,
            kvkName: 'KVK Patna',
            vehicleTypeName: 'Utility Vehicle',
            vehicleName: 'Bolero',
        }],
        { sectionId: '1.7', title: 'Vehicle Status' },
    );
    assert.match(vehicleStatusHtml, />2026<\/td>/);
    assert.doesNotMatch(vehicleStatusHtml, />1970<\/td>/);
});

test('comprehensive Reports-dashboard HTML includes vehicle and equipment types', async () => {
    const html = await reportTemplateService.generateReportHTML(
        { kvkId: null, kvkName: 'Patna Zone', isAggregatedView: true },
        {
            '1.6': {
                data: [{
                    KVK: 'KVK Patna',
                    'Vehicle Type': 'Utility Vehicle',
                    'Name of vehicle': 'Bolero',
                }],
            },
            '1.8': {
                data: [{
                    KVK: 'KVK Patna',
                    'Equipment Type': 'Laboratory Equipment',
                    'Equipment Name': 'Spectrometer',
                }],
            },
        },
        { year: 2026 },
        'Report Admin',
    );

    assert.match(html, /<th>Vehicle Type<\/th>/);
    assert.match(html, />Utility Vehicle<\/td>/);
    assert.match(html, /<th>Equipment Type<\/th>/);
    assert.match(html, />Laboratory Equipment<\/td>/);
});
