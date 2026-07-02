const poshanMaahService = require('../../services/forms/poshanMaahService.js');
const { translatePrismaError, sendFormRouteError } = require('../../utils/errorHandler.js');

const poshanMaahController = {
    findAll: async (req, res) => {
        try {
            const data = await poshanMaahService.findAll(req.query, req.user);
            res.json({ success: true, data });
        } catch (error) {
            sendFormRouteError(res, translatePrismaError(error, 'Poshan Maah', 'list'));
        }
    },

    findById: async (req, res) => {
        try {
            const data = await poshanMaahService.findById(req.params.id, req.user);
            res.json({ success: true, data });
        } catch (error) {
            sendFormRouteError(res, translatePrismaError(error, 'Poshan Maah', 'get'));
        }
    },

    create: async (req, res) => {
        try {
            const data = await poshanMaahService.create(req.body, req.user);
            res.status(201).json({ success: true, data });
        } catch (error) {
            sendFormRouteError(res, translatePrismaError(error, 'Poshan Maah', 'create'));
        }
    },

    update: async (req, res) => {
        try {
            const data = await poshanMaahService.update(req.params.id, req.body, req.user);
            res.json({ success: true, data });
        } catch (error) {
            sendFormRouteError(res, translatePrismaError(error, 'Poshan Maah', 'update'));
        }
    },

    delete: async (req, res) => {
        try {
            await poshanMaahService.delete(req.params.id, req.user);
            res.json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            sendFormRouteError(res, translatePrismaError(error, 'Poshan Maah', 'delete'));
        }
    },
};

module.exports = poshanMaahController;
