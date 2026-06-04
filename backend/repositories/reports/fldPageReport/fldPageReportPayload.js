const prisma = require('../../../config/prisma.js');

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function safeFloat(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function totalFarmers(r) {
    return (
        safeInt(r.generalM) + safeInt(r.generalF)
        + safeInt(r.obcM) + safeInt(r.obcF)
        + safeInt(r.scM) + safeInt(r.scF)
        + safeInt(r.stM) + safeInt(r.stF)
    );
}

function inferYearLabel(records) {
    for (const r of records) {
        const ry = r.reportingYear;
        if (typeof ry === 'string' && ry.length >= 4) {
            const y = parseInt(ry.slice(0, 4), 10);
            if (Number.isFinite(y)) return String(y);
        }
    }
    return String(new Date().getFullYear());
}

function weightedYield(rows, pick) {
    let num = 0;
    let den = 0;
    for (const r of rows) {
        const fr = r.fldResult;
        if (!fr) continue;
        const a = safeFloat(r.quantity ?? r.areaHa ?? r.area);
        const y = safeFloat(pick(fr));
        if (a != null && a > 0 && y != null) {
            num += y * a;
            den += a;
        }
    }
    if (den <= 0) return null;
    return num / den;
}

/**
 * Batch-load FLD result rows for export (list API does not include results).
 */
async function enrichFldListWithResults(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const ids = [...new Set(
        list.map((r) => r.kvkFldId ?? r.id).filter((id) => id != null),
    )].map((id) => Number(id)).filter((id) => Number.isFinite(id));
    if (ids.length === 0) return [];
    const results = await prisma.kvkFldResult.findMany({
        where: { kvkFldId: { in: ids } },
    });
    const byId = new Map(results.map((r) => [r.kvkFldId, r]));
    return list.map((r) => {
        const id = Number(r.kvkFldId ?? r.id);
        const fr = Number.isFinite(id) ? byId.get(id) : null;
        return { ...r, fldResult: fr || null };
    });
}

function mapDetailRow(r) {
    const fr = r.fldResult;
    const farmers = totalFarmers(r);
    return {
        crop: r.cropName ?? '—',
        thematicArea: r.thematicAreaName ?? r.thematicArea ?? '—',
        technology: r.technologyName ?? r.fldName ?? '—',
        noOfDemonstration: r.noOfDemonstration ?? r.demoCount ?? '—',
        noOfFarmers: farmers,
        areaHa: safeFloat(r.quantity ?? r.areaHa ?? r.area),
        yieldDemo: fr ? safeFloat(fr.demoYield) : null,
        yieldCheck: fr ? safeFloat(fr.checkYield) : null,
        increasePercent: fr ? safeFloat(fr.increasePercent) : null,
        demoGrossCost: fr ? safeFloat(fr.demoGrossCost) : null,
        demoGrossReturn: fr ? safeFloat(fr.demoGrossReturn) : null,
        demoNetReturn: fr ? safeFloat(fr.demoNetReturn) : null,
        demoBcr: fr ? safeFloat(fr.demoBcr) : null,
        checkGrossCost: fr ? safeFloat(fr.checkGrossCost) : null,
        checkGrossReturn: fr ? safeFloat(fr.checkGrossReturn) : null,
        checkNetReturn: fr ? safeFloat(fr.checkNetReturn) : null,
        checkBcr: fr ? safeFloat(fr.checkBcr) : null,
    };
}

/**
 * Build Section A summary, Section B by category, grand totals. Expects enrichFldListWithResults output.
 */
function buildFldPageReportPayload(enrichedRecords) {
    const records = Array.isArray(enrichedRecords) ? enrichedRecords : [];
    const yearLabel = inferYearLabel(records);

    const byCategory = new Map();
    for (const r of records) {
        const key = (r.categoryName || 'Uncategorized').trim() || 'Uncategorized';
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key).push(r);
    }

    const categoryOrder = [...byCategory.keys()].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );

    const sectionA = [];
    let sno = 1;
    for (const cat of categoryOrder) {
        const rows = byCategory.get(cat) || [];
        const noFld = rows.length;
        const areaSum = rows.reduce((s, x) => s + (safeFloat(x.quantity ?? x.areaHa ?? x.area) || 0), 0);
        const benSum = rows.reduce((s, x) => s + totalFarmers(x), 0);
        const yDemo = weightedYield(rows, (fr) => fr.demoYield);
        const yCheck = weightedYield(rows, (fr) => fr.checkYield);
        sectionA.push({
            sno: sno++,
            category: cat,
            noFld,
            area: areaSum,
            beneficiaries: benSum,
            yieldDemo: yDemo,
            yieldCheck: yCheck,
        });
    }

    const totalFld = records.length;
    const totalArea = records.reduce((s, r) => s + (safeFloat(r.quantity ?? r.areaHa ?? r.area) || 0), 0);
    const totalBen = records.reduce((s, r) => s + totalFarmers(r), 0);
    const grandYieldDemo = weightedYield(records, (fr) => fr.demoYield);
    const grandYieldCheck = weightedYield(records, (fr) => fr.checkYield);

    const sectionB = categoryOrder.map((cat) => {
        const rows = (byCategory.get(cat) || []).slice().sort((a, b) => {
            const ca = (a.cropName || '').localeCompare(b.cropName || '', undefined, { sensitivity: 'base' });
            if (ca !== 0) return ca;
            return (a.technologyName || a.fldName || '').localeCompare(b.technologyName || b.fldName || '', undefined, { sensitivity: 'base' });
        });
        return {
            categoryName: cat,
            rows: rows.map(mapDetailRow),
        };
    });

    return {
        yearLabel,
        sectionA,
        sectionB,
        grandTotal: {
            noFld: totalFld,
            area: totalArea,
            beneficiaries: totalBen,
            yieldDemo: grandYieldDemo,
            yieldCheck: grandYieldCheck,
        },
    };
}

function resolveFldPageReportPayload(data) {
    if (!data) {
        return buildFldPageReportPayload([]);
    }
    let d = data;
    if (d && typeof d === 'object' && !Array.isArray(d) && d.data) {
        d = d.data;
    }
    if (d && typeof d === 'object' && !Array.isArray(d) && d.yearLabel != null && Array.isArray(d.sectionA)) {
        return d;
    }
    const list = Array.isArray(d) ? d : [d];
    return buildFldPageReportPayload(list);
}

module.exports = {
    enrichFldListWithResults,
    buildFldPageReportPayload,
    resolveFldPageReportPayload,
    totalFarmers,
};
