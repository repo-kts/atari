const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');

const nicraVcrmcRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraVcrmc.create({
            data: {
                kvkId,
                reportingYear: (() => {
                    const d = parseReportingYearDate(data.reportingYear);
                    ensureNotFutureDate(d);
                    return d;
                })(),
                villageName: data.villageName,
                constitutionDate: new Date(data.constitutionDate),
                meetingsOrganized: parseInt(data.meetingsOrganized || 0),
                meetingDate: new Date(data.meetingDate),
                nameOfSecretary: data.nameOfSecretary,
                nameOfPresident: data.nameOfPresident,
                majorDecisionTaken: data.majorDecisionTaken,
                maleMembers: parseInt(data.maleMembers || 0),
                femaleMembers: parseInt(data.femaleMembers || 0),
                photographs: data.photographs ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : '',
            }
        });
    },

    _mapResponse: (r) => {
        if (!r) return null;
        let photos = [];
        try {
            if (r.photographs) {
                photos = typeof r.photographs === 'string' ? JSON.parse(r.photographs) : r.photographs;
                if (!Array.isArray(photos)) photos = [photos];
            }
        } catch (e) {
            photos = r.photographs ? r.photographs.split(',').filter(Boolean) : [];
        }
        return {
            ...r,
            id: r.nicraVcrmcId,
            constitutionDate: r.constitutionDate && r.constitutionDate instanceof Date ? r.constitutionDate.toISOString().split('T')[0] : (r.constitutionDate || ''),
            meetingDate: r.meetingDate && r.meetingDate instanceof Date ? r.meetingDate.toISOString().split('T')[0] : (r.meetingDate || ''),
            photographs: photos
        };
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYearFrom || filters.reportingYearTo) {
            where.reportingYear = {};
            if (filters.reportingYearFrom) {
                const from = parseReportingYearDate(filters.reportingYearFrom);
                ensureNotFutureDate(from);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.reportingYearTo) {
                const to = parseReportingYearDate(filters.reportingYearTo);
                ensureNotFutureDate(to);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }

        const results = await prisma.nicraVcrmc.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            },
            orderBy: { nicraVcrmcId: 'desc' }
        });
        return results.map(r => nicraVcrmcRepository._mapResponse(r));
    },

    findById: async (id, user) => {
        const where = { nicraVcrmcId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const result = await prisma.nicraVcrmc.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
            }
        });
        return nicraVcrmcRepository._mapResponse(result);
    },

    update: async (id, data, user) => {
        const where = { nicraVcrmcId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraVcrmc.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.nicraVcrmc.update({
            where: { nicraVcrmcId: parseInt(id) },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                villageName: data.villageName !== undefined ? data.villageName : existing.villageName,
                constitutionDate: data.constitutionDate ? new Date(data.constitutionDate) : existing.constitutionDate,
                meetingsOrganized: data.meetingsOrganized !== undefined ? parseInt(data.meetingsOrganized) : existing.meetingsOrganized,
                meetingDate: data.meetingDate ? new Date(data.meetingDate) : existing.meetingDate,
                nameOfSecretary: data.nameOfSecretary !== undefined ? data.nameOfSecretary : existing.nameOfSecretary,
                nameOfPresident: data.nameOfPresident !== undefined ? data.nameOfPresident : existing.nameOfPresident,
                majorDecisionTaken: data.majorDecisionTaken !== undefined ? data.majorDecisionTaken : existing.majorDecisionTaken,
                maleMembers: data.maleMembers !== undefined ? parseInt(data.maleMembers) : existing.maleMembers,
                femaleMembers: data.femaleMembers !== undefined ? parseInt(data.femaleMembers) : existing.femaleMembers,
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : (existing.photographs || ''),
            }
        });
        return nicraVcrmcRepository._mapResponse(updated);
    },

    delete: async (id, user) => {
        const where = { nicraVcrmcId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraVcrmc.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraVcrmc.delete({
            where: { nicraVcrmcId: parseInt(id) }
        });
    }
};

module.exports = nicraVcrmcRepository;
