/**
 * Production and supply of Technological products — `KvkProductionSupply`.
 * Page export: product, quantity, value (Rs), Farmers by category (M/F/T), row Total (M/F/T).
 * Modular report: same template with `records` from DB.
 */
const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');
const { formatReportingYear } = require('../../../utils/reportingYearUtils.js');
function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function safeFloat(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function pickInt(r, ...keys) {
    for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null && r[k] !== '') {
            return safeInt(r[k]);
        }
    }
    return 0;
}

function mfT(m, f) {
    const mi = safeInt(m);
    const fi = safeInt(f);
    return { m: mi, f: fi, t: mi + fi };
}

function formatProductName(r) {
    const parts = [
        r.productCategory || r.category,
        r.productType,
        r.product || r.prodType,
        r.speciesName || r.speciesBreedVariety || r.variety,
    ].filter((x) => x != null && String(x).trim() !== '');
    return parts.length ? parts.map((x) => String(x).trim()).join(' / ') : '—';
}

function formatQuantityCell(r) {
    const q = safeFloat(r.quantity ?? r.quantityKg);
    const u = (r.unit && String(r.unit).trim()) || '';
    if (!Number.isFinite(q)) return '—';
    const s = Number.isInteger(q) ? String(q) : String(Number(q.toFixed(3)));
    return u ? `${s} ${u}` : s;
}

function inferYearLabel(records) {
    for (const r of records) {
        const y = r.reportingYear;
        if (y == null) continue;
        if (typeof y === 'string' || typeof y === 'number') {
            const m = String(y).match(/(\d{4})/);
            if (m) return m[1];
        }
        const d = new Date(y);
        if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
    }
    return String(new Date().getFullYear());
}

function extractFarmerBreakdown(r) {
    return {
        genM: pickInt(r, 'gen_m', 'farmersGeneralM', 'farmers_general_m'),
        genF: pickInt(r, 'gen_f', 'farmersGeneralF', 'farmers_general_f'),
        obcM: pickInt(r, 'obc_m', 'farmersObcM', 'farmers_obc_m'),
        obcF: pickInt(r, 'obc_f', 'farmersObcF', 'farmers_obc_f'),
        scM: pickInt(r, 'sc_m', 'farmersScM', 'farmers_sc_m'),
        scF: pickInt(r, 'sc_f', 'farmersScF', 'farmers_sc_f'),
        stM: pickInt(r, 'st_m', 'farmersStM', 'farmers_st_m'),
        stF: pickInt(r, 'st_f', 'farmersStF', 'farmers_st_f'),
    };
}

function pageRowFromRecord(r) {
    const b = extractFarmerBreakdown(r);
    const g = mfT(b.genM, b.genF);
    const o = mfT(b.obcM, b.obcF);
    const s = mfT(b.scM, b.scF);
    const t = mfT(b.stM, b.stF);
    const totalM = b.genM + b.obcM + b.scM + b.stM;
    const totalF = b.genF + b.obcF + b.scF + b.stF;
    return {
        productName: formatProductName(r),
        quantityLabel: formatQuantityCell(r),
        valueRs: safeFloat(r.value ?? r.valueRs),
        unit: (r.unit && String(r.unit).trim()) || '',
        quantityRaw: safeFloat(r.quantity),
        farmersGenM: g.m,
        farmersGenF: g.f,
        farmersGenT: g.t,
        farmersObcM: o.m,
        farmersObcF: o.f,
        farmersObcT: o.t,
        farmersScM: s.m,
        farmersScF: s.f,
        farmersScT: s.t,
        farmersStM: t.m,
        farmersStF: t.f,
        farmersStT: t.t,
        totalM,
        totalF,
        totalT: totalM + totalF,
    };
}

function emptyTotals() {
    return {
        valueRs: 0,
        quantitySum: 0,
        farmersGenM: 0,
        farmersGenF: 0,
        farmersObcM: 0,
        farmersObcF: 0,
        farmersScM: 0,
        farmersScF: 0,
        farmersStM: 0,
        farmersStF: 0,
        totalM: 0,
        totalF: 0,
    };
}

