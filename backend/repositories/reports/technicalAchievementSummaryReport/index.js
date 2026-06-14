const prisma = require('../../../config/prisma.js');

// Technical Achievement Summary (§2.1) — Target vs Achievement across the main
// activity blocks, with caste×gender beneficiary demographics where the source
// captures them. Targets come from the Target table (keyed by typeName).

function yearRange(year) {
    const y = Number(year);
    if (!Number.isFinite(y)) return null;
    return {
        gte: new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0)),
        lte: new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)),
    };
}

// where-clause for a DateTime field given the report filters
function dateWhere(field, filters = {}) {
    const w = {};
    if (filters.startDate || filters.endDate) {
        w[field] = {};
        if (filters.startDate) w[field].gte = new Date(filters.startDate);
        if (filters.endDate) w[field].lte = new Date(filters.endDate);
    } else if (filters.year) {
        const r = yearRange(filters.year);
        if (r) w[field] = r;
    }
    return w;
}

const EMPTY = { gm: 0, gf: 0, om: 0, of: 0, sm: 0, sf: 0, stm: 0, stf: 0 };

// Sum caste×gender from rows. `pick` maps a row -> the 8 raw values.
function sumCaste(rows, pick) {
    const acc = { ...EMPTY };
    for (const r of rows) {
        const v = pick(r);
        acc.gm += Number(v.gm || 0); acc.gf += Number(v.gf || 0);
        acc.om += Number(v.om || 0); acc.of += Number(v.of || 0);
        acc.sm += Number(v.sm || 0); acc.sf += Number(v.sf || 0);
        acc.stm += Number(v.stm || 0); acc.stf += Number(v.stf || 0);
    }
    const totM = acc.gm + acc.om + acc.sm + acc.stm;
    const totF = acc.gf + acc.of + acc.sf + acc.stf;
    return { ...acc, totM, totF, totT: totM + totF };
}

// FLD/Training style fields (generalM, obcM, …)
const pickBare = (r) => ({
    gm: r.generalM, gf: r.generalF, om: r.obcM, of: r.obcF,
    sm: r.scM, sf: r.scF, stm: r.stM, stf: r.stF,
});
// Extension/Production style fields (farmersGeneralM, …)
const pickFarmers = (r) => ({
    gm: r.farmersGeneralM, gf: r.farmersGeneralF, om: r.farmersObcM, of: r.farmersObcF,
    sm: r.farmersScM, sf: r.farmersScF, stm: r.farmersStM, stf: r.farmersStF,
});

async function getTechnicalAchievementSummary(kvkId, filters = {}) {
    const kvkWhere = kvkId ? { kvkId } : {};

    // Targets keyed by typeName (Target.reportingYear is an Int year).
    const targetWhere = { ...kvkWhere };
    if (filters.year) targetWhere.reportingYear = Number(filters.year);
    const targets = await prisma.target.findMany({ where: targetWhere });
    const targetOf = (typeName) => targets
        .filter((t) => String(t.typeName).toLowerCase() === typeName.toLowerCase())
        .reduce((s, t) => s + Number(t.target || 0), 0);
    // Farmer/beneficiary target for the same typeName (separate column in §2.1).
    const farmerTargetOf = (typeName) => targets
        .filter((t) => String(t.typeName).toLowerCase() === typeName.toLowerCase())
        .reduce((s, t) => s + Number(t.farmerTarget || 0), 0);

    // OFT — kvkoft carries farmer demographics (farmersGeneralM, …) like the
    // extension/production tables, so pick with pickFarmers.
    const ofts = await prisma.kvkoft.findMany({ where: { ...kvkWhere, ...dateWhere('oftStartDate', filters) } });
    const oft = {
        target: targetOf('OFT'),
        achievement: ofts.length,
        locations: ofts.reduce((s, r) => s + Number(r.numberOfLocation || 0), 0),
        trials: ofts.reduce((s, r) => s + Number(r.numberOfTrialReplication || 0), 0),
        farmerTarget: farmerTargetOf('OFT'),
        farmers: sumCaste(ofts, pickFarmers),
    };

    // FLD
    const flds = await prisma.kvkFldIntroduction.findMany({ where: { ...kvkWhere, ...dateWhere('startDate', filters) } });
    const fld = {
        target: targetOf('FLD'),
        achievement: flds.length,
        area: flds.reduce((s, r) => s + Number(r.quantity || 0), 0),
        demos: flds.reduce((s, r) => s + Number(r.noOfDemonstration || 0), 0),
        farmerTarget: farmerTargetOf('FLD'),
        farmers: sumCaste(flds, pickBare),
    };

    // Training
    const trainings = await prisma.trainingAchievement.findMany({ where: { ...kvkWhere, ...dateWhere('startDate', filters) } });
    const training = {
        target: targetOf('Training'),
        courses: trainings.length,
        farmerTarget: farmerTargetOf('Training'),
        participants: sumCaste(trainings, pickBare),
    };

    // Extension
    const exts = await prisma.kvkExtensionActivity.findMany({ where: { ...kvkWhere, ...dateWhere('startDate', filters) } });
    const extension = {
        target: targetOf('Extension'),
        activities: exts.reduce((s, r) => s + Number(r.numberOfActivities || 0), 0),
        farmerTarget: farmerTargetOf('Extension'),
        participants: sumCaste(exts, pickFarmers),
    };

    // Production / Supply — grouped by product category (covers Seed, Planting
    // Material, Livestock & Fish, … whatever categories exist).
    const prod = await prisma.kvkProductionSupply.findMany({
        where: { ...kvkWhere, ...dateWhere('reportingYear', filters) },
        include: { productCategory: { select: { productCategoryName: true } } },
    });
    const prodByCat = new Map();
    for (const r of prod) {
        const cat = r.productCategory?.productCategoryName || 'Other';
        if (!prodByCat.has(cat)) prodByCat.set(cat, []);
        prodByCat.get(cat).push(r);
    }
    const production = Array.from(prodByCat.entries()).map(([category, rows]) => ({
        category,
        target: targetOf(category),
        quantity: rows.reduce((s, r) => s + Number(r.quantity || 0), 0),
        value: rows.reduce((s, r) => s + Number(r.value || 0), 0),
        beneficiaries: sumCaste(rows, pickFarmers),
    }));

    return { oft, fld, training, extension, production };
}

