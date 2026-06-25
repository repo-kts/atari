const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma.js');
const { REGISTRY, CATEGORY_ORDER } = require('../config/formSummaryRegistry.js');
const {
  getActorRole,
  getScopeWhere,
  buildKvkListingWhere,
} = require('../utils/dashboardScope.js');

// Year filter binds to the column that represents WHEN the record's activity
// happened. Most forms use `reportingYear`; activity forms use `startDate` or a
// single activity-date column. Static forms (bank account, infrastructure, …)
// have no such column — they are never year-filtered (always counted).
// Ordered by preference; first match on a model wins.
const YEAR_FIELD_PRIORITY = [
  'reportingYear',
  'startDate',
  'oftStartDate',
  'eventDate',
  'celebrationDate',
  'dateOfProgram',
  'dateOfTheProgramme',
  'programmeDate',
  'trainingDate',
  'activityDate',
  'observationDate',
  'meetingDate',
  'dateOfVisit',
  'visitDate',
  'publicationDate',
  'awardDate',
  'trialDate',
  'dateOfOutbreak',
  'dateOfCompletion',
];

// delegate name (camelCase) -> set of its DateTime field names, from the DMMF.
const dmmfDateFields = (() => {
  const map = new Map();
  const models = Prisma?.dmmf?.datamodel?.models || [];
  for (const m of models) {
    const delegate = m.name.charAt(0).toLowerCase() + m.name.slice(1);
    const dates = new Set(
      m.fields.filter(f => f.type === 'DateTime').map(f => f.name),
    );
    map.set(delegate, dates);
  }
  return map;
})();

const yearFieldCache = new Map();
/** Resolve which column a model's year filter should bind to (or null). */
function resolveYearField(modelName) {
  if (yearFieldCache.has(modelName)) return yearFieldCache.get(modelName);
  const dates = dmmfDateFields.get(modelName);
  let field = null;
  if (dates) {
    field = YEAR_FIELD_PRIORITY.find(f => dates.has(f)) || null;
  }
  yearFieldCache.set(modelName, field);
  return field;
}

const STATUS = Object.freeze({
  COMPLETED: 'completed',
  NOT_STARTED: 'not_started',
});

// Defensive: if a registry entry points to a delegate that doesn't exist
// (schema rename, typo), we log once and treat it as zero-count everywhere
// rather than 500ing the whole endpoint. Logged only once per model.
const warnedMissing = new Set();
function isValidDelegate(modelName) {
  const delegate = prisma[modelName];
  if (delegate && typeof delegate.groupBy === 'function') return true;
  if (!warnedMissing.has(modelName)) {
    warnedMissing.add(modelName);
    console.warn(`[formSummary] Prisma delegate missing: ${modelName}`);
  }
  return false;
}

/**
 * Run groupBy(kvkId) for one registry entry.
 * Returns Map<kvkId, count>. Empty map on errors so one bad form
 * never brings down the whole summary.
 */
async function countForEntry(entry, scopeWhere, dateRange) {
  if (!isValidDelegate(entry.model)) return new Map();
  const where = { ...scopeWhere, ...(entry.where || {}) };
  // Apply the year filter only when the model has a date column to bind to;
  // static forms (no such column) are left unfiltered.
  if (dateRange) {
    const yearField = resolveYearField(entry.model);
    if (yearField) where[yearField] = dateRange;
  }
  try {
    const rows = await prisma[entry.model].groupBy({
      by: ['kvkId'],
      _count: { _all: true },
      where,
      orderBy: { kvkId: 'asc' },
    });
    const m = new Map();
    for (const r of rows) {
      if (r.kvkId != null) m.set(r.kvkId, r._count._all);
    }
    return m;
  } catch (err) {
    console.error(`[formSummary] groupBy failed for ${entry.model}:`, err.message);
    return new Map();
  }
}

/** Run N queries in capped parallel batches to avoid exhausting the pg pool. */
async function batchedCount(entries, scopeWhere, dateRange, batchSize = 20) {
  const results = new Array(entries.length);
  for (let i = 0; i < entries.length; i += batchSize) {
    const slice = entries.slice(i, i + batchSize);
    const settled = await Promise.all(slice.map(e => countForEntry(e, scopeWhere, dateRange)));
    for (let j = 0; j < slice.length; j++) results[i + j] = settled[j];
  }
  return results;
}

function statusOf(count) {
  return count > 0 ? STATUS.COMPLETED : STATUS.NOT_STARTED;
}

/** Shape a registry entry for client consumption (strip server-only fields). */
function metaOf(entry) {
  return {
    key: entry.key,
    title: entry.title,
    category: entry.category,
    subcategory: entry.subcategory || null,
    moduleCode: entry.moduleCode,
    path: entry.path || null,
  };
}

function progressPct(completed, total) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Per-KVK summary — one row per registry entry with status + count.
 * Used by kvk_admin and any scoped user viewing their own KVK.
 */
async function getKvkSummary(actor, kvkId, dateRange = null) {
  const scopeWhere = kvkId != null ? { kvkId: Number(kvkId) } : getScopeWhere(actor);

  const counts = await batchedCount(REGISTRY, scopeWhere, dateRange);

  const resolvedKvkId = scopeWhere.kvkId ?? null;
  const modules = REGISTRY.map((entry, i) => {
    const count = resolvedKvkId != null ? (counts[i].get(resolvedKvkId) || 0) : 0;
    return { ...metaOf(entry), count, status: statusOf(count) };
  });

  const completed = modules.filter(m => m.status === STATUS.COMPLETED).length;
  const total = modules.length;

  const kvk = resolvedKvkId != null
    ? await prisma.kvk.findUnique({
        where: { kvkId: resolvedKvkId },
        select: { kvkId: true, kvkName: true },
      })
    : null;

  return {
    kvkId: kvk?.kvkId ?? resolvedKvkId,
    kvkName: kvk?.kvkName ?? null,
    modules,
    completed,
    total,
    progress: progressPct(completed, total),
    categoryOrder: CATEGORY_ORDER,
  };
}

/**
 * Cross-KVK summary — matrix of every in-scope KVK × every form, plus
 * per-KVK progress. For super_admin (global) or higher admins (scoped).
 */
async function getAllKvkSummary(actor, dateRange = null) {
  const listWhere = buildKvkListingWhere(actor, null);
  const kvks = await prisma.kvk.findMany({
    where: listWhere,
    select: { kvkId: true, kvkName: true, districtId: true, stateId: true },
    orderBy: { kvkName: 'asc' },
  });
  if (kvks.length === 0) {
    return {
      modules: REGISTRY.map(metaOf),
      kvks: [],
      categoryOrder: CATEGORY_ORDER,
    };
  }

  const counts = await batchedCount(REGISTRY, listWhere, dateRange);
  const total = REGISTRY.length;

  const kvkRows = kvks.map(kvk => {
    const countsByKey = {};
    let completed = 0;
    for (let i = 0; i < REGISTRY.length; i++) {
      const n = counts[i].get(kvk.kvkId) || 0;
      countsByKey[REGISTRY[i].key] = n;
      if (n > 0) completed++;
    }
    return {
      kvkId: kvk.kvkId,
      kvkName: kvk.kvkName,
      completed,
      total,
      progress: progressPct(completed, total),
      countsByKey,
    };
  });

  return {
    modules: REGISTRY.map(metaOf),
    kvks: kvkRows,
    categoryOrder: CATEGORY_ORDER,
  };
}

module.exports = {
  getKvkSummary,
  getAllKvkSummary,
  STATUS,
};
