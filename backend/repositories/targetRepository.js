const prisma = require('../config/prisma.js');

const targetRepository = {
  create: async (data) => {
    return prisma.target.create({ data });
  },

  findById: async (targetId) => {
    return prisma.target.findUnique({
      where: { targetId },
      include: {
        kvk: {
          select: {
            kvkId: true,
            kvkName: true,
          },
        },
        createdBy: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  update: async (targetId, data) => {
    return prisma.target.update({
      where: { targetId },
      data,
    });
  },

  remove: async (targetId) => {
    return prisma.target.delete({
      where: { targetId },
    });
  },

  list: async ({ where, skip, take, orderBy }) => {
    const [rows, total] = await Promise.all([
      prisma.target.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          kvk: {
            select: {
              kvkId: true,
              kvkName: true,
            },
          },
          createdBy: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.target.count({ where }),
    ]);

    return { rows, total };
  },

  findKvkById: async (kvkId) => {
    return prisma.kvk.findUnique({
      where: { kvkId },
      select: {
        kvkId: true,
        kvkName: true,
        zoneId: true,
        stateId: true,
        districtId: true,
        orgId: true,
      },
    });
  },

  listScopedKvks: async (where) => {
    return prisma.kvk.findMany({
      where,
      select: {
        kvkId: true,
        kvkName: true,
      },
      orderBy: [{ kvkName: 'asc' }, { kvkId: 'asc' }],
    });
  },
};

module.exports = targetRepository;
