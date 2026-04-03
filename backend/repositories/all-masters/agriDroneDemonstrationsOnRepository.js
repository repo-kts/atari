const prisma = require('../../config/prisma.js');

/**
 * Agri Drone - "Demonstrations on" Master
 */

function mapRow(row) {
    if (!row) return null;
    return {
        ...row,
        // Common frontend aliases
        id: row.agriDroneDemonstrationsOnId,
        name: row.demonstrationsOnName,
    };
}

const agriDroneDemonstrationsOnRepository = {
    findAll: async ({ search = '', limit = 100, offset = 0 } = {}) => {
        const take = Math.min(Number(limit || 100), 500);
        const skip = Math.max(Number(offset || 0), 0);
        const where = search
            ? { demonstrationsOnName: { contains: String(search), mode: 'insensitive' } }
            : {};

        const rows = await prisma.agriDroneDemonstrationsOnMaster.findMany({
            where,
            orderBy: { demonstrationsOnName: 'asc' },
            take,
            skip,
        });

        return (rows || []).map(mapRow);
    },

    findById: async (id) => {
        const row = await prisma.agriDroneDemonstrationsOnMaster.findUnique({
            where: { agriDroneDemonstrationsOnId: Number(id) },
        });
        return mapRow(row);
    },

    create: async (data) => {
        const name = (data?.demonstrationsOnName ?? data?.demonstrations_on_name ?? data?.name ?? '').toString().trim();
        if (!name) throw new Error('demonstrationsOnName is required');

        const row = await prisma.agriDroneDemonstrationsOnMaster.create({
            data: { demonstrationsOnName: name },
        });
        return mapRow(row);
    },

    update: async (id, data) => {
        const name = (data?.demonstrationsOnName ?? data?.demonstrations_on_name ?? data?.name ?? '').toString().trim();
        if (!name) throw new Error('demonstrationsOnName is required');

        const row = await prisma.agriDroneDemonstrationsOnMaster.update({
            where: { agriDroneDemonstrationsOnId: Number(id) },
            data: { demonstrationsOnName: name },
        });
        return mapRow(row);
    },

    delete: async (id) => {
        await prisma.agriDroneDemonstrationsOnMaster.delete({
            where: { agriDroneDemonstrationsOnId: Number(id) },
        });
        return { success: true };
    },
};

module.exports = agriDroneDemonstrationsOnRepository;

