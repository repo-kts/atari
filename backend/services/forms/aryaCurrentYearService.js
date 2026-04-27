const aryaCurrentYearRepository = require('../../repositories/forms/aryaCurrentYearRepository');
const reportCacheInvalidationService = require('../reports/reportCacheInvalidationService.js');
const formAttachmentService = require('../formAttachmentService.js');

const FORM_CODE = 'arya_current_year';

function stripAttachmentIds(data) {
    if (!data || typeof data !== 'object') return { payload: data, attachmentIds: [] };
    const { attachmentIds, ...rest } = data;
    return { payload: rest, attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : [] };
}

async function decorate(record, user) {
    if (!record?.aryaCurrentYearId || !record.kvkId) return record;
    const photos = await formAttachmentService.listByRecord({
        formCode: FORM_CODE,
        recordId: record.aryaCurrentYearId,
        kvkId: record.kvkId,
        kind: 'PHOTO',
    }, user);
    return { ...record, photos };
}

const aryaCurrentYearService = {
    getAll: async (filters, user) => {
        const rows = await aryaCurrentYearRepository.findAll(filters, user);
        if (!Array.isArray(rows)) return rows;
        return Promise.all(rows.map((r) => decorate(r, user)));
    },

    getById: async (id, user) => {
        const record = await aryaCurrentYearRepository.findById(id, user);
        return decorate(record, user);
    },

    create: async (data, user) => {
        const { payload, attachmentIds } = stripAttachmentIds(data);
        const result = await aryaCurrentYearRepository.create(payload, user);
        if (attachmentIds.length > 0 && result?.aryaCurrentYearId && result.kvkId) {
            await formAttachmentService.attachToRecord({
                attachmentIds,
                formCode: FORM_CODE,
                recordId: result.aryaCurrentYearId,
                kvkId: result.kvkId,
            }, user);
        }
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', result?.kvkId || user?.kvkId);
        return decorate(result, user);
    },

    update: async (id, data, user) => {
        const { payload, attachmentIds } = stripAttachmentIds(data);
        const existing = await aryaCurrentYearRepository.findById(id, user);
        const result = await aryaCurrentYearRepository.update(id, payload, user);
        const recordId = result?.aryaCurrentYearId ?? Number(id);
        const kvkId = result?.kvkId ?? existing?.kvkId;
        if (attachmentIds.length > 0 && recordId && kvkId) {
            await formAttachmentService.attachToRecord({
                attachmentIds,
                formCode: FORM_CODE,
                recordId,
                kvkId,
            }, user);
        }
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', kvkId || user?.kvkId);
        return decorate(result, user);
    },

    delete: async (id, user) => {
        const existing = await aryaCurrentYearRepository.findById(id, user);
        const result = await aryaCurrentYearRepository.delete(id, user);
        if (existing?.aryaCurrentYearId && existing?.kvkId) {
            try {
                await formAttachmentService.deleteManyByRecord({
                    formCode: FORM_CODE,
                    recordId: existing.aryaCurrentYearId,
                    kvkId: existing.kvkId,
                }, user);
            } catch { /* best-effort */ }
        }
        await reportCacheInvalidationService.invalidateDataSourceForKvk('aryaCurrent', existing?.kvkId || user?.kvkId);
        return result;
    },
};

module.exports = aryaCurrentYearService;
