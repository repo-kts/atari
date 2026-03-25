const prisma = require('../../config/prisma.js');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
} = require('../../utils/repositoryHelpers');

const _mapResponse = (r) => {
    if (!r) return null;
    return { ...r, id: r.kisanSarathiId };
};

const kisanSarathiRepository = {
    create: async (data, user) => {
        try {
            let kvkId = (user && user.kvkId) ? parseInteger(user.kvkId, 'user.kvkId', false) :
                (data.kvkId ? parseInteger(data.kvkId, 'kvkId', false) : null);

            if (!kvkId) throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            await validateKvkExists(kvkId);

            const result = await prisma.kisanSarathi.create({
                data: {
                    kvkId,
                    reportingYearId: data.reportingYearId ? parseInteger(data.reportingYearId, 'reportingYearId') : null,
                    noOfFarmersRegisteredOnKspPortal: parseInteger(data.noOfFarmersRegisteredOnKspPortal || 0, 'noOfFarmersRegisteredOnKspPortal'),
                    phoneCallAddressed: parseInteger(data.phoneCallAddressed || 0, 'phoneCallAddressed'),
                    phoneCallAnswered: parseInteger(data.phoneCallAnswered || 0, 'phoneCallAnswered'),
                    crop: String(data.crop || ''),
                    weather: String(data.weather || ''),
                    awareness: String(data.awareness || ''),
                    livestock: String(data.livestock || ''),
                    marketing: String(data.marketing || ''),
                    otherEnterprises: String(data.otherEnterprises || ''),
                },
                include: { kvk: { select: { kvkName: true } }, reportingYear: true }
            });
            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Failed to create Kisan Sarathi record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        } else if (filters.kvkId) {
            where.kvkId = parseInteger(filters.kvkId, 'kvkId', false);
        }

        const records = await prisma.kisanSarathi.findMany({
            where,
            include: { kvk: { select: { kvkName: true } }, reportingYear: true },
            orderBy: { kisanSarathiId: 'desc' },
        });
        return records.map(_mapResponse);
    },

    findById: async (id, user) => {
        const kisanSarathiId = parseInteger(id, 'id', false);
        const where = { kisanSarathiId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const record = await prisma.kisanSarathi.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } }, reportingYear: true },
        });
        if (!record) throw new RepositoryError('Kisan Sarathi record not found', 'NOT_FOUND', 404);
        return _mapResponse(record);
    },

    update: async (id, data, user) => {
        const kisanSarathiId = parseInteger(id, 'id', false);
        const where = { kisanSarathiId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const existing = await prisma.kisanSarathi.findFirst({ where });
        if (!existing) throw new RepositoryError('Kisan Sarathi record not found', 'NOT_FOUND', 404);

        const result = await prisma.kisanSarathi.update({
            where: { kisanSarathiId },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? parseInteger(data.reportingYearId, 'reportingYearId') : existing.reportingYearId,
                noOfFarmersRegisteredOnKspPortal: data.noOfFarmersRegisteredOnKspPortal !== undefined ? parseInteger(data.noOfFarmersRegisteredOnKspPortal, 'noOfFarmersRegisteredOnKspPortal') : existing.noOfFarmersRegisteredOnKspPortal,
                phoneCallAddressed: data.phoneCallAddressed !== undefined ? parseInteger(data.phoneCallAddressed, 'phoneCallAddressed') : existing.phoneCallAddressed,
                phoneCallAnswered: data.phoneCallAnswered !== undefined ? parseInteger(data.phoneCallAnswered, 'phoneCallAnswered') : existing.phoneCallAnswered,
                crop: data.crop !== undefined ? String(data.crop) : existing.crop,
                weather: data.weather !== undefined ? String(data.weather) : existing.weather,
                awareness: data.awareness !== undefined ? String(data.awareness) : existing.awareness,
                livestock: data.livestock !== undefined ? String(data.livestock) : existing.livestock,
                marketing: data.marketing !== undefined ? String(data.marketing) : existing.marketing,
                otherEnterprises: data.otherEnterprises !== undefined ? String(data.otherEnterprises) : existing.otherEnterprises,
            },
            include: { kvk: { select: { kvkName: true } }, reportingYear: true }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const kisanSarathiId = parseInteger(id, 'id', false);
        const where = { kisanSarathiId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }
        const existing = await prisma.kisanSarathi.findFirst({ where });
        if (!existing) throw new RepositoryError('Kisan Sarathi record not found', 'NOT_FOUND', 404);

        await prisma.kisanSarathi.delete({ where: { kisanSarathiId } });
        return { success: true, message: 'Deleted successfully' };
    }
};

module.exports = kisanSarathiRepository;
