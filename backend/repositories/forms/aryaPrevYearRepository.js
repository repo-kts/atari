const prisma = require('../../config/prisma.js');

const aryaPrevYearRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const reportingYearId = data.reportingYearId || data.yearId ? parseInt(data.reportingYearId || data.yearId) : null;
        const enterpriseId = parseInt(data.enterpriseId, 10);
        if (isNaN(enterpriseId)) {
            throw new Error('Valid enterpriseId is required');
        }

        const unitsMale = parseInt(data.unitsEstablishedMale || data.unitsMale) || 0;
        const unitsFemale = parseInt(data.unitsEstablishedFemale || data.unitsFemale) || 0;
        const nonFunctionalUnitsClosed = parseInt(data.unitsClosed || data.nonFunctionalUnitsClosed || data.totalClosed) || 0;
        const dateOfClosing = (data.closingDate || data.dateOfClosing) ? new Date(data.closingDate || data.dateOfClosing) : null;
        const nonFunctionalUnitsRestarted = parseInt(data.unitsRestarted || data.nonFunctionalUnitsRestarted || data.totalRestarted) || 0;
        const dateOfRestart = (data.restartDate || data.dateOfRestart) ? new Date(data.restartDate || data.dateOfRestart) : null;
        const numberOfUnits = parseInt(data.noOfUnit || data.numberOfUnits) || 0;
        const unitCapacity = parseFloat(data.unitCapacity) || 0;
        const fixedCost = parseFloat(data.fixedCost) || 0;
        const variableCost = parseFloat(data.variableCost) || 0;
        const totalProductionPerUnitYear = parseFloat(data.totalProductionPerUnit || data.totalProductionPerUnitYear) || 0;
        const grossCostPerUnitYear = parseFloat(data.grossCost || data.grossCostPerUnitYear) || 0;
        const grossReturnPerUnitYear = parseFloat(data.grossValue || data.grossReturnPerUnitYear) || 0;
        const netBenefitPerUnitYear = parseFloat(data.netBenefit || data.netBenefitPerUnitYear) || 0;
        const employmentFamilyMandays = parseFloat(data.employmentFamily || data.employmentFamilyMandays) || 0;
        const employmentOtherMandays = parseFloat(data.employmentOther || data.employmentOtherMandays) || 0;
        const personsVisitedUnit = parseInt(data.personsVisited || data.personsVisitedUnit) || 0;

        const resultRows = await prisma.$queryRawUnsafe(`
            INSERT INTO arya_prev_year (
                "kvkId", reporting_year_id, "enterpriseId", 
                units_male, units_female, non_functional_units_closed, date_of_closing,
                non_functional_units_restarted, date_of_restart, number_of_units,
                unit_capacity, fixed_cost, variable_cost, total_production_per_unit_year,
                gross_cost_per_unit_year, gross_return_per_unit_year, net_benefit_per_unit_year,
                employment_family_mandays, employment_other_mandays, persons_visited_unit,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `, kvkId, reportingYearId, enterpriseId, unitsMale, unitsFemale, nonFunctionalUnitsClosed, dateOfClosing,
            nonFunctionalUnitsRestarted, dateOfRestart, numberOfUnits, unitCapacity, fixedCost, variableCost,
            totalProductionPerUnitYear, grossCostPerUnitYear, grossReturnPerUnitYear, netBenefitPerUnitYear,
            employmentFamilyMandays, employmentOtherMandays, personsVisitedUnit);

        const result = await prisma.aryaPrevYear.findUnique({
            where: { aryaPrevYearId: resultRows[0].arya_prev_year_id },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
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

        if (filters.reportingYearId) {
            where.reportingYearId = parseInt(filters.reportingYearId);
        } else if (filters.reportingYear) {
            where.reportingYearId = parseInt(filters.reportingYear);
        }
        if (filters.enterpriseId) {
            where.enterpriseId = parseInt(filters.enterpriseId);
        }

        const results = await prisma.aryaPrevYear.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
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
                enterprise: { select: { enterpriseName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
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

        const reportingYearId = data.yearId !== undefined || data.reportingYearId !== undefined ? parseInt(data.yearId ?? data.reportingYearId) : existing.reportingYearId;
        const enterpriseId = data.enterpriseId !== undefined ? parseInt(data.enterpriseId) : existing.enterpriseId;
        const unitsMale = data.unitsMale !== undefined || data.unitsEstablishedMale !== undefined ? parseInt(data.unitsMale ?? data.unitsEstablishedMale) : existing.unitsMale;
        const unitsFemale = data.unitsFemale !== undefined || data.unitsEstablishedFemale !== undefined ? parseInt(data.unitsFemale ?? data.unitsEstablishedFemale) : existing.unitsFemale;
        const nonFunctionalUnitsClosed = data.unitsClosed !== undefined || data.nonFunctionalUnitsClosed !== undefined || data.totalClosed !== undefined ? parseInt(data.unitsClosed ?? data.nonFunctionalUnitsClosed ?? data.totalClosed) : existing.nonFunctionalUnitsClosed;
        const dateOfClosing = (data.dateOfClosing ?? data.closingDate) ? new Date(data.dateOfClosing ?? data.closingDate) : existing.dateOfClosing;
        const nonFunctionalUnitsRestarted = data.unitsRestarted !== undefined || data.nonFunctionalUnitsRestarted !== undefined || data.totalRestarted !== undefined ? parseInt(data.unitsRestarted ?? data.nonFunctionalUnitsRestarted ?? data.totalRestarted) : existing.nonFunctionalUnitsRestarted;
        const dateOfRestart = (data.dateOfRestart ?? data.restartDate) ? new Date(data.dateOfRestart ?? data.restartDate) : existing.dateOfRestart;
        const numberOfUnits = data.numberOfUnits !== undefined || data.noOfUnit !== undefined ? parseInt(data.numberOfUnits ?? data.noOfUnit) : existing.numberOfUnits;
        const unitCapacity = data.unitCapacity !== undefined ? parseFloat(data.unitCapacity) : existing.unitCapacity;
        const fixedCost = data.fixedCost !== undefined ? parseFloat(data.fixedCost) : existing.fixedCost;
        const variableCost = data.variableCost !== undefined ? parseFloat(data.variableCost) : existing.variableCost;
        const totalProductionPerUnitYear = data.totalProductionPerUnitYear !== undefined || data.totalProductionPerUnit !== undefined ? parseFloat(data.totalProductionPerUnitYear ?? data.totalProductionPerUnit) : existing.totalProductionPerUnitYear;
        const grossCostPerUnitYear = data.grossCostPerUnitYear !== undefined || data.grossCost !== undefined ? parseFloat(data.grossCostPerUnitYear ?? data.grossCost) : existing.grossCostPerUnitYear;
        const grossReturnPerUnitYear = data.grossReturnPerUnitYear !== undefined || data.grossValue !== undefined ? parseFloat(data.grossReturnPerUnitYear ?? data.grossValue) : existing.grossReturnPerUnitYear;
        const netBenefitPerUnitYear = data.netBenefitPerUnitYear !== undefined || data.netBenefit !== undefined ? parseFloat(data.netBenefitPerUnitYear ?? data.netBenefit) : existing.netBenefitPerUnitYear;
        const employmentFamilyMandays = data.employmentFamilyMandays !== undefined || data.employmentFamily !== undefined ? parseFloat(data.employmentFamilyMandays ?? data.employmentFamily) : existing.employmentFamilyMandays;
        const employmentOtherMandays = data.employmentOtherMandays !== undefined || data.employmentOther !== undefined ? parseFloat(data.employmentOtherMandays ?? data.employmentOther) : existing.employmentOtherMandays;
        const personsVisitedUnit = data.personsVisitedUnit !== undefined || data.personsVisited !== undefined ? parseInt(data.personsVisitedUnit ?? data.personsVisited) : existing.personsVisitedUnit;

        await prisma.$executeRawUnsafe(`
            UPDATE arya_prev_year 
            SET 
                reporting_year_id = $1, "enterpriseId" = $2, units_male = $3, units_female = $4, 
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
            reportingYearId, enterpriseId, unitsMale, unitsFemale, nonFunctionalUnitsClosed, dateOfClosing,
            nonFunctionalUnitsRestarted, dateOfRestart, numberOfUnits, unitCapacity, fixedCost, variableCost,
            totalProductionPerUnitYear, grossCostPerUnitYear, grossReturnPerUnitYear, netBenefitPerUnitYear,
            employmentFamilyMandays, employmentOtherMandays, personsVisitedUnit,
            aryaPrevYearId
        );

        const updated = await prisma.aryaPrevYear.findUnique({
            where: { aryaPrevYearId },
            include: {
                kvk: { select: { kvkName: true } },
                enterprise: { select: { enterpriseName: true } },
                reportingYear: { select: { yearId: true, yearName: true } }
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
        reportingYearId: r.reportingYearId,
        yearId: r.reportingYearId,
        reportingYear: r.reportingYear ? r.reportingYear.yearName : undefined,
        enterpriseId: r.enterpriseId,
        enterpriseName: r.enterprise ? r.enterprise.enterpriseName : undefined,

        // Internal fields
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

        // Frontend aliases for forms
        unitsEstablishedMale: r.unitsMale,
        unitsEstablishedFemale: r.unitsFemale,
        unitsClosed: r.nonFunctionalUnitsClosed,
        closingDate: r.dateOfClosing ? r.dateOfClosing.toISOString().split('T')[0] : '',
        unitsRestarted: r.nonFunctionalUnitsRestarted,
        restartDate: r.dateOfRestart ? r.dateOfRestart.toISOString().split('T')[0] : '',
        noOfUnit: r.numberOfUnits,
        totalProductionPerUnit: r.totalProductionPerUnitYear,
        grossCost: r.grossCostPerUnitYear,
        grossValue: r.grossReturnPerUnitYear,
        netBenefit: r.netBenefitPerUnitYear,
        employmentFamily: r.employmentFamilyMandays,
        employmentOther: r.employmentOtherMandays,
        personsVisited: r.personsVisitedUnit,

        // Frontend friendly table labels (matching routeConfig.ts)
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Enterprise': r.enterprise ? r.enterprise.enterpriseName : undefined,
        'Total Closed': r.nonFunctionalUnitsClosed,
        'Closing Date': r.dateOfClosing ? r.dateOfClosing.toISOString().split('T')[0] : '',
        'Total Restarted': r.nonFunctionalUnitsRestarted,
        'Restarted Date': r.dateOfRestart ? r.dateOfRestart.toISOString().split('T')[0] : ''
    };
}

module.exports = aryaPrevYearRepository;
