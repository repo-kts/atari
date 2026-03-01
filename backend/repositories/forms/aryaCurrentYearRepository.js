const prisma = require('../../config/prisma.js');

const aryaCurrentYearRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const reportingYear = parseInt(data.yearId || data.reportingYear) || new Date().getFullYear();
        const enterpriseId = parseInt(data.enterpriseId);
        const unitsMale = parseInt(data.unitsMale) || 0;
        const unitsFemale = parseInt(data.unitsFemale) || 0;
        const viableUnits = parseInt(data.viableUnits) || 0;
        const closedUnits = parseInt(data.closedUnits) || 0;
        const trainingsConducted = parseInt(data.trainingsConducted || data.trainings) || 0;
        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        const endDate = data.endDate ? new Date(data.endDate) : new Date();
        const youthMale = parseInt(data.youthMale) || 0;
        const youthFemale = parseInt(data.youthFemale) || 0;
        const groupsFormed = parseInt(data.groupsFormed || data.noOfGroupsFormed) || 0;
        const groupsActive = parseInt(data.groupsActive || data.noOfGroupsActive) || 0;
        const personsLeftGroup = parseInt(data.personsLeftGroup) || 0;
        const membersPerGroup = parseInt(data.membersPerGroup) || 0;
        const avgSizeOfUnit = parseFloat(data.avgSizeOfUnit) || 0;
        const totalProductionPerYear = parseFloat(data.totalProductionPerYear) || 0;
        const perUnitCostOfProduction = parseFloat(data.perUnitCostOfProduction) || 0;
        const saleValueOfProduce = parseFloat(data.saleValueOfProduce) || 0;
        const employmentGeneratedMandays = parseFloat(data.employmentGeneratedMandays) || 0;
        const imagePath = data.imagePath || null;

        await prisma.$executeRawUnsafe(`
            INSERT INTO arya_current_year (
                "kvkId", reporting_year, "enterpriseId", 
                units_male, units_female, viable_units, closed_units, 
                trainings_conducted, start_date, end_date, youth_male, youth_female, 
                groups_formed, groups_active, persons_left_group, members_per_group, 
                avg_size_of_unit, total_production_per_year, per_unit_cost_of_production, 
                sale_value_of_produce, employment_generated_mandays, image_path,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, reportingYear, enterpriseId, unitsMale, unitsFemale, viableUnits, closedUnits,
            trainingsConducted, startDate, endDate, youthMale, youthFemale, groupsFormed, groupsActive,
            personsLeftGroup, membersPerGroup, avgSizeOfUnit, totalProductionPerYear,
            perUnitCostOfProduction, saleValueOfProduce, employmentGeneratedMandays, imagePath);

        const result = await prisma.aryaCurrentYear.findFirst({
            where: {
                kvkId: kvkId,
                reportingYear: reportingYear,
                enterpriseId: enterpriseId
            },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            },
            orderBy: { aryaCurrentYearId: 'desc' }
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
        if (filters.enterpriseId) {
            where.enterpriseId = parseInt(filters.enterpriseId);
        }

        const results = await prisma.aryaCurrentYear.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            },
            orderBy: { aryaCurrentYearId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const aryaCurrentYearId = parseInt(id);
        const where = { aryaCurrentYearId };

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.aryaCurrentYear.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const aryaCurrentYearId = parseInt(id);
        const whereSpec = { aryaCurrentYearId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereSpec.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.aryaCurrentYear.findFirst({ where: whereSpec });
        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        if (data.reportingYear !== undefined || data.yearId !== undefined) updateData.reportingYear = parseInt(data.reportingYear || data.yearId);
        if (data.enterpriseId !== undefined) updateData.enterpriseId = parseInt(data.enterpriseId);
        if (data.unitsMale !== undefined) updateData.unitsMale = parseInt(data.unitsMale);
        if (data.unitsFemale !== undefined) updateData.unitsFemale = parseInt(data.unitsFemale);
        if (data.viableUnits !== undefined) updateData.viableUnits = parseInt(data.viableUnits);
        if (data.closedUnits !== undefined) updateData.closedUnits = parseInt(data.closedUnits);
        if (data.trainingsConducted !== undefined || data.trainings !== undefined) updateData.trainingsConducted = parseInt(data.trainingsConducted || data.trainings);
        if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
        if (data.youthMale !== undefined) updateData.youthMale = parseInt(data.youthMale);
        if (data.youthFemale !== undefined) updateData.youthFemale = parseInt(data.youthFemale);
        if (data.groupsFormed !== undefined || data.noOfGroupsFormed !== undefined) updateData.groupsFormed = parseInt(data.groupsFormed || data.noOfGroupsFormed);
        if (data.groupsActive !== undefined || data.noOfGroupsActive !== undefined) updateData.groupsActive = parseInt(data.groupsActive || data.noOfGroupsActive);
        if (data.personsLeftGroup !== undefined) updateData.personsLeftGroup = parseInt(data.personsLeftGroup);
        if (data.membersPerGroup !== undefined) updateData.membersPerGroup = parseInt(data.membersPerGroup);
        if (data.avgSizeOfUnit !== undefined) updateData.avgSizeOfUnit = parseFloat(data.avgSizeOfUnit);
        if (data.totalProductionPerYear !== undefined) updateData.totalProductionPerYear = parseFloat(data.totalProductionPerYear);
        if (data.perUnitCostOfProduction !== undefined) updateData.perUnitCostOfProduction = parseFloat(data.perUnitCostOfProduction);
        if (data.saleValueOfProduce !== undefined) updateData.saleValueOfProduce = parseFloat(data.saleValueOfProduce);
        if (data.employmentGeneratedMandays !== undefined) updateData.employmentGeneratedMandays = parseFloat(data.employmentGeneratedMandays);
        if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;

        await prisma.$executeRawUnsafe(`
            UPDATE arya_current_year 
            SET 
                reporting_year = $1, "enterpriseId" = $2, units_male = $3, units_female = $4, 
                viable_units = $5, closed_units = $6, trainings_conducted = $7, 
                start_date = $8, end_date = $9, youth_male = $10, youth_female = $11, 
                groups_formed = $12, groups_active = $13, persons_left_group = $14, 
                members_per_group = $15, avg_size_of_unit = $16, total_production_per_year = $17, 
                per_unit_cost_of_production = $18, sale_value_of_produce = $19, 
                employment_generated_mandays = $20, image_path = $21, 
                updated_at = CURRENT_TIMESTAMP
            WHERE arya_current_year_id = $22
        `,
            updateData.reportingYear ?? existing.reportingYear,
            updateData.enterpriseId ?? existing.enterpriseId,
            updateData.unitsMale ?? existing.unitsMale,
            updateData.unitsFemale ?? existing.unitsFemale,
            updateData.viableUnits ?? existing.viableUnits,
            updateData.closedUnits ?? existing.closedUnits,
            updateData.trainingsConducted ?? existing.trainingsConducted,
            updateData.startDate ?? existing.startDate,
            updateData.endDate ?? existing.endDate,
            updateData.youthMale ?? existing.youthMale,
            updateData.youthFemale ?? existing.youthFemale,
            updateData.groupsFormed ?? existing.groupsFormed,
            updateData.groupsActive ?? existing.groupsActive,
            updateData.personsLeftGroup ?? existing.personsLeftGroup,
            updateData.membersPerGroup ?? existing.membersPerGroup,
            updateData.avgSizeOfUnit ?? existing.avgSizeOfUnit,
            updateData.totalProductionPerYear ?? existing.totalProductionPerYear,
            updateData.perUnitCostOfProduction ?? existing.perUnitCostOfProduction,
            updateData.saleValueOfProduce ?? existing.saleValueOfProduce,
            updateData.employmentGeneratedMandays ?? existing.employmentGeneratedMandays,
            updateData.imagePath ?? existing.imagePath,
            aryaCurrentYearId
        );

        const updated = await prisma.aryaCurrentYear.findUnique({
            where: { aryaCurrentYearId },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            }
        });

        return _mapResponse(updated);
    },

    delete: async (id, user) => {
        const aryaCurrentYearId = parseInt(id);
        const whereSpec = { aryaCurrentYearId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereSpec.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.aryaCurrentYear.findFirst({ where: whereSpec });
        if (!existing) throw new Error("Record not found or unauthorized");

        await prisma.aryaCurrentYear.delete({
            where: { aryaCurrentYearId }
        });

        return { success: true };
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.aryaCurrentYearId,
        aryaCurrentYearId: r.aryaCurrentYearId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        yearId: r.reportingYear,
        reportingYear: r.reportingYear,
        enterpriseId: r.enterpriseId,
        enterpriseName: r.enterprise ? r.enterprise.enterpriseName : undefined,
        unitsMale: r.unitsMale,
        unitsFemale: r.unitsFemale,
        viableUnits: r.viableUnits,
        closedUnits: r.closedUnits,
        trainingsConducted: r.trainingsConducted,
        startDate: r.startDate ? r.startDate.toISOString().split('T')[0] : '',
        endDate: r.endDate ? r.endDate.toISOString().split('T')[0] : '',
        youthMale: r.youthMale,
        youthFemale: r.youthFemale,
        groupsFormed: r.groupsFormed,
        groupsActive: r.groupsActive,
        personsLeftGroup: r.personsLeftGroup,
        membersPerGroup: r.membersPerGroup,
        avgSizeOfUnit: r.avgSizeOfUnit,
        totalProductionPerYear: r.totalProductionPerYear,
        perUnitCostOfProduction: r.perUnitCostOfProduction,
        saleValueOfProduce: r.saleValueOfProduce,
        employmentGeneratedMandays: r.employmentGeneratedMandays,
        imagePath: r.imagePath,

        // Frontend friendly table labels (matching routeConfig.ts)
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Enterprise': r.enterprise ? r.enterprise.enterpriseName : undefined,
        'Viable Units': r.viableUnits,
        'Closed Units': r.closedUnits,
        'Start Date': r.startDate ? r.startDate.toISOString().split('T')[0] : '',
        'End Date': r.endDate ? r.endDate.toISOString().split('T')[0] : '',
        'No. of Groups Formed': r.groupsFormed,
        'No. of Groups Active': r.groupsActive
    };
}

module.exports = aryaCurrentYearRepository;
