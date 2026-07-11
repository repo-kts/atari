const analyticsService = require('../services/analyticsService.js');

/**
 * Detailed dashboard analytics. Super admin only — every other role sees a
 * single fixed scope, so a cross-scope filter UI has nothing to offer them.
 */
function requireSuperAdmin(req) {
    const role = String(req.user?.roleName || req.user?.role || '').trim();
    if (role !== 'super_admin') {
        const error = new Error('Detailed analytics is restricted to super admins');
        error.status = 403;
        throw error;
    }
}

function handleError(res, error, context) {
    const status = error?.status || 500;
    if (status === 500) {
        console.error(`Failed to load ${context}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(status).json({ error: error.message });
}

const analyticsController = {
    getFilterOptions: async (req, res) => {
        try {
            requireSuperAdmin(req);
            return res.status(200).json(await analyticsService.getFilterOptions());
        } catch (error) {
            return handleError(res, error, 'analytics filters');
        }
    },

    getMetricAnalytics: async (req, res) => {
        try {
            requireSuperAdmin(req);
            const data = await analyticsService.getMetricAnalytics(req.params.metric, req.query);
            return res.status(200).json(data);
        } catch (error) {
            return handleError(res, error, 'analytics metric');
        }
    },

    getMetricMatrix: async (req, res) => {
        try {
            requireSuperAdmin(req);
            const data = await analyticsService.getMetricMatrix(req.params.metric, req.query);
            return res.status(200).json(data);
        } catch (error) {
            return handleError(res, error, 'analytics matrix');
        }
    },
};

module.exports = analyticsController;
