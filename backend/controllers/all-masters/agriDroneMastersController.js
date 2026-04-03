const repo = require('../../repositories/all-masters/agriDroneDemonstrationsOnRepository.js');

const agriDroneMastersController = {
    // GET /admin/masters/agri-drone-demonstrations-on
    getAllDemonstrationsOn: async (req, res) => {
        try {
            const search = req.query.search || '';
            const page = parseInt(req.query.page || '1', 10);
            const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
            const offset = (Math.max(page, 1) - 1) * limit;

            const data = await repo.findAll({ search, limit, offset });

            res.json({
                success: true,
                data,
                pagination: {
                    total: data.length, // lightweight pagination (table is small)
                    page,
                    limit,
                    totalPages: 1,
                },
            });
        } catch (error) {
            console.error('Error fetching agri-drone-demonstrations-on:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /admin/masters/agri-drone-demonstrations-on/:id
    getDemonstrationsOnById: async (req, res) => {
        try {
            const item = await repo.findById(req.params.id);
            if (!item) return res.status(404).json({ success: false, error: 'Not found' });
            res.json({ success: true, data: item });
        } catch (error) {
            console.error('Error fetching agri-drone-demonstrations-on by id:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // POST /admin/masters/agri-drone-demonstrations-on
    createDemonstrationsOn: async (req, res) => {
        try {
            const created = await repo.create(req.body);
            res.status(201).json({ success: true, data: created, message: 'Created successfully' });
        } catch (error) {
            console.error('Error creating agri-drone-demonstrations-on:', error);
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PUT /admin/masters/agri-drone-demonstrations-on/:id
    updateDemonstrationsOn: async (req, res) => {
        try {
            const updated = await repo.update(req.params.id, req.body);
            res.json({ success: true, data: updated, message: 'Updated successfully' });
        } catch (error) {
            console.error('Error updating agri-drone-demonstrations-on:', error);
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // DELETE /admin/masters/agri-drone-demonstrations-on/:id
    deleteDemonstrationsOn: async (req, res) => {
        try {
            await repo.delete(req.params.id);
            res.json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            console.error('Error deleting agri-drone-demonstrations-on:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
};

module.exports = agriDroneMastersController;

