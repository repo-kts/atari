const oftService = require('../../services/forms/oftService.js');
const { asyncHandler } = require('../../utils/errorHandler.js'); 

const oftController = {
    create: asyncHandler(async (req, res) => {
        // Ensure body exists (should be handled by middleware, but double-check)
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

        const result = await oftService.createOft(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'OFT record created successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    getAll: asyncHandler(async (req, res) => {
        const result = await oftService.getAllOft(req.query || {}, req.user);
        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const result = await oftService.getOftById(req.params.id, req.user);
        if (!result) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'OFT record not found',
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

        const result = await oftService.updateOft(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'OFT record updated successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    transferToNextYear: asyncHandler(async (req, res) => {
        const result = await oftService.transferToNextYear(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'OFT transferred to next year successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    addResult: asyncHandler(async (req, res) => {
        const result = await oftService.addResult(req.params.id, req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'OFT result created successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    editResult: asyncHandler(async (req, res) => {
        const result = await oftService.editResult(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'OFT result updated successfully',
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    getResult: asyncHandler(async (req, res) => {
        const result = await oftService.getResult(req.params.id, req.user);
        res.status(200).json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    }),

    delete: asyncHandler(async (req, res) => {
        await oftService.deleteOft(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'OFT record deleted successfully',
            timestamp: new Date().toISOString(),
        });
    }),
};

module.exports = oftController;