function addToTotals(z, row) {
    z.valueRs += safeFloat(row.valueRs);
    z.quantitySum += safeFloat(row.quantityRaw);
    z.farmersGenM += safeInt(row.farmersGenM);
    z.farmersGenF += safeInt(row.farmersGenF);
    z.farmersObcM += safeInt(row.farmersObcM);
    z.farmersObcF += safeInt(row.farmersObcF);
    z.farmersScM += safeInt(row.farmersScM);
    z.farmersScF += safeInt(row.farmersScF);
    z.farmersStM += safeInt(row.farmersStM);
    z.farmersStF += safeInt(row.farmersStF);
    z.totalM += safeInt(row.totalM);
    z.totalF += safeInt(row.totalF);
}

function grandRowFromTotals(z, quantityGrandLabel) {
    const g = mfT(z.farmersGenM, z.farmersGenF);
    const o = mfT(z.farmersObcM, z.farmersObcF);
    const s = mfT(z.farmersScM, z.farmersScF);
    const t = mfT(z.farmersStM, z.farmersStF);
    return {
        productName: 'Total',
        quantityLabel: quantityGrandLabel,
        valueRs: z.valueRs,
        farmersGenM: g.m,
        farmersGenF: g.f,
        farmersGenT: g.t,
        farmersObcM: o.m,
        farmersObcF: o.f,
        farmersObcT: o.t,
        farmersScM: s.m,
        farmersScF: s.f,
        farmersScT: s.t,
        farmersStM: t.m,
        farmersStF: t.f,
        farmersStT: t.t,
        totalM: z.totalM,
        totalF: z.totalF,
        totalT: z.totalM + z.totalF,
    };
}

function buildPagePayloadFromRecords(records) {
    const list = Array.isArray(records) ? records : [];
    const yearLabel = inferYearLabel(list);
    const rows = list.map((r) => pageRowFromRecord(r));

    const z = emptyTotals();
    const units = new Set();
    for (let i = 0; i < rows.length; i += 1) {
        addToTotals(z, rows[i]);
        units.add((list[i].unit && String(list[i].unit).trim()) || '');
    }
    const quantityGrandLabel = quantitySumLabel(z.quantitySum, units, rows.length);

    const grandTotal = grandRowFromTotals(z, quantityGrandLabel);
    return { yearLabel, rows, grandTotal };
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

// Builds product rows + a totals row for one record list (one KVK, or all).
function buildBlock(list, totalLabel) {
    const rows = list.map((r) => pageRowFromRecord(r));
    const z = emptyTotals();
    const units = new Set();
    rows.forEach((row, i) => {
        addToTotals(z, row);
        units.add((list[i].unit && String(list[i].unit).trim()) || '');
    });
    const quantityLabel = quantitySumLabel(z.quantitySum, units, rows.length);
    const total = grandRowFromTotals(z, quantityLabel);
    total.productName = totalLabel;
    return { rows, total };
}

// KVK-wise grouped payload (no year). Each KVK gets a product block + sub-total;
// admins (multi-KVK) also get a grand total. Same shape for PDF / Excel / Word.
function buildKvkGroupedPagePayload(records) {
    const list = Array.isArray(records) ? records : [];

    const byKvk = new Map();
    for (const r of list) {
        const k = (r.kvkName && String(r.kvkName).trim())
            || (r.kvk && r.kvk.kvkName && String(r.kvk.kvkName).trim())
            || 'Unknown KVK';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }

    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => {
        const block = buildBlock(byKvk.get(kvkName), `Sub-total — ${kvkName}`);
        return { kvkName, rows: block.rows, subtotal: block.total };
    });

    const grand = buildBlock(list, 'Grand Total (all KVKs)').total;
    return { groups, grandTotal: grand, isMultiKvk: groups.length > 1 };
}

function resolveProductionSupplyGroupedPayload(data) {
    let records = [];
    if (Array.isArray(data)) records = data;
    else if (data && Array.isArray(data.records)) records = data.records;
    else if (data && data.data && Array.isArray(data.data.records)) records = data.data.records;
    else if (data) records = [data];
    return buildKvkGroupedPagePayload(records);
}

// ── Category → Product Type → Crop grouping (§2.8.A) ─────────────────
// Matches the reference layout: one titled table per Product Category
// (lettered A, B, C…), inside which rows are grouped by Product Type (a
// full-width group header row), then individual Crops (product) rows with
// their Variety (speciesName), a Sub Total per Product Type, and a Total row
// for the whole category.
function cropRowFromRecord(r) {
    const base = pageRowFromRecord(r);
    return {
        ...base,
        crop: (r.product && String(r.product).trim())
            || (r.prodType && String(r.prodType).trim())
            || '—',
        variety: (r.speciesName && String(r.speciesName).trim())
            || (r.speciesBreedVariety && String(r.speciesBreedVariety).trim())
            || (r.variety && String(r.variety).trim())
            || '—',
    };
}

