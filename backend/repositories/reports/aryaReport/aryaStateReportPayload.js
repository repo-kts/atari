const prisma = require('../../../config/prisma.js');

// Numeric columns summed across a state's KVKs, per enterprise. Date columns
// (dateOfClosing/dateOfRestart) are intentionally excluded from the state view.
const CURRENT_FIELDS = [
    'trainingsConducted', 'unitsMale', 'unitsFemale', 'youthMale', 'youthFemale',
    'viableUnits', 'closedUnits', 'avgSizeOfUnit', 'totalProductionPerYear',
    'perUnitCostOfProduction', 'saleValueOfProduce', 'economicGainsPerUnit',
    'employmentGeneratedMandays',
];

const PREV_FIELDS = [
    'unitsMale', 'unitsFemale', 'nonFunctionalUnitsClosed', 'nonFunctionalUnitsRestarted',
    'numberOfUnits', 'unitCapacity', 'fixedCost', 'variableCost', 'totalProductionPerUnitYear',
    'grossCostPerUnitYear', 'grossReturnPerUnitYear', 'netBenefitPerUnitYear',
    'employmentFamilyMandays', 'employmentOtherMandays', 'employmentTotalMandays',
    'personsVisitedUnit',
];

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function zeroed(fields) {
    const o = {};
    for (const f of fields) o[f] = 0;
    return o;
}

async function fetchEnterprisesOrdered() {
    const rows = await prisma.enterprise.findMany({
        // "Others" (isOther) last, otherwise insertion order.
        orderBy: [{ isOther: 'asc' }, { enterpriseId: 'asc' }],
        select: { enterpriseName: true },
    });
    return rows.map((r) => r.enterpriseName);
}

// One block per state; rows are master-driven (every enterprise, 0 where a state
// has no data) with any free-text enterprises appended after the master list.
async function buildAryaStateReportPayload(records, options = {}) {
    const prevYear = Boolean(options.prevYear);
    const fields = prevYear ? PREV_FIELDS : CURRENT_FIELDS;
    const list = Array.isArray(records) ? records : [];

    const stateSet = new Set();
    const byState = new Map(); // state -> (enterpriseName -> summed fields)
    for (const r of list) {
        const st = (r.stateName && String(r.stateName).trim()) || 'Unknown';
        stateSet.add(st);
        const ent = (r.enterpriseName && String(r.enterpriseName).trim()) || '—';
        if (!byState.has(st)) byState.set(st, new Map());
        const entMap = byState.get(st);
        if (!entMap.has(ent)) entMap.set(ent, zeroed(fields));
        const acc = entMap.get(ent);
        for (const f of fields) acc[f] += num(r[f]);
    }

    const masterEnterprises = await fetchEnterprisesOrdered();
    const seen = new Set(masterEnterprises);
    const extras = [];
    for (const entMap of byState.values()) {
        for (const e of entMap.keys()) {
            if (!seen.has(e)) { seen.add(e); extras.push(e); }
        }
    }
    const enterpriseOrder = [...masterEnterprises, ...extras.sort(sortStr)];

    const states = [...stateSet].sort(sortStr).map((stateName) => {
        const entMap = byState.get(stateName) || new Map();
        const enterprises = enterpriseOrder.map((enterpriseName) => ({
            enterpriseName,
            ...(entMap.get(enterpriseName) || zeroed(fields)),
        }));
        return { stateName, enterprises };
    });

    return { states, prevYear };
}

function resolveAryaStatePayload(data) {
    if (data && data.statePayload) return data.statePayload;
    return { states: [] };
}

module.exports = { buildAryaStateReportPayload, resolveAryaStatePayload };
