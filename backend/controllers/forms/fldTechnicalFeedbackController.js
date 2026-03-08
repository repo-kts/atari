const fldTechnicalFeedbackService = require('../../services/forms/fldTechnicalFeedbackService.js');
const { asyncHandler } = require('../../utils/errorHandler.js');

/**
 * FLD Technical Feedback Controller
 * HTTP request handlers for FLD Technical Feedback
 */
const fldTechnicalFeedbackController = {
    /**
     * Create a new FLD Technical Feedback record
     * @route POST /api/forms/achievements/fld/technical-feedback
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

        const result = await fldTechnicalFeedbackService.createFldTechnicalFeedback(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'FLD Technical Feedback record created successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Get all FLD Technical Feedback records
     * @route GET /api/forms/achievements/fld/technical-feedback
     */
    getAll: asyncHandler(async (req, res) => {
        const result = await fldTechnicalFeedbackService.getAllFldTechnicalFeedback(req.query || {}, req.user);
        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Get a single FLD Technical Feedback record by ID
     * @route GET /api/forms/achievements/fld/technical-feedback/:id
     */
    getById: asyncHandler(async (req, res) => {
        const result = await fldTechnicalFeedbackService.getFldTechnicalFeedbackById(req.params.id, req.user);
        if (!result) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'FLD Technical Feedback record not found',
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
     * Update an existing FLD Technical Feedback record
     * @route PATCH /api/forms/achievements/fld/technical-feedback/:id
     * @route PUT /api/forms/achievements/fld/technical-feedback/:id
     */
    update: asyncHandler(async (req, res) => {
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

        const result = await fldTechnicalFeedbackService.updateFldTechnicalFeedback(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD Technical Feedback record updated successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Delete an FLD Technical Feedback record
     * @route DELETE /api/forms/achievements/fld/technical-feedback/:id
     */
    delete: asyncHandler(async (req, res) => {
        await fldTechnicalFeedbackService.deleteFldTechnicalFeedback(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD Technical Feedback record deleted successfully',
            timestamp: new Date().toISOString(),
        });
    }),
};

module.exports = fldTechnicalFeedbackController;
