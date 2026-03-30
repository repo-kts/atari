const logHistoryRepository = require('../repositories/logHistoryRepository.js');

const ADMIN_ROLES = ['super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_admin'];
const ALLOWED_ACTIVITIES = ['LOGIN', 'LOGOUT'];
const ALLOWED_SORT_FIELDS = new Set(['eventAt', 'kvkName', 'userName', 'activity', 'ipAddress']);

function normalizeActivity(activity) {
  const normalized = String(activity || '').trim().toUpperCase();
  if (!ALLOWED_ACTIVITIES.includes(normalized)) {
    throw new Error(`Invalid activity "${activity}". Allowed values: ${ALLOWED_ACTIVITIES.join(', ')}`);
  }
  return normalized;
}

function normalizeOrder(sortOrder) {
  return String(sortOrder || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
}

function normalizeSortBy(sortBy) {
  if (!sortBy || !ALLOWED_SORT_FIELDS.has(sortBy)) return 'eventAt';
  return sortBy;
}

function normalizePage(page) {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeLimit(limit) {
  const parsed = Number(limit);
  if (!Number.isInteger(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, 100);
}

function parseDate(value, fieldName) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName} date`);
  }
  return date;
}

function normalizeRole(roleName) {
  if (!roleName) return null;
  const normalized = String(roleName).trim();
  if (!normalized) return null;
  if (normalized.length > 100) throw new Error('Invalid roleName');
  return normalized;
}

function buildScopeFilter(actor) {
  const role = actor?.roleName;
  if (!ADMIN_ROLES.includes(role)) {
    throw new Error('User does not have permission to view log history');
  }

  if (role === 'super_admin') return {};
  if (role === 'zone_admin') {
    if (actor.zoneId == null) throw new Error('Admin user is not assigned to a zone');
    return { zoneId: actor.zoneId };
  }
  if (role === 'state_admin') {
    if (actor.stateId == null) throw new Error('Admin user is not assigned to a state');
    return { stateId: actor.stateId };
  }
  if (role === 'district_admin') {
    if (actor.districtId == null) throw new Error('Admin user is not assigned to a district');
    return { districtId: actor.districtId };
  }
  if (role === 'org_admin') {
    if (actor.orgId == null) throw new Error('Admin user is not assigned to an organization');
    return { orgId: actor.orgId };
  }
  if (role === 'kvk_admin') {
    if (actor.kvkId == null) throw new Error('Admin user is not assigned to a KVK');
    return { kvkId: actor.kvkId };
  }

  return {};
}

const logHistoryService = {
  /**
   * Record an auth activity.
   * @param {object} payload
   */
  recordAuthActivity: async (payload) => {
    const activity = normalizeActivity(payload.activity);

    return logHistoryRepository.createActivityLog({
      userId: payload.userId ?? null,
      kvkId: payload.kvkId ?? null,
      userName: payload.userName ?? null,
      userEmail: payload.userEmail ?? null,
      roleName: payload.roleName ?? null,
      zoneId: payload.zoneId ?? null,
      stateId: payload.stateId ?? null,
      districtId: payload.districtId ?? null,
      orgId: payload.orgId ?? null,
      kvkName: payload.kvkName ?? null,
      activity,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
      eventAt: payload.eventAt || new Date(),
    });
  },

  /**
   * Get paginated log history for an actor.
   * @param {object} actor
   * @param {object} filters
   */
  getLogHistory: async (actor, filters = {}) => {
    const scopeFilter = buildScopeFilter(actor);

    const page = normalizePage(filters.page);
    const limit = normalizeLimit(filters.limit);
    const skip = (page - 1) * limit;
    const sortBy = normalizeSortBy(filters.sortBy);
    const sortOrder = normalizeOrder(filters.sortOrder);
    const fromDate = parseDate(filters.from, 'from');
    const toDate = parseDate(filters.to, 'to');

    if (fromDate && toDate && fromDate > toDate) {
      throw new Error('from date must be less than or equal to to date');
    }

    const where = {
      ...scopeFilter,
    };

    if (filters.kvkId !== undefined && filters.kvkId !== null) {
      where.kvkId = Number(filters.kvkId);
    }
    if (filters.userId !== undefined && filters.userId !== null) {
      where.userId = Number(filters.userId);
    }

    if (filters.activity) {
      where.activity = normalizeActivity(filters.activity);
    }
    if (filters.roleName) {
      where.roleName = normalizeRole(filters.roleName);
    }

    if (fromDate || toDate) {
      where.eventAt = {};
      if (fromDate) where.eventAt.gte = fromDate;
      if (toDate) where.eventAt.lte = toDate;
    }

    const search = String(filters.search || '').trim();
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { roleName: { contains: search, mode: 'insensitive' } },
        { kvkName: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const { logs, total } = await logHistoryRepository.listActivityLogs({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortBy]: sortOrder }, { logId: 'desc' }],
    });

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  /**
   * Get distinct KVK options for the filter dropdown.
   * @param {object} actor
   */
  getKvkFilterOptions: async (actor) => {
    const scopeFilter = buildScopeFilter(actor);
    const rows = await logHistoryRepository.listDistinctKvks({
      ...scopeFilter,
      kvkId: { not: null },
    });

    return rows.map((row) => ({
      kvkId: row.kvkId,
      kvkName: row.kvkName || `KVK ${row.kvkId}`,
    }));
  },

  /**
   * Get distinct user options for the filter dropdown.
   * @param {object} actor
   */
  getUserFilterOptions: async (actor) => {
    // Authorize caller, but return all active users in DB as requested.
    buildScopeFilter(actor);
    const rows = await logHistoryRepository.listScopedUsers({});

    return rows.map((row) => ({
      userId: row.userId,
      userName: row.name || null,
      userEmail: row.email || null,
      roleName: row.role?.roleName || null,
    }));
  },
};

module.exports = logHistoryService;
