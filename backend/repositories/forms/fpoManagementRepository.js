const prisma = require('../../config/prisma.js');

const fpoManagementRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);

        const result = await prisma.fpoManagement.create({
            data: {
                kvkId,
                reportingYear: parseInt(data.yearId ?? data.reportingYear) || new Date().getFullYear(),
                fpoName: data.fpoName || '',
                address: data.fpoAddress ?? data.address ?? '',
                registrationNumber: data.registrationNo ?? data.registrationNumber ?? '',
                registrationDate: (() => {
                    const dateVal = data.registrationDate && typeof data.registrationDate === 'object' && data.registrationDate.value
                        ? data.registrationDate.value
                        : data.registrationDate;
                    if (!dateVal) return new Date();
                    const parsedDate = new Date(dateVal);
                    if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() > 2100 || parsedDate.getFullYear() < 1900) {
                        return new Date();
                    }
                    return parsedDate;
                })(),
                proposedActivity: data.proposedActivity || '',
                commodityIdentified: data.commodityIdentified || '',
                totalBomMembers: parseInt(data.bomMembersCount ?? data.totalBomMembers) || 0,
                totalFarmersAttached: parseInt(data.farmersAttachedCount ?? data.totalFarmersAttached) || 0,
                financialPositionLakh: parseFloat(data.financialPosition ?? data.financialPositionLakh) || 0,
                successIndicator: data.successIndicator || '',
            },
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYear) {
            where.reportingYear = parseInt(filters.reportingYear);
        }

        const results = await prisma.fpoManagement.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { fpoManagementId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.fpoManagement.findUnique({
            where: { fpoManagementId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const updateData = {};

        if (data.yearId !== undefined || data.reportingYear !== undefined) updateData.reportingYear = parseInt(data.yearId ?? data.reportingYear);
        if (data.fpoName !== undefined) updateData.fpoName = data.fpoName || '';
        if (data.fpoAddress !== undefined || data.address !== undefined) updateData.address = data.fpoAddress ?? data.address ?? '';
        if (data.registrationNo !== undefined || data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNo ?? data.registrationNumber ?? '';
        if (data.registrationDate !== undefined) {
            const dateVal = data.registrationDate && typeof data.registrationDate === 'object' && data.registrationDate.value
                ? data.registrationDate.value
                : data.registrationDate;
            const parsedDate = new Date(dateVal);
            if (!isNaN(parsedDate.getTime())) {
                updateData.registrationDate = parsedDate;
            }
        }
        if (data.proposedActivity !== undefined) updateData.proposedActivity = data.proposedActivity || '';
        if (data.commodityIdentified !== undefined) updateData.commodityIdentified = data.commodityIdentified || '';
        if (data.bomMembersCount !== undefined || data.totalBomMembers !== undefined) updateData.totalBomMembers = parseInt(data.bomMembersCount ?? data.totalBomMembers);
        if (data.farmersAttachedCount !== undefined || data.totalFarmersAttached !== undefined) updateData.totalFarmersAttached = parseInt(data.farmersAttachedCount ?? data.totalFarmersAttached);
        if (data.financialPosition !== undefined || data.financialPositionLakh !== undefined) updateData.financialPositionLakh = parseFloat(data.financialPosition ?? data.financialPositionLakh);
        if (data.successIndicator !== undefined) updateData.successIndicator = data.successIndicator || '';

        const result = await prisma.fpoManagement.update({
            where: { fpoManagementId: parseInt(id) },
            data: updateData,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.fpoManagement.delete({
            where: { fpoManagementId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.fpoManagementId,
        kvkId: r.kvkId,
        yearId: r.reportingYear, // Frontend alias
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        reportingYear: r.reportingYear,
        fpoName: r.fpoName,
        address: r.address,
        fpoAddress: r.address, // Frontend alias
        registrationNumber: r.registrationNumber,
        registrationNo: r.registrationNumber, // Frontend alias
        registrationDate: r.registrationDate,
        proposedActivity: r.proposedActivity,
        commodityIdentified: r.commodityIdentified,
        totalBomMembers: r.totalBomMembers,
        bomMembersCount: r.totalBomMembers, // Frontend alias
        totalFarmersAttached: r.totalFarmersAttached,
        farmersAttachedCount: r.totalFarmersAttached, // Frontend alias
        financialPositionLakh: r.financialPositionLakh,
        financialPosition: r.financialPositionLakh, // Frontend alias
        successIndicator: r.successIndicator,
    };
}

module.exports = fpoManagementRepository;
