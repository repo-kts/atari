const prisma = require('../../../config/prisma.js');

function _yearRange(year) {
    const y = Number(year);
    if (!Number.isFinite(y)) return null;
    const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
    return { start, end };
}

async function getNicraBasicData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;

    // Support all-report filters: startDate/endDate/year
    if (filters.startDate || filters.endDate || filters.year) {
        where.reportingDate = {};
        if (filters.year && !filters.startDate && !filters.endDate) {
            const yr = _yearRange(filters.year);
            if (yr) {
                where.reportingDate.gte = yr.start;
                where.reportingDate.lte = yr.end;
            }
        } else {
            if (filters.startDate) {
                const from = new Date(filters.startDate);
                if (!isNaN(from)) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingDate.gte = from;
                }
            }
            if (filters.endDate) {
                const to = new Date(filters.endDate);
                if (!isNaN(to)) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingDate.lte = to;
                }
            }
        }
    }

    const rows = await prisma.nicraBasicInfo.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true, state: { select: { stateName: true } } } },
        },
        orderBy: [{ reportingDate: 'asc' }, { nicraBasicInfoId: 'asc' }],
    });

    return rows.map(r => ({
        id: r.nicraBasicInfoId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName || '',
        stateName: r.kvk?.state?.stateName || '',
        rfMmDistrictNormal: Number(r.rfNormal || 0),
        rfMmDistrictReceived: Number(r.rfReceived || 0),
        maxTemperature: Number(r.tempMax || 0),
        minTemperature: Number(r.tempMin || 0),
        dry10: Number(r.drySpell10Days || 0),
        dry15: Number(r.drySpell15Days || 0),
        dry20: Number(r.drySpell20Days || 0),
        intensiveRain: Number(r.intensiveRainAbove60mm || 0),
        waterDepth: Number(r.waterDepthCm || 0),
        startDate: r.startDate,
        endDate: r.endDate,
    }));
}

async function getNicraTrainingData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    if (filters.startDate || filters.endDate || filters.year) {
        where.startDate = {};
        if (filters.year && !filters.startDate && !filters.endDate) {
            const y = Number(filters.year);
            if (Number.isFinite(y)) {
                where.startDate.gte = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
                where.startDate.lte = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
            }
        } else {
            if (filters.startDate) {
                const from = new Date(filters.startDate);
                if (!isNaN(from)) {
                    from.setHours(0, 0, 0, 0);
                    where.startDate.gte = from;
                }
            }
            if (filters.endDate) {
                const to = new Date(filters.endDate);
                if (!isNaN(to)) {
                    to.setHours(23, 59, 59, 999);
                    where.startDate.lte = to;
                }
            }
        }
    }

    const rows = await prisma.nicraTraining.findMany({
        where,
        include: { kvk: { select: { kvkName: true } } },
        orderBy: [{ startDate: 'asc' }, { nicraTrainingId: 'asc' }],
    });

    return rows.map(r => {
        const gT = (r.generalM || 0) + (r.generalF || 0);
        const oT = (r.obcM || 0) + (r.obcF || 0);
        const sT = (r.scM || 0) + (r.scF || 0);
        const tT = (r.stM || 0) + (r.stF || 0);
        const totM = (r.generalM || 0) + (r.obcM || 0) + (r.scM || 0) + (r.stM || 0);
        const totF = (r.generalF || 0) + (r.obcF || 0) + (r.scF || 0) + (r.stF || 0);
        return {
            kvkName: r.kvk?.kvkName || '',
            titleOfTraining: r.titleOfTraining || '',
            campusType: r.campusType || '',
            startDate: r.startDate,
            endDate: r.endDate,
            durationDays: r.startDate && r.endDate ? Math.max(1, Math.round((r.endDate - r.startDate) / (1000*60*60*24))) : 1,
            genM: r.generalM || 0, genF: r.generalF || 0, genT: gT,
            obcM: r.obcM || 0, obcF: r.obcF || 0, obcT: oT,
            scM: r.scM || 0, scF: r.scF || 0, scT: sT,
            stM: r.stM || 0, stF: r.stF || 0, stT: tT,
            totM, totF, totT: totM + totF,
        };
    });
}

module.exports = { getNicraBasicData, getNicraTrainingData };
