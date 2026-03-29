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
     * DataSource-to-Prisma-model mapping.
     * Used by getByDataSource() to dynamically resolve any config dataSource.
     */
    static DATA_SOURCE_MODEL_MAP = {
        // Achievements
        achievementsOft: 'kvkoft',
        achievementsFld: 'kvkFldResult',
        achievementsFldExtension: 'fldExtension',
        achievementsFldTechnical: 'fldTechnicalFeedback',
        achievementsTrainings: 'trainingAchievement',
        achievementsExtension: 'kvkExtensionActivity',
        achievementsOtherExtension: 'kvkOtherExtensionActivity',
        achievementsTechWeek: 'kvkTechnologyWeekCelebration',
        achievementsCelebrationDays: 'kvkImportantDayCelebration',
        achievementsProductionSupply: 'kvkProductionSupply',
        achievementsPublications: 'kvkPublicationDetails',
        achievementsSoilWater: 'kkvSoilWaterEquipment',
        achievementsSoilAnalysis: 'kkvSoilWaterAnalysis',
        achievementsWorldSoilDay: 'kkvWorldSoilCelebration',
        achievementsKvkAward: 'kvkAward',
        achievementsScientistAward: 'scientistAward',
        achievementsFarmerAward: 'farmerAward',
        achievementsHrd: 'hrdProgram',
        achievementsProjects: 'projectBudget',
        // Projects
        projectSwmHealth: 'nicraSoilHealthCard',
        projectSwmExtension: 'nicraExtensionActivity',
        projectSwmBudget: 'budgetDetail',
        projectCraForm: 'craDetails',
        projectCraExtension: 'craExtensionActivity',
        projectCfld: 'cfldTechnicalParameter',
        projectTcbSkill: 'trainingAchievement',
        projectAryaDetails: 'aryaCurrentYear',
        projectAryaActivity: 'aryaPrevYear',
        projectNariNutriGarden: 'nariNutritionalGarden',
        projectNariBioFortified: 'nariBioFortifiedCrop',
        projectNariValueAddition: 'nariValueAddition',
        projectNariTraining: 'nariTrainingProgramme',
        projectNariExtension: 'nariExtensionActivity',
        projectNicraBasic: 'nicraBasicInfo',
        projectNicraExtension: 'nicraExtensionActivity',
        projectNicraEval: 'nicraDetails',
        projectCsisa: 'csisa',
        projectTspScsp: 'tspScsp',
        projectDroneInfo: 'kvkAgriDrone',
        projectDroneDemo: 'kvkAgriDroneDemonstration',
        projectSeedHub: 'kvkSeedHubProgram',
        projectOtherProgram: 'kvkOtherProgramme',
        projectNfInfo: 'nariActivity',
        projectNfDigital: 'mobileApp',
        projectNfExtension: 'nariExtensionActivity',
        projectNfBiz: 'nariTrainingProgramme',
        projectNfField: 'nariActivity',
        projectNfUnit: 'nariActivity',
        projectNfOutput: 'nariActivity',
        projectKimBasic: 'kmas',
        projectKimEvents: 'kmas',
        projectKimTraining: 'kmas',
        projectKimExtension: 'kmas',
        // Performance Indicators
        performanceImpactKvk: 'kvkImpactActivity',
        performanceImpactEnt: 'entrepreneurship',
        performanceImpactSuccess: 'successStory',
        performanceDistrictLevel: 'districtLevelData',
        performanceOperationalArea: 'operationalArea',
        performanceVillageAdoption: 'villageAdoption',
        performancePriorityThrust: 'priorityThrustArea',
        performanceDemoUnits: 'demonstrationUnit',
        performanceFarmCrops: 'instructionalFarmCrop',
        performanceProductionUnits: 'productionUnit',
        performanceFarmLivestock: 'instructionalFarmLivestock',
        performanceHostel: 'hostelUtilization',
        performanceStaffQuarters: 'staffQuartersUtilization',
        performanceRainWater: 'rainwaterHarvesting',
        performanceBudget: 'budgetDetail',
        performanceProjectBudget: 'projectBudget',
        performanceRevolvingFund: 'revolvingFund',
        performanceRevenue: 'revenueGeneration',
        performanceLinkage: 'functionalLinkage',
        performanceSpecial: 'specialProgramme',
        // Miscellaneous
        miscDiseasesCrops: 'prevalentDiseasesInCrop',
        miscDiseasesLivestock: 'prevalentDiseasesOnLivestock',
        miscNyk: 'nykTraining',
        miscPpvFraTraining: 'ppvFraTraining',
        miscPlantVarieties: 'ppvFraPlantVarieties',
        miscRaweFet: 'raweFetFitProgramme',
        miscVipVisitors: 'vipVisitor',
        // Digital Information
        digitalMobileApp: 'mobileApp',
        digitalWebPortal: 'webPortal',
        digitalKisanSarathi: 'kisanSarathi',
        digitalKisanMobile: 'msgDetails',
        digitalOtherChannels: 'msgDetails',
        // Swachhta Bharat
        swachhtaSewa: 'swachhtaHiSewa',
        swachhtaPakhwada: 'swachhtaPakhwada',
        swachhtaBudget: 'swachhQuarterlyExpenditure',
        swachhtaResource: 'swachhQuarterlyExpenditure',
        swachhtaThinking: 'swachhQuarterlyExpenditure',
        swachhtaCard: 'swachhQuarterlyExpenditure',
        swachhtaAwareness: 'swachhQuarterlyExpenditure',
        swachhtaAction: 'swachhQuarterlyExpenditure',
        // Meetings
        meetingsSac: 'sacMeeting',
        meetingsOther: 'atariMeeting',
    };

    /**
     * Generic method to fetch data by dataSource name.
     * Resolves the correct Prisma model via DATA_SOURCE_MODEL_MAP.
     */
    async getByDataSource(dataSource, kvkId, filters = {}) {
        const modelName = ReportRepository.DATA_SOURCE_MODEL_MAP[dataSource];
        if (!modelName) {
            return null; // unknown dataSource — handled by caller
        }

        const where = { kvkId };

        if (filters.startDate || filters.endDate) {
            const dateFilter = {};
            if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
            if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
            if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
        }

        if (filters.year && !where.createdAt) {
            where.createdAt = {
                gte: new Date(filters.year, 0, 1),
                lte: new Date(filters.year, 11, 31, 23, 59, 59),
            };
        }

        try {
            return await prisma[modelName].findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            console.error(`Report data fetch failed for ${dataSource} (model: ${modelName}):`, error.message);
            return [];
        }
    }
}

module.exports = new ReportRepository();
