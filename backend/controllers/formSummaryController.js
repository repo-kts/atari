const formSummaryService = require('../services/formSummaryService.js');
const { getActorRole } = require('../utils/dashboardScope.js');

function mapErrorToStatus(error) {
  const message = error?.message || 'Unexpected error';
  if (
    message === 'Authentication required' ||
    message === 'User does not have permission to view dashboard' ||
    message.startsWith('User is not assigned to a valid')
  ) {
    return { status: 403, message };
  }
  if (message === 'Invalid kvkId' || message === 'Invalid kvkId for current scope') {
    return { status: 400, message };
  }
  return { status: 500, message: 'Internal server error' };
}

const formSummaryController = {
  /**
   * GET /api/forms/summary
   *
   * Response shape:
   *   - super_admin (and no ?kvkId): { modules[], kvks[], categoryOrder[] }
   *   - super_admin with ?kvkId=N:   { kvkId, kvkName, modules[], completed, total, progress }
   *   - kvk_admin / scoped user:     { kvkId, kvkName, modules[], completed, total, progress }
   */
  getSummary: async (req, res) => {
    try {
      const role = getActorRole(req.user);
      const requestedKvkId = req.query.kvkId ? Number(req.query.kvkId) : null;

      if (role === 'super_admin' && requestedKvkId == null) {
        const data = await formSummaryService.getAllKvkSummary(req.user);
        return res.status(200).json(data);
      }

      // Scoped users see only their own KVK. super_admin with ?kvkId sees that one.
      const kvkId = requestedKvkId != null ? requestedKvkId : req.user.kvkId;
      const data = await formSummaryService.getKvkSummary(req.user, kvkId);
      return res.status(200).json(data);
    } catch (error) {
      const mapped = mapErrorToStatus(error);
      if (mapped.status === 500) {
        console.error('Failed to load form summary:', error);
      }
      return res.status(mapped.status).json({ error: mapped.message });
    }
  },
};

module.exports = formSummaryController;
