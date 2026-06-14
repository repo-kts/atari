const prisma = require('../../../config/prisma.js');

const PARAMETER_DEFS = [
    { key: 'pic', label: 'Name of the project implementing centre (PIC)' },
    { key: 'dronesSanctioned', label: 'No. of Agri Drones Sanctioned' },
    { key: 'dronesPurchased', label: 'No. of Agri Drones Purchased' },
    { key: 'amountSanctioned', label: 'Amount sanctioned (Rs)' },
    { key: 'costPerDrone', label: 'Purchased cost of each Drone (Rs.)' },
    { key: 'companyModel', label: 'Company and Model of Drone' },
    { key: 'pilotContactLine', label: 'Name and contact No of Agri Drone Pilot' },
    { key: 'targetAreaHa', label: 'Target Area for Agri Drone Demonstration (ha) (1 demo = 1 ha area)' },
    { key: 'demoAmountSanctioned', label: 'Amount sanctioned for Agri Drone Demonstrations (Rs.)' },
    { key: 'demoAmountUtilised', label: 'Amount utilised for Agri Drone Demonstrations (Rs.)' },
    { key: 'areaUnderDemos', label: 'Area covered under demos (area in ha)' },
    { key: 'operationType', label: 'Operation carried out (Pesticide/Weedicide/Nutrient application) in demonstration organised' },
    { key: 'farmersParticipated', label: 'Number of farmers participated during demonstration' },
    { key: 'advantagesObserved', label: 'Advantages of using Agri Drones as observed during the demonstrations' },
];

function buildReportingYearFilter(filters = {}) {
    if (!filters.startDate && !filters.endDate && !filters.year) {
        return null;
    }
    const g = {};
    if (filters.year && !filters.startDate && !filters.endDate) {
        const y = Number(filters.year);
        if (Number.isFinite(y)) {
            g.gte = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
            g.lte = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
        }
    } else {
        if (filters.startDate) {
            const from = new Date(filters.startDate);
            if (!Number.isNaN(from.getTime())) {
                from.setHours(0, 0, 0, 0);
                g.gte = from;
            }
        }
        if (filters.endDate) {
            const to = new Date(filters.endDate);
            if (!Number.isNaN(to.getTime())) {
                to.setHours(23, 59, 59, 999);
                g.lte = to;
            }
        }
    }
    return Object.keys(g).length > 0 ? g : null;
}

function buildIntroWhere(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.reportingYear = ry;
    return where;
}

function buildDemoWhere(agriDroneId, kvkId, filters = {}) {
    const where = { agriDroneId, kvkId };
    const ry = buildReportingYearFilter(filters);
    if (ry) where.reportingYear = ry;
    return where;
}

function fmtInt(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return String(Math.round(n));
}

function fmtFloat(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
    return String(Number(n.toFixed(2)));
}

function fmtMoney(v) {
    if (v === null || v === undefined || v === '') return '—';
    return fmtFloat(v);
}

function dashText(s) {
    const t = (s === null || s === undefined) ? '' : String(s).trim();
    return t === '' ? '—' : t;
}

/**
 * Build 14 parameter rows from one intro record + demo aggregates.
 */
function buildParameterRows(intro, demoAgg = {}) {
    if (!intro) return [];
    const areaSum = demoAgg.areaSum ?? demoAgg._demoAreaSum ?? 0;
    const farmersSum = demoAgg.farmersSum ?? demoAgg._demoFarmersSum ?? 0;

    const company = (intro.droneCompany ?? '').trim();
    const model = (intro.droneModel ?? '').trim();
    const companyModel = [company, model].filter(Boolean).join(' and ') || '—';

    const pilotName = (intro.pilotName ?? '').trim();
    const pilotContact = (intro.pilotContact ?? '').trim();
    const pilotLine = [pilotName, pilotContact].filter(Boolean).join(' and ') || '—';

    const values = {
        pic: dashText(intro.projectImplementingCentre ?? intro.picName),
        dronesSanctioned: fmtInt(intro.dronesSanctioned),
        dronesPurchased: fmtInt(intro.dronesPurchased),
        amountSanctioned: fmtMoney(intro.amountSanctioned),
        costPerDrone: fmtMoney(intro.costPerDrone ?? intro.droneCost),
        companyModel,
        pilotContactLine: pilotLine,
        targetAreaHa: fmtFloat(intro.targetAreaHa),
        demoAmountSanctioned: fmtMoney(intro.demoAmountSanctioned),
        demoAmountUtilised: fmtMoney(intro.demoAmountUtilised),
        areaUnderDemos: fmtFloat(areaSum),
        operationType: dashText(intro.operationType ?? intro.operations),
        farmersParticipated: fmtInt(farmersSum),
        advantagesObserved: dashText(intro.advantagesObserved ?? intro.advantages),
    };

    return PARAMETER_DEFS.map((def, i) => ({
        sNo: i + 1,
        parameterName: def.label,
        details: values[def.key] ?? '—',
    }));
}

function isPayloadWithRows(d) {
    return Boolean(
        d && typeof d === 'object' && !Array.isArray(d)
        && Array.isArray(d.rows) && d.rows.length > 0
        && d.rows[0] && typeof d.rows[0].parameterName === 'string',
    );
}

/**
 * Build a "KVK — District, State" label so super-admin aggregated reports show
 * which KVK each block belongs to. Returns '' when no KVK identity is present.
 */
