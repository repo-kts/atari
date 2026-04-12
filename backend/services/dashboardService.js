const prisma = require('../config/prisma.js');
const {
  getActorRole,
  getScopeWhere,
  buildAchievementWhere,
  buildKvkListingWhere,
  buildFiscalYearRange,
  parseYearParam,
  buildLoginLogWhere,
} = require('../utils/dashboardScope.js');

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

async function resolveKvkFilter(actor, requestedKvkId) {
  if (requestedKvkId === undefined || requestedKvkId === null || requestedKvkId === '') {
    return null;
  }

  const kvkId = Number(requestedKvkId);
  if (!Number.isInteger(kvkId) || kvkId <= 0) {
    throw new Error('Invalid kvkId');
  }

  const scopeWhere = getScopeWhere(actor);
  const scoped = await prisma.kvk.findFirst({
    where: { kvkId, ...scopeWhere },
    select: { kvkId: true },
  });

  if (!scoped) {
    throw new Error('Invalid kvkId for current scope');
  }

  return kvkId;
}

function oftDateClause(yearMode) {
  if (yearMode === 'all') {
    return {};
  }
  const { start, endExclusive } = buildFiscalYearRange(yearMode);
  return {
    OR: [
      { reportingYear: { gte: start, lt: endExclusive } },
      { reportingYear: null, oftStartDate: { gte: start, lt: endExclusive } },
    ],
  };
}

function fldDateClause(yearMode) {
  if (yearMode === 'all') {
    return {};
  }
  const { start, endExclusive } = buildFiscalYearRange(yearMode);
  return {
    OR: [
      { reportingYear: { gte: start, lt: endExclusive } },
      { reportingYear: null, startDate: { gte: start, lt: endExclusive } },
    ],
  };
}

function trainingDateClause(yearMode) {
  if (yearMode === 'all') {
    return {};
  }
  const { start, endExclusive } = buildFiscalYearRange(yearMode);
  return {
    startDate: { gte: start, lt: endExclusive },
  };
}

function extensionDateClause(yearMode) {
  if (yearMode === 'all') {
    return {};
  }
  const { start, endExclusive } = buildFiscalYearRange(yearMode);
  return {
    startDate: { gte: start, lt: endExclusive },
  };
}

function computeOftFldStatus(completed, created) {
  const c = toNumber(completed);
  const n = toNumber(created);
  if (n <= 0) {
    return c > 0 ? 'active' : 'pending';
  }
  if (c >= n) return 'complete';
  if (c === 0) return 'pending';
  return 'in-progress';
}

function countMapFromGroup(rows) {
  const m = new Map();
  for (const r of rows) {
    m.set(r.kvkId, r._count._all);
  }
  return m;
}

/** KvkStaff rows scoped the same way as Kvk listing (avoid `kvk: { is: {} }`). */
function buildStaffWhere(listWhere) {
  const base = { transferStatus: 'ACTIVE' };
  if (!listWhere || Object.keys(listWhere).length === 0) {
    return base;
  }
  if (Object.keys(listWhere).length === 1 && listWhere.kvkId != null) {
    return { ...base, kvkId: listWhere.kvkId };
  }
  return { ...base, kvk: { is: listWhere } };
}

