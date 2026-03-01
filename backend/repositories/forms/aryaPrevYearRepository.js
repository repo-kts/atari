const prisma = require('../../config/prisma.js');

const aryaPrevYearRepository = {
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
        const nonFunctionalUnitsClosed = parseInt(data.nonFunctionalUnitsClosed || data.totalClosed) || 0;
        const dateOfClosing = (data.dateOfClosing || data.closingDate) ? new Date(data.dateOfClosing || data.closingDate) : null;
        const nonFunctionalUnitsRestarted = parseInt(data.nonFunctionalUnitsRestarted || data.totalRestarted) || 0;
        const dateOfRestart = (data.dateOfRestart || data.restartedDate) ? new Date(data.dateOfRestart || data.restartedDate) : null;
        const numberOfUnits = parseInt(data.numberOfUnits) || 0;
        const unitCapacity = parseFloat(data.unitCapacity) || 0;
        const fixedCost = parseFloat(data.fixedCost) || 0;
        const variableCost = parseFloat(data.variableCost) || 0;
        const totalProductionPerUnitYear = parseFloat(data.totalProductionPerUnitYear) || 0;
        const grossCostPerUnitYear = parseFloat(data.grossCostPerUnitYear) || 0;
        const grossReturnPerUnitYear = parseFloat(data.grossReturnPerUnitYear) || 0;
        const netBenefitPerUnitYear = parseFloat(data.netBenefitPerUnitYear) || 0;
        const employmentFamilyMandays = parseFloat(data.employmentFamilyMandays) || 0;
        const employmentOtherMandays = parseFloat(data.employmentOtherMandays) || 0;
        const personsVisitedUnit = parseInt(data.personsVisitedUnit) || 0;

        await prisma.$executeRawUnsafe(`
            INSERT INTO arya_prev_year (
                "kvkId", reporting_year, "enterpriseId", 
                units_male, units_female, non_functional_units_closed, date_of_closing,
                non_functional_units_restarted, date_of_restart, number_of_units,
                unit_capacity, fixed_cost, variable_cost, total_production_per_unit_year,
                gross_cost_per_unit_year, gross_return_per_unit_year, net_benefit_per_unit_year,
                employment_family_mandays, employment_other_mandays, persons_visited_unit,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, reportingYear, enterpriseId, unitsMale, unitsFemale, nonFunctionalUnitsClosed, dateOfClosing,
            nonFunctionalUnitsRestarted, dateOfRestart, numberOfUnits, unitCapacity, fixedCost, variableCost,
            totalProductionPerUnitYear, grossCostPerUnitYear, grossReturnPerUnitYear, netBenefitPerUnitYear,
            employmentFamilyMandays, employmentOtherMandays, personsVisitedUnit);

        const result = await prisma.aryaPrevYear.findFirst({
            where: {
                kvkId: kvkId,
                reportingYear: reportingYear,
                enterpriseId: enterpriseId
            },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            },
            orderBy: { aryaPrevYearId: 'desc' }
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

        const results = await prisma.aryaPrevYear.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            },
            orderBy: { aryaPrevYearId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const aryaPrevYearId = parseInt(id);
        const where = { aryaPrevYearId };

        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.aryaPrevYear.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const aryaPrevYearId = parseInt(id);
        const whereSpec = { aryaPrevYearId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereSpec.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.aryaPrevYear.findFirst({ where: whereSpec });
        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        if (data.reportingYear !== undefined || data.yearId !== undefined) updateData.reportingYear = parseInt(data.reportingYear || data.yearId);
        if (data.enterpriseId !== undefined) updateData.enterpriseId = parseInt(data.enterpriseId);
        if (data.unitsMale !== undefined) updateData.unitsMale = parseInt(data.unitsMale);
        if (data.unitsFemale !== undefined) updateData.unitsFemale = parseInt(data.unitsFemale);
        if (data.nonFunctionalUnitsClosed !== undefined || data.totalClosed !== undefined) updateData.nonFunctionalUnitsClosed = parseInt(data.nonFunctionalUnitsClosed || data.totalClosed);
        if (data.dateOfClosing !== undefined || data.closingDate !== undefined) updateData.dateOfClosing = new Date(data.dateOfClosing || data.closingDate);
        if (data.nonFunctionalUnitsRestarted !== undefined || data.totalRestarted !== undefined) updateData.nonFunctionalUnitsRestarted = parseInt(data.nonFunctionalUnitsRestarted || data.totalRestarted);
        if (data.dateOfRestart !== undefined || data.restartedDate !== undefined) updateData.dateOfRestart = new Date(data.dateOfRestart || data.restartedDate);
        if (data.numberOfUnits !== undefined) updateData.numberOfUnits = parseInt(data.numberOfUnits);
        if (data.unitCapacity !== undefined) updateData.unitCapacity = parseFloat(data.unitCapacity);
        if (data.fixedCost !== undefined) updateData.fixedCost = parseFloat(data.fixedCost);
        if (data.variableCost !== undefined) updateData.variableCost = parseFloat(data.variableCost);
        if (data.totalProductionPerUnitYear !== undefined) updateData.totalProductionPerUnitYear = parseFloat(data.totalProductionPerUnitYear);
        if (data.grossCostPerUnitYear !== undefined) updateData.grossCostPerUnitYear = parseFloat(data.grossCostPerUnitYear);
        if (data.grossReturnPerUnitYear !== undefined) updateData.grossReturnPerUnitYear = parseFloat(data.grossReturnPerUnitYear);
        if (data.netBenefitPerUnitYear !== undefined) updateData.netBenefitPerUnitYear = parseFloat(data.netBenefitPerUnitYear);
        if (data.employmentFamilyMandays !== undefined) updateData.employmentFamilyMandays = parseFloat(data.employmentFamilyMandays);
        if (data.employmentOtherMandays !== undefined) updateData.employmentOtherMandays = parseFloat(data.employmentOtherMandays);
        if (data.personsVisitedUnit !== undefined) updateData.personsVisitedUnit = parseInt(data.personsVisitedUnit);

        await prisma.$executeRawUnsafe(`
            UPDATE arya_prev_year 
            SET 
                reporting_year = $1, "enterpriseId" = $2, units_male = $3, units_female = $4, 
                non_functional_units_closed = $5, date_of_closing = $6, 
                non_functional_units_restarted = $7, date_of_restart = $8, 
                number_of_units = $9, unit_capacity = $10, fixed_cost = $11, 
                variable_cost = $12, total_production_per_unit_year = $13, 
                gross_cost_per_unit_year = $14, gross_return_per_unit_year = $15, 
                net_benefit_per_unit_year = $16, employment_family_mandays = $17, 
                employment_other_mandays = $18, persons_visited_unit = $19, 
                updated_at = CURRENT_TIMESTAMP
            WHERE arya_prev_year_id = $20
        `,
            updateData.reportingYear ?? existing.reportingYear,
            updateData.enterpriseId ?? existing.enterpriseId,
            updateData.unitsMale ?? existing.unitsMale,
            updateData.unitsFemale ?? existing.unitsFemale,
            updateData.nonFunctionalUnitsClosed ?? existing.nonFunctionalUnitsClosed,
            updateData.dateOfClosing ?? existing.dateOfClosing,
            updateData.nonFunctionalUnitsRestarted ?? existing.nonFunctionalUnitsRestarted,
            updateData.dateOfRestart ?? existing.dateOfRestart,
            updateData.numberOfUnits ?? existing.numberOfUnits,
            updateData.unitCapacity ?? existing.unitCapacity,
            updateData.fixedCost ?? existing.fixedCost,
            updateData.variableCost ?? existing.variableCost,
            updateData.totalProductionPerUnitYear ?? existing.totalProductionPerUnitYear,
            updateData.grossCostPerUnitYear ?? existing.grossCostPerUnitYear,
            updateData.grossReturnPerUnitYear ?? existing.grossReturnPerUnitYear,
            updateData.netBenefitPerUnitYear ?? existing.netBenefitPerUnitYear,
            updateData.employmentFamilyMandays ?? existing.employmentFamilyMandays,
            updateData.employmentOtherMandays ?? existing.employmentOtherMandays,
            updateData.personsVisitedUnit ?? existing.personsVisitedUnit,
            aryaPrevYearId
        );

        const updated = await prisma.aryaPrevYear.findFirst({
            where: { aryaPrevYearId },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } }
            }
        });

        return _mapResponse(updated);
    },

    delete: async (id, user) => {
        const aryaPrevYearId = parseInt(id);
        const whereSpec = { aryaPrevYearId };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereSpec.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.aryaPrevYear.findFirst({ where: whereSpec });
        if (!existing) throw new Error("Record not found or unauthorized");

        await prisma.aryaPrevYear.delete({
            where: { aryaPrevYearId }
        });

        return { success: true };
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.aryaPrevYearId,
        aryaPrevYearId: r.aryaPrevYearId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        yearId: r.reportingYear,
        reportingYear: r.reportingYear,
        enterpriseId: r.enterpriseId,
        enterpriseName: r.enterprise ? r.enterprise.enterpriseName : undefined,
        unitsMale: r.unitsMale,
        unitsFemale: r.unitsFemale,
        nonFunctionalUnitsClosed: r.nonFunctionalUnitsClosed,
        dateOfClosing: r.dateOfClosing ? r.dateOfClosing.toISOString().split('T')[0] : null,
        nonFunctionalUnitsRestarted: r.nonFunctionalUnitsRestarted,
        dateOfRestart: r.dateOfRestart ? r.dateOfRestart.toISOString().split('T')[0] : null,
        numberOfUnits: r.numberOfUnits,
        unitCapacity: r.unitCapacity,
        fixedCost: r.fixedCost,
        variableCost: r.variableCost,
        totalProductionPerUnitYear: r.totalProductionPerUnitYear,
        grossCostPerUnitYear: r.grossCostPerUnitYear,
        grossReturnPerUnitYear: r.grossReturnPerUnitYear,
        netBenefitPerUnitYear: r.netBenefitPerUnitYear,
        employmentFamilyMandays: r.employmentFamilyMandays,
        employmentOtherMandays: r.employmentOtherMandays,
        personsVisitedUnit: r.personsVisitedUnit,

        // Frontend friendly table labels (matching routeConfig.ts)
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Enterprise': r.enterprise ? r.enterprise.enterpriseName : undefined,
        'Total Closed': r.nonFunctionalUnitsClosed,
        'Closing Date': r.dateOfClosing ? r.dateOfClosing.toISOString().split('T')[0] : '',
        'Total Restarted': r.nonFunctionalUnitsRestarted,
        'Restarted Da': r.dateOfRestart ? r.dateOfRestart.toISOString().split('T')[0] : ''
    };
}

module.exports = aryaPrevYearRepository;
