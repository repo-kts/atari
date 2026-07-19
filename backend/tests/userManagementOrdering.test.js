const test = require('node:test');
const assert = require('node:assert/strict');

test('user management requests users in alphabetical order', async () => {
    const prismaPath = require.resolve('../config/prisma.js');
    const repositoryPath = require.resolve('../repositories/userRepository.js');
    const originalPrismaModule = require.cache[prismaPath];
    let findManyOptions;

    require.cache[prismaPath] = {
        id: prismaPath,
        filename: prismaPath,
        loaded: true,
        exports: {
            user: {
                findMany: async (options) => {
                    findManyOptions = options;
                    return [];
                },
            },
        },
    };
    delete require.cache[repositoryPath];

    try {
        const userRepository = require(repositoryPath);
        await userRepository.findUsersByHierarchy({ search: 'kvk' });

        assert.deepEqual(findManyOptions.orderBy, [
            { name: 'asc' },
            { userId: 'asc' },
        ]);
        assert.deepEqual(findManyOptions.where.OR, [
            { name: { contains: 'kvk', mode: 'insensitive' } },
            { email: { contains: 'kvk', mode: 'insensitive' } },
        ]);
    } finally {
        delete require.cache[repositoryPath];
        if (originalPrismaModule) require.cache[prismaPath] = originalPrismaModule;
        else delete require.cache[prismaPath];
    }
});
