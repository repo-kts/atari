const prisma = require('../../config/prisma.js');

const nicraSoilHealthRepository = {
    create: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('Valid kvkId is required');

        return await prisma.nicraSoilHealthCard.create({
            data: {
                kvkId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                noOfSoilSamplesCollected: parseInt(data.noOfSoilSamplesCollected || 0),
                noOfSamplesAnalysed: parseInt(data.noOfSamplesAnalysed || 0),
                shcIssued: parseInt(data.shcIssued || 0),
                generalM: parseInt(data.genMale || data.generalM || 0),
                generalF: parseInt(data.genFemale || data.generalF || 0),
                obcM: parseInt(data.obcMale || data.obcM || 0),
                obcF: parseInt(data.obcFemale || data.obcF || 0),
                scM: parseInt(data.scMale || data.scM || 0),
                scF: parseInt(data.scFemale || data.scF || 0),
                stM: parseInt(data.stMale || data.stM || 0),
                stF: parseInt(data.stFemale || data.stF || 0),
                photographs: data.photographs ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : '',
            }
        });
    },

    _mapResponse: (r) => {
        if (!r) return null;
        let photos = [];
        try {
            if (r.photographs) {
                photos = typeof r.photographs === 'string' ? JSON.parse(r.photographs) : r.photographs;
                if (!Array.isArray(photos)) photos = [photos];
            }
        } catch (e) {
            photos = r.photographs ? r.photographs.split(',').filter(Boolean) : [];
        }

        return {
            ...r,
            id: r.nicraSoilHealthCardId,
            startDate: r.startDate && r.startDate instanceof Date ? r.startDate.toISOString().split('T')[0] : (r.startDate || ''),
            endDate: r.endDate && r.endDate instanceof Date ? r.endDate.toISOString().split('T')[0] : (r.endDate || ''),
            genMale: r.generalM,
            genFemale: r.generalF,
            obcMale: r.obcM,
            obcFemale: r.obcF,
            scMale: r.scM,
            scFemale: r.scF,
            stMale: r.stM,
            stFemale: r.stF,
            photographs: photos,
        };
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const results = await prisma.nicraSoilHealthCard.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { nicraSoilHealthCardId: 'desc' }
        });
        return results.map(r => nicraSoilHealthRepository._mapResponse(r));
    },

    findById: async (id, user) => {
        const where = { nicraSoilHealthCardId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const result = await prisma.nicraSoilHealthCard.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
        return nicraSoilHealthRepository._mapResponse(result);
    },

    update: async (id, data, user) => {
        const where = { nicraSoilHealthCardId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }

        const existing = await prisma.nicraSoilHealthCard.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        const updated = await prisma.nicraSoilHealthCard.update({
            where: { nicraSoilHealthCardId: parseInt(id) },
            data: {
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
                noOfSoilSamplesCollected: data.noOfSoilSamplesCollected !== undefined ? parseInt(data.noOfSoilSamplesCollected) : existing.noOfSoilSamplesCollected,
                noOfSamplesAnalysed: data.noOfSamplesAnalysed !== undefined ? parseInt(data.noOfSamplesAnalysed) : existing.noOfSamplesAnalysed,
                shcIssued: data.shcIssued !== undefined ? parseInt(data.shcIssued) : existing.shcIssued,
                generalM: data.genMale !== undefined ? parseInt(data.genMale) : (data.generalM !== undefined ? parseInt(data.generalM) : existing.generalM),
                generalF: data.genFemale !== undefined ? parseInt(data.genFemale) : (data.generalF !== undefined ? parseInt(data.generalF) : existing.generalF),
                obcM: data.obcMale !== undefined ? parseInt(data.obcMale) : (data.obcM !== undefined ? parseInt(data.obcM) : existing.obcM),
                obcF: data.obcFemale !== undefined ? parseInt(data.obcFemale) : (data.obcF !== undefined ? parseInt(data.obcF) : existing.obcF),
                scM: data.scMale !== undefined ? parseInt(data.scMale) : (data.scM !== undefined ? parseInt(data.scM) : existing.scM),
                scF: data.scFemale !== undefined ? parseInt(data.scFemale) : (data.scF !== undefined ? parseInt(data.scF) : existing.scF),
                stM: data.stMale !== undefined ? parseInt(data.stMale) : (data.stM !== undefined ? parseInt(data.stM) : existing.stM),
                stF: data.stFemale !== undefined ? parseInt(data.stFemale) : (data.stF !== undefined ? parseInt(data.stF) : existing.stF),
                photographs: data.photographs !== undefined ? (typeof data.photographs === 'string' ? data.photographs : JSON.stringify(data.photographs)) : (existing.photographs || ''),
            }
        });
        return nicraSoilHealthRepository._mapResponse(updated);
    },

    delete: async (id, user) => {
        const where = { nicraSoilHealthCardId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = user.kvkId;
        }
        const existing = await prisma.nicraSoilHealthCard.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');

        return await prisma.nicraSoilHealthCard.delete({
            where: { nicraSoilHealthCardId: parseInt(id) }
        });
    }
};

module.exports = nicraSoilHealthRepository;
