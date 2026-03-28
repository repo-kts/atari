const targetRepository = require('../repositories/targetRepository.js');

const TARGET_TYPES = [
  'OFT',
  'FLD',
  'Training',
  'Extension Activities',
  'Impact of Capacity Building',
  'Impact of Extension Activities',
  'Seed Production',
  'Planting Material',
  'Livestock Strains and Fish Fingerlings Produced',
  'Soil Water Plants Manures Samples Tested',
  'CFLD Pulses',
  'CFLD Oilseed',
];

const TYPES_WITHOUT_FARMER_TARGET = new Set([
  'Seed Production',
  'Planting Material',
  'Livestock Strains and Fish Fingerlings Produced',
  'Soil Water Plants Manures Samples Tested',
  'CFLD Pulses',
  'CFLD Oilseed',
]);

const CFLD_TYPES = new Set(['CFLD Pulses', 'CFLD Oilseed']);

// Seasons are fetched from DB on the frontend; backend just validates non-empty string.

const ROLE_SCOPE_KEYS = {
  zone_admin: 'zoneId',
  state_admin: 'stateId',
  state_user: 'stateId',
  district_admin: 'districtId',
  district_user: 'districtId',
  org_admin: 'orgId',
  org_user: 'orgId',
  kvk_admin: 'kvkId',
  kvk_user: 'kvkId',
};

