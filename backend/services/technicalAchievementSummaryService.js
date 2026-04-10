const prisma = require('../config/prisma.js');

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

const TARGET_TYPE = {
  OFT: 'OFT',
  FLD: 'FLD',
  TRAINING: 'Training',
  EXTENSION: 'Extension Activities',
  SEED_PRODUCTION: 'Seed Production',
  PLANTING_MATERIAL: 'Planting Material',
  LIVESTOCK: 'Livestock Strains and Fish Fingerlings Produced',
  SOIL_WATER: 'Soil Water Plants Manures Samples Tested',
};

const PRODUCTION_CATEGORY_ALIASES = {
  [TARGET_TYPE.SEED_PRODUCTION]: ['Seed Production', 'Seeds'],
  [TARGET_TYPE.PLANTING_MATERIAL]: ['Planting Material'],
  [TARGET_TYPE.LIVESTOCK]: [
    'Livestock Strains and Fish Fingerlings Produced',
    'Livestock Products',
    'Fish Fingerlings',
  ],
};

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function parseReportingYear(inputYear) {
  const fallbackYear = new Date().getFullYear();
  if (inputYear === undefined || inputYear === null || inputYear === '') {
    return fallbackYear;
  }

  const parsed = Number(inputYear);
  if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 3000) {
    throw new Error('Invalid reportingYear');
  }
  return parsed;
}

function buildFiscalYearRange(reportingYear) {
  const start = new Date(Date.UTC(reportingYear, 3, 1, 0, 0, 0, 0));
  const endExclusive = new Date(Date.UTC(reportingYear + 1, 3, 1, 0, 0, 0, 0));
  return { start, endExclusive };
}

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
    throw new Error('User does not have permission to view technical summary');
  }

  const scopeValue = actor?.[scopeKey];
  if (scopeValue == null) {
    throw new Error(`User is not assigned to a valid ${scopeKey}`);
  }

  return { [scopeKey]: scopeValue };
}

