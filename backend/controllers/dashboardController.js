const dashboardService = require('../services/dashboardService.js');

function mapErrorToStatus(error) {
  const message = error?.message || 'Unexpected error';

  if (message === 'Invalid reportingYear' || message === 'Invalid kvkId' || message === 'Invalid kvkId for current scope') {
    return { status: 400, message };
  }

  if (
    message === 'Authentication required' ||
    message === 'User does not have permission to view dashboard' ||
    message.startsWith('User is not assigned to a valid')
  ) {
    return { status: 403, message };
  }

  return { status: 500, message: 'Internal server error' };
}

const dashboardController = {
  getDashboard: async (req, res) => {
    try {
      const data = await dashboardService.getDashboard(req.user, {
        reportingYear: req.query.reportingYear,
        kvkId: req.query.kvkId,
      });
      return res.status(200).json(data);
    } catch (error) {
      const mapped = mapErrorToStatus(error);
      if (mapped.status === 500) {
        console.error('Failed to load dashboard:', error);
      }
      return res.status(mapped.status).json({ error: mapped.message });
    }
  },
};

module.exports = dashboardController;