// Caste×gender keys produced by sumCaste (see EMPTY above).
const CASTE_KEYS = ['gm', 'gf', 'om', 'of', 'sm', 'sf', 'stm', 'stf'];

// Sum many sumCaste-shaped objects into one, recomputing the totals.
function mergeCaste(list) {
    const acc = { ...EMPTY };
    for (const c of list) {
        if (!c) continue;
        for (const k of CASTE_KEYS) acc[k] += Number(c[k] || 0);
    }
    const totM = acc.gm + acc.om + acc.sm + acc.stm;
    const totF = acc.gf + acc.of + acc.sf + acc.stf;
    return { ...acc, totM, totF, totT: totM + totF };
}

// Merge per-KVK summaries (each shaped like getTechnicalAchievementSummary's
// return) into a single aggregate object the §2.1 template can render. Used by
// the aggregation pipeline so super-admin / multi-KVK scopes show combined
// totals instead of an array the template can't read.
function mergeTechnicalAchievementSummaries(summaries) {
    const valid = (summaries || []).filter(Boolean);
    if (valid.length === 0) {
        return { oft: null, fld: null, training: null, extension: null, production: [] };
    }

    const sum = (pick) => valid.reduce((s, d) => s + Number(pick(d) || 0), 0);

    const oft = {
        target: sum((d) => d.oft?.target),
        achievement: sum((d) => d.oft?.achievement),
        locations: sum((d) => d.oft?.locations),
        trials: sum((d) => d.oft?.trials),
        farmerTarget: sum((d) => d.oft?.farmerTarget),
        farmers: mergeCaste(valid.map((d) => d.oft?.farmers)),
    };

    const fld = {
        target: sum((d) => d.fld?.target),
        achievement: sum((d) => d.fld?.achievement),
        area: sum((d) => d.fld?.area),
        demos: sum((d) => d.fld?.demos),
        farmerTarget: sum((d) => d.fld?.farmerTarget),
        farmers: mergeCaste(valid.map((d) => d.fld?.farmers)),
    };

    const training = {
        target: sum((d) => d.training?.target),
        courses: sum((d) => d.training?.courses),
        farmerTarget: sum((d) => d.training?.farmerTarget),
        participants: mergeCaste(valid.map((d) => d.training?.participants)),
    };

    const extension = {
        target: sum((d) => d.extension?.target),
        activities: sum((d) => d.extension?.activities),
        farmerTarget: sum((d) => d.extension?.farmerTarget),
        participants: mergeCaste(valid.map((d) => d.extension?.participants)),
    };

    // Production / Supply rows are grouped by category — merge the same category
    // across KVKs rather than listing it once per KVK.
    const byCat = new Map();
    for (const d of valid) {
        for (const p of d.production || []) {
            const key = p.category || 'Other';
            if (!byCat.has(key)) {
                byCat.set(key, { category: key, target: 0, quantity: 0, value: 0, _bene: [] });
            }
            const agg = byCat.get(key);
            agg.target += Number(p.target || 0);
            agg.quantity += Number(p.quantity || 0);
            agg.value += Number(p.value || 0);
            agg._bene.push(p.beneficiaries);
        }
    }
    const production = Array.from(byCat.values()).map((agg) => ({
        category: agg.category,
        target: agg.target,
        quantity: agg.quantity,
        value: agg.value,
        beneficiaries: mergeCaste(agg._bene),
    }));

    return { oft, fld, training, extension, production };
}

module.exports = { getTechnicalAchievementSummary, mergeTechnicalAchievementSummaries };
