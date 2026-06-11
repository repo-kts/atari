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

    // OFT
    const ofts = await prisma.kvkoft.findMany({ where: { ...kvkWhere, ...dateWhere('oftStartDate', filters) } });
    const oft = {
        target: targetOf('OFT'),
        achievement: ofts.length,
        locations: ofts.reduce((s, r) => s + Number(r.numberOfLocation || 0), 0),
        trials: ofts.reduce((s, r) => s + Number(r.numberOfTrialReplication || 0), 0),
    };

    // FLD
    const flds = await prisma.kvkFldIntroduction.findMany({ where: { ...kvkWhere, ...dateWhere('startDate', filters) } });
    const fld = {
        target: targetOf('FLD'),
        achievement: flds.length,
        area: flds.reduce((s, r) => s + Number(r.quantity || 0), 0),
        demos: flds.reduce((s, r) => s + Number(r.noOfDemonstration || 0), 0),
        farmers: sumCaste(flds, pickBare),
    };

    // Training
    const trainings = await prisma.trainingAchievement.findMany({ where: { ...kvkWhere, ...dateWhere('startDate', filters) } });
    const training = {
        target: targetOf('Training'),
        courses: trainings.length,
        participants: sumCaste(trainings, pickBare),
    };

    // Extension
    const exts = await prisma.kvkExtensionActivity.findMany({ where: { ...kvkWhere, ...dateWhere('startDate', filters) } });
    const extension = {
        target: targetOf('Extension'),
        activities: exts.reduce((s, r) => s + Number(r.numberOfActivities || 0), 0),
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

module.exports = { getTechnicalAchievementSummary };
