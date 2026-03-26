const prisma = require('../../config/prisma.js');

const nariTrainingRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkId = isKvkScoped ? parseInt(user.kvkId) : parseInt(data.kvkId);

        if (isNaN(kvkId)) throw new Error('Valid kvkId is required');

        const result = await prisma.nariTrainingProgramme.create({
            data: {
                kvkId,
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : null,
                activityId: data.activityId ? parseInt(data.activityId) : null,
                campusType: data.campusType || 'ON_CAMPUS',
                nameOfNutriSmartVillage: data.nameOfNutriSmartVillage || '',
                areaOfTraining: data.areaOfTraining || '',
                titleOfTraining: data.titleOfTraining || '',
                noOfDays: parseInt(data.noOfDays || 0),
                noOfCourses: parseInt(data.noOfCourses || 0),
                venue: data.venue || '',
                generalM: parseInt(data.generalM || data.genMale || 0),
                generalF: parseInt(data.generalF || data.genFemale || 0),
                obcM: parseInt(data.obcM || data.obcMale || 0),
                obcF: parseInt(data.obcF || data.obcFemale || 0),
                scM: parseInt(data.scM || data.scMale || 0),
                scF: parseInt(data.scF || data.scFemale || 0),
                stM: parseInt(data.stM || data.stMale || 0),
                stF: parseInt(data.stF || data.stFemale || 0),
            },
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } },
                activity: { select: { activityName: true } },
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

        if (filters.reportingYearId) where.reportingYearId = parseInt(filters.reportingYearId);

        const results = await prisma.nariTrainingProgramme.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } },
                activity: { select: { activityName: true } },
            },
            orderBy: { nariTrainingProgrammeId: 'desc' }
        });
        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.nariTrainingProgramme.findUnique({
            where: { nariTrainingProgrammeId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } },
                activity: { select: { activityName: true } },
            }
        });
        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const result = await prisma.nariTrainingProgramme.update({
            where: { nariTrainingProgrammeId: parseInt(id) },
            data: {
                reportingYearId: data.reportingYearId ? parseInt(data.reportingYearId) : undefined,
                activityId: data.activityId ? parseInt(data.activityId) : undefined,
                campusType: data.campusType || undefined,
                nameOfNutriSmartVillage: data.nameOfNutriSmartVillage !== undefined ? data.nameOfNutriSmartVillage : undefined,
                areaOfTraining: data.areaOfTraining !== undefined ? data.areaOfTraining : undefined,
                titleOfTraining: data.titleOfTraining !== undefined ? data.titleOfTraining : undefined,
                noOfDays: data.noOfDays !== undefined ? parseInt(data.noOfDays) : undefined,
                noOfCourses: data.noOfCourses !== undefined ? parseInt(data.noOfCourses) : undefined,
                venue: data.venue !== undefined ? data.venue : undefined,
                generalM: data.generalM !== undefined || data.genMale !== undefined ? parseInt(data.generalM ?? data.genMale) : undefined,
                generalF: data.generalF !== undefined || data.genFemale !== undefined ? parseInt(data.generalF ?? data.genFemale) : undefined,
                obcM: data.obcM !== undefined || data.obcMale !== undefined ? parseInt(data.obcM ?? data.obcMale) : undefined,
                obcF: data.obcF !== undefined || data.obcFemale !== undefined ? parseInt(data.obcF ?? data.obcFemale) : undefined,
                scM: data.scM !== undefined || data.scMale !== undefined ? parseInt(data.scM ?? data.scMale) : undefined,
                scF: data.scF !== undefined || data.scFemale !== undefined ? parseInt(data.scF ?? data.scFemale) : undefined,
                stM: data.stM !== undefined || data.stMale !== undefined ? parseInt(data.stM ?? data.stMale) : undefined,
                stF: data.stF !== undefined || data.stFemale !== undefined ? parseInt(data.stF ?? data.stFemale) : undefined,
            },
            include: {
                kvk: { select: { kvkName: true } },
                reportingYear: { select: { yearName: true } },
                activity: { select: { activityName: true } },
            }
        });
        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.nariTrainingProgramme.delete({
            where: { nariTrainingProgrammeId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    const totalBeneficiaries = (r.generalM || 0) + (r.generalF || 0) + (r.obcM || 0) + (r.obcF || 0) + (r.scM || 0) + (r.scF || 0) + (r.stM || 0) + (r.stF || 0);

    return {
        id: r.nariTrainingProgrammeId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName,
        reportingYearId: r.reportingYearId,
        yearName: r.reportingYear?.yearName,
        activityId: r.activityId,
        activityName: r.activity?.activityName,
        campusType: r.campusType,
        nameOfNutriSmartVillage: r.nameOfNutriSmartVillage,
        areaOfTraining: r.areaOfTraining,
        titleOfTraining: r.titleOfTraining,
        noOfDays: r.noOfDays,
        noOfCourses: r.noOfCourses,
        venue: r.venue,
        generalM: r.generalM,
        generalF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        totalBeneficiaries,
        
        // Aliases for frontend consistency
        villageName: r.nameOfNutriSmartVillage,
        genMale: r.generalM,
        genFemale: r.generalF,
        obcMale: r.obcM,
        obcFemale: r.obcF,
        scMale: r.scM,
        scFemale: r.scF,
        stMale: r.stM,
        stFemale: r.stF
    };
}

module.exports = nariTrainingRepository;
