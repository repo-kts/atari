const technicalAchievementSummaryService = require('../services/technicalAchievementSummaryService.js');

function mapErrorToStatus(error) {
  const message = error?.message || 'Unexpected error';

  if (
    message === 'Invalid reportingYear' ||
    message === 'Invalid kvkId' ||
    message === 'Invalid kvkId for current scope'
  ) {
    return { status: 400, message };
  }

  if (
    message === 'Authentication required' ||
    message === 'User does not have permission to view technical summary' ||
    message.startsWith('User is not assigned to a valid')
  ) {
    return { status: 403, message };
  }

  return { status: 500, message: 'Internal server error' };
}

const technicalAchievementSummaryController = {
  getFilterOptions: async (req, res) => {
    try {
      const data = await technicalAchievementSummaryService.getFilterOptions(req.user);
      return res.status(200).json(data);
    } catch (error) {
      const mapped = mapErrorToStatus(error);
      if (mapped.status === 500) {
        console.error('Failed to get technical achievement summary filter options:', error);
      }
      return res.status(mapped.status).json({ error: mapped.message });
    }
  },

  getSummary: async (req, res) => {
    try {
      const data = await technicalAchievementSummaryService.getSummary(req.user, {
        reportingYear: req.query.reportingYear,
        kvkId: req.query.kvkId,
      });
      return res.status(200).json(data);
    } catch (error) {
      const mapped = mapErrorToStatus(error);
      if (mapped.status === 500) {
        console.error('Failed to get technical achievement summary:', error);
      }
      return res.status(mapped.status).json({ error: mapped.message });
    }
  },
};

module.exports = technicalAchievementSummaryController;
