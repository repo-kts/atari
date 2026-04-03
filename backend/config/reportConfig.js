/**
 * Report Configuration
 * Defines the structure, sections, and data sources for KVK reports
 */

const reportConfig = {
    metadata: {
        name: 'KVK Comprehensive Report',
        version: '1.0.0',
        description: 'Comprehensive report containing all modules for KVK',
    },
    pdfFooter: {
        enabled: true,
        textTemplate: 'Page {current} of {total}',
        fontSize: 9,
        color: { r: 90, g: 90, b: 90 },
        bottomMarginPt: 24,
        align: 'right',
        fontName: 'Helvetica',
    },

    sections: [
        {
            id: '1.1',
            title: 'KVK Basic Information',
            description: 'Basic details about the KVK including contact information and geographic data',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvk',
            format: 'custom',                 
            customTemplate: 'about-kvk-view', // temp;ate key
            filters: {
                dateFields: [],
            },
            fields: [
                { dbField: 'kvkName', displayName: 'KVK Name' },
                { dbField: 'address', displayName: 'Address' },
                { dbField: 'email', displayName: 'Email' },
                { dbField: 'mobile', displayName: 'Mobile' },
                { dbField: 'landline', displayName: 'Office Phone', optional: true },
                { dbField: 'fax', displayName: 'Fax', optional: true },
                { dbField: 'zone.zoneName', displayName: 'Zone' },
                { dbField: 'state.stateName', displayName: 'State' },
                { dbField: 'district.districtName', displayName: 'District' },
                { dbField: 'org.orgName', displayName: 'Organization' },
                { dbField: 'university.universityName', displayName: 'University', optional: true },
                { dbField: 'hostOrg', displayName: 'Host Organization' },
                { dbField: 'hostAddress', displayName: 'Host Address', optional: true },
                { dbField: 'hostLandline', displayName: 'Host Office Phone', optional: true },
                { dbField: 'hostFax', displayName: 'Host Fax', optional: true },
                { dbField: 'hostEmail', displayName: 'Host Email', optional: true },
                { dbField: 'yearOfSanction', displayName: 'Year of Sanction' },
                { dbField: 'landDetails', displayName: 'Land Details', type: 'raw', optional: true },
            ],
        },
        {
            id: '1.2',
            title: 'Bank Account Details',
            description: 'All bank accounts associated with the KVK',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkBankAccounts',
            format: 'custom',
            customTemplate: 'about-kvk-bank-accounts',
            filters: {
                dateFields: ['createdAt'],
            },
            // Column order mirrors the sample: KVK Name, Account Type, Account Name, Name of the bank, Location, Account Number
            fields: [
                { dbField: 'kvk.kvkName', displayName: 'KVK Name' },
                { dbField: 'accountType', displayName: 'Account Type' },
                { dbField: 'accountName', displayName: 'Account Name' },
                { dbField: 'bankName', displayName: 'Name of the bank' },
                { dbField: 'location', displayName: 'Location' },
                { dbField: 'accountNumber', displayName: 'Account Number' },
            ],
        },
        {
            id: '1.3',
            title: 'Employee Details',
            description: 'Heads of KVKs (position order = 1)',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkEmployeesHeads',
            format: 'custom',
            customTemplate: 'about-kvk-employee-contacts',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'kvk.kvkName', displayName: 'KVK' },
                { dbField: 'staffName', displayName: 'Name' },
                { dbField: 'residence', displayName: 'Residence', optional: true },
                { dbField: 'mobile', displayName: 'Mobile' },
                { dbField: 'email', displayName: 'Email' },
            ],
        },
        {
            id: '1.4',
            title: 'All KVK staff Details',
            description: 'All active employees/staff of the KVK',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkEmployees',
            format: 'custom',
            customTemplate: 'about-kvk-employees-full',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'kvk.kvkName', displayName: 'KVK' },
                { dbField: 'sanctionedPost.postName', displayName: 'Sanctioned post' },
                { dbField: 'staffName', displayName: 'Name of the Incumbent' },
                { dbField: 'dateOfBirth', displayName: 'Date of Birth', type: 'date' },
                { dbField: 'discipline.disciplineName', displayName: 'Discipline' },
                { dbField: 'payLevel.levelName', displayName: 'Pay Scale with Present Basic', optional: true },
                { dbField: 'dateOfJoining', displayName: 'Date of joining', type: 'date' },
                { dbField: 'staffCategory.categoryName', displayName: 'Category (SC/ST/ OBC/ General)', optional: true },
            ],
        },  
        {
            id: '1.5',
            title: 'Infrastructure Details',
            description: 'All infrastructure records for the KVK',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkInfrastructure',
            format: 'table',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'infraMaster.name', displayName: 'Infrastructure Name' },
                { dbField: 'notYetStarted', displayName: 'Not Yet Started', type: 'boolean' },
                { dbField: 'completedPlinthLevel', displayName: 'Completed Plinth Level', type: 'boolean' },
                { dbField: 'completedLintelLevel', displayName: 'Completed Lintel Level', type: 'boolean' },
                { dbField: 'completedRoofLevel', displayName: 'Completed Roof Level', type: 'boolean' },
                { dbField: 'totallyCompleted', displayName: 'Totally Completed', type: 'boolean' },
                { dbField: 'plinthAreaSqM', displayName: 'Plinth Area (sq m)' },
                { dbField: 'underUse', displayName: 'Under Use', type: 'boolean' },
                { dbField: 'sourceOfFunding', displayName: 'Source of Funding' },
            ],
        },
        {
            id: '1.6',
            title: 'Vehicle Details',
            description: 'All vehicles and their maintenance records',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkVehicles',
            format: 'custom',
            customTemplate: 'about-kvk-vehicles',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'kvk.kvkName', displayName: 'KVK' },
                { dbField: 'vehicleName', displayName: 'Type of vehicle' },
                { dbField: 'yearOfPurchase', displayName: 'Year of purchase' },
                { dbField: 'totalCost', displayName: 'Cost (Rs.)' },
                { dbField: 'totalRun', displayName: 'Total Run(km/hrs)', optional: true },
                { dbField: 'presentStatus', displayName: 'Present status' },
            ],
        },
        {
            id: '1.7',
            title: 'Equipment Details',
            description: 'All equipments and their details',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkEquipments',
            format: 'grouped-table',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'equipmentName', displayName: 'Equipment Name' },
                { dbField: 'yearOfPurchase', displayName: 'Year of Purchase' },
                { dbField: 'totalCost', displayName: 'Total Cost', type: 'currency' },
                { dbField: 'presentStatus', displayName: 'Present Status' },
                { dbField: 'sourceOfFunding', displayName: 'Source of Funding' },
                { dbField: 'reportingYear', displayName: 'Reporting Year', optional: true },
            ],
        },
        {
            id: '1.8',
            title: 'Farm Implement Details',
            description: 'All farm implements',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkFarmImplements',
            format: 'custom',
            customTemplate: 'about-kvk-farm-implements',
            customSectionLabel: '1.12. Farm implements',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'kvk.kvkName', displayName: 'KVK', lookupPaths: ['kvk.kvkName', 'kvkName', 'KVK'] },
                { dbField: 'implementName', displayName: 'Name of equipment', lookupPaths: ['implementName', 'Name of equipment'] },
                { dbField: 'yearOfPurchase', displayName: 'Year', lookupPaths: ['yearOfPurchase', 'Year of purchase', 'Year'] },
                { dbField: 'totalCost', displayName: 'Cost (Rs.)', type: 'currency', lookupPaths: ['totalCost', 'Cost (Rs.)'] },
                { dbField: 'presentStatus', displayName: 'Present status', type: 'status', lookupPaths: ['presentStatus', 'Present status'] },
                { dbField: 'sourceOfFund', displayName: 'Source of fund', lookupPaths: ['sourceOfFund', 'sourceOfFunding', 'Source of fund', 'Source of Funding'] },
            ],
        },
        {
            id: '1.9',
            title: 'Vehicles Records',
            description: 'Vehicle reporting-year records (Vehicle Details form)',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkVehicleDetails',
            format: 'custom',
            customTemplate: 'about-kvk-vehicle-details',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'reportingYear', displayName: 'Year' },
                { dbField: 'kvk.kvkName', displayName: 'KVK' },
                { dbField: 'vehicleName', displayName: 'Vehicle' },
                { dbField: 'registrationNo', displayName: 'Registration No.' },
                { dbField: 'yearOfPurchase', displayName: 'Year of purchase' },
                { dbField: 'totalCost', displayName: 'Cost (Rs.)' },
                { dbField: 'totalRun', displayName: 'Total Run(km/hrs)' },
                { dbField: 'presentStatus', displayName: 'Present status' },
                { dbField: 'repairingCost', displayName: 'Repairing Cost', optional: true },
                { dbField: 'sourceOfFunding', displayName: 'Funding Source', optional: true },
            ],
        },
        {
            id: '1.11',
            title: 'Equipment Records',
            description: 'Equipment reporting-year records (Equipment Details form)',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkEquipmentRecords',
            format: 'custom',
            customTemplate: 'about-kvk-equipment-records',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [
                { dbField: 'reportingYear', displayName: 'Year' },
                { dbField: 'kvk.kvkName', displayName: 'KVK' },
                { dbField: 'equipmentName', displayName: 'Equipment Name' },
                { dbField: 'yearOfPurchase', displayName: 'Year of purchase' },
                { dbField: 'totalCost', displayName: 'Cost (Rs.)' },
                { dbField: 'sourceOfFunding', displayName: 'Source of fund' },
                { dbField: 'presentStatus', displayName: 'Present status' },
            ],
        },
        // ── OFT (On-Farm Testing) ───────────────────────────────────
        {
            id: '2.1',
            title: 'OFT Summary',
            description: 'Technology Assessed by KVK - sector-wise thematic area summary',
            subsection: true,
            parentSectionId: '2',
            dataSource: 'oftSummary',
            format: 'custom',
            customTemplate: 'oft-summary',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [],
        },
        {
            id: '2.2',
            title: 'OFT Details',
            description: 'Individual OFT trial detail cards with results',
            subsection: true,
            parentSectionId: '2',
            dataSource: 'oftDetailCards',
            format: 'custom',
            customTemplate: 'oft-detail-cards',
            filters: {
                dateFields: ['createdAt'],
            },
            fields: [],
        },
        {
            id: '2.8.1',
            title: 'Performance of Demonstration under CFLD',
            description: 'Combined CFLD report with technical, economic, socio-economic and perception parameters',
            subsection: true,
            parentSectionId: '3',
            dataSource: 'cfldCombined',
            format: 'custom',
            customTemplate: 'cfld-combined',
            filters: {
                dateFields: ['createdAt'],
                yearFields: ['reportingYear'],
            },
            fields: [
                { dbField: 'reportingYear', displayName: 'Reporting Year', type: 'date' },
                { dbField: 'kvkName', displayName: 'KVK Name' },
                { dbField: 'stateName', displayName: 'State' },
                { dbField: 'cropTypeName', displayName: 'Crop Type' },
                { dbField: 'seasonName', displayName: 'Season' },
                { dbField: 'cropName', displayName: 'Crop' },
                { dbField: 'areaInHa', displayName: 'Area (ha)' },
                { dbField: 'technologyDemonstrated', displayName: 'Detail of technology demonstrated' },
                { dbField: 'farmerYield', displayName: 'Yield in farmer field (q/ha)' },
                { dbField: 'demoYieldAvg', displayName: 'Yield in demonstration (q/ha)' },
                { dbField: 'percentIncrease', displayName: '% Increase' },
            ],
        },
        {
            id: '2.8.2',
            title: 'Extension activities under CFLD conducted',
            description: 'CFLD extension activities with participant category counts',
            subsection: true,
            parentSectionId: '3',
            dataSource: 'cfldExtensionActivity',
            format: 'custom',
            customTemplate: 'cfld-extension-activity',
            filters: {
                dateFields: ['activityDate'],
            },
            fields: [
                { dbField: 'kvkName', displayName: 'KVK Name' },
                { dbField: 'extensionActivityName', displayName: 'Extension Activities organized' },
                { dbField: 'activityDate', displayName: 'Activity Date', type: 'date' },
                { dbField: 'placeOfActivity', displayName: 'Place of Activity' },
                { dbField: 'generalM', displayName: 'General M' },
                { dbField: 'generalF', displayName: 'General F' },
                { dbField: 'obcM', displayName: 'OBC M' },
                { dbField: 'obcF', displayName: 'OBC F' },
                { dbField: 'scM', displayName: 'SC M' },
                { dbField: 'scF', displayName: 'SC F' },
                { dbField: 'stM', displayName: 'ST M' },
                { dbField: 'stF', displayName: 'ST F' },
                { dbField: 'totalFarmers', displayName: 'Total Farmers' },
            ],
        },
        {
            id: '2.8.3',
            title: 'Details of budget utilization',
            description: 'CFLD crop-wise budget utilization details',
            subsection: true,
            parentSectionId: '3',
            dataSource: 'cfldBudgetUtilization',
            format: 'custom',
            customTemplate: 'cfld-budget-utilization',
            filters: {
                dateFields: ['createdAt'],
                yearFields: ['reportingYearDate'],
            },
            fields: [
                { dbField: 'kvkName', displayName: 'KVK Name' },
                { dbField: 'seasonName', displayName: 'Season' },
                { dbField: 'cropName', displayName: 'Crop' },
                { dbField: 'overallFundAllocation', displayName: 'Overall fund allocation' },
                { dbField: 'areaAllotted', displayName: 'Area (ha) alloted' },
                { dbField: 'areaAchieved', displayName: 'Area (ha) achieved' },
            ],
        },
        {
            id: '2.9',
            title: 'CRA Details',
            description: 'Climate resilient agriculture details with state-wise presentation',
            subsection: true,
            parentSectionId: '3',
            dataSource: 'craDetails',
            format: 'custom',
            customTemplate: 'cra-details-state-wise',
            filters: {
                dateFields: [],
                yearFields: ['reportingYear'],
            },
            fields: [],
        },
        {
            id: '2.10',
            title: 'CRA Extension Activity',
            description: 'Extension activities under climate resilient agriculture',
            subsection: true,
            parentSectionId: '3',
            dataSource: 'craExtensionActivity',
            format: 'custom',
            customTemplate: 'cra-extension-activity',
            filters: {
                dateFields: ['startDate'],
            },
            fields: [],
        },
        {
            id: '2.11',
            title: 'Formation and Promotion of FPOs as CBBOs under NCDC Funding',
            description: 'FPO registration, training and business performance under CBBO support',
            subsection: true,
            parentSectionId: '3',
            dataSource: 'fpoCbboDetails',
            format: 'custom',
            customTemplate: 'fpo-cbbo-details',
            filters: {
                dateFields: ['reportingYear'],
            },
            fields: [],
        },
        {
            id: '2.12',
            title: 'Details of commodity-based organizations/Farmers Cooperative Society/FPO Formed/Associated with KVK under NCDC Funding',
            description: 'FPO management profile details under NCDC funding',
            subsection: true,
            parentSectionId: '3',
            dataSource: 'fpoManagement',
            format: 'custom',
            customTemplate: 'fpo-management-details',
            filters: {
                dateFields: ['reportingYear'],
            },
            fields: [],
        },
    ],
};

/**
 * Get section configuration by ID
 */
function getSectionConfig(sectionId) {
    return reportConfig.sections.find(s => s.id === sectionId);
}

/**
 * Get all sections
 */
function getAllSections() {
    return reportConfig.sections;
}

/**
 * Get sections by data source
 */
function getSectionsByDataSource(dataSource) {
    return reportConfig.sections.filter(s => s.dataSource === dataSource);
}

function getSectionByCustomTemplate(customTemplate) {
    return reportConfig.sections.find(s => s.customTemplate === customTemplate);
}

/**
 * Validate section IDs
 */
function validateSectionIds(sectionIds) {
    const validIds = reportConfig.sections.map(s => s.id);
    const invalidIds = sectionIds.filter(id => !validIds.includes(id));
    if (invalidIds.length > 0) {
        throw new Error(`Invalid section IDs: ${invalidIds.join(', ')}`);
    }
    return true;
}

module.exports = {
    reportConfig,
    getSectionConfig,
    getAllSections,
    getSectionsByDataSource,
    getSectionByCustomTemplate, 
    validateSectionIds,
};
