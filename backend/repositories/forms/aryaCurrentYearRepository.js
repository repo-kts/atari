const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');

const aryaCurrentYearRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const reportingYear = parseReportingYearDate(data.reportingYear);
        ensureNotFutureDate(reportingYear);
        const enterpriseId = parseInt(data.enterpriseId, 10);
        if (isNaN(enterpriseId)) {
            throw new Error('Valid enterpriseId is required');
        }

        const unitsMale = parseInt(data.unitsEstablishedMale || data.unitsMale) || 0;
        const unitsFemale = parseInt(data.unitsEstablishedFemale || data.unitsFemale) || 0;
        const viableUnits = parseInt(data.viableUnits) || 0;
        const closedUnits = parseInt(data.closedUnits) || 0;
        const trainingsConducted = parseInt(data.trainingConducted || data.trainingsConducted || data.trainings) || 0;
        const startDate = data.startDate ? new Date(data.startDate) : new Date();
        const endDate = data.endDate ? new Date(data.endDate) : new Date();
        const youthMale = parseInt(data.youthTrainedMale || data.youthMale) || 0;
        const youthFemale = parseInt(data.youthTrainedFemale || data.youthFemale) || 0;
        const groupsFormed = parseInt(data.groupsFormed || data.noOfGroupsFormed) || 0;
        const groupsActive = parseInt(data.groupsActive || data.noOfGroupsActive) || 0;
        const personsLeftGroup = parseInt(data.personsLeftGroup) || 0;
        const membersPerGroup = parseInt(data.membersPerGroup) || 0;
        const avgSizeOfUnit = parseFloat(data.avgUnitSize || data.avgSizeOfUnit) || 0;
        const totalProductionPerYear = parseFloat(data.totalProduction || data.totalProductionPerYear) || 0;
        const perUnitCostOfProduction = parseFloat(data.perUnitCost || data.perUnitCostOfProduction) || 0;
        const saleValueOfProduce = parseFloat(data.saleValue || data.saleValueOfProduce) || 0;
        const employmentGeneratedMandays = parseFloat(data.employmentGenerated || data.employmentGeneratedMandays) || 0;
        const imagePath = data.imagePath || null;

        const resultRows = await prisma.$queryRawUnsafe(`
            INSERT INTO arya_current_year (
                "kvkId", reporting_year, "enterpriseId", 
                units_male, units_female, viable_units, closed_units, 
                trainings_conducted, start_date, end_date, youth_male, youth_female, 
                groups_formed, groups_active, persons_left_group, members_per_group, 
                avg_size_of_unit, total_production_per_year, per_unit_cost_of_production, 
                sale_value_of_produce, employment_generated_mandays, image_path,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `, kvkId, reportingYear, enterpriseId, unitsMale, unitsFemale, viableUnits, closedUnits,
            trainingsConducted, startDate, endDate, youthMale, youthFemale, groupsFormed, groupsActive,
            personsLeftGroup, membersPerGroup, avgSizeOfUnit, totalProductionPerYear,
            perUnitCostOfProduction, saleValueOfProduce, employmentGeneratedMandays, imagePath);

        const result = await prisma.aryaCurrentYear.findUnique({
            where: { aryaCurrentYearId: resultRows[0].arya_current_year_id },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } },
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

        if (filters.reportingYearFrom || filters.reportingYearTo) {
            where.reportingYear = {};
            if (filters.reportingYearFrom) {
                const from = parseReportingYearDate(filters.reportingYearFrom);
                ensureNotFutureDate(from);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.reportingYear.gte = from;
                }
            }
            if (filters.reportingYearTo) {
                const to = parseReportingYearDate(filters.reportingYearTo);
                ensureNotFutureDate(to);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.reportingYear.lte = to;
                }
            }
        }
        if (filters.enterpriseId) {
            where.enterpriseId = parseInt(filters.enterpriseId);
        }

        const results = await prisma.aryaCurrentYear.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } },
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
                enterprise: { select: { enterpriseName: true } },
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

        const reportingYear = data.reportingYear !== undefined ? parseReportingYearDate(data.reportingYear) : existing.reportingYear;
        ensureNotFutureDate(reportingYear);
        const enterpriseId = data.enterpriseId !== undefined ? parseInt(data.enterpriseId) : existing.enterpriseId;
        const unitsMale = data.unitsMale !== undefined || data.unitsEstablishedMale !== undefined ? parseInt(data.unitsMale ?? data.unitsEstablishedMale) : existing.unitsMale;
        const unitsFemale = data.unitsFemale !== undefined || data.unitsEstablishedFemale !== undefined ? parseInt(data.unitsFemale ?? data.unitsEstablishedFemale) : existing.unitsFemale;
        const viableUnits = data.viableUnits !== undefined ? parseInt(data.viableUnits) : existing.viableUnits;
        const closedUnits = data.closedUnits !== undefined ? parseInt(data.closedUnits) : existing.closedUnits;
        const trainingsConducted = data.trainingsConducted !== undefined || data.trainingConducted !== undefined || data.trainings !== undefined ? parseInt(data.trainingsConducted ?? data.trainingConducted ?? data.trainings) : existing.trainingsConducted;
        const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
        const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;
        const youthMale = data.youthMale !== undefined || data.youthTrainedMale !== undefined ? parseInt(data.youthMale ?? data.youthTrainedMale) : existing.youthMale;
        const youthFemale = data.youthFemale !== undefined || data.youthTrainedFemale !== undefined ? parseInt(data.youthFemale ?? data.youthTrainedFemale) : existing.youthFemale;
        const groupsFormed = data.groupsFormed !== undefined || data.noOfGroupsFormed !== undefined ? parseInt(data.groupsFormed ?? data.noOfGroupsFormed) : existing.groupsFormed;
        const groupsActive = data.groupsActive !== undefined || data.noOfGroupsActive !== undefined ? parseInt(data.groupsActive ?? data.noOfGroupsActive) : existing.groupsActive;
        const personsLeftGroup = data.personsLeftGroup !== undefined ? parseInt(data.personsLeftGroup) : existing.personsLeftGroup;
        const membersPerGroup = data.membersPerGroup !== undefined ? parseInt(data.membersPerGroup) : existing.membersPerGroup;
        const avgSizeOfUnit = data.avgSizeOfUnit !== undefined || data.avgUnitSize !== undefined ? parseFloat(data.avgSizeOfUnit ?? data.avgUnitSize) : existing.avgSizeOfUnit;
        const totalProductionPerYear = data.totalProductionPerYear !== undefined || data.totalProduction !== undefined ? parseFloat(data.totalProductionPerYear ?? data.totalProduction) : existing.totalProductionPerYear;
        const perUnitCostOfProduction = data.perUnitCostOfProduction !== undefined || data.perUnitCost !== undefined ? parseFloat(data.perUnitCostOfProduction ?? data.perUnitCost) : existing.perUnitCostOfProduction;
        const saleValueOfProduce = data.saleValueOfProduce !== undefined || data.saleValue !== undefined ? parseFloat(data.saleValueOfProduce ?? data.saleValue) : existing.saleValueOfProduce;
        const employmentGeneratedMandays = data.employmentGeneratedMandays !== undefined || data.employmentGenerated !== undefined ? parseFloat(data.employmentGeneratedMandays ?? data.employmentGenerated) : existing.employmentGeneratedMandays;
        const imagePath = data.imagePath ?? existing.imagePath;

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
            reportingYear, enterpriseId, unitsMale, unitsFemale, viableUnits, closedUnits,
            trainingsConducted, startDate, endDate, youthMale, youthFemale, groupsFormed, groupsActive,
            personsLeftGroup, membersPerGroup, avgSizeOfUnit, totalProductionPerYear,
            perUnitCostOfProduction, saleValueOfProduce, employmentGeneratedMandays, imagePath,
            aryaCurrentYearId
        );

        const updated = await prisma.aryaCurrentYear.findUnique({
            where: { aryaCurrentYearId },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } },
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
        reportingYear: formatReportingYear(r.reportingYear),
        enterpriseId: r.enterpriseId,
        enterpriseName: r.enterprise ? r.enterprise.enterpriseName : undefined,

        // Internal fields
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

        // Frontend aliases for forms
        unitsEstablishedMale: r.unitsMale,
        unitsEstablishedFemale: r.unitsFemale,
        trainingConducted: r.trainingsConducted,
        youthTrainedMale: r.youthMale,
        youthTrainedFemale: r.youthFemale,
        avgUnitSize: r.avgSizeOfUnit,
        totalProduction: r.totalProductionPerYear,
        perUnitCost: r.perUnitCostOfProduction,
        saleValue: r.saleValueOfProduce,
        employmentGenerated: r.employmentGeneratedMandays,
    };
}

module.exports = aryaCurrentYearRepository;
