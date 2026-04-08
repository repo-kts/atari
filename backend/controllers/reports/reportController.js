const reportService = require('../../services/reports/reportService.js');
const reportAggregationService = require('../../services/reports/reportAggregationService.js');
const { generateExcel, generateWord } = require('../../utils/exportHelper.js');
const { normalizeReportKvkId } = require('../../utils/reportKvkId.js');

/**
 * Resolve KVK id for single-KVK report endpoints.
 * KVK-bound users may omit kvkId in the body; JWT user.kvkId is used.
 * Compares ids as normalized integers so string "5" matches number 5.
 */
function resolveSingleKvkReportTarget(user, kvkIdFromBody, options = {}) {
    const forbiddenMessage =
        options.forbiddenMessage || 'Access denied: You can only access your own KVK data';
    const targetKvkId = normalizeReportKvkId(
        user.kvkId != null && user.kvkId !== '' ? user.kvkId : kvkIdFromBody,
    );
    if (targetKvkId == null) {
        return { error: { status: 400, message: 'KVK ID is required' } };
    }
    if (user.kvkId != null && user.kvkId !== '') {
        const userKvk = normalizeReportKvkId(user.kvkId);
        if (kvkIdFromBody != null && kvkIdFromBody !== '') {
            const bodyKvk = normalizeReportKvkId(kvkIdFromBody);
            if (bodyKvk != null && userKvk !== bodyKvk) {
                return {
                    error: {
                        status: 403,
                        message: forbiddenMessage,
                    },
                };
            }
        }
    }
    return { targetKvkId };
}

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
        let format = String(req.query.format || 'pdf').toLowerCase();
        if (format === 'doc' || format === 'word') format = 'docx';
        if (format === 'xls') format = 'excel';

        const resolved = resolveSingleKvkReportTarget(user, kvkId, {
            forbiddenMessage: 'Access denied: You can only generate reports for your own KVK',
        });
        if (resolved.error) {
            return res.status(resolved.error.status).json({
                success: false,
                error: resolved.error.message,
            });
        }
        const { targetKvkId } = resolved;
        const generatedBy = user.name || user.email || 'Unknown User';

        if (format === 'excel' || format === 'docx') {
            // Build a compact tabular export from report data
            const data = await reportService.getReportData(targetKvkId, {
                sectionIds: sectionIds || [],
                filters: filters || {},
            });
            const headers = ['Section', 'Data'];
            const rows = Object.entries(data.sectionsData || {}).map(([section, value]) => {
                try {
                    return [section, JSON.stringify(value)];
                } catch {
                    return [section, String(value)];
                }
            });
            if (format === 'excel') {
                const buffer = await generateExcel(`KVK Report ${targetKvkId}`, headers, rows);
                const fileName = `KVK_Report_${targetKvkId}_${Date.now()}.xlsx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Content-Length', buffer.length);
                return res.send(Buffer.from(buffer));
            } else {
                const buffer = await generateWord(`KVK Report ${targetKvkId}`, headers, rows);
                const fileName = `KVK_Report_${targetKvkId}_${Date.now()}.docx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Content-Length', buffer.length);
                return res.send(Buffer.from(buffer));
            }
        }

        // Default: Generate PDF
        const result = await reportService.generateKvkReport(targetKvkId, {
            sectionIds: sectionIds || [],
            filters: filters || {},
            generatedBy,
        });
        const fileName = `KVK_Report_${targetKvkId}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.pdfBuffer.length);
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

        // Single KVK report (KVK-bound users may omit kvkId; use JWT user.kvkId)
        const resolved = resolveSingleKvkReportTarget(user, kvkId);
        if (resolved.error) {
            return res.status(resolved.error.status).json({
                success: false,
                error: resolved.error.message,
            });
        }
        const { targetKvkId } = resolved;

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
        let format = String(req.query.format || 'pdf').toLowerCase();
        if (format === 'doc' || format === 'word') format = 'docx';
        if (format === 'xls') format = 'excel';

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

        if (format === 'excel' || format === 'docx') {
            const data = await reportService.getAggregatedReportData(scope, {
                sectionIds: sectionIds || [],
                filters: filters || {},
            });
            const headers = ['Section', 'Data'];
            const rows = Object.entries(data.sectionsData || {}).map(([section, value]) => {
                try {
                    return [section, JSON.stringify(value)];
                } catch {
                    return [section, String(value)];
                }
            });
            if (format === 'excel') {
                const buffer = await generateExcel('Aggregated Report', headers, rows);
                const fileName = `Aggregated_Report_${Date.now()}.xlsx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Content-Length', buffer.length);
                return res.send(Buffer.from(buffer));
            } else {
                const buffer = await generateWord('Aggregated Report', headers, rows);
                const fileName = `Aggregated_Report_${Date.now()}.docx`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Content-Length', buffer.length);
                return res.send(Buffer.from(buffer));
            }
        }

        // Default: PDF
        const result = await reportService.generateAggregatedReport(scope, {
            sectionIds: sectionIds || [],
            filters: filters || {},
            generatedBy,
        });
        const fileName = `Aggregated_Report_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.pdfBuffer.length);
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

        // Single KVK report (original logic; KVK-bound users may omit kvkId)
        const resolved = resolveSingleKvkReportTarget(user, kvkId, {
            forbiddenMessage: 'Access denied: You can only generate reports for your own KVK',
        });
        if (resolved.error) {
            return res.status(resolved.error.status).json({
                success: false,
                error: resolved.error.message,
            });
        }
        const { targetKvkId } = resolved;
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
