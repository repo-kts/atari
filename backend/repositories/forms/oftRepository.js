const prisma = require('../../config/prisma.js');

const oftRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        // Prepare technology types mapping
        const techKeys = ['Farmer Practice', 'TO1', 'TO2', 'TO3', 'TO4', 'TO5', 'C1', 'C2'];
        const technologiesData = [];

        for (const key of techKeys) {
            const detail = data[`tech_${key}`];
            if (detail && detail.trim()) {
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
                    details: detail.trim()
                });
            }
        }

        const result = await prisma.kvkoft.create({
            data: {
                kvkId: kvkId,
                reportingYear: parseInt(data.reportingYear) || new Date().getFullYear(),
                seasonId: parseInt(data.seasonId) || 1,
                staffId: parseInt(data.staffId || data.staffName) || 1,
                oftSubjectId: parseInt(data.oftSubjectId) || 1,
                oftThematicAreaId: parseInt(data.oftThematicAreaId || data.thematicArea) || 1,
                disciplineId: parseInt(data.disciplineId || data.discipline) || 1,
                title: data.title || '',
                problemDiagnosed: data.problemDiagnosed || '',
                sourceOfTechnology: data.sourceOfTechnology || '',
                productionSystem: data.productionSystem || '',
                performanceIndicators: data.performanceIndicators || '',
                areaHaNumber: parseFloat(data.areaHaNumber || data.area) || 0,
                numberOfLocation: parseInt(data.numberOfLocation || data.locations) || 0,
                numberOfTrialReplication: parseInt(data.numberOfTrialReplication || data.replications) || 0,
                oftStartDate: data.oftStartDate || data.duration ? new Date(data.oftStartDate || data.duration) : new Date(),
                criticalInput: data.criticalInput || '',
                costOfOft: parseFloat(data.costOfOft || data.cost) || 0,
                farmersGeneralM: parseInt(data.farmersGeneralM || data.gen_m) || 0,
                farmersGeneralF: parseInt(data.farmersGeneralF || data.gen_f) || 0,
                farmersObcM: parseInt(data.farmersObcM || data.obc_m) || 0,
                farmersObcF: parseInt(data.farmersObcF || data.obc_f) || 0,
                farmersScM: parseInt(data.farmersScM || data.sc_m) || 0,
                farmersScF: parseInt(data.farmersScF || data.sc_f) || 0,
                farmersStM: parseInt(data.farmersStM || data.st_m) || 0,
                farmersStF: parseInt(data.farmersStF || data.st_f) || 0,
                technologies: {
                    create: technologiesData
                }
            },
            include: {
                kvk: { select: { kvkName: true } },
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
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYear) {
            where.reportingYear = parseInt(filters.reportingYear);
        }

        const results = await prisma.kvkoft.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
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
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkoft.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
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
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        // Check existence and ownership
        const existing = await prisma.kvkoft.findFirst({ where });
        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        if (data.reportingYear !== undefined) updateData.reportingYear = parseInt(data.reportingYear);
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

        const result = await prisma.kvkoft.update({
            where: { kvkOftId: parseInt(id) },
            data: updateData,
            include: {
                kvk: { select: { kvkName: true } },
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
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
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
        reportingYear: r.reportingYear,
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

        // Frontend friendly table labels (matching routeConfig.ts exactly, including typos)
        'Reporting Year': r.reportingYear,
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Staff': r.staff ? r.staff.staffName : undefined,
        'Trail on form': r.title, // Frontend has typo 'Trail'
        'Problem Diagnoised': r.problemDiagnosed, // Frontend has typo 'Diagnoised'
        'Ongoing/Completed': r.oftStartDate < new Date() ? 'Completed' : 'Ongoing'
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
