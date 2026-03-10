const prisma = require('../../config/prisma.js');

const nicraMasterRepository = {
    getAllCategories: async () => {
        const categories = await prisma.nicraCategory.findMany({
            include: { subCategories: true },
            orderBy: { categoryName: 'asc' }
        });
        return categories.map(c => ({
            ...c,
            id: c.nicraCategoryId,
            categoryId: c.nicraCategoryId,
            subCategories: c.subCategories.map(sc => ({
                ...sc,
                id: sc.nicraSubCategoryId,
                subCategoryId: sc.nicraSubCategoryId,
                categoryId: sc.nicraCategoryId
            }))
        }));
    },

    getAllSubCategories: async (categoryId) => {
        const where = {};
        if (categoryId) where.nicraCategoryId = parseInt(categoryId);
        const subCategories = await prisma.nicraSubCategory.findMany({
            where,
            orderBy: { subCategoryName: 'asc' }
        });
        return subCategories.map(sc => ({
            ...sc,
            id: sc.nicraSubCategoryId,
            subCategoryId: sc.nicraSubCategoryId,
            categoryId: sc.nicraCategoryId
        }));
    }
};

module.exports = nicraMasterRepository;
