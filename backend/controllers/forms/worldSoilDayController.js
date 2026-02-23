const worldSoilDayService = require('../../services/forms/worldSoilDayService.js');

const worldSoilDayController = {
    create: async (req, res) => {
        try {
            const result = await worldSoilDayService.create(req.body, req.user);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating World Soil Day record:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    findAll: async (req, res) => {
        try {
            const result = await worldSoilDayService.findAll(req.user);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching World Soil Day records:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    findById: async (req, res) => {
        try {
            const result = await worldSoilDayService.findById(req.params.id);
            if (!result) return res.status(404).json({ error: 'Record not found' });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching World Soil Day record:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    update: async (req, res) => {
        try {
            const result = await worldSoilDayService.update(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error updating World Soil Day record:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    delete: async (req, res) => {
        try {
            const result = await worldSoilDayService.delete(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting World Soil Day record:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = worldSoilDayController;
