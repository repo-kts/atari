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
            durationDays: r.startDate && r.endDate ? Math.max(1, Math.round((r.endDate - r.startDate) / (1000 * 60 * 60 * 24))) : 1,
            genM: r.generalM || 0, genF: r.generalF || 0, genT: gT,
            obcM: r.obcM || 0, obcF: r.obcF || 0, obcT: oT,
            scM: r.scM || 0, scF: r.scF || 0, scT: sT,
            stM: r.stM || 0, stF: r.stF || 0, stT: tT,
            totM, totF, totT: totM + totF,
        };
    });
}

async function getNicraInterventionData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    if (filters.startDate || filters.endDate || filters.year || filters.reportingYearFrom || filters.reportingYearTo) {
        where.startDate = {};
        if (filters.year && !filters.startDate && !filters.endDate && !filters.reportingYearFrom && !filters.reportingYearTo) {
            const y = Number(filters.year);
            if (Number.isFinite(y)) {
                where.startDate.gte = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
                where.startDate.lte = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
            }
        } else {
            if (filters.startDate || filters.reportingYearFrom) {
                const from = new Date(filters.startDate || filters.reportingYearFrom);
                if (!isNaN(from)) {
                    from.setHours(0, 0, 0, 0);
                    where.startDate.gte = from;
                }
            }
            if (filters.endDate || filters.reportingYearTo) {
                const to = new Date(filters.endDate || filters.reportingYearTo);
                if (!isNaN(to)) {
                    to.setHours(23, 59, 59, 999);
                    where.startDate.lte = to;
                }
            }
        }
    }

    const rows = await prisma.nicraIntervention.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true, state: { select: { stateName: true } } } },
            seedBankFodderBank: true,
        },
        orderBy: [{ startDate: 'asc' }, { nicraInterventionId: 'asc' }],
    });

    return rows.map(r => ({
        stateName: r.kvk?.state?.stateName || '',
        kvkName: r.kvk?.kvkName || '',
        bankType: r.seedBankFodderBank?.name || '',
        cropWithVariety: r.variety ? `${r.crop || ''} ${r.variety}`.trim() : (r.crop || ''),
        quantityQ: Number(r.quantityQ || 0),
    }));
}

async function getNicraExtensionActivityData(kvkId, filters = {}) {
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

    const items = await prisma.nicraExtensionActivity.findMany({
        where,
        include: { kvk: { select: { kvkName: true, state: { select: { stateName: true } } } } },
        orderBy: [{ kvkId: 'asc' }, { activityName: 'asc' }],
    });

    // Group by state, kvk, activityName
    const key = (r) => `${r.kvkId}::${r.activityName || ''}`;
    const map = new Map();
    for (const r of items) {
        const k = key(r);
        const cur = map.get(k) || {
            stateName: r.kvk?.state?.stateName || '',
            kvkName: r.kvk?.kvkName || '',
            activityName: r.activityName || '',
            numProgrammes: 0,
            genM: 0, genF: 0,
            obcM: 0, obcF: 0,
            scM: 0, scF: 0,
            stM: 0, stF: 0,
        };
        cur.numProgrammes += 1;
        cur.genM += r.generalM || 0; cur.genF += r.generalF || 0;
        cur.obcM += r.obcM || 0; cur.obcF += r.obcF || 0;
        cur.scM += r.scM || 0; cur.scF += r.scF || 0;
        cur.stM += r.stM || 0; cur.stF += r.stF || 0;
        map.set(k, cur);
    }
    return Array.from(map.values()).map(r => {
        const genT = r.genM + r.genF;
        const obcT = r.obcM + r.obcF;
        const scT = r.scM + r.scF;
        const stT = r.stM + r.stF;
        const totM = r.genM + r.obcM + r.scM + r.stM;
        const totF = r.genF + r.obcF + r.scF + r.stF;
        return { ...r, genT, obcT, scT, stT, totM, totF, totT: totM + totF };
    });
}

