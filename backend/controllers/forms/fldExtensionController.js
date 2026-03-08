const fldExtensionService = require('../../services/forms/fldExtensionService.js');
const { asyncHandler } = require('../../utils/errorHandler.js');

/**
 * FLD Extension Controller
 * HTTP request handlers for FLD Extension & Training Activities
 */
const fldExtensionController = {
    /**
     * Create a new FLD Extension record
     * @route POST /api/forms/achievements/fld/extension-training
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

        const result = await fldExtensionService.createFldExtension(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'FLD Extension record created successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Get all FLD Extension records
     * @route GET /api/forms/achievements/fld/extension-training
     */
    getAll: asyncHandler(async (req, res) => {
        const result = await fldExtensionService.getAllFldExtension(req.query || {}, req.user);
        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Get a single FLD Extension record by ID
     * @route GET /api/forms/achievements/fld/extension-training/:id
     */
    getById: asyncHandler(async (req, res) => {
        const result = await fldExtensionService.getFldExtensionById(req.params.id, req.user);
        if (!result) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'FLD Extension record not found',
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
     * Update an existing FLD Extension record
     * @route PATCH /api/forms/achievements/fld/extension-training/:id
     * @route PUT /api/forms/achievements/fld/extension-training/:id
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

        const result = await fldExtensionService.updateFldExtension(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD Extension record updated successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Delete an FLD Extension record
     * @route DELETE /api/forms/achievements/fld/extension-training/:id
     */
    delete: asyncHandler(async (req, res) => {
        await fldExtensionService.deleteFldExtension(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD Extension record deleted successfully',
            timestamp: new Date().toISOString(),
        });
    }),
};

module.exports = fldExtensionController;
