const prisma = require('../config/prisma.js');

const moduleImageRepository = {
  /**
   * Create module image record.
   * @param {object} data
   */
  create: async (data) => {
    return prisma.moduleImage.create({ data });
  },

  /**
   * Get one image by ID with related category + kvk.
   * @param {number} imageId
   */
  findById: async (imageId) => {
    return prisma.moduleImage.findUnique({
      where: { imageId },
      include: {
        kvk: {
          select: {
            kvkId: true,
            kvkName: true,
          },
        },
        module: {
          select: {
            moduleId: true,
            moduleCode: true,
            menuName: true,
            subMenuName: true,
          },
        },
      },
    });
  },

  /**
   * List paginated module images.
   * @param {object} params
   */
  list: async ({ where, skip, take, orderBy }) => {
    const [rows, total] = await Promise.all([
      prisma.moduleImage.findMany({
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
          module: {
            select: {
              moduleId: true,
              moduleCode: true,
              menuName: true,
              subMenuName: true,
            },
          },
          uploadedBy: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.moduleImage.count({ where }),
    ]);

    return { rows, total };
  },

  /**
   * Distinct KVK filter options from images in scope.
   * @param {object} where
   */
  listDistinctKvks: async (where) => {
    return prisma.moduleImage.findMany({
      where,
      select: {
        kvkId: true,
        kvk: {
          select: {
            kvkName: true,
          },
        },
      },
      distinct: ['kvkId'],
      orderBy: [{ kvk: { kvkName: 'asc' } }, { kvkId: 'asc' }],
    });
  },

  /**
   * List KVKs from master table within scope.
   * @param {object} where
   */
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

  /**
   * List category options from modules table.
   * @param {string[]} allowedMenuNames
   */
  listCategories: async (allowedMenuNames) => {
    return prisma.module.findMany({
      where: {
        menuName: { in: allowedMenuNames },
      },
      select: {
        moduleId: true,
        moduleCode: true,
        menuName: true,
        subMenuName: true,
      },
      orderBy: [{ menuName: 'asc' }, { subMenuName: 'asc' }, { moduleId: 'asc' }],
    });
  },

  /**
   * Get one category module by ID.
   * @param {number} moduleId
   */
  findCategoryById: async (moduleId) => {
    return prisma.module.findUnique({
      where: { moduleId },
      select: {
        moduleId: true,
        moduleCode: true,
        menuName: true,
        subMenuName: true,
      },
    });
  },

  /**
   * Get one KVK by ID with scope fields.
   * @param {number} kvkId
   */
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
};

module.exports = moduleImageRepository;
