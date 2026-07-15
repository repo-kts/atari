const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const { getSectionConfig } = require('../config/reportConfig.js');
const reportDataService = require('../services/reports/reportDataService.js');
const templateService = require('../services/reports/reportTemplateService.js');
const {
    renderVehicleDetailsSection,
} = require('../services/reports/formsTemplate/aboutkvkTemplates/vehicleDetailsTemplate.js');
const {
    renderEquipmentDetailsSection,
} = require('../services/reports/formsTemplate/aboutkvkTemplates/equipmentDetailsTemplate.js');
const {
    renderEquipmentRecordsSection,
} = require('../services/reports/formsTemplate/aboutkvkTemplates/equipmentRecordsTemplate.js');

function extractFieldGroup(source, groupName) {
    const match = source.match(new RegExp(`${groupName}:\\s*\\[([\\s\\S]*?)\\]\\s*as const`));
    assert.ok(match, `${groupName} field group should exist`);
    return match[1];
}

test('View Equipments and report 1.5.A omit funding', () => {
    const frontendFields = fs.readFileSync(
        path.resolve(__dirname, '../../frontend/src/constants/fieldNames.ts'),
        'utf8',
    );
    const viewEquipmentBlock = extractFieldGroup(frontendFields, 'VIEW_EQUIPMENTS');
    assert.doesNotMatch(viewEquipmentBlock, /SOURCE_OF_FUND/);

    const section = getSectionConfig('1.8');
    assert.equal(
        section.fields.some((field) => field.dbField === 'sourceOfFunding'),
        false,
    );

    const html = renderEquipmentDetailsSection.call(templateService, section, [{
        kvk: { kvkName: 'KVK Test' },
        equipmentName: 'Computer',
        yearOfPurchase: 2025,
        totalCost: 50000,
        sourceOfFunding: 'ICAR',
    }], 'section-1-8', false, {});

    assert.doesNotMatch(html, /Source of Funding/);
    assert.doesNotMatch(html, />ICAR</);
});

test('report 1.4.B preserves vehicle funding source and agency', () => {
    const section = getSectionConfig('1.7');
    const transformed = reportDataService._transformSectionData([{
        reportingYear: new Date('2025-01-01T00:00:00.000Z'),
        kvk: { kvkName: 'KVK Test' },
        vehicleName: 'Vehicle A',
        registrationNo: 'TEST-1',
        yearOfPurchase: 2024,
        totalCost: 500000,
        totalRun: 1000,
        presentStatus: 'Working',
        repairingCost: 100,
        sourceOfFunding: 'ICAR',
        fundingAgencyName: 'Vehicle Agency Ltd',
    }], section);
    const html = renderVehicleDetailsSection.call(
        templateService,
        section,
        transformed,
        'section-1-7',
        false,
        {},
    );

    assert.match(html, />ICAR</);
    assert.match(html, />Vehicle Agency Ltd</);
});

test('report 1.5.B preserves equipment funding source and agency', () => {
    const section = getSectionConfig('1.9');
    const transformed = reportDataService._transformSectionData([{
        reportingYear: new Date('2025-01-01T00:00:00.000Z'),
        kvk: { kvkName: 'KVK Test' },
        equipmentName: 'Equipment A',
        yearOfPurchase: 2024,
        totalCost: 75000,
        sourceOfFunding: 'ICAR',
        fundingAgencyName: 'Equipment Agency Ltd',
        presentStatus: 'Working',
    }], section);
    const html = renderEquipmentRecordsSection.call(
        templateService,
        section,
        transformed,
        'section-1-9',
        false,
        {},
    );

    assert.match(html, />ICAR</);
    assert.match(html, />Equipment Agency Ltd</);
});