function categoryNameOf(r) {
    const c = r.productCategory || r.category;
    return (c && String(c).trim()) || 'Uncategorised';
}

function productTypeNameOf(r) {
    const t = r.productType;
    return (t && String(t).trim()) || '—';
}

function buildCategoryGroupedPagePayload(records) {
    const list = Array.isArray(records) ? records : [];

    // Group records: category → product type → rows, preserving stable order.
    const byCategory = new Map();
    for (const r of list) {
        const cat = categoryNameOf(r);
        if (!byCategory.has(cat)) byCategory.set(cat, new Map());
        const typeMap = byCategory.get(cat);
        const type = productTypeNameOf(r);
        if (!typeMap.has(type)) typeMap.set(type, []);
        typeMap.get(type).push(r);
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const categories = [...byCategory.keys()].sort(sortStr).map((categoryName, idx) => {
        const typeMap = byCategory.get(categoryName);
        const catTotals = emptyTotals();
        const catUnits = new Set();
        let catRowCount = 0;

        const productTypeGroups = [...typeMap.keys()].sort(sortStr).map((productTypeName) => {
            const typeRecords = typeMap.get(productTypeName);
            const rows = typeRecords.map((r) => cropRowFromRecord(r));

            const z = emptyTotals();
            const units = new Set();
            rows.forEach((row, i) => {
                addToTotals(z, row);
                addToTotals(catTotals, row);
                const u = (typeRecords[i].unit && String(typeRecords[i].unit).trim()) || '';
                units.add(u);
                catUnits.add(u);
                catRowCount += 1;
            });
            const subtotal = grandRowFromTotals(z, quantitySumLabel(z.quantitySum, units, rows.length));
            subtotal.productName = 'Sub Total';
            return { productTypeName, rows, subtotal };
        });

        const total = grandRowFromTotals(catTotals, quantitySumLabel(catTotals.quantitySum, catUnits, catRowCount));
        total.productName = 'Total';
        return {
            categoryName,
            letter: letters[idx] || String(idx + 1),
            productTypeGroups,
            total,
        };
    });

    return { categories };
}

function quantitySumLabel(sum, unitSet, rowCount) {
    const unitList = [...unitSet].filter(Boolean);
    const qSum = Number.isInteger(sum) ? sum : Number(sum.toFixed(3));
    if (!rowCount) return '—';
    if (unitList.length === 0) return String(qSum);
    return unitList.length === 1 ? `${qSum} ${unitList[0]}` : `${qSum} (mixed units)`;
}

function resolveProductionSupplyCategoryGroupedPayload(data) {
    let records = [];
    if (Array.isArray(data)) records = data;
    else if (data && Array.isArray(data.records)) records = data.records;
    else if (data && data.data && Array.isArray(data.data.records)) records = data.data.records;
    else if (data) records = [data];
    return buildCategoryGroupedPagePayload(records);
}

// ── State-wise superadmin payload (Production & Supply all-reports) ─────────
// One block per Product Category (master order, only those with data). Inside
// each: Table 1 (state-wise category total quantity), Table 2 (product-type ×
// state summary), Table 3 (crops grouped by product type × state). Rows are
// master-driven — every product type / product under the category is listed even
// with zero data — with any free-text / unmatched entries appended after them.
function farmersTotalOf(r) {
    return safeInt(r.farmersGeneralM) + safeInt(r.farmersGeneralF)
        + safeInt(r.farmersObcM) + safeInt(r.farmersObcF)
        + safeInt(r.farmersScM) + safeInt(r.farmersScF)
        + safeInt(r.farmersStM) + safeInt(r.farmersStF);
}

function emptyMetric() {
    return { qty: 0, value: 0, farmers: 0 };
}

function addMetricRow(m, r) {
    m.qty += safeFloat(r.quantity);
    m.value += safeFloat(r.value ?? r.valueRs);
    m.farmers += farmersTotalOf(r);
}

function accMetric(target, src) {
    target.qty += src.qty;
    target.value += src.value;
    target.farmers += src.farmers;
}

function stateNameOf(r) {
    const s = r.stateName;
    return (s && String(s).trim()) || 'Unknown';
}

function productNameOf(r) {
    const p = r.product || r.prodType;
    return (p && String(p).trim()) || '—';
}

async function fetchProductionSupplyMasterHierarchy() {
    // Ordered by ID descending to match the approved report layout (Cereals →
    // … → Others; Paddy → … → Navane) — the reverse of insertion order.
    const [categories, types, products] = await Promise.all([
        prisma.productCategory.findMany({
            orderBy: { productCategoryId: 'desc' },
            select: { productCategoryId: true, productCategoryName: true },
        }),
        prisma.productType.findMany({
            orderBy: { productTypeId: 'desc' },
            select: { productTypeId: true, productCategoryType: true, productCategoryId: true },
        }),
        prisma.product.findMany({
            orderBy: { productId: 'desc' },
            select: { productName: true, productTypeId: true },
        }),
    ]);

    const productsByType = new Map();
    for (const p of products) {
        if (p.productTypeId == null) continue;
        if (!productsByType.has(p.productTypeId)) productsByType.set(p.productTypeId, []);
        productsByType.get(p.productTypeId).push(p.productName);
    }
    const typesByCategory = new Map();
    for (const t of types) {
        if (t.productCategoryId == null) continue;
        if (!typesByCategory.has(t.productCategoryId)) typesByCategory.set(t.productCategoryId, []);
        typesByCategory.get(t.productCategoryId).push({
            name: t.productCategoryType,
            products: productsByType.get(t.productTypeId) || [],
        });
    }
    return categories.map((c) => ({
        name: c.productCategoryName,
        types: typesByCategory.get(c.productCategoryId) || [],
    }));
}

// Merge master-ordered names with any extra names present in `dataKeys` but not
// in the master, so free-text entries still appear (appended after master rows).
function orderedWithExtras(masterNames, dataKeys) {
    const out = [];
    const seen = new Set();
    for (const n of masterNames) { out.push(n); seen.add(n); }
    for (const n of dataKeys) if (!seen.has(n)) { out.push(n); seen.add(n); }
    return out;
}

async function buildProductionSupplyStateReportPayload(records) {
    const list = Array.isArray(records) ? records : [];
    const yearLabel = inferYearLabel(list);

    // category -> type -> product -> state -> metric
    const stateSet = new Set();
    const catMap = new Map();
    for (const r of list) {
        const st = stateNameOf(r);
        stateSet.add(st);
        const cat = categoryNameOf(r);
        const type = productTypeNameOf(r);
        const prod = productNameOf(r);
        if (!catMap.has(cat)) catMap.set(cat, new Map());
        const typeMap = catMap.get(cat);
        if (!typeMap.has(type)) typeMap.set(type, new Map());
        const prodMap = typeMap.get(type);
        if (!prodMap.has(prod)) prodMap.set(prod, new Map());
        const stateMap = prodMap.get(prod);
        if (!stateMap.has(st)) stateMap.set(st, emptyMetric());
        addMetricRow(stateMap.get(st), r);
    }

    const stateColumns = [...stateSet].sort(sortStr);
    const master = await fetchProductionSupplyMasterHierarchy();
    const masterByName = new Map(master.map((m) => [m.name, m]));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Render only categories that have data, in master order (extras appended).
    const orderedCatNames = orderedWithExtras(
        master.map((m) => m.name).filter((n) => catMap.has(n)),
        [...catMap.keys()],
    );

    const categories = orderedCatNames.map((catName, idx) => {
        const typeMap = catMap.get(catName) || new Map();
        const mc = masterByName.get(catName);
        const masterTypes = mc ? mc.types : [];
        const masterTypeByName = new Map(masterTypes.map((t) => [t.name, t]));
        const orderedTypeNames = orderedWithExtras(
            masterTypes.map((t) => t.name),
            [...typeMap.keys()],
        );

        const catByState = new Map(stateColumns.map((s) => [s, emptyMetric()]));
        const catTotal = emptyMetric();
        const productTypes = []; // Table 2 rows
        const typeGroups = []; // Table 3 groups

        for (const typeName of orderedTypeNames) {
            const prodMap = typeMap.get(typeName) || new Map();
            const mt = masterTypeByName.get(typeName);
            const orderedProdNames = orderedWithExtras(
                mt ? mt.products : [],
                [...prodMap.keys()],
            );

            const typeByState = {};
            for (const s of stateColumns) typeByState[s] = emptyMetric();
            const typeTotal = emptyMetric();
            const crops = [];

            for (const prodName of orderedProdNames) {
                const stateMap = prodMap.get(prodName) || new Map();
                const byState = {};
                const rowTotal = emptyMetric();
                for (const st of stateColumns) {
                    const m = stateMap.get(st) || emptyMetric();
                    byState[st] = { qty: m.qty, value: m.value, farmers: m.farmers };
                    accMetric(typeByState[st], m);
                    accMetric(catByState.get(st), m);
                    accMetric(rowTotal, m);
                }
                accMetric(typeTotal, rowTotal);
                accMetric(catTotal, rowTotal);
                crops.push({ name: prodName, byState, total: rowTotal });
            }

            productTypes.push({ name: typeName, byState: typeByState, total: typeTotal });
            typeGroups.push({ name: typeName, crops, typeByState, typeTotal });
        }

        const catByStateObj = {};
        for (const st of stateColumns) catByStateObj[st] = catByState.get(st);

        return {
            categoryName: catName,
            letter: letters[idx] || String(idx + 1),
            productTypes,
            typeGroups,
            byState: catByStateObj,
            total: catTotal,
        };
    });

    return { yearLabel, stateColumns, categories };
}

function resolveProductionSupplyStatePayload(data) {
    if (data && data.statePayload) return data.statePayload;
    return { yearLabel: '', stateColumns: [], categories: [] };
}

function mapPrismaRowToReportRow(r) {
    if (!r) return null;
    const reportingYear = formatReportingYear(r.reportingYear);
    return {
        ...r,
        id: r.productionSupplyId,
        kvkName: r.kvk?.kvkName || '',
        stateName: r.kvk?.state?.stateName || '',
        reportingYear,
        productCategory: r.productCategoryOther || r.productCategory?.productCategoryName,
        productType: r.productTypeOther || r.productType?.productCategoryType,
        product: r.productOther || r.product?.productName,
        speciesName: r.speciesName,
        // Unit derives from the linked product's master unit (no stored column).
        unit: r.product?.unit?.unitName || '',
        quantity: r.quantity,
        value: r.value,
        valueRs: r.value,
        gen_m: r.farmersGeneralM,
        gen_f: r.farmersGeneralF,
        obc_m: r.farmersObcM,
        obc_f: r.farmersObcF,
        sc_m: r.farmersScM,
        sc_f: r.farmersScF,
        st_m: r.farmersStM,
        st_f: r.farmersStF,
        farmersGeneralM: r.farmersGeneralM,
        farmersGeneralF: r.farmersGeneralF,
        farmersObcM: r.farmersObcM,
        farmersObcF: r.farmersObcF,
        farmersScM: r.farmersScM,
        farmersScF: r.farmersScF,
        farmersStM: r.farmersStM,
        farmersStF: r.farmersStF,
    };
}

async function fetchProductionSupplyRecordsForReport(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.reportingYear = ry;

    const rows = await prisma.kvkProductionSupply.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true, state: { select: { stateName: true } } } },
            productCategory: { select: { productCategoryName: true } },
            productType: { select: { productCategoryType: true } },
            product: { select: { productName: true, unit: { select: { unitName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return rows.map(mapPrismaRowToReportRow).filter(Boolean);
}

async function getProductionSupplyReportData(kvkId, filters = {}) {
    const records = await fetchProductionSupplyRecordsForReport(kvkId, filters);
    return { records };
}

function resolveProductionSupplyPagePayload(data) {
    if (!data) {
        return buildPagePayloadFromRecords([]);
    }
    if (Array.isArray(data)) {
        return buildPagePayloadFromRecords(data);
    }
    if (Array.isArray(data.records)) {
        return buildPagePayloadFromRecords(data.records);
    }
    if (data.data && Array.isArray(data.data.records)) {
        return buildPagePayloadFromRecords(data.data.records);
    }
    return buildPagePayloadFromRecords([data]);
}

module.exports = {
    buildPagePayloadFromRecords,
    buildKvkGroupedPagePayload,
    buildCategoryGroupedPagePayload,
    resolveProductionSupplyPagePayload,
    resolveProductionSupplyGroupedPayload,
    resolveProductionSupplyCategoryGroupedPayload,
    buildProductionSupplyStateReportPayload,
    resolveProductionSupplyStatePayload,
    getProductionSupplyReportData,
    fetchProductionSupplyRecordsForReport,
    pageRowFromRecord,
    formatProductName,
};
