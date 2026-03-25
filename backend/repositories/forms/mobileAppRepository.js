const prisma = require('../../config/prisma.js');
const { Prisma } = require('@prisma/client');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
} = require('../../utils/repositoryHelpers');

const _mapResponse = (r) => {
    if (!r) return null;
    return {
        ...r,
        id: r.mobileAppId,
    };
};

const mobileAppRepository = {
    create: async (data, user) => {
        try {
            let kvkId = (user && user.kvkId) ? parseInteger(user.kvkId, 'user.kvkId', false) :
                (data.kvkId ? parseInteger(data.kvkId, 'kvkId', false) : null);

            if (!kvkId) throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            await validateKvkExists(kvkId);

            const result = await prisma.mobileApp.create({
                data: {
                    kvkId,
                    reportingYearId: data.reportingYearId ? parseInteger(data.reportingYearId, 'reportingYearId') : null,
                    nameOfApp: String(data.nameOfApp || ''),
                    meantFor: String(data.meantFor || ''),
                    numberOfAppsDeveloped: parseInteger(data.numberOfAppsDeveloped || 0, 'numberOfAppsDeveloped'),
                    languageOfApp: String(data.languageOfApp || ''),
                    numberOfTimesDownloaded: parseInteger(data.numberOfTimesDownloaded || 0, 'numberOfTimesDownloaded'),
                },
                include: { kvk: { select: { kvkName: true } }, reportingYear: true }
            });
            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Failed to create Mobile App record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        } else if (filters.kvkId) {
            where.kvkId = parseInteger(filters.kvkId, 'kvkId', false);
        }

        const records = await prisma.mobileApp.findMany({
            where,
            include: { kvk: { select: { kvkName: true } }, reportingYear: true },
            orderBy: { mobileAppId: 'desc' },
        });
        return records.map(_mapResponse);
    },

    findById: async (id, user) => {
        const mobileAppId = parseInteger(id, 'id', false);
        const where = { mobileAppId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const record = await prisma.mobileApp.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } }, reportingYear: true },
        });
        if (!record) throw new RepositoryError('Mobile App record not found', 'NOT_FOUND', 404);
        return _mapResponse(record);
    },

    update: async (id, data, user) => {
        const mobileAppId = parseInteger(id, 'id', false);
        const where = { mobileAppId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const existing = await prisma.mobileApp.findFirst({ where });
        if (!existing) throw new RepositoryError('Mobile App record not found', 'NOT_FOUND', 404);

        const result = await prisma.mobileApp.update({
            where: { mobileAppId },
            data: {
                reportingYearId: data.reportingYearId !== undefined ? parseInteger(data.reportingYearId, 'reportingYearId') : existing.reportingYearId,
                nameOfApp: data.nameOfApp !== undefined ? String(data.nameOfApp) : existing.nameOfApp,
                meantFor: data.meantFor !== undefined ? String(data.meantFor) : existing.meantFor,
                numberOfAppsDeveloped: data.numberOfAppsDeveloped !== undefined ? parseInteger(data.numberOfAppsDeveloped, 'numberOfAppsDeveloped') : existing.numberOfAppsDeveloped,
                languageOfApp: data.languageOfApp !== undefined ? String(data.languageOfApp) : existing.languageOfApp,
                numberOfTimesDownloaded: data.numberOfTimesDownloaded !== undefined ? parseInteger(data.numberOfTimesDownloaded, 'numberOfTimesDownloaded') : existing.numberOfTimesDownloaded,
            },
            include: { kvk: { select: { kvkName: true } }, reportingYear: true }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const mobileAppId = parseInteger(id, 'id', false);
        const where = { mobileAppId };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }
        const existing = await prisma.mobileApp.findFirst({ where });
        if (!existing) throw new RepositoryError('Mobile App record not found', 'NOT_FOUND', 404);

        await prisma.mobileApp.delete({ where: { mobileAppId } });
        return { success: true, message: 'Deleted successfully' };
    }
};

module.exports = mobileAppRepository;
