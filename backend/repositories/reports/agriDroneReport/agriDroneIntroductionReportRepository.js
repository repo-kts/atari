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
 * Normalize report/export input into { rows: [{ sNo, parameterName, details }] }.
 */
function resolveAgriDroneIntroductionPayload(data) {
    if (!data) return { rows: [] };
    let d = data;
    if (d && typeof d === 'object' && !Array.isArray(d) && d.data && isPayloadWithRows(d.data)) {
        d = d.data;
    }
    if (isPayloadWithRows(d)) {
        return d;
    }
    const list = Array.isArray(d) ? d : [d];
    const allRows = [];
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const intro = item;
        const demoAgg = {
            areaSum: item._demoAreaSum ?? item.areaSum,
            farmersSum: item._demoFarmersSum ?? item.farmersSum,
        };
        const rows = buildParameterRows(intro, demoAgg);
        if (rows.length === 0) continue;
        if (allRows.length > 0) {
            allRows.push({
                sNo: '',
                parameterName: '',
                details: '',
                _spacer: true,
            });
        }
        allRows.push(...rows);
    }
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
    const intro = await prisma.kvkAgriDrone.findFirst({
        where,
        orderBy: [{ reportingYear: 'desc' }, { agriDroneId: 'desc' }],
    });
    if (!intro) {
        return { rows: [] };
    }
    const demoAgg = await sumDemonstrationsForIntro(intro.agriDroneId, intro.kvkId, filters);
    const rows = buildParameterRows(intro, demoAgg);
    return { rows };
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
