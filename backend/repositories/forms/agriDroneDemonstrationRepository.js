const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

function isKvkUser(user) {
    return user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
}

function safeInt(v, def = null) {
    if (v === undefined || v === null || v === '') return def;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : def;
}

function safeFloat(v, def = null) {
    if (v === undefined || v === null || v === '') return def;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : def;
}

function safeDate(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
}

const agriDroneDemonstrationRepository = {
    create: async (data, user) => {
        const agriDroneId = safeInt(data.agriDroneId || data.agriDroneIntroId, null);
        if (!agriDroneId) throw new Error('agriDroneId is required (select Intro/PIC)');

        // Ensure the selected intro belongs to the kvk scope (if kvk user)
        const introWhere = { agriDroneId };
        if (isKvkUser(user)) introWhere.kvkId = safeInt(user.kvkId, null);
        const intro = await prisma.kvkAgriDrone.findFirst({ where: introWhere, select: { agriDroneId: true, kvkId: true } });
        if (!intro) throw new Error('Invalid intro selected or unauthorized');

        const kvkId = intro.kvkId;

        const record = await prisma.kvkAgriDroneDemonstration.create({
            data: {
                kvkId,
                agriDroneId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                demonstrationsOnId: safeInt(data.demonstrationsOnId, null),
                districtId: safeInt(data.districtId, null),
                dateOfDemonstration: safeDate(data.dateOfDemons || data.dateOfDemonstration),
                placeOfDemonstration: (data.placeOfDemons || data.placeOfDemonstration || null),
                cropName: (data.cropName || null),
                noOfDemos: safeInt(data.noOfDemos, null),
                areaHa: safeFloat(data.areaCoveredUnderDemos || data.areaHa, null),
                noOfFarmers: safeInt(data.noOfFarmers || data.noOfFarmersParticipated, null),
                generalM: safeInt(data.generalM, null),
                generalF: safeInt(data.generalF, null),
                obcM: safeInt(data.obcM, null),
                obcF: safeInt(data.obcF, null),
                scM: safeInt(data.scM, null),
                scF: safeInt(data.scF, null),
                stM: safeInt(data.stM, null),
                stF: safeInt(data.stF, null),
            },
            include: {
                kvk: { select: { kvkName: true } },
                agriDrone: { select: { agriDroneId: true, projectImplementingCentre: true } },
                district: { select: { districtId: true, districtName: true } },
                demonstrationsOn: { select: { agriDroneDemonstrationsOnId: true, demonstrationsOnName: true } },
            },
        });

        return agriDroneDemonstrationRepository._mapResponse(record);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId, null);
        else if (filters.kvkId) where.kvkId = safeInt(filters.kvkId, null);

        const records = await prisma.kvkAgriDroneDemonstration.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                agriDrone: { select: { agriDroneId: true, projectImplementingCentre: true } },
                district: { select: { districtId: true, districtName: true } },
                demonstrationsOn: { select: { agriDroneDemonstrationsOnId: true, demonstrationsOnName: true } },
            },
            orderBy: { agriDroneDemonstrationId: 'desc' },
        });
        return records.map(r => agriDroneDemonstrationRepository._mapResponse(r));
    },

    findById: async (id, user) => {
        const where = { agriDroneDemonstrationId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId, null);

        const record = await prisma.kvkAgriDroneDemonstration.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                agriDrone: { select: { agriDroneId: true, projectImplementingCentre: true } },
                district: { select: { districtId: true, districtName: true } },
                demonstrationsOn: { select: { agriDroneDemonstrationsOnId: true, demonstrationsOnName: true } },
            },
        });
        return agriDroneDemonstrationRepository._mapResponse(record);
    },

    update: async (id, data, user) => {
        const where = { agriDroneDemonstrationId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId, null);

        const existing = await prisma.kvkAgriDroneDemonstration.findFirst({ where, select: { agriDroneDemonstrationId: true, kvkId: true, agriDroneId: true } });
        if (!existing) throw new Error('Record not found or unauthorized');

        // If intro selection is changed, validate ownership
        const nextAgriDroneId = safeInt(data.agriDroneId || data.agriDroneIntroId, null);
        if (nextAgriDroneId) {
            const introWhere = { agriDroneId: nextAgriDroneId };
            if (isKvkUser(user)) introWhere.kvkId = safeInt(user.kvkId, null);
            const intro = await prisma.kvkAgriDrone.findFirst({ where: introWhere, select: { agriDroneId: true, kvkId: true } });
            if (!intro) throw new Error('Invalid intro selected or unauthorized');
        }

        const updated = await prisma.kvkAgriDroneDemonstration.update({
            where: { agriDroneDemonstrationId: existing.agriDroneDemonstrationId },
            data: {
                agriDroneId: nextAgriDroneId || undefined,
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : undefined,
                demonstrationsOnId: data.demonstrationsOnId !== undefined ? safeInt(data.demonstrationsOnId, null) : undefined,
                districtId: data.districtId !== undefined ? safeInt(data.districtId, null) : undefined,
                dateOfDemonstration: (data.dateOfDemons || data.dateOfDemonstration) !== undefined ? safeDate(data.dateOfDemons || data.dateOfDemonstration) : undefined,
                placeOfDemonstration: (data.placeOfDemons || data.placeOfDemonstration) !== undefined ? (data.placeOfDemons || data.placeOfDemonstration || null) : undefined,
                cropName: data.cropName !== undefined ? (data.cropName || null) : undefined,
                noOfDemos: data.noOfDemos !== undefined ? safeInt(data.noOfDemos, null) : undefined,
                areaHa: (data.areaCoveredUnderDemos || data.areaHa) !== undefined ? safeFloat(data.areaCoveredUnderDemos || data.areaHa, null) : undefined,
                noOfFarmers: (data.noOfFarmers || data.noOfFarmersParticipated) !== undefined ? safeInt(data.noOfFarmers || data.noOfFarmersParticipated, null) : undefined,
                generalM: data.generalM !== undefined ? safeInt(data.generalM, null) : undefined,
                generalF: data.generalF !== undefined ? safeInt(data.generalF, null) : undefined,
                obcM: data.obcM !== undefined ? safeInt(data.obcM, null) : undefined,
                obcF: data.obcF !== undefined ? safeInt(data.obcF, null) : undefined,
                scM: data.scM !== undefined ? safeInt(data.scM, null) : undefined,
                scF: data.scF !== undefined ? safeInt(data.scF, null) : undefined,
                stM: data.stM !== undefined ? safeInt(data.stM, null) : undefined,
                stF: data.stF !== undefined ? safeInt(data.stF, null) : undefined,
            },
            include: {
                kvk: { select: { kvkName: true } },
                agriDrone: { select: { agriDroneId: true, projectImplementingCentre: true } },
                district: { select: { districtId: true, districtName: true } },
                demonstrationsOn: { select: { agriDroneDemonstrationsOnId: true, demonstrationsOnName: true } },
            },
        });
        return agriDroneDemonstrationRepository._mapResponse(updated);
    },

    delete: async (id, user) => {
        const where = { agriDroneDemonstrationId: safeInt(id, 0) };
        if (isKvkUser(user)) where.kvkId = safeInt(user.kvkId, null);

        const result = await prisma.kvkAgriDroneDemonstration.deleteMany({ where });
        if (result.count === 0) throw new Error('Record not found or unauthorized');
        return { success: true };
    },

    _mapResponse: (r) => {
        if (!r) return null;
        return {
            ...r,
            id: r.agriDroneDemonstrationId,
            // Link back to intro
            agriDroneId: r.agriDroneId,
            projectImplementingCentre: r.agriDrone?.projectImplementingCentre,
            reportingYear: formatReportingYear(r.reportingYear),
            yearName: formatReportingYear(r.reportingYear),
            districtId: r.districtId,
            district: r.district?.districtName,
            demonstrationsOnId: r.demonstrationsOnId,
            demonstrationsOnName: r.demonstrationsOn?.demonstrationsOnName,
            dateOfDemons: r.dateOfDemonstration ? r.dateOfDemonstration.toISOString().split('T')[0] : undefined,
            placeOfDemons: r.placeOfDemonstration,
            noOfDemos: r.noOfDemos,
            areaCoveredUnderDemos: r.areaHa,
            noOfFarmers: r.noOfFarmers,
        };
    },
};

module.exports = agriDroneDemonstrationRepository;

