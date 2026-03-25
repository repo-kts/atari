const prisma = require('../../config/prisma.js');
const { sanitizeString, sanitizeInteger, sanitizeNumber, sanitizeDate, safeGet, removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');

const oftRepository = {
    create: async (data, user) => {
        // Validate input
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ValidationError('Invalid data: must be an object');
        }

        if (!user || typeof user !== 'object') {
            throw new ValidationError('User information is required');
        }

        const isKvkScoped = user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? safeGet(user, 'kvkId') : safeGet(data, 'kvkId');
        const kvkId = sanitizeInteger(kvkIdSource);

        if (kvkId === null || kvkId === undefined || isNaN(kvkId)) {
            throw new ValidationError('Valid kvkId is required');
        }

        // Prepare technology types mapping
        const techKeys = ['Farmer Practice', 'TO1', 'TO2', 'TO3', 'TO4', 'TO5', 'C1', 'C2'];
        const technologiesData = [];

        for (const key of techKeys) {
            const detail = sanitizeString(safeGet(data, `tech_${key}`), { allowEmpty: false });
            if (detail) {
                // Find or create technology type
                let techType = await prisma.oftTechnologyType.findUnique({
                    where: { name: key }
                });
                if (!techType) {
                    techType = await prisma.oftTechnologyType.create({
                        data: { name: key }
                    });
                }
                technologiesData.push({
                    oftTechnologyTypeId: techType.oftTechnologyTypeId,
                    details: detail
                });
            }
        }

        // Sanitize all fields
        // Standardize on reportingYearId 
        const reportingYearId = sanitizeInteger(safeGet(data, 'reportingYearId'))
        const seasonId = sanitizeInteger(safeGet(data, 'seasonId'), { defaultValue: 1 });
        const staffId = sanitizeInteger(safeGet(data, 'staffId') || safeGet(data, 'staffName'), { defaultValue: 1 });
        const oftSubjectId = sanitizeInteger(safeGet(data, 'oftSubjectId'));
        const oftThematicAreaId = sanitizeInteger(safeGet(data, 'oftThematicAreaId') || safeGet(data, 'thematicArea'), { defaultValue: 1 });
        const disciplineId = sanitizeInteger(safeGet(data, 'disciplineId') || safeGet(data, 'discipline'), { defaultValue: 1 });

        // Validate required fields
        if (!oftSubjectId || oftSubjectId === null) {
            throw new ValidationError('oftSubjectId is required', 'oftSubjectId');
        }

        const createData = {
            kvkId: kvkId,
            reportingYearId: reportingYearId,
            seasonId: seasonId,
            staffId: staffId,
            oftSubjectId: oftSubjectId,
            oftThematicAreaId: oftThematicAreaId,
            disciplineId: disciplineId,
            title: sanitizeString(safeGet(data, 'title'), { allowEmpty: true }) || '',
            problemDiagnosed: sanitizeString(safeGet(data, 'problemDiagnosed'), { allowEmpty: true }) || '',
            sourceOfTechnology: sanitizeString(safeGet(data, 'sourceOfTechnology'), { allowEmpty: true }) || '',
            productionSystem: sanitizeString(safeGet(data, 'productionSystem'), { allowEmpty: true }) || '',
            performanceIndicators: sanitizeString(safeGet(data, 'performanceIndicators'), { allowEmpty: true }) || '',
            areaHaNumber: sanitizeNumber(safeGet(data, 'areaHaNumber') || safeGet(data, 'area'), { defaultValue: 0 }),
            numberOfLocation: sanitizeInteger(safeGet(data, 'numberOfLocation') || safeGet(data, 'locations'), { defaultValue: 0 }),
            numberOfTrialReplication: sanitizeInteger(safeGet(data, 'numberOfTrialReplication') || safeGet(data, 'replications'), { defaultValue: 0 }),
            oftStartDate: sanitizeDate(safeGet(data, 'oftStartDate') || safeGet(data, 'duration')) || new Date(),
            criticalInput: sanitizeString(safeGet(data, 'criticalInput'), { allowEmpty: true }) || '',
            costOfOft: sanitizeNumber(safeGet(data, 'costOfOft') || safeGet(data, 'cost'), { defaultValue: 0 }),
            farmersGeneralM: sanitizeInteger(safeGet(data, 'farmersGeneralM') || safeGet(data, 'gen_m'), { defaultValue: 0 }),
            farmersGeneralF: sanitizeInteger(safeGet(data, 'farmersGeneralF') || safeGet(data, 'gen_f'), { defaultValue: 0 }),
            farmersObcM: sanitizeInteger(safeGet(data, 'farmersObcM') || safeGet(data, 'obc_m'), { defaultValue: 0 }),
            farmersObcF: sanitizeInteger(safeGet(data, 'farmersObcF') || safeGet(data, 'obc_f'), { defaultValue: 0 }),
            farmersScM: sanitizeInteger(safeGet(data, 'farmersScM') || safeGet(data, 'sc_m'), { defaultValue: 0 }),
            farmersScF: sanitizeInteger(safeGet(data, 'farmersScF') || safeGet(data, 'sc_f'), { defaultValue: 0 }),
            farmersStM: sanitizeInteger(safeGet(data, 'farmersStM') || safeGet(data, 'st_m'), { defaultValue: 0 }),
            farmersStF: sanitizeInteger(safeGet(data, 'farmersStF') || safeGet(data, 'st_f'), { defaultValue: 0 }),
            status: sanitizeString(safeGet(data, 'ongoingCompleted') || safeGet(data, 'status'), { allowEmpty: true }) || 'Ongoing',
        };

        // Add technologies if any
        if (technologiesData.length > 0) {
            createData.technologies = {
                create: technologiesData
            };
        }

        // CRITICAL: Remove ID fields from createData - Prisma doesn't accept them in data object
        const finalCreateData = removeIdFieldsForUpdate(createData, ['kvkOftId', 'id']);

        const result = await prisma.kvkoft.create({
            data: finalCreateData,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearId: true, yearName: true } },
                staff: { select: { staffName: true } },
                season: { select: { seasonName: true } },
                oftSubject: { select: { subjectName: true } },
                oftThematicArea: { select: { thematicAreaName: true } },
                discipline: { select: { disciplineName: true } },
                technologies: {
                    include: {
                        oftTechnologyType: true
                    }
                }
            }
        });

        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        // Standardize on reportingYearId 
        if (filters.reportingYearId) {
            where.reportingYearId = parseInt(filters.reportingYearId);
        }

        const results = await prisma.kvkoft.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearId: true, yearName: true } },
                staff: { select: { staffName: true } },
                season: { select: { seasonName: true } },
                oftSubject: { select: { subjectName: true } },
                oftThematicArea: { select: { thematicAreaName: true } },
                discipline: { select: { disciplineName: true } },
                technologies: {
                    include: {
                        oftTechnologyType: true
                    }
                }
            },
            orderBy: { kvkOftId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id, user) => {
        const where = { kvkOftId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkoft.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearId: true, yearName: true } },
                staff: { select: { staffName: true } },
                season: { select: { seasonName: true } },
                oftSubject: { select: { subjectName: true } },
                oftThematicArea: { select: { thematicAreaName: true } },
                discipline: { select: { disciplineName: true } },
                technologies: {
                    include: {
                        oftTechnologyType: true
                    }
                }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { kvkOftId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        // Check existence and ownership
        const existing = await prisma.kvkoft.findFirst({ where });
        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        // Standardize on reportingYearId 
        if (data.reportingYearId !== undefined) {
            updateData.reportingYearId = sanitizeInteger(data.reportingYearId);
        }
        if (data.seasonId !== undefined) updateData.seasonId = parseInt(data.seasonId);
        if (data.staffId !== undefined || data.staffName !== undefined) updateData.staffId = parseInt(data.staffId || data.staffName);
        if (data.oftSubjectId !== undefined) updateData.oftSubjectId = parseInt(data.oftSubjectId);
        if (data.oftThematicAreaId !== undefined || data.thematicArea !== undefined) updateData.oftThematicAreaId = parseInt(data.oftThematicAreaId || data.thematicArea);
        if (data.disciplineId !== undefined || data.discipline !== undefined) updateData.disciplineId = parseInt(data.disciplineId || data.discipline);
        if (data.title !== undefined) updateData.title = data.title;
        if (data.problemDiagnosed !== undefined) updateData.problemDiagnosed = data.problemDiagnosed;
        if (data.sourceOfTechnology !== undefined) updateData.sourceOfTechnology = data.sourceOfTechnology;
        if (data.productionSystem !== undefined) updateData.productionSystem = data.productionSystem;
        if (data.performanceIndicators !== undefined) updateData.performanceIndicators = data.performanceIndicators;
        if (data.areaHaNumber !== undefined || data.area !== undefined) updateData.areaHaNumber = parseFloat(data.areaHaNumber ?? data.area);
        if (data.numberOfLocation !== undefined || data.locations !== undefined) updateData.numberOfLocation = parseInt(data.numberOfLocation ?? data.locations);
        if (data.numberOfTrialReplication !== undefined || data.replications !== undefined) updateData.numberOfTrialReplication = parseInt(data.numberOfTrialReplication ?? data.replications);
        if (data.oftStartDate !== undefined || data.duration !== undefined) updateData.oftStartDate = new Date(data.oftStartDate || data.duration);
        if (data.criticalInput !== undefined) updateData.criticalInput = data.criticalInput;
        if (data.costOfOft !== undefined || data.cost !== undefined) updateData.costOfOft = parseFloat(data.costOfOft ?? data.cost);
        if (data.status !== undefined || data.ongoingCompleted !== undefined) updateData.status = sanitizeString(data.status ?? data.ongoingCompleted, { allowEmpty: true });

        // Farmers mapping
        const farmersMapping = {
            gen_m: 'farmersGeneralM', gen_f: 'farmersGeneralF',
            obc_m: 'farmersObcM', obc_f: 'farmersObcF',
            sc_m: 'farmersScM', sc_f: 'farmersScF',
            st_m: 'farmersStM', st_f: 'farmersStF'
        };
        for (const [front, back] of Object.entries(farmersMapping)) {
            const val = data[front] !== undefined ? data[front] : data[back];
            if (val !== undefined) updateData[back] = parseInt(val);
        }

        // Handle technologies update (delete all and recreate for simplicity, or complex upsert)
        if (data.hasTechnologiesUpdate || Object.keys(data).some(k => k.startsWith('tech_'))) {
            await prisma.kvkoftTechnology.deleteMany({
                where: { kvkOftId: parseInt(id) }
            });

            const techKeys = ['Farmer Practice', 'TO1', 'TO2', 'TO3', 'TO4', 'TO5', 'C1', 'C2'];
            const technologiesData = [];
            for (const key of techKeys) {
                const detail = data[`tech_${key}`];
                if (detail && detail.trim()) {
                    let techType = await prisma.oftTechnologyType.findUnique({
                        where: { name: key }
                    });
                    if (!techType) {
                        techType = await prisma.oftTechnologyType.create({
                            data: { name: key }
                        });
                    }
                    technologiesData.push({
                        oftTechnologyTypeId: techType.oftTechnologyTypeId,
                        details: detail.trim()
                    });
                }
            }
            updateData.technologies = {
                create: technologiesData
            };
        }

        // CRITICAL: Remove ID fields from updateData - Prisma doesn't accept them in data object
        const finalUpdateData = removeIdFieldsForUpdate(updateData, ['kvkOftId', 'id']);

        const result = await prisma.kvkoft.update({
            where: { kvkOftId: parseInt(id) },
            data: finalUpdateData,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearId: true, yearName: true } },
                staff: { select: { staffName: true } },
                season: { select: { seasonName: true } },
                oftSubject: { select: { subjectName: true } },
                oftThematicArea: { select: { thematicAreaName: true } },
                discipline: { select: { disciplineName: true } },
                technologies: {
                    include: {
                        oftTechnologyType: true
                    }
                }
            }
        });

        return _mapResponse(result);
    },

    delete: async (id, user) => {
        const where = { kvkOftId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user', 'kvk_expert', 'kvk_report', 'link_report'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        // Check existence and ownership
        const existing = await prisma.kvkoft.findFirst({ where });
        if (!existing) throw new Error("Record not found or unauthorized");

        // Delete related technologies first (cascading might not be configured)
        await prisma.kvkoftTechnology.deleteMany({
            where: { kvkOftId: parseInt(id) }
        });

        await prisma.kvkoft.delete({
            where: { kvkOftId: parseInt(id) }
        });

        return { success: true };
    }
};

