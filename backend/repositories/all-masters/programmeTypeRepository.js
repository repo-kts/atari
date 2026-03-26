const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const programmeTypeRepository = {
    getAll: async () => {
        return await prisma.programmeTypeMaster.findMany({
            orderBy: { programmeType: 'asc' }
        });
    },

    getById: async (id) => {
        return await prisma.programmeTypeMaster.findUnique({
            where: { programmeTypeId: parseInt(id) }
        });
    },

    create: async (data) => {
        return await prisma.programmeTypeMaster.create({
            data: {
                programmeType: data.programmeType
            }
        });
    },

    update: async (id, data) => {
        return await prisma.programmeTypeMaster.update({
            where: { programmeTypeId: parseInt(id) },
            data: {
                programmeType: data.programmeType
            }
        });
    },

    delete: async (id) => {
        return await prisma.programmeTypeMaster.delete({
            where: { programmeTypeId: parseInt(id) }
        });
    },

    count: async () => {
        return await prisma.programmeTypeMaster.count();
    }
};

module.exports = programmeTypeRepository;
