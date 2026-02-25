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
    async getKvkBankAccounts(kvkId) {
        return await prisma.kvkBankAccount.findMany({
            where: { kvkId },
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

        // Apply date filters
        if (filters.startDate || filters.endDate) {
            where.OR = [];
            if (filters.startDate || filters.endDate) {
                const dateFilter = {};
                if (filters.startDate) {
                    dateFilter.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    dateFilter.lte = new Date(filters.endDate);
                }
                if (Object.keys(dateFilter).length > 0) {
                    where.OR.push({ dateOfJoining: dateFilter });
                    where.OR.push({ dateOfBirth: dateFilter });
                }
            }
        }

        // Apply year filter
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            if (!where.OR) where.OR = [];
            where.OR.push({
                dateOfJoining: {
                    gte: yearStart,
                    lte: yearEnd,
                },
            });
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

        // Apply date filters
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.lastTransferDate = dateFilter;
            }
        }

        // Apply year filter
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.lastTransferDate = {
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

        // Apply date filters
        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) {
                dateFilter.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                dateFilter.lte = new Date(filters.endDate);
            }
            if (Object.keys(dateFilter).length > 0) {
                where.OR = [
                    { createdAt: dateFilter },
                    { updatedAt: dateFilter },
                ];
            }
        }

        // Apply year filter
        if (filters.year) {
            const yearStart = new Date(filters.year, 0, 1);
            const yearEnd = new Date(filters.year, 11, 31, 23, 59, 59);
            where.OR = [
                { createdAt: { gte: yearStart, lte: yearEnd } },
                { updatedAt: { gte: yearStart, lte: yearEnd } },
            ];
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

        // Apply date/year filters
        if (filters.startDate || filters.endDate || filters.year) {
            const yearFilter = {};
            if (filters.year) {
                yearFilter.yearOfPurchase = filters.year;
            } else if (filters.startDate || filters.endDate) {
                // Convert date range to year range
                if (filters.startDate) {
                    const startYear = new Date(filters.startDate).getFullYear();
                    yearFilter.yearOfPurchase = { gte: startYear };
                }
                if (filters.endDate) {
                    const endYear = new Date(filters.endDate).getFullYear();
                    if (yearFilter.yearOfPurchase) {
                        yearFilter.yearOfPurchase.lte = endYear;
                    } else {
                        yearFilter.yearOfPurchase = { lte: endYear };
                    }
                }
            }
            if (Object.keys(yearFilter).length > 0) {
                Object.assign(where, yearFilter);
            }
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

        // Apply date/year filters
        if (filters.startDate || filters.endDate || filters.year) {
            const yearFilter = {};
            if (filters.year) {
                yearFilter.yearOfPurchase = filters.year;
            } else if (filters.startDate || filters.endDate) {
                // Convert date range to year range
                if (filters.startDate) {
                    const startYear = new Date(filters.startDate).getFullYear();
                    yearFilter.yearOfPurchase = { gte: startYear };
                }
                if (filters.endDate) {
                    const endYear = new Date(filters.endDate).getFullYear();
                    if (yearFilter.yearOfPurchase) {
                        yearFilter.yearOfPurchase.lte = endYear;
                    } else {
                        yearFilter.yearOfPurchase = { lte: endYear };
                    }
                }
            }
            if (Object.keys(yearFilter).length > 0) {
                Object.assign(where, yearFilter);
            }
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

        // Apply date/year filters
        if (filters.startDate || filters.endDate || filters.year) {
            const yearFilter = {};
            if (filters.year) {
                yearFilter.yearOfPurchase = filters.year;
            } else if (filters.startDate || filters.endDate) {
                // Convert date range to year range
                if (filters.startDate) {
                    const startYear = new Date(filters.startDate).getFullYear();
                    yearFilter.yearOfPurchase = { gte: startYear };
                }
                if (filters.endDate) {
                    const endYear = new Date(filters.endDate).getFullYear();
                    if (yearFilter.yearOfPurchase) {
                        yearFilter.yearOfPurchase.lte = endYear;
                    } else {
                        yearFilter.yearOfPurchase = { lte: endYear };
                    }
                }
            }
            if (Object.keys(yearFilter).length > 0) {
                Object.assign(where, yearFilter);
            }
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
