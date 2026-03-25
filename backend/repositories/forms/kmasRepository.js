const prisma = require('../../config/prisma.js');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
} = require('../../utils/repositoryHelpers');

const _mapResponse = (r) => {
    if (!r) return null;
    return { ...r, id: r.kmasId };
};

const kmasRepository = {
    create: async (data, user) => {
        try {
            let kvkId = (user && user.kvkId) ? parseInteger(user.kvkId, 'user.kvkId', false) :
                (data.kvkId ? parseInteger(data.kvkId, 'kvkId', false) : null);

            if (!kvkId) throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            await validateKvkExists(kvkId);

            const result = await prisma.kmas.create({
                data: {
                    kvkId,
                    reportingYearId: data.reportingYearId ? parseInteger(data.reportingYearId, 'reportingYearId') : null,
                    noOfFarmersCovered: parseInteger(data.noOfFarmersCovered || 0, 'noOfFarmersCovered'),
                    noOfAdvisoriesSent: parseInteger(data.noOfAdvisoriesSent || 0, 'noOfAdvisoriesSent'),
                    crop: String(data.crop || ''),
                    livestock: String(data.livestock || ''),
                    weather: String(data.weather || ''),
                    marketing: String(data.marketing || ''),
                    awareness: String(data.awareness || ''),
                    otherEnterprises: String(data.otherEnterprises || ''),
                    anyOther: String(data.anyOther || ''),
                },
                include: { kvk: { select: { kvkName: true } }, reportingYear: true }
            });
            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Failed to create KMAS record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        } else if (filters.kvkId) {
            where.kvkId = parseInteger(filters.kvkId, 'kvkId', false);
        }

        const records = await prisma.kmas.findMany({
            where,
            include: { kvk: { select: { kvkName: true } }, reportingYear: true },
            orderBy: { kmasId: 'desc' },
        });
        return records.map(_mapResponse);
    },

    findById: async (id, user) => {
        const kmasId = parseInteger(id, 'id', false);
        const where = { kmasId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const record = await prisma.kmas.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } }, reportingYear: true },
        });
        if (!record) throw new RepositoryError('KMAS record not found', 'NOT_FOUND', 404);
        return _mapResponse(record);
    },

    update: async (id, data, user) => {
        const kmasId = parseInteger(id, 'id', false);
        const where = { kmasId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const existing = await prisma.kmas.findFirst({ where });
        if (!existing) throw new RepositoryError('KMAS record not found', 'NOT_FOUND', 404);

        const result = await prisma.kmas.update({
            where: { kmasId },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? parseInteger(data.reportingYearId, 'reportingYearId') : existing.reportingYearId,
                noOfFarmersCovered: data.noOfFarmersCovered !== undefined ? parseInteger(data.noOfFarmersCovered, 'noOfFarmersCovered') : existing.noOfFarmersCovered,
                noOfAdvisoriesSent: data.noOfAdvisoriesSent !== undefined ? parseInteger(data.noOfAdvisoriesSent, 'noOfAdvisoriesSent') : existing.noOfAdvisoriesSent,
                crop: data.crop !== undefined ? String(data.crop) : existing.crop,
                livestock: data.livestock !== undefined ? String(data.livestock) : existing.livestock,
                weather: data.weather !== undefined ? String(data.weather) : existing.weather,
                marketing: data.marketing !== undefined ? String(data.marketing) : existing.marketing,
                awareness: data.awareness !== undefined ? String(data.awareness) : existing.awareness,
                otherEnterprises: data.otherEnterprises !== undefined ? String(data.otherEnterprises) : existing.otherEnterprises,
                anyOther: data.anyOther !== undefined ? String(data.anyOther) : existing.anyOther,
            },
            include: { kvk: { select: { kvkName: true } }, reportingYear: true }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const kmasId = parseInteger(id, 'id', false);
        const where = { kmasId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }
        const existing = await prisma.kmas.findFirst({ where });
        if (!existing) throw new RepositoryError('KMAS record not found', 'NOT_FOUND', 404);

        await prisma.kmas.delete({ where: { kmasId } });
        return { success: true, message: 'Deleted successfully' };
    }
};

module.exports = kmasRepository;
