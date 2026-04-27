const raweFetRepository = require('../../repositories/forms/raweFetRepository');
const formAttachmentService = require('../formAttachmentService.js');

const FORM_CODE = 'rawe_fet';

function stripAttachmentIds(data) {
    if (!data || typeof data !== 'object') return { payload: data, attachmentIds: [] };
    const { attachmentIds, ...rest } = data;
    return { payload: rest, attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : [] };
}

async function decorate(record, user) {
    if (!record?.raweProgrammeId || !record.kvkId) return record;
    const attachments = await formAttachmentService.listByRecord({
        formCode: FORM_CODE,
        recordId: record.raweProgrammeId,
        kvkId: record.kvkId,
    }, user);
    return {
        ...record,
        photos: attachments.filter((a) => a.kind === 'PHOTO'),
        documents: attachments.filter((a) => a.kind !== 'PHOTO'),
    };
}

const raweFetService = {
    create: async (data, user) => {
        const { payload, attachmentIds } = stripAttachmentIds(data);
        const result = await raweFetRepository.create(payload, user);
        if (attachmentIds.length > 0 && result?.raweProgrammeId && result.kvkId) {
            await formAttachmentService.attachToRecord({
                attachmentIds,
                formCode: FORM_CODE,
                recordId: result.raweProgrammeId,
                kvkId: result.kvkId,
            }, user);
        }
        return decorate(result, user);
    },
    findAll: async (filters, user) => {
        const rows = await raweFetRepository.findAll(filters, user);
        if (!Array.isArray(rows)) return rows;
        return Promise.all(rows.map((r) => decorate(r, user)));
    },
    findById: async (id, user) => {
        const record = await raweFetRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return decorate(record, user);
    },
    update: async (id, data, user) => {
        const { payload, attachmentIds } = stripAttachmentIds(data);
        const existing = await raweFetRepository.findById(id, user);
        const result = await raweFetRepository.update(id, payload, user);
        const recordId = result?.raweProgrammeId ?? Number(id);
        const kvkId = result?.kvkId ?? existing?.kvkId;
        if (attachmentIds.length > 0 && recordId && kvkId) {
            await formAttachmentService.attachToRecord({
                attachmentIds,
                formCode: FORM_CODE,
                recordId,
                kvkId,
            }, user);
        }
        return decorate(result, user);
    },
    delete: async (id, user) => {
        const existing = await raweFetRepository.findById(id, user);
        const result = await raweFetRepository.delete(id, user);
        if (existing?.raweProgrammeId && existing?.kvkId) {
            try {
                await formAttachmentService.deleteManyByRecord({
                    formCode: FORM_CODE,
                    recordId: existing.raweProgrammeId,
                    kvkId: existing.kvkId,
                }, user);
            } catch { /* best-effort */ }
        }
        return result;
    },
    findAllAttachmentTypes: async () => raweFetRepository.findAllAttachmentTypes(),
};

module.exports = raweFetService;