function _mapResponse(r) {
    if (!r) return null;

    const mapped = {
        id: r.kvkOftId,
        kvkOftId: r.kvkOftId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        reportingYearId: r.reportingYearId, // Standardized field name
        reportingYear: r.reportingYear ? r.reportingYear.yearName : undefined, // Display year name for table view
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        staffId: r.staffId,
        staffName: r.staff ? r.staff.staffName : undefined,
        oftSubjectId: r.oftSubjectId,
        subjectName: r.oftSubject ? r.oftSubject.subjectName : undefined,
        oftThematicAreaId: r.oftThematicAreaId,
        thematicAreaName: r.oftThematicArea ? r.oftThematicArea.thematicAreaName : undefined,
        disciplineId: r.disciplineId,
        disciplineName: r.discipline ? r.discipline.disciplineName : undefined,
        title: r.title,
        problemDiagnosed: r.problemDiagnosed,
        sourceOfTechnology: r.sourceOfTechnology,
        productionSystem: r.productionSystem,
        performanceIndicators: r.performanceIndicators,
        areaHaNumber: r.areaHaNumber,
        area: r.areaHaNumber,
        numberOfLocation: r.numberOfLocation,
        locations: r.numberOfLocation,
        numberOfTrialReplication: r.numberOfTrialReplication,
        replications: r.numberOfTrialReplication,
        oftStartDate: r.oftStartDate,
        duration: r.oftStartDate ? r.oftStartDate.toISOString().split('T')[0] : '',
        criticalInput: r.criticalInput,
        costOfOft: r.costOfOft,
        cost: r.costOfOft,

        gen_m: r.farmersGeneralM, gen_f: r.farmersGeneralF,
        obc_m: r.farmersObcM, obc_f: r.farmersObcF,
        sc_m: r.farmersScM, sc_f: r.farmersScF,
        st_m: r.farmersStM, st_f: r.farmersStF,
        ongoingCompleted: r.status || 'Ongoing',
   };

    // Add technologies
    if (r.technologies) {
        r.technologies.forEach(t => {
            mapped[`tech_${t.oftTechnologyType.name}`] = t.details;
        });
    }

    return mapped;
}

module.exports = oftRepository;
