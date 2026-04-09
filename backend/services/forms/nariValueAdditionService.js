const prisma = require('../../config/prisma.js');
const nariValueAdditionRepository = require('../../repositories/forms/nariValueAdditionRepository.js');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');

async function invalidateReportCacheForValueAdditionId(valueAdditionId) {
    const id = parseInt(String(valueAdditionId), 10);
    if (!Number.isFinite(id)) return;
    const row = await prisma.nariValueAddition.findUnique({
        where: { nariValueAdditionId: id },
        select: { kvkId: true },
    });
    if (row?.kvkId != null) {
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariValueAddition', row.kvkId);
    }
}

const nariValueAdditionService = {
    create: async (data, user) => {
        const result = await nariValueAdditionRepository.create(data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariValueAddition', result?.kvkId || user?.kvkId);
        return result;
    },

    findAll: async (filters, user) => {
        return await nariValueAdditionRepository.findAll(filters, user);
    },

    findById: async (id, user) => {
        return await nariValueAdditionRepository.findById(id, user);
    },

    update: async (id, data, user) => {
        const existing = await nariValueAdditionRepository.findById(id, user);
        const result = await nariValueAdditionRepository.update(id, data, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariValueAddition', result?.kvkId || existing?.kvkId || user?.kvkId);
        return result;
    },

    delete: async (id, user) => {
        const existing = await nariValueAdditionRepository.findById(id, user);
        const result = await nariValueAdditionRepository.delete(id, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('nariValueAddition', existing?.kvkId || user?.kvkId);
        return result;
    },

    getResultById: async (id) => {
        return await nariValueAdditionRepository.getResultById(id);
    },

    createResult: async (id, data) => {
        const result = await nariValueAdditionRepository.createResult(id, data);
        await invalidateReportCacheForValueAdditionId(id);
        return result;
    },

    updateResult: async (id, data) => {
        const result = await nariValueAdditionRepository.updateResult(id, data);
        await invalidateReportCacheForValueAdditionId(id);
        return result;
    },
};

module.exports = nariValueAdditionService;
