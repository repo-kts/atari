const fldService = require('../../services/forms/fldService.js');
const { asyncHandler } = require('../../utils/errorHandler.js');

/**
 * FLD Controller
 * HTTP request handlers for Front Line Demonstrations (FLD)
 * Handles request/response formatting and error handling
 */
const fldController = {
    /**
     * Create a new FLD record
     * @route POST /api/forms/achievements/fld
     */
    create: asyncHandler(async (req, res) => {
        // Ensure body exists
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

        const result = await fldService.createFld(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'FLD record created successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Get all FLD records
     * @route GET /api/forms/achievements/fld
     */
    getAll: asyncHandler(async (req, res) => {
        const result = await fldService.getAllFld(req.query || {}, req.user);
        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Get a single FLD record by ID
     * @route GET /api/forms/achievements/fld/:id
     */
    getById: asyncHandler(async (req, res) => {
        const result = await fldService.getFldById(req.params.id, req.user);
        if (!result) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'FLD record not found',
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
     * Update an existing FLD record
     * @route PATCH /api/forms/achievements/fld/:id
     * @route PUT /api/forms/achievements/fld/:id
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

        const result = await fldService.updateFld(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD record updated successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    transferToNextYear: asyncHandler(async (req, res) => {
        const result = await fldService.transferToNextYear(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD transferred to next year successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    addResult: asyncHandler(async (req, res) => {
        const result = await fldService.addResult(req.params.id, req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'FLD result created successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    editResult: asyncHandler(async (req, res) => {
        const result = await fldService.editResult(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD result updated successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    getResult: asyncHandler(async (req, res) => {
        const result = await fldService.getResult(req.params.id, req.user);
        res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    /**
     * Delete an FLD record
     * @route DELETE /api/forms/achievements/fld/:id
     */
    delete: asyncHandler(async (req, res) => {
        await fldService.deleteFld(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'FLD record deleted successfully',
            timestamp: new Date().toISOString(),
        });
    }),
};

module.exports = fldController;
