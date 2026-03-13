const prisma = require('../../config/prisma.js');

const ppvFraPlantVarietiesRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) throw new Error('KVK ID is required');

        return await prisma.ppvFraPlantVarieties.create({
            data: {
                kvkId,
                reportingYear: parseInt(data.reportingYear || new Date().getFullYear()),
                cropName: data.cropName || '',
                farmerName: data.farmerName || '',
                mobile: data.mobile || '',
                village: data.village || '',
                block: data.block || '',
                district: data.district || '',
                characteristics: data.characteristics || '',
                image: data.image || null,
            }
        });
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && user.kvkId) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }
        return await prisma.ppvFraPlantVarieties.findMany({
            where,
            include: {
                kvk: {
                    select: {
                        kvkName: true,
                        district: { select: { districtName: true } }
                    }
                }
            },
            orderBy: { ppvFraPlantVarietiesID: 'desc' }
        });
    },

    findById: async (id, user) => {
        const where = { ppvFraPlantVarietiesID: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        return await prisma.ppvFraPlantVarieties.findFirst({
            where,
            include: {
                kvk: {
                    select: {
                        kvkName: true,
                        district: { select: { districtName: true } }
                    }
                }
            }
        });
    },

    update: async (id, data, user) => {
        const where = { ppvFraPlantVarietiesID: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.ppvFraPlantVarieties.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.ppvFraPlantVarieties.update({
            where: { ppvFraPlantVarietiesID: parseInt(id) },
            data: {
                reportingYear: data.reportingYear !== undefined ? parseInt(data.reportingYear) : existing.reportingYear,
                cropName: data.cropName !== undefined ? data.cropName : existing.cropName,
                farmerName: data.farmerName !== undefined ? data.farmerName : existing.farmerName,
                mobile: data.mobile !== undefined ? data.mobile : existing.mobile,
                village: data.village !== undefined ? data.village : existing.village,
                block: data.block !== undefined ? data.block : existing.block,
                district: data.district !== undefined ? data.district : existing.district,
                characteristics: data.characteristics !== undefined ? data.characteristics : existing.characteristics,
                image: data.image !== undefined ? data.image : existing.image,
            }
        });
    },

    delete: async (id, user) => {
        const where = { ppvFraPlantVarietiesID: parseInt(id) };
        if (user && user.kvkId) where.kvkId = parseInt(user.kvkId);
        const existing = await prisma.ppvFraPlantVarieties.findFirst({ where });
        if (!existing) throw new Error('Record not found or unauthorized');
        return await prisma.ppvFraPlantVarieties.delete({ where: { ppvFraPlantVarietiesID: parseInt(id) } });
    }
};

module.exports = ppvFraPlantVarietiesRepository;
