const prisma = require('../../../config/prisma.js');

// Superadmin NARI summary: master-driven Activity rows × state columns, each
// cell = { count, m, f, t }. Count is a per-form field sum (or record count);
// m/f/t are total male/female/total beneficiaries (all castes). Repos expose
// these as totalM/F/T (Garden, Value Addition) or grandM/F/T (Bio, Training,
// Extension) — read with a fallback.

function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function mftOf(r) {
    return {
        m: num(r.totalM != null ? r.totalM : r.grandM),
        f: num(r.totalF != null ? r.totalF : r.grandF),
        t: num(r.totalT != null ? r.totalT : r.grandT),
    };
}

function emptyCell() {
    return { count: 0, m: 0, f: 0, t: 0 };
}

function addCell(target, countInc, v) {
    target.count += countInc;
    target.m += v.m;
    target.f += v.f;
    target.t += v.t;
}

function activityOf(r) {
    return (r.activityName && String(r.activityName).trim())
        || (r.activityOther && String(r.activityOther).trim())
        || 'Not specified';
}

async function buildNariActivityStateSummary(records, options = {}) {
    const countField = options.countField || null;
    const countLabel = options.countLabel || 'Count';
    const list = Array.isArray(records) ? records : [];

    const stateSet = new Set();
    const byActivity = new Map(); // activity -> (state -> cell)
    for (const r of list) {
        const act = activityOf(r);
        const st = (r.stateName && String(r.stateName).trim()) || 'Unknown';
        stateSet.add(st);
        if (!byActivity.has(act)) byActivity.set(act, new Map());
        const sm = byActivity.get(act);
        if (!sm.has(st)) sm.set(st, emptyCell());
        const countInc = countField ? num(r[countField]) : 1;
        addCell(sm.get(st), countInc, mftOf(r));
    }

    const stateColumns = [...stateSet].sort(sortStr);

    // Master-driven activity order (Others/isOther last), extras appended.
    const master = await prisma.nariActivity.findMany({
        orderBy: [{ isOther: 'asc' }, { nariActivityId: 'asc' }],
        select: { activityName: true },
    });
    const masterNames = master.map((m) => m.activityName);
    const seen = new Set(masterNames);
    const extras = [...byActivity.keys()].filter((a) => !seen.has(a)).sort(sortStr);
    const activityOrder = [...masterNames, ...extras];

    const grandByState = new Map(stateColumns.map((s) => [s, emptyCell()]));
    const grandTotal = emptyCell();

    const rows = activityOrder.map((activityName) => {
        const sm = byActivity.get(activityName) || new Map();
        const byState = {};
        const total = emptyCell();
        for (const st of stateColumns) {
            const c = sm.get(st) || emptyCell();
            byState[st] = { count: c.count, m: c.m, f: c.f, t: c.t };
            const g = grandByState.get(st);
            g.count += c.count; g.m += c.m; g.f += c.f; g.t += c.t;
            total.count += c.count; total.m += c.m; total.f += c.f; total.t += c.t;
        }
        grandTotal.count += total.count;
        grandTotal.m += total.m;
        grandTotal.f += total.f;
        grandTotal.t += total.t;
        return { activityName, byState, total };
    });

    const grandByStateObj = {};
    for (const st of stateColumns) grandByStateObj[st] = grandByState.get(st);

    return {
        countLabel,
        stateColumns,
        rows,
        grandTotal: { byState: grandByStateObj, total: grandTotal },
    };
}

function resolveNariStatePayload(data) {
    if (data && data.statePayload) return data.statePayload;
    return {
        countLabel: 'Count',
        stateColumns: [],
        rows: [],
        grandTotal: { byState: {}, total: emptyCell() },
    };
}

module.exports = { buildNariActivityStateSummary, resolveNariStatePayload };