function buildKvkScopedWhere(actor, kvkId) {
  if (kvkId) {
    return { kvkId };
  }

  const scopeWhere = getScopeWhere(actor);
  if (Object.keys(scopeWhere).length === 0) {
    return {};
  }

  return { kvk: { is: scopeWhere } };
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

function buildCategoryWhere(aliases) {
  return {
    OR: aliases.map((name) => ({
      productCategory: {
        is: {
          productCategoryName: { equals: name, mode: 'insensitive' },
        },
      },
    })),
  };
}

function buildBreakdown(sum = {}) {
  const generalM = toNumber(sum.generalM);
  const generalF = toNumber(sum.generalF);
  const obcM = toNumber(sum.obcM);
  const obcF = toNumber(sum.obcF);
  const scM = toNumber(sum.scM);
  const scF = toNumber(sum.scF);
  const stM = toNumber(sum.stM);
  const stF = toNumber(sum.stF);

  const totalM = generalM + obcM + scM + stM;
  const totalF = generalF + obcF + scF + stF;

  return {
    general: { m: generalM, f: generalF },
    obc: { m: obcM, f: obcF },
    sc: { m: scM, f: scF },
    st: { m: stM, f: stF },
    total: { m: totalM, f: totalF, t: totalM + totalF },
  };
}

async function getTargetAggregate(baseWhere, reportingYear, typeName) {
  const agg = await prisma.target.aggregate({
    where: {
      ...baseWhere,
      reportingYear,
      typeName,
    },
    _sum: {
      target: true,
      farmerTarget: true,
      areaTarget: true,
    },
  });

  return {
    target: toNumber(agg?._sum?.target),
    farmerTarget: toNumber(agg?._sum?.farmerTarget),
    areaTarget: toNumber(agg?._sum?.areaTarget),
  };
}

const technicalAchievementSummaryService = {
  getFilterOptions: async (actor) => {
    const scopeWhere = getScopeWhere(actor);

    const kvks = await prisma.kvk.findMany({
      where: scopeWhere,
      select: { kvkId: true, kvkName: true },
      orderBy: [{ kvkName: 'asc' }, { kvkId: 'asc' }],
    });

    const currentYear = new Date().getFullYear();
    const parsedYears = Array.from({ length: 20 }, (_, index) => currentYear - index);

    return {
      years: parsedYears,
      defaultReportingYear: parsedYears[0] || currentYear,
      kvks,
      canFilterByKvk: getActorRole(actor) === 'super_admin',
    };
  },

  getSummary: async (actor, { reportingYear, kvkId }) => {
    const year = parseReportingYear(reportingYear);
    const resolvedKvkId = await resolveKvkFilter(actor, kvkId);
    const { start, endExclusive } = buildFiscalYearRange(year);

    const baseWhere = buildKvkScopedWhere(actor, resolvedKvkId);

    const [
      oftTarget,
      fldTarget,
      trainingTarget,
      extensionTarget,
      seedTarget,
      plantingTarget,
      livestockTarget,
      soilTarget,
    ] = await Promise.all([
      getTargetAggregate(baseWhere, year, TARGET_TYPE.OFT),
      getTargetAggregate(baseWhere, year, TARGET_TYPE.FLD),
      getTargetAggregate(baseWhere, year, TARGET_TYPE.TRAINING),
      getTargetAggregate(baseWhere, year, TARGET_TYPE.EXTENSION),
      getTargetAggregate(baseWhere, year, TARGET_TYPE.SEED_PRODUCTION),
      getTargetAggregate(baseWhere, year, TARGET_TYPE.PLANTING_MATERIAL),
      getTargetAggregate(baseWhere, year, TARGET_TYPE.LIVESTOCK),
      getTargetAggregate(baseWhere, year, TARGET_TYPE.SOIL_WATER),
    ]);

    const [oftAgg, fldAgg, trainingAgg, extensionAgg, seedAgg, plantingAgg, livestockAgg, soilAgg, publicationGroupBy] =
        await Promise.all([
      prisma.kvkoft.aggregate({
        where: {
          ...baseWhere,
          OR: [
            { reportingYear: { gte: start, lt: endExclusive } },
            { reportingYear: null, oftStartDate: { gte: start, lt: endExclusive } },
          ],
        },
        _count: { _all: true },
        _sum: {
          numberOfLocation: true,
          numberOfTrialReplication: true,
          farmersGeneralM: true,
          farmersGeneralF: true,
          farmersObcM: true,
          farmersObcF: true,
          farmersScM: true,
          farmersScF: true,
          farmersStM: true,
          farmersStF: true,
        },
      }),

      prisma.kvkFldIntroduction.aggregate({
        where: {
          ...baseWhere,
          OR: [
            { reportingYear: { gte: start, lt: endExclusive } },
            { reportingYear: null, startDate: { gte: start, lt: endExclusive } },
          ],
        },
        _count: { _all: true },
        _sum: {
          noOfDemonstration: true,
          areaHa: true,
          generalM: true,
          generalF: true,
          obcM: true,
          obcF: true,
          scM: true,
          scF: true,
          stM: true,
          stF: true,
        },
      }),

      prisma.trainingAchievement.aggregate({
        where: {
          ...baseWhere,
          startDate: { gte: start, lt: endExclusive },
        },
        _count: { _all: true },
        _sum: {
          generalM: true,
          generalF: true,
          obcM: true,
          obcF: true,
          scM: true,
          scF: true,
          stM: true,
          stF: true,
        },
      }),

      prisma.kvkExtensionActivity.aggregate({
        where: {
          ...baseWhere,
          startDate: { gte: start, lt: endExclusive },
        },
        _count: { _all: true },
        _sum: {
          numberOfActivities: true,
          farmersGeneralM: true,
          farmersGeneralF: true,
          farmersObcM: true,
          farmersObcF: true,
          farmersScM: true,
          farmersScF: true,
          farmersStM: true,
          farmersStF: true,
          officialsGeneralM: true,
          officialsGeneralF: true,
          officialsObcM: true,
          officialsObcF: true,
          officialsScM: true,
          officialsScF: true,
          officialsStM: true,
          officialsStF: true,
        },
      }),

      prisma.kvkProductionSupply.aggregate({
        where: {
          ...baseWhere,
          reportingYear: { gte: start, lt: endExclusive },
          ...buildCategoryWhere(PRODUCTION_CATEGORY_ALIASES[TARGET_TYPE.SEED_PRODUCTION]),
        },
        _sum: {
          quantity: true,
          value: true,
          farmersGeneralM: true,
          farmersGeneralF: true,
          farmersObcM: true,
          farmersObcF: true,
          farmersScM: true,
          farmersScF: true,
          farmersStM: true,
          farmersStF: true,
        },
      }),

      prisma.kvkProductionSupply.aggregate({
        where: {
          ...baseWhere,
          reportingYear: { gte: start, lt: endExclusive },
          ...buildCategoryWhere(PRODUCTION_CATEGORY_ALIASES[TARGET_TYPE.PLANTING_MATERIAL]),
        },
        _sum: {
          quantity: true,
          value: true,
          farmersGeneralM: true,
          farmersGeneralF: true,
          farmersObcM: true,
          farmersObcF: true,
          farmersScM: true,
          farmersScF: true,
          farmersStM: true,
          farmersStF: true,
        },
      }),

      prisma.kvkProductionSupply.aggregate({
        where: {
          ...baseWhere,
          reportingYear: { gte: start, lt: endExclusive },
          ...buildCategoryWhere(PRODUCTION_CATEGORY_ALIASES[TARGET_TYPE.LIVESTOCK]),
        },
        _sum: {
          quantity: true,
          value: true,
          farmersGeneralM: true,
          farmersGeneralF: true,
          farmersObcM: true,
          farmersObcF: true,
          farmersScM: true,
          farmersScF: true,
          farmersStM: true,
          farmersStF: true,
        },
      }),

      prisma.kkvSoilWaterAnalysis.aggregate({
        where: {
          ...baseWhere,
          reportingYear: { gte: start, lt: endExclusive },
        },
        _sum: {
          samplesAnalysed: true,
          generalM: true,
          generalF: true,
          obcM: true,
          obcF: true,
          scM: true,
          scF: true,
          stM: true,
          stF: true,
        },
      }),

      prisma.kvkPublicationDetails.groupBy({
        by: ['publicationId'],
        where: {
          ...baseWhere,
          reportingYear: { gte: start, lt: endExclusive },
        },
        _count: { _all: true },
      }),
    ]);

    const publicationIdList = publicationGroupBy.map((g) => g.publicationId).filter((id) => id != null);
    const publicationMasters =
      publicationIdList.length > 0
        ? await prisma.publication.findMany({
            where: { publicationId: { in: publicationIdList } },
            select: { publicationId: true, publicationName: true },
          })
        : [];
    const publicationNameById = new Map(publicationMasters.map((p) => [p.publicationId, p.publicationName]));
    const publicationSummaryRows = publicationGroupBy
      .map((g) => {
        const label =
          g.publicationId == null ? 'Not categorized' : publicationNameById.get(g.publicationId) || 'Unknown';
        return { publication: label, count: g._count._all };
      })
      .filter((r) => r.count > 0)
      .sort((a, b) => a.publication.localeCompare(b.publication));

    const extensionBreakdown = buildBreakdown({
      generalM: toNumber(extensionAgg?._sum?.farmersGeneralM) + toNumber(extensionAgg?._sum?.officialsGeneralM),
      generalF: toNumber(extensionAgg?._sum?.farmersGeneralF) + toNumber(extensionAgg?._sum?.officialsGeneralF),
      obcM: toNumber(extensionAgg?._sum?.farmersObcM) + toNumber(extensionAgg?._sum?.officialsObcM),
      obcF: toNumber(extensionAgg?._sum?.farmersObcF) + toNumber(extensionAgg?._sum?.officialsObcF),
      scM: toNumber(extensionAgg?._sum?.farmersScM) + toNumber(extensionAgg?._sum?.officialsScM),
      scF: toNumber(extensionAgg?._sum?.farmersScF) + toNumber(extensionAgg?._sum?.officialsScF),
      stM: toNumber(extensionAgg?._sum?.farmersStM) + toNumber(extensionAgg?._sum?.officialsStM),
      stF: toNumber(extensionAgg?._sum?.farmersStF) + toNumber(extensionAgg?._sum?.officialsStF),
    });

    return {
      reportingYear: year,
      kvkId: resolvedKvkId,
      sections: {
        oft: {
          target: oftTarget.target,
          achievement: toNumber(oftAgg?._count?._all),
          noOfLocation: toNumber(oftAgg?._sum?.numberOfLocation),
          noOfTrials: toNumber(oftAgg?._sum?.numberOfTrialReplication),
          farmers: {
            target: oftTarget.farmerTarget,
            achievement: buildBreakdown({
              generalM: oftAgg?._sum?.farmersGeneralM,
              generalF: oftAgg?._sum?.farmersGeneralF,
              obcM: oftAgg?._sum?.farmersObcM,
              obcF: oftAgg?._sum?.farmersObcF,
              scM: oftAgg?._sum?.farmersScM,
              scF: oftAgg?._sum?.farmersScF,
              stM: oftAgg?._sum?.farmersStM,
              stF: oftAgg?._sum?.farmersStF,
            }),
          },
        },

        fld: {
          target: fldTarget.target,
          achievement: toNumber(fldAgg?._sum?.noOfDemonstration),
          area: toNumber(fldAgg?._sum?.areaHa),
          farmers: {
            target: fldTarget.farmerTarget,
            achievement: buildBreakdown({
              generalM: fldAgg?._sum?.generalM,
              generalF: fldAgg?._sum?.generalF,
              obcM: fldAgg?._sum?.obcM,
              obcF: fldAgg?._sum?.obcF,
              scM: fldAgg?._sum?.scM,
              scF: fldAgg?._sum?.scF,
              stM: fldAgg?._sum?.stM,
              stF: fldAgg?._sum?.stF,
            }),
          },
        },

        training: {
          target: trainingTarget.target,
          achievement: toNumber(trainingAgg?._count?._all),
          participants: {
            target: trainingTarget.farmerTarget,
            achievement: buildBreakdown({
              generalM: trainingAgg?._sum?.generalM,
              generalF: trainingAgg?._sum?.generalF,
              obcM: trainingAgg?._sum?.obcM,
              obcF: trainingAgg?._sum?.obcF,
              scM: trainingAgg?._sum?.scM,
              scF: trainingAgg?._sum?.scF,
              stM: trainingAgg?._sum?.stM,
              stF: trainingAgg?._sum?.stF,
            }),
          },
        },

        extension: {
          target: extensionTarget.target,
          achievement: toNumber(extensionAgg?._sum?.numberOfActivities),
          participants: {
            target: extensionTarget.farmerTarget,
            achievement: extensionBreakdown,
          },
        },

        seedProduction: {
          target: seedTarget.target,
          quantity: toNumber(seedAgg?._sum?.quantity),
          value: toNumber(seedAgg?._sum?.value),
          participants: buildBreakdown({
            generalM: seedAgg?._sum?.farmersGeneralM,
            generalF: seedAgg?._sum?.farmersGeneralF,
            obcM: seedAgg?._sum?.farmersObcM,
            obcF: seedAgg?._sum?.farmersObcF,
            scM: seedAgg?._sum?.farmersScM,
            scF: seedAgg?._sum?.farmersScF,
            stM: seedAgg?._sum?.farmersStM,
            stF: seedAgg?._sum?.farmersStF,
          }),
        },

        plantingMaterial: {
          target: plantingTarget.target,
          quantity: toNumber(plantingAgg?._sum?.quantity),
          value: toNumber(plantingAgg?._sum?.value),
          participants: buildBreakdown({
            generalM: plantingAgg?._sum?.farmersGeneralM,
            generalF: plantingAgg?._sum?.farmersGeneralF,
            obcM: plantingAgg?._sum?.farmersObcM,
            obcF: plantingAgg?._sum?.farmersObcF,
            scM: plantingAgg?._sum?.farmersScM,
            scF: plantingAgg?._sum?.farmersScF,
            stM: plantingAgg?._sum?.farmersStM,
            stF: plantingAgg?._sum?.farmersStF,
          }),
        },

        livestock: {
          target: livestockTarget.target,
          quantity: toNumber(livestockAgg?._sum?.quantity),
          value: toNumber(livestockAgg?._sum?.value),
          participants: buildBreakdown({
            generalM: livestockAgg?._sum?.farmersGeneralM,
            generalF: livestockAgg?._sum?.farmersGeneralF,
            obcM: livestockAgg?._sum?.farmersObcM,
            obcF: livestockAgg?._sum?.farmersObcF,
            scM: livestockAgg?._sum?.farmersScM,
            scF: livestockAgg?._sum?.farmersScF,
            stM: livestockAgg?._sum?.farmersStM,
            stF: livestockAgg?._sum?.farmersStF,
          }),
        },

        soilWater: {
          target: soilTarget.target,
          achievement: toNumber(soilAgg?._sum?.samplesAnalysed),
          participants: buildBreakdown({
            generalM: soilAgg?._sum?.generalM,
            generalF: soilAgg?._sum?.generalF,
            obcM: soilAgg?._sum?.obcM,
            obcF: soilAgg?._sum?.obcF,
            scM: soilAgg?._sum?.scM,
            scF: soilAgg?._sum?.scF,
            stM: soilAgg?._sum?.stM,
            stF: soilAgg?._sum?.stF,
          }),
        },

        publications: {
          rows: publicationSummaryRows,
        },
      },
    };
  },
};

module.exports = technicalAchievementSummaryService;
