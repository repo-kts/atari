const trainingService = require('../../services/forms/trainingService.js');
const { asyncHandler } = require('../../utils/errorHandler.js');
const { resolveTrainingsPageReportPayload } = require('../../repositories/reports/trainingsPageReport/trainingsPageReportPayload.js');
const { generateTrainingsPageExcelBuffer, generateTrainingsPageWordBuffer } = require('../../utils/trainingsPageExport.js');
const exportHelper = require('../../utils/exportHelper.js');
const reportTemplateService = require('../../services/reports/reportTemplateService.js');
const { deliverReport } = require('../../utils/reportDelivery.js');

/**
 * Training Controller
 * HTTP request handlers for Training Achievement forms
 * Follows the same pattern as extensionActivityController for consistency
 */

const trainingController = {
    /**
     * Create a new Training Achievement
     * @route POST /api/forms/achievements/trainings
     */
    create: asyncHandler(async (req, res) => {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Request body is required',
                    code: 'VALIDATION_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }

        if (!req.user || typeof req.user !== 'object') {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'User information is required. Please ensure you are authenticated.',
                    code: 'AUTHENTICATION_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }

        const result = await trainingService.createTraining(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Training achievement created successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Get all Training Achievements
     * @route GET /api/forms/achievements/trainings
     */
    getAll: asyncHandler(async (req, res) => {
        const filters = req.query || {};
        const result = await trainingService.getAllTrainings(filters, req.user);
        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Export ALL Training Achievements (scoped to the user) as PDF / Excel / Word.
     * The server fetches the data itself instead of the browser uploading thousands
     * of rows — this keeps the request/response small enough for serverless, and
     * large PDFs are handed off via S3 (see deliverReport).
     * @route GET /api/forms/achievements/trainings/export?format=excel|word|pdf
     */
    exportAll: asyncHandler(async (req, res) => {
        const format = String(req.query.format || 'excel').toLowerCase();
        const title = 'Trainings';

        // Same scoped data the list returns — no giant upload from the browser.
        // Pass empty filters (not req.query) so the `format` param isn't spread
        // into the Prisma where-clause; role scoping still applies inside findAll.
        const data = await trainingService.getAllTrainings({}, req.user);

        const stamp = new Date().toISOString().slice(0, 10);
        let buffer;
        let ext;

        if (format === 'excel') {
            buffer = await generateTrainingsPageExcelBuffer(title, resolveTrainingsPageReportPayload(data));
            ext = 'xlsx';
        } else if (format === 'word') {
            buffer = await generateTrainingsPageWordBuffer(title, resolveTrainingsPageReportPayload(data));
            ext = 'docx';
        } else if (format === 'pdf') {
            const html = await reportTemplateService.generateStandaloneCustomTemplateHTML(
                'trainings-page-report',
                data,
                { sectionId: 'trainings-page', title },
            );
            buffer = await exportHelper.generatePDF(html);
            ext = 'pdf';
        } else {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid format. Use excel, word or pdf.', code: 'VALIDATION_ERROR' },
                timestamp: new Date().toISOString(),
            });
        }

        return deliverReport(res, { buffer, ext, fileName: `trainings-report-${stamp}.${ext}` });
    }),

    /**
     * Get Training Achievement by ID
     * @route GET /api/forms/achievements/trainings/:id
     */
    getById: asyncHandler(async (req, res) => {
        const result = await trainingService.getTrainingById(req.params.id, req.user);
        if (!result) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Training achievement not found',
                    code: 'NOT_FOUND',
                },
                timestamp: new Date().toISOString(),
            });
        }
        res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Update Training Achievement
     * @route PATCH /api/forms/achievements/trainings/:id
     * @route PUT /api/forms/achievements/trainings/:id
     */
    update: asyncHandler(async (req, res) => {
        const result = await trainingService.updateTraining(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Training achievement updated successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Delete Training Achievement
     * @route DELETE /api/forms/achievements/trainings/:id
     */
    delete: asyncHandler(async (req, res) => {
        await trainingService.deleteTraining(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'Training achievement deleted successfully',
            timestamp: new Date().toISOString(),
        });
    }),
};

module.exports = trainingController;
