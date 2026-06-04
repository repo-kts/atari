const cfldTechnicalParameterService = require('../../services/forms/cfldTechnicalParameterService.js');
const { translatePrismaError } = require('../../utils/errorHandler.js');

const RESOURCE = 'CFLD technical parameter';

function sendError(res, error, operation) {
    const normalizedError = translatePrismaError(error, RESOURCE, operation);
    const statusCode = normalizedError.statusCode || 500;

    if (statusCode >= 500) {
        console.error(`Error ${operation} ${RESOURCE}:`, error);
    } else {
        console.warn(`Error ${operation} ${RESOURCE}:`, normalizedError.message);
    }

    return res.status(statusCode).json({
        success: false,
        error: normalizedError.message,
        code: normalizedError.code || 'INTERNAL_ERROR',
        ...(normalizedError.field ? { field: normalizedError.field } : {}),
    });
}

const cfldTechnicalParameterController = {
    create: async (req, res) => {
        try {
            const result = await cfldTechnicalParameterService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            return sendError(res, error, 'create');
        }
    },

    findAll: async (req, res) => {
        try {
            const results = await cfldTechnicalParameterService.findAll(req.query, req.user);
            res.json({ success: true, data: results });
        } catch (error) {
            return sendError(res, error, 'findAll');
        }
    },

    findById: async (req, res) => {
        try {
            const result = await cfldTechnicalParameterService.findById(req.params.id);
            if (!result) {
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            res.json({ success: true, data: result });
        } catch (error) {
            return sendError(res, error, 'findById');
        }
    },

    update: async (req, res) => {
        try {
            const result = await cfldTechnicalParameterService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            return sendError(res, error, 'update');
        }
    },

    delete: async (req, res) => {
        try {
            await cfldTechnicalParameterService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            return sendError(res, error, 'delete');
        }
    },

    transferToNextYear: async (req, res) => {
        try {
            const result = await cfldTechnicalParameterService.transferToNextYear(req.params.id, req.user);
            res.json({ success: true, data: result });
        } catch (error) {
            return sendError(res, error, 'transfer');
        }
    },
};

module.exports = cfldTechnicalParameterController;
