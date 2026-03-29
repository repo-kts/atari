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

    /**
     * Generic method to fetch form data
     */
    async getFormData(modelName, kvkId, filters = {}) {
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

        try {
            return await prisma[modelName].findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            console.error(`Error fetching data for model \${modelName}:`, error);
            return [];
        }
    }

    /**
     * Achievement Methods
     */
    async getAchievementsOft(kvkId, filters) { return this.getFormData('achievementsOft', kvkId, filters); }
    async getAchievementsFld(kvkId, filters) { return this.getFormData('achievementsFld', kvkId, filters); }
    async getAchievementsFldExtension(kvkId, filters) { return this.getFormData('achievementsFldExtension', kvkId, filters); }
    async getAchievementsFldTechnical(kvkId, filters) { return this.getFormData('achievementsFldTechnical', kvkId, filters); }
    async getAchievementsTrainings(kvkId, filters) { return this.getFormData('achievementsTrainings', kvkId, filters); }
    async getAchievementsExtension(kvkId, filters) { return this.getFormData('achievementsExtension', kvkId, filters); }
    async getAchievementsOtherExtension(kvkId, filters) { return this.getFormData('achievementsOtherExtension', kvkId, filters); }
    async getAchievementsTechWeek(kvkId, filters) { return this.getFormData('achievementsTechWeek', kvkId, filters); }
    async getAchievementsCelebrationDays(kvkId, filters) { return this.getFormData('achievementsCelebrationDays', kvkId, filters); }
    async getAchievementsProductionSupply(kvkId, filters) { return this.getFormData('achievementsProductionSupply', kvkId, filters); }
    async getAchievementsPublications(kvkId, filters) { return this.getFormData('achievementsPublications', kvkId, filters); }
    async getAchievementsSoilWater(kvkId, filters) { return this.getFormData('achievementsSoilWater', kvkId, filters); }
    async getAchievementsSoilAnalysis(kvkId, filters) { return this.getFormData('achievementsSoilAnalysis', kvkId, filters); }
    async getAchievementsWorldSoilDay(kvkId, filters) { return this.getFormData('achievementsWorldSoilDay', kvkId, filters); }
    async getAchievementsKvkAward(kvkId, filters) { return this.getFormData('achievementsKvkAward', kvkId, filters); }
    async getAchievementsScientistAward(kvkId, filters) { return this.getFormData('achievementsScientistAward', kvkId, filters); }
    async getAchievementsFarmerAward(kvkId, filters) { return this.getFormData('achievementsFarmerAward', kvkId, filters); }
    async getAchievementsHrd(kvkId, filters) { return this.getFormData('achievementsHrd', kvkId, filters); }

    /**
     * Project Methods
     */
    async getProjectNari(kvkId, filters) { return this.getFormData('projectNari', kvkId, filters); }
    async getProjectArya(kvkId, filters) { return this.getFormData('projectArya', kvkId, filters); }
    async getProjectNicra(kvkId, filters) { return this.getFormData('projectNicra', kvkId, filters); }
    async getProjectCfld(kvkId, filters) { return this.getFormData('projectCfld', kvkId, filters); }
    async getProjectCra(kvkId, filters) { return this.getFormData('projectCra', kvkId, filters); }
    async getProjectFpo(kvkId, filters) { return this.getFormData('projectFpo', kvkId, filters); }
    async getProjectCsisa(kvkId, filters) { return this.getFormData('projectCsisa', kvkId, filters); }
    async getProjectTspScsp(kvkId, filters) { return this.getFormData('projectTspScsp', kvkId, filters); }
    async getProjectNaturalFarming(kvkId, filters) { return this.getFormData('projectNaturalFarming', kvkId, filters); }
    async getProjectAgriDrone(kvkId, filters) { return this.getFormData('projectAgriDrone', kvkId, filters); }
    async getProjectSeedHub(kvkId, filters) { return this.getFormData('projectSeedHub', kvkId, filters); }
    async getProjectDrmr(kvkId, filters) { return this.getFormData('projectDrmr', kvkId, filters); }
    async getProjectOtherProgram(kvkId, filters) { return this.getFormData('projectOtherProgram', kvkId, filters); }

    /**
     * Performance Indicators
     */
    async getPerformanceScientific(kvkId, filters) { return this.getFormData('performanceScientific', kvkId, filters); }
    async getPerformanceTechnical(kvkId, filters) { return this.getFormData('performanceTechnical', kvkId, filters); }
    async getPerformanceImpactKvk(kvkId, filters) { return this.getFormData('performanceImpactKvk', kvkId, filters); }
    async getPerformanceImpactEnt(kvkId, filters) { return this.getFormData('performanceImpactEnt', kvkId, filters); }
    async getPerformanceImpactSuccess(kvkId, filters) { return this.getFormData('performanceImpactSuccess', kvkId, filters); }
    async getPerformanceDistrictLevel(kvkId, filters) { return this.getFormData('performanceDistrictLevel', kvkId, filters); }
    async getPerformanceOperationalArea(kvkId, filters) { return this.getFormData('performanceOperationalArea', kvkId, filters); }
    async getPerformanceVillageAdoption(kvkId, filters) { return this.getFormData('performanceVillageAdoption', kvkId, filters); }
    async getPerformancePriorityThrust(kvkId, filters) { return this.getFormData('performancePriorityThrust', kvkId, filters); }
    async getPerformanceDemoUnits(kvkId, filters) { return this.getFormData('performanceDemoUnits', kvkId, filters); }
    async getPerformanceFarmCrops(kvkId, filters) { return this.getFormData('performanceFarmCrops', kvkId, filters); }
    async getPerformanceProductionUnits(kvkId, filters) { return this.getFormData('performanceProductionUnits', kvkId, filters); }
    async getPerformanceFarmLivestock(kvkId, filters) { return this.getFormData('performanceFarmLivestock', kvkId, filters); }
    async getPerformanceHostel(kvkId, filters) { return this.getFormData('performanceHostel', kvkId, filters); }
    async getPerformanceStaffQuarters(kvkId, filters) { return this.getFormData('performanceStaffQuarters', kvkId, filters); }
    async getPerformanceRainwater(kvkId, filters) { return this.getFormData('performanceRainwater', kvkId, filters); }
    async getPerformanceBudget(kvkId, filters) { return this.getFormData('performanceBudget', kvkId, filters); }
    async getPerformanceProjectBudget(kvkId, filters) { return this.getFormData('performanceProjectBudget', kvkId, filters); }
    async getPerformanceRevolvingFund(kvkId, filters) { return this.getFormData('performanceRevolvingFund', kvkId, filters); }
    async getPerformanceRevenue(kvkId, filters) { return this.getFormData('performanceRevenue', kvkId, filters); }
    async getPerformanceResource(kvkId, filters) { return this.getFormData('performanceResource', kvkId, filters); }
    async getPerformanceLinkage(kvkId, filters) { return this.getFormData('performanceLinkage', kvkId, filters); }
    async getPerformanceSpecial(kvkId, filters) { return this.getFormData('performanceSpecial', kvkId, filters); }

    /**
     * Miscellaneous
     */
    async getMiscDiseasesCrops(kvkId, filters) { return this.getFormData('miscDiseasesCrops', kvkId, filters); }
    async getMiscDiseasesLivestock(kvkId, filters) { return this.getFormData('miscDiseasesLivestock', kvkId, filters); }
    async getMiscNyk(kvkId, filters) { return this.getFormData('miscNyk', kvkId, filters); }
    async getMiscPpvFraTraining(kvkId, filters) { return this.getFormData('miscPpvFraTraining', kvkId, filters); }
    async getMiscPlantVarieties(kvkId, filters) { return this.getFormData('miscPlantVarieties', kvkId, filters); }
    async getMiscRaweFet(kvkId, filters) { return this.getFormData('miscRaweFet', kvkId, filters); }
    async getMiscVipVisitors(kvkId, filters) { return this.getFormData('miscVipVisitors', kvkId, filters); }

    /**
     * Digital Information
     */
    async getDigitalMobileApp(kvkId, filters) { return this.getFormData('digitalMobileApp', kvkId, filters); }
    async getDigitalWebPortal(kvkId, filters) { return this.getFormData('digitalWebPortal', kvkId, filters); }
    async getDigitalKisanSarathi(kvkId, filters) { return this.getFormData('digitalKisanSarathi', kvkId, filters); }
    async getDigitalKisanMobile(kvkId, filters) { return this.getFormData('digitalKisanMobile', kvkId, filters); }
    async getDigitalOtherChannels(kvkId, filters) { return this.getFormData('digitalOtherChannels', kvkId, filters); }

    /**
     * Swachhta Bharat Abhiyaan
     */
    async getSwachhtaSewa(kvkId, filters) { return this.getFormData('swachhtaSewa', kvkId, filters); }
    async getSwachhtaPakhwada(kvkId, filters) { return this.getFormData('swachhtaPakhwada', kvkId, filters); }
    async getSwachhtaBudget(kvkId, filters) { return this.getFormData('swachhtaBudget', kvkId, filters); }

    /**
     * Meetings
     */
    async getMeetingsSac(kvkId, filters) { return this.getFormData('meetingsSac', kvkId, filters); }
    async getMeetingsOther(kvkId, filters) { return this.getFormData('meetingsOther', kvkId, filters); }
}

module.exports = new ReportRepository();
