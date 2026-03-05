const prisma = require('../../config/prisma.js');

/**
 * Report Repository
 * Data access layer for report generation
 */
class ReportRepository {
    /**
     * Get KVK basic information with all relations
     */
    async getKvkBasicInfo(kvkId) {
        return await prisma.kvk.findUnique({
            where: { kvkId },
            include: {
                zone: {
                    select: { zoneId: true, zoneName: true },
                },
                state: {
                    select: { stateId: true, stateName: true },
                },
                district: {
                    select: { districtId: true, districtName: true },
                },
                org: {
                    select: { orgId: true, orgName: true },
                },
                university: {
                    select: { universityId: true, universityName: true },
                },
            },
        });
    }

    /**
     * Get KVK bank accounts
     */
    async getKvkBankAccounts(kvkId, filters = {}) {
        const where = { kvkId };

        // Apply date filters on created_at
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.createdAt = dateFilter;
            }
        }

        // Apply year filter - convert to date range on created_at
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.createdAt = {
                gte: yearStart,
                lte: yearEnd,
            };
        }

        return await prisma.kvkBankAccount.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Get KVK employees (active staff)
     */
    async getKvkEmployees(kvkId, filters = {}) {
        const where = {
            kvkId,
            transferStatus: 'ACTIVE',
        };

        // Apply date filters on created_at
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.createdAt = dateFilter;
            }
        }

        // Apply year filter - convert to date range on created_at
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.createdAt = {
                gte: yearStart,
                lte: yearEnd,
            };
        }

        return await prisma.kvkStaff.findMany({
            where,
            include: {
                sanctionedPost: {
                    select: { sanctionedPostId: true, postName: true },
                },
                discipline: {
                    select: { disciplineId: true, disciplineName: true },
                },
                payLevel: {
                    select: { payLevelId: true, levelName: true },
                },
                staffCategory: {
                    select: { staffCategoryId: true, categoryName: true },
                },
            },
            orderBy: { staffName: 'asc' },
        });
    }

    /**
     * Get KVK staff transferred (where sourceKvkIds contains kvkId)
     */
    async getKvkStaffTransferred(kvkId, filters = {}) {
        const where = {
            transferStatus: 'TRANSFERRED',
        };

        // Apply date filters on created_at
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.createdAt = dateFilter;
            }
        }

        // Apply year filter - convert to date range on created_at
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.createdAt = {
                gte: yearStart,
                lte: yearEnd,
            };
        }

        // Get all transferred staff (we'll filter by sourceKvkIds in memory since it's JSON)
        const allTransferred = await prisma.kvkStaff.findMany({
            where,
            include: {
                kvk: {
                    select: { kvkId: true, kvkName: true },
                },
                originalKvk: {
                    select: { kvkId: true, kvkName: true },
                },
            },
            orderBy: { staffName: 'asc' },
        });

        // Filter by sourceKvkIds containing kvkId or originalKvkId matching
        return allTransferred.filter(staff => {
            // Include if original KVK matches
            if (staff.originalKvkId === kvkId) return true;
            
            // Check if kvkId is in sourceKvkIds array
            if (!staff.sourceKvkIds) return false;
            const sourceIds = Array.isArray(staff.sourceKvkIds)
                ? staff.sourceKvkIds
                : (typeof staff.sourceKvkIds === 'string' ? JSON.parse(staff.sourceKvkIds) : []);
            return Array.isArray(sourceIds) && sourceIds.includes(kvkId);
        });
    }

    /**
     * Get KVK infrastructure
     */
    async getKvkInfrastructure(kvkId, filters = {}) {
        const where = { kvkId };

        // Apply date filters on created_at
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.createdAt = dateFilter;
            }
        }

        // Apply year filter - convert to date range on created_at
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.createdAt = {
                gte: yearStart,
                lte: yearEnd,
            };
        }

        return await prisma.kvkInfrastructure.findMany({
            where,
            include: {
                infraMaster: {
                    select: { infraMasterId: true, name: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Get KVK vehicles
     */
    async getKvkVehicles(kvkId, filters = {}) {
        const where = { kvkId };

        // Apply date filters on created_at
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.createdAt = dateFilter;
            }
        }

        // Apply year filter - convert to date range on created_at
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.createdAt = {
                gte: yearStart,
                lte: yearEnd,
            };
        }

        return await prisma.kvkVehicle.findMany({
            where,
            orderBy: [
                { yearOfPurchase: 'desc' },
                { vehicleName: 'asc' },
            ],
        });
    }

    /**
     * Get KVK equipments
     */
    async getKvkEquipments(kvkId, filters = {}) {
        const where = { kvkId };

        // Apply date filters on created_at
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.createdAt = dateFilter;
            }
        }

        // Apply year filter - convert to date range on created_at
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.createdAt = {
                gte: yearStart,
                lte: yearEnd,
            };
        }

        return await prisma.kvkEquipment.findMany({
            where,
            orderBy: [
                { yearOfPurchase: 'desc' },
                { equipmentName: 'asc' },
            ],
        });
    }

    /**
     * Get KVK farm implements
     */
    async getKvkFarmImplements(kvkId, filters = {}) {
        const where = { kvkId };

        // Apply date filters on created_at
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.createdAt = dateFilter;
            }
        }

        // Apply year filter - convert to date range on created_at
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.createdAt = {
                gte: yearStart,
                lte: yearEnd,
            };
        }

        return await prisma.kvkFarmImplement.findMany({
            where,
            orderBy: [
                { yearOfPurchase: 'desc' },
                { implementName: 'asc' },
            ],
        });
    }
}

module.exports = new ReportRepository(); 