async function getNicraFarmImplementData(kvkId, filters = {}) {
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

    const rows = await prisma.nicraFarmImplement.findMany({
        where,
        include: { kvk: { select: { kvkName: true, state: { select: { stateName: true } } } } },
        orderBy: [{ startDate: 'asc' }, { nicraFarmImplementId: 'asc' }],
    });
    return rows.map(r => {
        const genM = Number(r.generalM || 0), genF = Number(r.generalF || 0);
        const obcM = Number(r.obcM || 0), obcF = Number(r.obcF || 0);
        const scM = Number(r.scM || 0), scF = Number(r.scF || 0);
        const stM = Number(r.stM || 0), stF = Number(r.stF || 0);
        const genT = genM + genF, obcT = obcM + obcF, scT = scM + scF, stT = stM + stF;
        const totM = genM + obcM + scM + stM;
        const totF = genF + obcF + scF + stF;
        return {
            stateName: r.kvk?.state?.stateName || '',
            kvkName: r.kvk?.kvkName || '',
            nameOfFarmImplement: r.nameOfFarmImplement || '',
            genM, genF, genT,
            obcM, obcF, obcT,
            scM, scF, scT,
            stM, stF, stT,
            totM, totF, totT: totM + totF,
            areaCovered: Number(r.areaCovered || 0),
            farmImplementUsedHours: Number(r.farmImplementUsedHours || 0),
            revenueGeneratedRs: Number(r.revenueGeneratedRs || 0),
            expenditureIncurredRepairingRs: Number(r.expenditureIncurredRepairingRs || 0),
        };
    });
}

async function getNicraVcrmcData(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    if (filters.startDate || filters.endDate || filters.year) {
        where.vcrmcConstitutionDate = {};
        if (filters.year && !filters.startDate && !filters.endDate) {
            const y = Number(filters.year);
            if (Number.isFinite(y)) {
                where.vcrmcConstitutionDate.gte = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
                where.vcrmcConstitutionDate.lte = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
            }
        } else {
            if (filters.startDate) {
                const from = new Date(filters.startDate);
                if (!isNaN(from)) {
                    from.setHours(0, 0, 0, 0);
                    where.vcrmcConstitutionDate.gte = from;
                }
            }
            if (filters.endDate) {
                const to = new Date(filters.endDate);
                if (!isNaN(to)) {
                    to.setHours(23, 59, 59, 999);
                    where.vcrmcConstitutionDate.lte = to;
                }
            }
        }
    }

    const rows = await prisma.nicraVcrmc.findMany({
        where,
        include: { kvk: { select: { kvkName: true, state: { select: { stateName: true } } } } },
        orderBy: [{ vcrmcConstitutionDate: 'asc' }, { nicraVcrmcId: 'asc' }],
    });

    return rows.map(r => ({
        stateName: r.kvk?.state?.stateName || '',
        kvkName: r.kvk?.kvkName || '',
        villageName: r.villageName || '',
        vcrmcConstitutionDate: r.vcrmcConstitutionDate,
        membersMale: Number(r.membersMale || 0),
        membersFemale: Number(r.membersFemale || 0),
        membersTotal: Number((r.membersMale || 0) + (r.membersFemale || 0)),
        meetingsOrganized: Number(r.meetingsOrganized || 0),
        dateOfMeeting: r.dateOfMeeting,
        nameOfSecretary: r.nameOfSecretary || '',
        nameOfPresident: r.nameOfPresident || '',
        majorDecisionTaken: r.majorDecisionTaken || '',
    }));
}

async function getNicraSoilHealthData(kvkId, filters = {}) {
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
                    from.setHours(0,0,0,0);
                    where.startDate.gte = from;
                }
            }
            if (filters.endDate) {
                const to = new Date(filters.endDate);
                if (!isNaN(to)) {
                    to.setHours(23,59,59,999);
                    where.startDate.lte = to;
                }
            }
        }
    }

    const rows = await prisma.nicraSoilHealthCard.findMany({
        where,
        include: { kvk: { select: { kvkName: true, state: { select: { stateName: true } } } } },
        orderBy: [{ startDate: 'asc' }, { nicraSoilHealthCardId: 'asc' }],
    });

    return rows.map(r => {
        const genM = Number(r.generalM || 0), genF = Number(r.generalF || 0);
        const obcM = Number(r.obcM || 0), obcF = Number(r.obcF || 0);
        const scM = Number(r.scM || 0), scF = Number(r.scF || 0);
        const stM = Number(r.stM || 0), stF = Number(r.stF || 0);
        const genT = genM + genF, obcT = obcM + obcF, scT = scM + scF, stT = stM + stF;
        const totM = genM + obcM + scM + stM;
        const totF = genF + obcF + scF + stF;
        return {
            stateName: r.kvk?.state?.stateName || '',
            kvkName: r.kvk?.kvkName || '',
            noOfSoilSamplesCollected: Number(r.noOfSoilSamplesCollected || 0),
            noOfSamplesAnalysed: Number(r.noOfSamplesAnalysed || 0),
            shcIssued: Number(r.shcIssued || 0),
            genM, genF, genT,
            obcM, obcF, obcT,
            scM, scF, scT,
            stM, stF, stT,
            totM, totF, totT: totM + totF,
        };
    });
}

module.exports = { getNicraBasicData, getNicraTrainingData, getNicraInterventionData, getNicraExtensionActivityData, getNicraFarmImplementData, getNicraVcrmcData, getNicraSoilHealthData };
