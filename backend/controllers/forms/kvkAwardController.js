const kvkAwardService = require('../../services/forms/kvkAwardService.js');

const kvkAwardController = {
    /**
     * Create a new KVK Award
     */
    createKvkAward: async (req, res) => {
        try {
            console.log('--- Create KVK Award ---');
            console.log('User:', JSON.stringify(req.user));
            console.log('Body:', JSON.stringify(req.body));
            const data = await kvkAwardService.createKvkAward(req.body, req.user);
            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('Error creating KVK Award:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Get all KVK Awards
     */
    getAllKvkAwards: async (req, res) => {
        try {
            const awards = await kvkAwardService.getAllKvkAwards(req.user);
            res.json({ success: true, data: awards });
        } catch (error) {
            console.error('Error fetching KVK Awards:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Get KVK Award by ID
     */
    getKvkAwardById: async (req, res) => {
        try {
            const award = await kvkAwardService.getKvkAwardById(req.params.id, req.user);
            res.json({ success: true, data: award });
        } catch (error) {
            console.error('Error fetching KVK Award by ID:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({ success: false, error: error.message });
        }
    },

    /**
     * Update KVK Award
     */
    updateKvkAward: async (req, res) => {
        try {
            const award = await kvkAwardService.updateKvkAward(req.params.id, req.body, req.user);
            res.json({ success: true, data: award });
        } catch (error) {
            console.error('Error updating KVK Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Delete KVK Award
     */
    deleteKvkAward: async (req, res) => {
        try {
            await kvkAwardService.deleteKvkAward(req.params.id, req.user);
            res.json({ success: true, message: 'KVK Award deleted successfully' });
        } catch (error) {
            console.error('Error deleting KVK Award:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
};

module.exports = kvkAwardController;