const dashboardService = {
  getDashboard: async (actor, { reportingYear: rawYear, kvkId: rawKvkId }) => {
    const yearMode = parseYearParam(rawYear);
    const roleName = getActorRole(actor);
    const canFilterByKvk = roleName === 'super_admin';
    const requestedKvk = canFilterByKvk ? rawKvkId : undefined;
    const resolvedKvkId = await resolveKvkFilter(actor, requestedKvk);

    const achKvk = buildAchievementWhere(actor, resolvedKvkId);
    const listWhere = buildKvkListingWhere(actor, resolvedKvkId);

    const oftWhere = { ...achKvk, ...oftDateClause(yearMode) };
    const fldWhere = { ...achKvk, ...fldDateClause(yearMode) };
    const oftCompletedWhere = { ...oftWhere, status: 'COMPLETED' };
    const fldCompletedWhere = { ...fldWhere, ongoingCompleted: 'COMPLETED' };
    const trainingWhere = { ...achKvk, ...trainingDateClause(yearMode) };
    const extensionWhere = { ...achKvk, ...extensionDateClause(yearMode) };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);

    const kvkOptions = await prisma.kvk.findMany({
      where: getScopeWhere(actor),
      select: { kvkId: true, kvkName: true },
      orderBy: [{ kvkName: 'asc' }, { kvkId: 'asc' }],
    });

    const [
      orgDistinct,
      kvkCount,
      oftTotal,
      fldRecordCount,
      trainingTotal,
      extensionSum,
      staffTotal,
      oftGroup,
      oftCompletedGroup,
      fldGroup,
      fldCompletedGroup,
      trainingGroup,
      extensionGroup,
      staffPostGroups,
      recentLogs,
    ] = await Promise.all([
      prisma.kvk.findMany({
        where: listWhere,
        select: { orgId: true },
        distinct: ['orgId'],
      }),
      prisma.kvk.count({ where: listWhere }),
      prisma.kvkoft.count({ where: oftWhere }),
      prisma.kvkFldIntroduction.count({ where: fldWhere }),
      prisma.trainingAchievement.count({ where: trainingWhere }),
      prisma.kvkExtensionActivity.aggregate({
        where: extensionWhere,
        _sum: { numberOfActivities: true },
      }),
      prisma.kvkStaff.count({
        where: buildStaffWhere(listWhere),
      }),
      prisma.kvkoft.groupBy({
        by: ['kvkId'],
        where: oftWhere,
        _count: { _all: true },
      }),
      prisma.kvkoft.groupBy({
        by: ['kvkId'],
        where: oftCompletedWhere,
        _count: { _all: true },
      }),
      prisma.kvkFldIntroduction.groupBy({
        by: ['kvkId'],
        where: fldWhere,
        _count: { _all: true },
      }),
      prisma.kvkFldIntroduction.groupBy({
        by: ['kvkId'],
        where: fldCompletedWhere,
        _count: { _all: true },
      }),
      prisma.trainingAchievement.groupBy({
        by: ['kvkId'],
        where: trainingWhere,
        _count: { _all: true },
      }),
      prisma.kvkExtensionActivity.groupBy({
        by: ['kvkId'],
        where: extensionWhere,
        _sum: { numberOfActivities: true },
      }),
      prisma.kvkStaff.groupBy({
        by: ['sanctionedPostId'],
        where: buildStaffWhere(listWhere),
        _count: { _all: true },
      }),
      prisma.userLoginActivity.findMany({
        where: buildLoginLogWhere(actor),
        orderBy: [{ eventAt: 'desc' }, { logId: 'desc' }],
        take: 12,
        select: {
          kvkName: true,
          userName: true,
          activity: true,
          ipAddress: true,
          eventAt: true,
        },
      }),
    ]);

    const kvkRows = await prisma.kvk.findMany({
      where: listWhere,
      select: { kvkId: true, kvkName: true },
      orderBy: [{ kvkName: 'asc' }, { kvkId: 'asc' }],
    });

    const oftCreatedByKvk = countMapFromGroup(oftGroup);
    const oftCompletedByKvk = countMapFromGroup(oftCompletedGroup);
    const fldCreatedByKvk = countMapFromGroup(fldGroup);
    const fldCompletedByKvk = countMapFromGroup(fldCompletedGroup);
    const trainAch = new Map(trainingGroup.map((g) => [g.kvkId, g._count._all]));
    const extAch = new Map(extensionGroup.map((g) => [g.kvkId, toNumber(g._sum?.numberOfActivities)]));

    const perKvk = kvkRows.map((k) => {
      const oid = k.kvkId;
      const oftCreated = toNumber(oftCreatedByKvk.get(oid));
      const oftCompleted = toNumber(oftCompletedByKvk.get(oid));
      const fldCreated = toNumber(fldCreatedByKvk.get(oid));
      const fldCompleted = toNumber(fldCompletedByKvk.get(oid));
      const trainC = toNumber(trainAch.get(oid));
      const extC = toNumber(extAch.get(oid));

      return {
        kvkId: oid,
        kvkName: k.kvkName,
        oft: {
          completed: oftCompleted,
          created: oftCreated,
          status: computeOftFldStatus(oftCompleted, oftCreated),
        },
        fld: {
          completed: fldCompleted,
          created: fldCreated,
          status: computeOftFldStatus(fldCompleted, fldCreated),
        },
        training: {
          count: trainC,
          status: trainC > 0 ? 'active' : 'pending',
        },
        extension: {
          count: extC,
          status: extC > 0 ? 'active' : 'pending',
        },
      };
    });

    const postIds = staffPostGroups.map((g) => g.sanctionedPostId).filter((id) => id != null);
    const posts =
      postIds.length > 0
        ? await prisma.sanctionedPost.findMany({
            where: { sanctionedPostId: { in: postIds } },
            select: { sanctionedPostId: true, postName: true },
          })
        : [];
    const postNameById = new Map(posts.map((p) => [p.sanctionedPostId, p.postName]));

    const staffByPost = staffPostGroups
      .map((g) => ({
        postId: g.sanctionedPostId,
        postName: g.sanctionedPostId == null ? 'No post assigned' : postNameById.get(g.sanctionedPostId) || 'Unknown',
        count: g._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    const primaryKvk =
      resolvedKvkId != null
        ? kvkRows.find((r) => r.kvkId === resolvedKvkId) || (await prisma.kvk.findUnique({
              where: { kvkId: resolvedKvkId },
              select: { kvkId: true, kvkName: true },
            }))
        : kvkRows.length === 1
          ? kvkRows[0]
          : null;

    return {
      reportingYear: yearMode,
      filterKvkId: resolvedKvkId,
      canFilterByKvk,
      yearOptions,
      kvkOptions,
      primaryKvkName: primaryKvk?.kvkName ?? null,
      kpis: {
        organizationCount: orgDistinct.length,
        kvkCount,
        totalOft: oftTotal,
        totalFld: fldRecordCount,
        training: trainingTotal,
        extension: toNumber(extensionSum?._sum?.numberOfActivities),
        totalStaff: staffTotal,
      },
      perKvk,
      staffByPost,
      recentLogs: recentLogs.map((log) => ({
        kvkName: log.kvkName,
        userName: log.userName,
        activity: log.activity,
        ipAddress: log.ipAddress,
        eventAt: log.eventAt.toISOString(),
      })),
    };
  },
};

module.exports = dashboardService;
