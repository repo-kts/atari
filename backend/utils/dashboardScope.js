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

function getActorRole(actor) {
  return String(actor?.roleName || actor?.role || '').trim();
}

function getScopeWhere(actor) {
  const roleName = getActorRole(actor);

  if (!roleName) {
    throw new Error('Authentication required');
  }

  if (roleName === 'super_admin') {
    return {};
  }

  const scopeKey = ROLE_SCOPE_KEYS[roleName];
  if (!scopeKey) {
    if (actor?.kvkId != null) {
      return { kvkId: Number(actor.kvkId) };
    }
    throw new Error('User does not have permission to view dashboard');
  }

  const scopeValue = actor?.[scopeKey];
  if (scopeValue == null) {
    throw new Error(`User is not assigned to a valid ${scopeKey}`);
  }

  return { [scopeKey]: scopeValue };
}

/**
 * Prisma where fragment for achievement tables (Kvkoft, KvkFldIntroduction, etc.)
 */
function buildAchievementWhere(actor, resolvedKvkId) {
  if (resolvedKvkId) {
    return { kvkId: resolvedKvkId };
  }
  const scopeWhere = getScopeWhere(actor);
  if (Object.keys(scopeWhere).length === 0) {
    return {};
  }
  return { kvk: { is: scopeWhere } };
}

/** Where clause for top-level Kvk model (counts, listing). */
function buildKvkListingWhere(actor, resolvedKvkId) {
  if (resolvedKvkId) {
    return { kvkId: resolvedKvkId };
  }
  return getScopeWhere(actor);
}

function buildFiscalYearRange(reportingYear) {
  const start = new Date(Date.UTC(reportingYear, 3, 1, 0, 0, 0, 0));
  const endExclusive = new Date(Date.UTC(reportingYear + 1, 3, 1, 0, 0, 0, 0));
  return { start, endExclusive };
}

function parseYearParam(raw) {
  if (raw === undefined || raw === null || raw === '') {
    return 'all';
  }
  const s = String(raw).trim().toLowerCase();
  if (s === 'all') {
    return 'all';
  }
  const y = Number(raw);
  if (!Number.isInteger(y) || y < 1900 || y > 3000) {
    throw new Error('Invalid reportingYear');
  }
  return y;
}

function buildLoginLogWhere(actor) {
  const role = getActorRole(actor);
  if (role === 'super_admin') {
    return {};
  }
  if (role === 'zone_admin') {
    if (actor.zoneId == null) return { userId: actor.userId };
    return { zoneId: actor.zoneId };
  }
  if (role === 'state_admin' || role === 'state_user') {
    if (actor.stateId == null) return { userId: actor.userId };
    return { stateId: actor.stateId };
  }
  if (role === 'district_admin' || role === 'district_user') {
    if (actor.districtId == null) return { userId: actor.userId };
    return { districtId: actor.districtId };
  }
  if (role === 'org_admin' || role === 'org_user') {
    if (actor.orgId == null) return { userId: actor.userId };
    return { orgId: actor.orgId };
  }
  if (role === 'kvk_admin' || role === 'kvk_user') {
    if (actor.kvkId == null) return { userId: actor.userId };
    return { kvkId: actor.kvkId };
  }
  if (actor.kvkId != null) {
    return { kvkId: actor.kvkId };
  }
  return { userId: actor.userId };
}

module.exports = {
  getActorRole,
  getScopeWhere,
  buildAchievementWhere,
  buildKvkListingWhere,
  buildFiscalYearRange,
  parseYearParam,
  buildLoginLogWhere,
};