function normalizePage(page) {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeLimit(limit) {
  const parsed = Number(limit);
  if (!Number.isInteger(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, 100);
}

function buildScopeFilter(actor) {
  const roleName = String(actor?.roleName || actor?.role || '').trim();
  if (!roleName) {
    throw new Error('Authentication required');
  }

  if (roleName === 'super_admin') {
    return {};
  }

  const scopeKey = ROLE_SCOPE_KEYS[roleName];
  if (!scopeKey) {
    if (actor.kvkId != null) {
      return { kvkId: actor.kvkId };
    }
    throw new Error('User does not have permission to view targets');
  }

  const scopeValue = actor[scopeKey];
  if (scopeValue == null) {
    throw new Error(`User is not assigned to a valid ${scopeKey}`);
  }

  return { [scopeKey]: scopeValue };
}

function validateTypeName(typeName) {
  if (!typeName || !TARGET_TYPES.includes(typeName)) {
    throw new Error('Invalid target type');
  }
  return typeName;
}

function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  return parsed;
}

const targetService = {
  getTypeOptions: () => {
    return TARGET_TYPES.map((typeName) => ({
      typeName,
      hasFarmerTarget: !TYPES_WITHOUT_FARMER_TARGET.has(typeName),
      isCfld: CFLD_TYPES.has(typeName),
    }));
  },

  getKvkOptions: async (actor) => {
    const scopeFilter = buildScopeFilter(actor);
    const rows = await targetRepository.listScopedKvks(scopeFilter);
    return rows.map((row) => ({
      kvkId: row.kvkId,
      kvkName: row.kvkName || `KVK ${row.kvkId}`,
    }));
  },

  list: async (actor, filters) => {
    const scopeFilter = buildScopeFilter(actor);
    const page = normalizePage(filters.page);
    const limit = normalizeLimit(filters.limit);
    const skip = (page - 1) * limit;
    const where = { ...scopeFilter };

    if (filters.reportingYear !== undefined && filters.reportingYear !== null && filters.reportingYear !== '') {
      const year = Number(filters.reportingYear);
      if (!Number.isInteger(year) || year < 1900 || year > 3000) {
        throw new Error('Invalid reportingYear');
      }
      where.reportingYear = year;
    }

    if (filters.kvkId !== undefined && filters.kvkId !== null && filters.kvkId !== '') {
      const kvkId = Number(filters.kvkId);
      if (!Number.isInteger(kvkId) || kvkId <= 0) {
        throw new Error('Invalid kvkId');
      }
      where.kvkId = kvkId;
    }

    if (filters.typeName !== undefined && filters.typeName !== null && filters.typeName !== '') {
      where.typeName = filters.typeName;
    }

    if (filters.search) {
      const term = String(filters.search).trim();
      if (term) {
        where.OR = [
          { typeName: { contains: term, mode: 'insensitive' } },
          { cropName: { contains: term, mode: 'insensitive' } },
          { kvk: { kvkName: { contains: term, mode: 'insensitive' } } },
        ];
      }
    }

    const { rows, total } = await targetRepository.list({
      where,
      skip,
      take: limit,
      orderBy: [{ reportingYear: 'desc' }, { targetId: 'desc' }],
    });

    return {
      data: rows.map((row) => ({
        targetId: row.targetId,
        kvkId: row.kvkId,
        kvkName: row.kvk?.kvkName || `KVK ${row.kvkId}`,
        reportingYear: row.reportingYear,
        typeName: row.typeName,
        target: row.target,
        farmerTarget: row.farmerTarget,
        season: row.season,
        cropName: row.cropName,
        areaTarget: row.areaTarget,
        createdBy: row.createdBy
          ? { userId: row.createdBy.userId, name: row.createdBy.name, email: row.createdBy.email }
          : null,
        createdAt: row.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  create: async (actor, payload) => {
    const roleName = String(actor?.roleName || '').trim();

    let kvkId;
    if (roleName === 'super_admin') {
      kvkId = Number(payload.kvkId);
      if (!Number.isInteger(kvkId) || kvkId <= 0) {
        throw new Error('KVK is required');
      }
    } else if (actor.kvkId != null) {
      kvkId = actor.kvkId;
    } else {
      throw new Error('User is not assigned to a KVK');
    }

    const kvk = await targetRepository.findKvkById(kvkId);
    if (!kvk) {
      throw new Error('KVK not found');
    }

    const typeName = validateTypeName(payload.typeName);
    const reportingYear = parsePositiveInt(payload.reportingYear, 'Reporting Year');
    if (reportingYear < 1900 || reportingYear > 3000) {
      throw new Error('Invalid reporting year');
    }

    const target = parsePositiveInt(payload.target, 'Target');

    const data = {
      kvkId: kvk.kvkId,
      zoneId: kvk.zoneId,
      stateId: kvk.stateId,
      districtId: kvk.districtId,
      orgId: kvk.orgId,
      reportingYear,
      typeName,
      target,
      createdByUserId: actor.userId,
    };

    if (!TYPES_WITHOUT_FARMER_TARGET.has(typeName)) {
      data.farmerTarget = parsePositiveInt(payload.farmerTarget ?? 0, 'Farmer Target');
    }

    if (CFLD_TYPES.has(typeName)) {
      if (!payload.season || !String(payload.season).trim()) {
        throw new Error('Season is required for CFLD types');
      }
      if (!payload.cropName || !String(payload.cropName).trim()) {
        throw new Error('Crop is required for CFLD types');
      }
      data.season = payload.season;
      data.cropName = String(payload.cropName).trim();
      data.areaTarget = parsePositiveInt(payload.areaTarget ?? 0, 'Area Target');
    }

    const created = await targetRepository.create(data);
    return { targetId: created.targetId };
  },

  update: async (actor, targetId, payload) => {
    const existing = await targetRepository.findById(targetId);
    if (!existing) {
      throw new Error('Target not found');
    }

    const scopeFilter = buildScopeFilter(actor);
    const scopeChecks = Object.entries(scopeFilter);
    const isInScope = scopeChecks.every(([key, value]) => existing[key] === value);
    if (!isInScope) {
      throw new Error('You do not have permission to edit this target');
    }

    const typeName = validateTypeName(payload.typeName);
    const reportingYear = parsePositiveInt(payload.reportingYear, 'Reporting Year');
    if (reportingYear < 1900 || reportingYear > 3000) {
      throw new Error('Invalid reporting year');
    }

    const target = parsePositiveInt(payload.target, 'Target');

    const data = {
      reportingYear,
      typeName,
      target,
      farmerTarget: null,
      season: null,
      cropName: null,
      areaTarget: null,
    };

    if (!TYPES_WITHOUT_FARMER_TARGET.has(typeName)) {
      data.farmerTarget = parsePositiveInt(payload.farmerTarget ?? 0, 'Farmer Target');
    }

    if (CFLD_TYPES.has(typeName)) {
      if (!payload.season || !String(payload.season).trim()) {
        throw new Error('Season is required for CFLD types');
      }
      if (!payload.cropName || !String(payload.cropName).trim()) {
        throw new Error('Crop is required for CFLD types');
      }
      data.season = payload.season;
      data.cropName = String(payload.cropName).trim();
      data.areaTarget = parsePositiveInt(payload.areaTarget ?? 0, 'Area Target');
    }

    await targetRepository.update(targetId, data);
    return { targetId };
  },

  remove: async (actor, targetId) => {
    const existing = await targetRepository.findById(targetId);
    if (!existing) {
      throw new Error('Target not found');
    }

    const scopeFilter = buildScopeFilter(actor);
    const scopeChecks = Object.entries(scopeFilter);
    const isInScope = scopeChecks.every(([key, value]) => existing[key] === value);
    if (!isInScope) {
      throw new Error('You do not have permission to delete this target');
    }

    await targetRepository.remove(targetId);
    return true;
  },
};

module.exports = targetService;
