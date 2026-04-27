const aryaCurrentYearRepository = require('../../repositories/forms/aryaCurrentYearRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');
const { createAttachmentBinding } = require('./formAttachmentBinding');

const attachments = createAttachmentBinding({
    formCode: 'arya_current_year',
    primaryKey: 'aryaCurrentYearId',
});

const aryaCurrentYearService = {
    getAll: async (filters, user) => {
        const rows = await aryaCurrentYearRepository.findAll(filters, user);
        return attachments.decorateMany(rows, user);
    },

    getById: async (id, user) => {
        const record = await aryaCurrentYearRepository.findById(id, user);
        return attachments.decorate(record, user);
    },

    create: async (data, user) => {
        const { payload, attachmentIds } = attachments.strip(data);
        const result = await aryaCurrentYearRepository.create(payload, user);
        await attachments.attach(result, attachmentIds, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', result?.kvkId || user?.kvkId);
        return attachments.decorate(result, user);
    },

    update: async (id, data, user) => {
        const { payload, attachmentIds } = attachments.strip(data);
        const existing = await aryaCurrentYearRepository.findById(id, user);
        const result = await aryaCurrentYearRepository.update(id, payload, user);
        await attachments.attach(result ?? existing, attachmentIds, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk(
            'aryaCurrent',
            result?.kvkId || existing?.kvkId || user?.kvkId,
        );
        return attachments.decorate(result, user);
    },

    delete: async (id, user) => {
        const existing = await aryaCurrentYearRepository.findById(id, user);
        const result = await aryaCurrentYearRepository.delete(id, user);
        await attachments.cleanup(existing, user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', existing?.kvkId || user?.kvkId);
        return result;
    },
};

module.exports = aryaCurrentYearService;
