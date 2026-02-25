/**
 * Report Configuration
 * Defines the structure, sections, and data sources for KVK reports
 */

const reportConfig = {  
    metadata: {
        name: 'KVK Comprehensive Report',
        version: '1.0.0',
        description: 'Comprehensive report containing all About KVK form data',
    },

    sections: [
        {
            id: '1.1',
            title: 'KVK Basic Information',
            description: 'Basic details about the KVK including contact information and geographic data',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvk',
            format: 'formatted-text',
            filters: {
                dateFields: [],
            },
            fields: [
                { dbField: 'kvkName', displayName: 'KVK Name' },
                { dbField: 'address', displayName: 'Address' },
                { dbField: 'email', displayName: 'Email' },
                { dbField: 'mobile', displayName: 'Mobile' },
                { dbField: 'zone.zoneName', displayName: 'Zone' },
                { dbField: 'state.stateName', displayName: 'State' },
                { dbField: 'district.districtName', displayName: 'District' },
                { dbField: 'org.uniName', displayName: 'Organization' },
                { dbField: 'university.uniName', displayName: 'University', optional: true },
                { dbField: 'hostOrg', displayName: 'Host Organization' },
                { dbField: 'yearOfSanction', displayName: 'Year of Sanction' },
            ],
        },
        {
            id: '1.2',
            title: 'Bank Account Details',
            description: 'All bank accounts associated with the KVK',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkBankAccounts',
            format: 'table',
            filters: {
                dateFields: [],
            },
            fields: [
                { dbField: 'accountType', displayName: 'Account Type' },
                { dbField: 'accountName', displayName: 'Account Name' },
                { dbField: 'bankName', displayName: 'Bank Name' },
                { dbField: 'accountNumber', displayName: 'Account Number' },
                { dbField: 'location', displayName: 'Location' },
            ],
        },
        {
            id: '1.3',
            title: 'Employee Details',
            description: 'All active employees/staff of the KVK',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkEmployees',
            format: 'table',
            filters: {
                dateFields: ['dateOfJoining', 'dateOfBirth'],
            },
            fields: [
                { dbField: 'staffName', displayName: 'Staff Name' },
                { dbField: 'sanctionedPost.postName', displayName: 'Sanctioned Post' },
                { dbField: 'dateOfBirth', displayName: 'Date of Birth', type: 'date' },
                { dbField: 'discipline.disciplineName', displayName: 'Discipline' },
                { dbField: 'payScale', displayName: 'Pay Scale', optional: true },
                { dbField: 'dateOfJoining', displayName: 'Date of Joining', type: 'date' },
                { dbField: 'staffCategory.categoryName', displayName: 'Category', optional: true },
                { dbField: 'email', displayName: 'Email', optional: true },
                { dbField: 'mobile', displayName: 'Mobile' },
                { dbField: 'payLevel.levelName', displayName: 'Pay Level', optional: true },
                { dbField: 'jobType', displayName: 'Job Type', optional: true },
                { dbField: 'allowances', displayName: 'Allowances', optional: true },
            ],
        },
        {
            id: '1.4',
            title: 'Staff Transferred',
            description: 'Staff that were transferred from this KVK',
            subsection: true,
            parentSectionId: '1',
            dataSource: 'kvkStaffTransferred',
            format: 'table',
            filters: {
                dateFields: ['transferDate', 'lastTransferDate'],
            },
            fields: [
                { dbField: 'staffName', displayName: 'Staff Name' },
                { dbField: 'kvk.kvkName', displayName: 'Current KVK' },
                { dbField: 'originalKvk.kvkName', displayName: 'Original KVK', optional: true },
                { dbField: 'lastTransferDate', displayName: 'Transfer Date', type: 'date', optional: true },
                { dbField: 'transferCount', displayName: 'Transfer Count', optional: true },
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
                dateFields: ['createdAt', 'updatedAt'],
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
            format: 'grouped-table',
            filters: {
                dateFields: ['yearOfPurchase'],
                yearFields: ['yearOfPurchase', 'reportingYear'],
            },
            fields: [
                { dbField: 'vehicleName', displayName: 'Vehicle Name' },
                { dbField: 'registrationNo', displayName: 'Registration Number' },
                { dbField: 'yearOfPurchase', displayName: 'Year of Purchase' },
                { dbField: 'totalCost', displayName: 'Total Cost', type: 'currency' },
                { dbField: 'presentStatus', displayName: 'Present Status' },
                { dbField: 'reportingYear', displayName: 'Reporting Year', optional: true },
                { dbField: 'totalRun', displayName: 'Total Run (Kms)', optional: true },
                { dbField: 'sourceOfFunding', displayName: 'Source of Funding', optional: true },
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
                dateFields: [],
                yearFields: ['yearOfPurchase', 'reportingYear'],
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
            format: 'table',
            filters: {
                dateFields: [],
                yearFields: ['yearOfPurchase'],
            },
            fields: [
                { dbField: 'implementName', displayName: 'Implement Name' },
                { dbField: 'yearOfPurchase', displayName: 'Year of Purchase' },
                { dbField: 'totalCost', displayName: 'Total Cost', type: 'currency' },
                { dbField: 'presentStatus', displayName: 'Present Status' },
                { dbField: 'sourceOfFund', displayName: 'Source of Fund' },
            ],
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
    validateSectionIds,
};
