const prisma = require('../../config/prisma.js');
const {
    RepositoryError,
    parseInteger,
    validateKvkExists,
} = require('../../utils/repositoryHelpers.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const _mapResponse = (r) => {
    if (!r) return null;
    return { ...r, id: r.msgDetailsId, yearName: formatReportingYear(r.reportingYear) };
};

const msgDetailsRepository = {
    create: async (data, user) => {
        try {
            let kvkId = (user && user.kvkId) ? parseInteger(user.kvkId, 'user.kvkId', false) :
                (data.kvkId ? parseInteger(data.kvkId, 'kvkId', false) : null);

            if (!kvkId) throw new RepositoryError('Valid kvkId is required', 'VALIDATION_ERROR', 400);
            await validateKvkExists(kvkId);

            const result = await prisma.msgDetails.create({
                data: {
                    kvkId,
                    reportingYear: (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })(),
                    textNoOfFarmersCovered: parseInteger(data.textNoOfFarmersCovered || 0, 'textNoOfFarmersCovered'),
                    textNoOfAdvisoriesSent: parseInteger(data.textNoOfAdvisoriesSent || 0, 'textNoOfAdvisoriesSent'),
                    textCrop: String(data.textCrop || ''),
                    textLivestock: String(data.textLivestock || ''),
                    textWeather: String(data.textWeather || ''),
                    textMarketing: String(data.textMarketing || ''),
                    textAwareness: String(data.textAwareness || ''),
                    textOtherEnterprises: String(data.textOtherEnterprises || ''),
                    whatsappNoOfFarmersCovered: parseInteger(data.whatsappNoOfFarmersCovered || 0, 'whatsappNoOfFarmersCovered'),
                    whatsappNoOfAdvisoriesSent: parseInteger(data.whatsappNoOfAdvisoriesSent || 0, 'whatsappNoOfAdvisoriesSent'),
                    whatsappCrop: String(data.whatsappCrop || ''),
                    whatsappLivestock: String(data.whatsappLivestock || ''),
                    whatsappWeather: String(data.whatsappWeather || ''),
                    whatsappMarketing: String(data.whatsappMarketing || ''),
                    whatsappAwareness: String(data.whatsappAwareness || ''),
                    whatsappOtherEnterprises: String(data.whatsappOtherEnterprises || ''),
                    weatherNoOfFarmersCovered: parseInteger(data.weatherNoOfFarmersCovered || 0, 'weatherNoOfFarmersCovered'),
                    weatherNoOfAdvisoriesSent: parseInteger(data.weatherNoOfAdvisoriesSent || 0, 'weatherNoOfAdvisoriesSent'),
                    weatherCrop: String(data.weatherCrop || ''),
                    weatherLivestock: String(data.weatherLivestock || ''),
                    weatherWeather: String(data.weatherWeather || ''),
                    weatherMarketing: String(data.weatherMarketing || ''),
                    weatherAwareness: String(data.weatherAwareness || ''),
                    weatherOtherEnterprises: String(data.weatherOtherEnterprises || ''),
                    socialNoOfFarmersCovered: parseInteger(data.socialNoOfFarmersCovered || 0, 'socialNoOfFarmersCovered'),
                    socialNoOfAdvisoriesSent: parseInteger(data.socialNoOfAdvisoriesSent || 0, 'socialNoOfAdvisoriesSent'),
                    socialCrop: String(data.socialCrop || ''),
                    socialLivestock: String(data.socialLivestock || ''),
                    socialWeather: String(data.socialWeather || ''),
                    socialMarketing: String(data.socialMarketing || ''),
                    socialAwareness: String(data.socialAwareness || ''),
                    socialOtherEnterprises: String(data.socialOtherEnterprises || ''),
                },
                include: { kvk: { select: { kvkName: true } } }
            });
            return _mapResponse(result);
        } catch (error) {
            if (error instanceof RepositoryError) throw error;
            throw new RepositoryError(`Failed to create Message Details record: ${error.message}`, 'CREATE_ERROR', 500);
        }
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        } else if (filters.kvkId) {
            where.kvkId = parseInteger(filters.kvkId, 'kvkId', false);
        }

        const records = await prisma.msgDetails.findMany({
            where,
            include: { kvk: { select: { kvkName: true } } },
            orderBy: { msgDetailsId: 'desc' },
        });
        return records.map(_mapResponse);
    },

    findById: async (id, user) => {
        const msgDetailsId = parseInteger(id, 'id', false);
        const where = { msgDetailsId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const record = await prisma.msgDetails.findFirst({
            where,
            include: { kvk: { select: { kvkName: true } } },
        });
        if (!record) throw new RepositoryError('Message Details record not found', 'NOT_FOUND', 404);
        return _mapResponse(record);
    },

    update: async (id, data, user) => {
        const msgDetailsId = parseInteger(id, 'id', false);
        const where = { msgDetailsId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }

        const existing = await prisma.msgDetails.findFirst({ where });
        if (!existing) throw new RepositoryError('Message Details record not found', 'NOT_FOUND', 404);

        const result = await prisma.msgDetails.update({
            where: { msgDetailsId },
            data: {
                reportingYear: data.reportingYear !== undefined
                    ? (() => {
                        const d = parseReportingYearDate(data.reportingYear);
                        ensureNotFutureDate(d);
                        return d;
                    })()
                    : existing.reportingYear,
                // Text
                textNoOfFarmersCovered: data.textNoOfFarmersCovered !== undefined ? parseInteger(data.textNoOfFarmersCovered) : existing.textNoOfFarmersCovered,
                textNoOfAdvisoriesSent: data.textNoOfAdvisoriesSent !== undefined ? parseInteger(data.textNoOfAdvisoriesSent) : existing.textNoOfAdvisoriesSent,
                textCrop: data.textCrop !== undefined ? String(data.textCrop) : existing.textCrop,
                textLivestock: data.textLivestock !== undefined ? String(data.textLivestock) : existing.textLivestock,
                textWeather: data.textWeather !== undefined ? String(data.textWeather) : existing.textWeather,
                textMarketing: data.textMarketing !== undefined ? String(data.textMarketing) : existing.textMarketing,
                textAwareness: data.textAwareness !== undefined ? String(data.textAwareness) : existing.textAwareness,
                textOtherEnterprises: data.textOtherEnterprises !== undefined ? String(data.textOtherEnterprises) : existing.textOtherEnterprises,
                // WhatsApp
                whatsappNoOfFarmersCovered: data.whatsappNoOfFarmersCovered !== undefined ? parseInteger(data.whatsappNoOfFarmersCovered) : existing.whatsappNoOfFarmersCovered,
                whatsappNoOfAdvisoriesSent: data.whatsappNoOfAdvisoriesSent !== undefined ? parseInteger(data.whatsappNoOfAdvisoriesSent) : existing.whatsappNoOfAdvisoriesSent,
                whatsappCrop: data.whatsappCrop !== undefined ? String(data.whatsappCrop) : existing.whatsappCrop,
                whatsappLivestock: data.whatsappLivestock !== undefined ? String(data.whatsappLivestock) : existing.whatsappLivestock,
                whatsappWeather: data.whatsappWeather !== undefined ? String(data.whatsappWeather) : existing.whatsappWeather,
                whatsappMarketing: data.whatsappMarketing !== undefined ? String(data.whatsappMarketing) : existing.whatsappMarketing,
                whatsappAwareness: data.whatsappAwareness !== undefined ? String(data.whatsappAwareness) : existing.whatsappAwareness,
                whatsappOtherEnterprises: data.whatsappOtherEnterprises !== undefined ? String(data.whatsappOtherEnterprises) : existing.whatsappOtherEnterprises,
                // Weather
                weatherNoOfFarmersCovered: data.weatherNoOfFarmersCovered !== undefined ? parseInteger(data.weatherNoOfFarmersCovered) : existing.weatherNoOfFarmersCovered,
                weatherNoOfAdvisoriesSent: data.weatherNoOfAdvisoriesSent !== undefined ? parseInteger(data.weatherNoOfAdvisoriesSent) : existing.weatherNoOfAdvisoriesSent,
                weatherCrop: data.weatherCrop !== undefined ? String(data.weatherCrop) : existing.weatherCrop,
                weatherLivestock: data.weatherLivestock !== undefined ? String(data.weatherLivestock) : existing.weatherLivestock,
                weatherWeather: data.weatherWeather !== undefined ? String(data.weatherWeather) : existing.weatherWeather,
                weatherMarketing: data.weatherMarketing !== undefined ? String(data.weatherMarketing) : existing.weatherMarketing,
                weatherAwareness: data.weatherAwareness !== undefined ? String(data.weatherAwareness) : existing.weatherAwareness,
                weatherOtherEnterprises: data.weatherOtherEnterprises !== undefined ? String(data.weatherOtherEnterprises) : existing.weatherOtherEnterprises,
                // Social
                socialNoOfFarmersCovered: data.socialNoOfFarmersCovered !== undefined ? parseInteger(data.socialNoOfFarmersCovered) : existing.socialNoOfFarmersCovered,
                socialNoOfAdvisoriesSent: data.socialNoOfAdvisoriesSent !== undefined ? parseInteger(data.socialNoOfAdvisoriesSent) : existing.socialNoOfAdvisoriesSent,
                socialCrop: data.socialCrop !== undefined ? String(data.socialCrop) : existing.socialCrop,
                socialLivestock: data.socialLivestock !== undefined ? String(data.socialLivestock) : existing.socialLivestock,
                socialWeather: data.socialWeather !== undefined ? String(data.socialWeather) : existing.socialWeather,
                socialMarketing: data.socialMarketing !== undefined ? String(data.socialMarketing) : existing.socialMarketing,
                socialAwareness: data.socialAwareness !== undefined ? String(data.socialAwareness) : existing.socialAwareness,
                socialOtherEnterprises: data.socialOtherEnterprises !== undefined ? String(data.socialOtherEnterprises) : existing.socialOtherEnterprises,
            },
            include: { kvk: { select: { kvkName: true } } }
        });
        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const msgDetailsId = parseInteger(id, 'id', false);
        const where = { msgDetailsId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInteger(user.kvkId, 'user.kvkId', false);
        }
        const existing = await prisma.msgDetails.findFirst({ where });
        if (!existing) throw new RepositoryError('Message Details record not found', 'NOT_FOUND', 404);

        await prisma.msgDetails.delete({ where: { msgDetailsId } });
        return { success: true, message: 'Deleted successfully' };
    }
};

module.exports = msgDetailsRepository;
