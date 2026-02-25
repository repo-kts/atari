const reportService = require('../../services/reports/reportService.js');
const reportAggregationService = require('../../services/reports/reportAggregationService.js');

/**
 * Report Controller
 * HTTP request handlers for report generation 
 */

/**
 * Generate KVK report PDF
 * POST /api/reports/kvk/generate
 */
const generateKvkReport = async (req, res) => {
    try {
        const { kvkId, sectionIds, filters } = req.body;
        const user = req.user;

        // Validate KVK ID
        if (!kvkId) {
            return res.status(400).json({
                success: false,
                error: 'KVK ID is required',
            });
        }

        // Authorization: KVK admin can only generate reports for their KVK
        if (user.kvkId && user.kvkId !== kvkId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied: You can only generate reports for your own KVK',
            });
        }

        // Use user's KVK ID if they are KVK admin
        const targetKvkId = user.kvkId || kvkId;
        const generatedBy = user.name || user.email || 'Unknown User';

        // Generate report
        const result = await reportService.generateKvkReport(targetKvkId, {
            sectionIds: sectionIds || [],
            filters: filters || {},
            generatedBy,
        });

        // Set response headers for PDF download
        const fileName = `KVK_Report_${targetKvkId}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.pdfBuffer.length);

        // Send PDF buffer
        res.send(result.pdfBuffer);
    } catch (error) {
        console.error('Error generating KVK report:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate report',
        });
    }
};

/**
 * Get report configuration (available sections)
 * GET /api/reports/kvk/config
 */
const getReportConfig = async (req, res) => {
    try {
        const config = reportService.getReportConfig();
        res.json({
            success: true,
            data: config,
        });
    } catch (error) {
        console.error('Error getting report config:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get report configuration',
        });
    }
};

/**
 * Get report data (for preview)
 * POST /api/reports/kvk/data
 */
const getReportData = async (req, res) => {
    try {
        const { kvkId, sectionIds, filters, scope } = req.body;
        const user = req.user;

        // Check if this is an aggregated report request
        if (scope) {
            // Validate scope access
            const userScope = await reportAggregationService.getScopeForRole(user);
            const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
            
            if (kvkIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No KVKs found for the selected scope',
                });
            }

            // Get aggregated report data
            const data = await reportService.getAggregatedReportData(scope, {
                sectionIds: sectionIds || [],
                filters: filters || {},
            });

            return res.json({
                success: true,
                data,
            });
        }

        // Single KVK report
        // Validate KVK ID
        if (!kvkId) {
            return res.status(400).json({
                success: false,
                error: 'KVK ID is required',
            });
        }

        // Authorization: KVK admin can only access their KVK data
        if (user.kvkId && user.kvkId !== kvkId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied: You can only access your own KVK data',
            });
        }

        // Use user's KVK ID if they are KVK admin
        const targetKvkId = user.kvkId || kvkId;

        // Get report data
        const data = await reportService.getReportData(targetKvkId, {
            sectionIds: sectionIds || [],
            filters: filters || {},
        });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error getting report data:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get report data',
        });
    }
};

/**
 * Generate aggregated report
 * POST /api/reports/aggregated/generate
 */
const generateAggregatedReport = async (req, res) => {
    try {
        const { scope, sectionIds, filters } = req.body;
        const user = req.user;

        if (!scope) {
            return res.status(400).json({
                success: false,
                error: 'Scope is required for aggregated reports',
            });
        }

        // Validate scope access
        const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
        
        if (kvkIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No KVKs found for the selected scope',
            });
        }

        const generatedBy = user.name || user.email || 'Unknown User';

        // Generate aggregated report
        const result = await reportService.generateAggregatedReport(scope, {
            sectionIds: sectionIds || [],
            filters: filters || {},
            generatedBy,
        });

        // Set response headers for PDF download
        const fileName = `Aggregated_Report_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.pdfBuffer.length);

        // Send PDF buffer
        res.send(result.pdfBuffer);
    } catch (error) {
        console.error('Error generating aggregated report:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate aggregated report',
        });
    }
};

/**
 * Get scope options for current user
 * GET /api/reports/scope
 */
const getScopeOptions = async (req, res) => {
    try {
        const user = req.user;
        const scope = await reportAggregationService.getScopeForRole(user);
        
        res.json({
            success: true,
            data: scope,
        });
    } catch (error) {
        console.error('Error getting scope options:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get scope options',
        });
    }
};

/**
 * Get filtered children based on selected parents
 * POST /api/reports/scope/children
 */
const getFilteredChildren = async (req, res) => {
    try {
        const { parentType, parentIds } = req.body;

        if (!parentType) {
            return res.status(400).json({
                success: false,
                error: 'parentType is required',
            });
        }

        if (!parentIds || !Array.isArray(parentIds)) {
            return res.status(400).json({
                success: false,
                error: 'parentIds must be an array',
            });
        }

        if (parentIds.length === 0) {
            return res.json({
                success: true,
                data: [],
            });
        }

        const children = await reportAggregationService.getFilteredChildren(parentType, parentIds);
        
        res.json({
            success: true,
            data: children,
        });
    } catch (error) {
        console.error('Error getting filtered children:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get filtered children',
        });
    }
};

/**
 * Get filtered KVKs based on multiple parent filters
 * POST /api/reports/scope/kvks
 */
const getFilteredKvks = async (req, res) => {
    try {
        const { zoneIds, stateIds, districtIds, orgIds } = req.body;

        const filters = {};
        if (zoneIds && zoneIds.length > 0) filters.zoneIds = zoneIds;
        if (stateIds && stateIds.length > 0) filters.stateIds = stateIds;
        if (districtIds && districtIds.length > 0) filters.districtIds = districtIds;
        if (orgIds && orgIds.length > 0) filters.orgIds = orgIds;

        const kvks = await reportAggregationService.getFilteredKvks(filters);
        
        res.json({
            success: true,
            data: kvks,
        });
    } catch (error) {
        console.error('Error getting filtered KVKs:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get filtered KVKs',
        });
    }
};

/**
 * Update generateKvkReport to support scope
 */
const generateKvkReportUpdated = async (req, res) => {
    try {
        const { kvkId, sectionIds, filters, scope } = req.body;
        const user = req.user;

        // Check if this is an aggregated report request
        if (scope) {
            return generateAggregatedReport(req, res);
        }

        // Single KVK report (original logic)
        // Validate KVK ID
        if (!kvkId) {
            return res.status(400).json({
                success: false,
                error: 'KVK ID is required',
            });
        }

        // Authorization: KVK admin can only generate reports for their KVK
        if (user.kvkId && user.kvkId !== kvkId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied: You can only generate reports for your own KVK',
            });
        }

        // Use user's KVK ID if they are KVK admin
        const targetKvkId = user.kvkId || kvkId;
        const generatedBy = user.name || user.email || 'Unknown User';

        // Generate report
        const result = await reportService.generateKvkReport(targetKvkId, {
            sectionIds: sectionIds || [],
            filters: filters || {},
            generatedBy,
        });

        // Set response headers for PDF download
        const fileName = `KVK_Report_${targetKvkId}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.pdfBuffer.length);

        // Send PDF buffer
        res.send(result.pdfBuffer);
    } catch (error) {
        console.error('Error generating KVK report:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate report',
        });
    }
};

module.exports = {
    generateKvkReport: generateKvkReportUpdated,
    getReportConfig,
    getReportData,
    generateAggregatedReport,
    getScopeOptions,
    getFilteredChildren,
    getFilteredKvks,
};
