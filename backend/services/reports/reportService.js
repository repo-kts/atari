const reportDataService = require('./reportDataService.js');
const pdfGenerationService = require('./pdfGenerationService.js');
const reportAggregationService = require('./reportAggregationService.js');
const { validateSectionIds, getAllSections } = require('../../config/reportConfig.js');

/**
 * Report Service
 * Main service orchestrating report generation
 */
class ReportService {
    /**
     * Generate KVK report
     */
    async generateKvkReport(kvkId, options = {}) {
        const {
            sectionIds = [],
            filters = {},
            generatedBy = 'System',
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            // If no sections specified, include all sections
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK info for header
        const kvkInfo = await reportDataService.getKvkInfoForHeader(kvkId);

        // Fetch data for all selected sections in parallel
        const sectionsData = await reportDataService.getMultipleSectionData(
            sectionIds,
            kvkId,
            filters
        );

        // Generate PDF
        const pdfBuffer = await pdfGenerationService.generateReportPDF(
            kvkInfo,
            sectionsData,
            filters,
            generatedBy
        );

        return {
            pdfBuffer,
            kvkInfo,
            sectionsData,
        };
    }

    /**
     * Get report configuration (available sections)
     */
    getReportConfig() {
        const sections = getAllSections();
        return {
            sections: sections.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                subsection: s.subsection,
                parentSectionId: s.parentSectionId,
            })),
        };
    }

    /**
     * Get report data without generating PDF (for preview)
     */
    async getReportData(kvkId, options = {}) {
        const {
            sectionIds = [],
            filters = {},
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK info
        const kvkInfo = await reportDataService.getKvkInfoForHeader(kvkId);

        // Fetch data for all selected sections
        const sectionsData = await reportDataService.getMultipleSectionData(
            sectionIds,
            kvkId,
            filters
        );

        return {
            kvkInfo,
            sectionsData,
        };
    }

    /**
     * Generate aggregated report for multiple KVKs
     */
    async generateAggregatedReport(scope, options = {}) {
        const {
            sectionIds = [],
            filters = {},
            generatedBy = 'System',
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK IDs for the scope
        const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
        
        if (kvkIds.length === 0) {
            throw new Error('No KVKs found for the selected scope');
        }

        // Aggregate data for all selected sections
        const sectionsData = await reportAggregationService.aggregateMultipleSections(
            sectionIds,
            kvkIds,
            filters
        );

        // Build aggregated KVK info for header
        const kvkInfo = await this._buildAggregatedKvkInfo(scope, kvkIds);

        // Generate PDF
        const pdfBuffer = await pdfGenerationService.generateReportPDF(
            kvkInfo,
            sectionsData,
            filters,
            generatedBy
        );

        return {
            pdfBuffer,
            kvkInfo,
            sectionsData,
            kvkCount: kvkIds.length,
        };
    }

    /**
     * Get aggregated report data without generating PDF
     */
    async getAggregatedReportData(scope, options = {}) {
        const {
            sectionIds = [],
            filters = {},
        } = options;

        // Validate section IDs
        if (sectionIds.length === 0) {
            const allSections = getAllSections();
            sectionIds.push(...allSections.map(s => s.id));
        }

        validateSectionIds(sectionIds);

        // Get KVK IDs for the scope
        const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
        
        if (kvkIds.length === 0) {
            throw new Error('No KVKs found for the selected scope');
        }

        // Aggregate data for all selected sections
        const sectionsData = await reportAggregationService.aggregateMultipleSections(
            sectionIds,
            kvkIds,
            filters
        );

        // Build aggregated KVK info
        const kvkInfo = await this._buildAggregatedKvkInfo(scope, kvkIds);

        return {
            kvkInfo,
            sectionsData,
            kvkCount: kvkIds.length,
        };
    }

    /**
     * Build aggregated KVK info for report header
     */
    async _buildAggregatedKvkInfo(scope, kvkIds) {
        const prisma = require('../../config/prisma.js');
        
        // Get first KVK for basic structure
        const firstKvk = await prisma.kvk.findUnique({
            where: { kvkId: kvkIds[0] },
            include: {
                zone: { select: { zoneName: true } },
                state: { select: { stateName: true } },
                district: { select: { districtName: true } },
                org: { select: { orgName: true } },
            },
        });

        if (!firstKvk) {
            return {
                kvkId: null,
                kvkName: 'Aggregated Report',
                address: '',
                email: '',
                mobile: '',
                zone: scope.zoneIds ? 'Multiple Zones' : (firstKvk?.zone?.zoneName || ''),
                state: scope.stateIds ? 'Multiple States' : (firstKvk?.state?.stateName || ''),
                district: scope.districtIds ? 'Multiple Districts' : (firstKvk?.district?.districtName || ''),
                organization: scope.orgIds ? 'Multiple Organizations' : (firstKvk?.org?.orgName || ''),
                university: null,
                hostOrg: '',
                yearOfSanction: null,
            };
        }

        return {
            kvkId: null,
            kvkName: `Aggregated Report (${kvkIds.length} KVKs)`,
            address: '',
            email: '',
            mobile: '',
            zone: scope.zoneIds ? 'Multiple Zones' : (firstKvk.zone?.zoneName || ''),
            state: scope.stateIds ? 'Multiple States' : (firstKvk.state?.stateName || ''),
            district: scope.districtIds ? 'Multiple Districts' : (firstKvk.district?.districtName || ''),
            organization: scope.orgIds ? 'Multiple Organizations' : (firstKvk.org?.orgName || ''),
            university: null,
            hostOrg: '',
            yearOfSanction: null,
        };
    }
}

module.exports = new ReportService();