function payloadLabel(p) {
    if (!p) return '';
    const kvk = String(p.kvkName || '').trim();
    if (!kvk) return '';
    const loc = [p.districtName, p.stateName]
        .map(s => String(s || '').trim())
        .filter(Boolean)
        .join(', ');
    return loc ? `${kvk} — ${loc}` : kvk;
}

/**
 * Normalize report/export input into { rows: [{ sNo, parameterName, details }] }.
 */
function resolveAgriDroneIntroductionPayload(data) {
    if (!data) return { rows: [] };
    let d = data;
    if (d && typeof d === 'object' && !Array.isArray(d) && d.data && isPayloadWithRows(d.data)) {
        d = d.data;
    }
    const list = Array.isArray(d) ? d : [d];

    // Collect one block per KVK. Each block keeps its own label so super-admin
    // aggregated output can show which KVK the data is from.
    const blocks = [];
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;

        if (Array.isArray(item.rows)) {
            // Already-built per-KVK payload (e.g. { kvkName, rows: [...] }).
            // Skip empty payloads so KVKs without data don't render a phantom
            // block of all '—'/0 rows.
            if (item.rows.length === 0) continue;
            if (item.rows[0] && typeof item.rows[0].parameterName === 'string') {
                blocks.push({ label: payloadLabel(item), rows: item.rows });
                continue;
            }
        }

        // Raw intro record → build the 14 parameter rows.
        const demoAgg = {
            areaSum: item._demoAreaSum ?? item.areaSum,
            farmersSum: item._demoFarmersSum ?? item.farmersSum,
        };
        const rows = buildParameterRows(item, demoAgg);
        if (rows.length === 0) continue;
        blocks.push({
            label: payloadLabel({
                kvkName: item.kvk?.kvkName,
                stateName: item.kvk?.state?.stateName,
                districtName: item.kvk?.district?.districtName,
            }),
            rows,
        });
    }

    if (blocks.length === 0) return { rows: [] };
    // Single KVK: keep the original look (no per-block header).
    if (blocks.length === 1) return { rows: blocks[0].rows };

    const allRows = [];
    blocks.forEach((b, i) => {
        if (i > 0) allRows.push({ sNo: '', parameterName: '', details: '', _spacer: true });
        if (b.label) allRows.push({ _header: true, label: b.label });
        allRows.push(...b.rows);
    });
    return { rows: allRows };
}

async function sumDemonstrationsForIntro(agriDroneId, kvkId, filters) {
    const where = buildDemoWhere(agriDroneId, kvkId, filters);
    const agg = await prisma.kvkAgriDroneDemonstration.aggregate({
        where,
        _sum: { areaHa: true, noOfFarmers: true },
    });
    return {
        areaSum: Number(agg._sum.areaHa || 0),
        farmersSum: Number(agg._sum.noOfFarmers || 0),
    };
}

async function getAgriDroneIntroductionData(kvkId, filters = {}) {
    const where = buildIntroWhere(kvkId, filters);
    // A KVK may have more than one Agri-Drone intro (one per project
    // implementing centre / PIC). Return them all, stacked, instead of just the
    // first — otherwise the report drops every PIC after the first.
    const intros = await prisma.kvkAgriDrone.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
        },
        orderBy: [{ reportingYear: 'desc' }, { agriDroneId: 'desc' }],
    });
    if (intros.length === 0) {
        return { rows: [] };
    }

    const rows = [];
    for (let i = 0; i < intros.length; i++) {
        const intro = intros[i];
        const demoAgg = await sumDemonstrationsForIntro(intro.agriDroneId, intro.kvkId, filters);
        const introRows = buildParameterRows(intro, demoAgg);
        if (i > 0) rows.push({ sNo: '', parameterName: '', details: '', _spacer: true });
        rows.push(...introRows);
    }

    const first = intros[0];
    return {
        kvkName: first.kvk?.kvkName || '',
        stateName: first.kvk?.state?.stateName || '',
        districtName: first.kvk?.district?.districtName || '',
        rows,
    };
}

/**
 * Enrich client export payloads with demo sums (area + farmers) per intro id.
 */
async function enrichAgriDroneIntroductionExport(rawData) {
    const list = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const out = [];
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const agriDroneId = item.agriDroneId ?? item.id;
        let kvkId = item.kvkId;
        if (agriDroneId && (kvkId === undefined || kvkId === null)) {
            const row = await prisma.kvkAgriDrone.findFirst({
                where: { agriDroneId: Number(agriDroneId) },
                select: { kvkId: true },
            });
            kvkId = row?.kvkId;
        }
        let areaSum = 0;
        let farmersSum = 0;
        if (agriDroneId && kvkId != null) {
            const sums = await sumDemonstrationsForIntro(
                Number(agriDroneId),
                Number(kvkId),
                {},
            );
            areaSum = sums.areaSum;
            farmersSum = sums.farmersSum;
        }
        out.push({
            ...item,
            _demoAreaSum: areaSum,
            _demoFarmersSum: farmersSum,
        });
    }
    return out.length === 1 ? out[0] : out;
}

module.exports = {
    getAgriDroneIntroductionData,
    resolveAgriDroneIntroductionPayload,
    enrichAgriDroneIntroductionExport,
    buildParameterRows,
    PARAMETER_DEFS,
    buildReportingYearFilter,
};
