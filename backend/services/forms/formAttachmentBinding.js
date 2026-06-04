const formAttachmentService = require('../formAttachmentService.js');

const KIND_KEY = {
    PHOTO: 'photos',
    DATASHEET: 'datasheets',
    DOCUMENT: 'documents',
};

/**
 * Factory that returns the strip / attach / decorate / cleanup helpers a form
 * service needs to bind itself to FormAttachment without duplicating boilerplate.
 *
 * Usage:
 *   const binding = createAttachmentBinding({
 *     formCode: 'sac_meeting',
 *     primaryKey: 'sacMeetingId',
 *   });
 *
 *   const create = async (data, user) => {
 *     const { payload, attachmentIds } = binding.strip(data);
 *     const result = await repo.create(payload, user);
 *     await binding.attach(result, attachmentIds, user);
 *     return binding.decorate(result, user);
 *   };
 */
function createAttachmentBinding({ formCode, primaryKey, kvkKey = 'kvkId' }) {
    if (!formCode || !primaryKey) {
        throw new Error('createAttachmentBinding requires formCode and primaryKey');
    }

    function strip(data) {
        if (!data || typeof data !== 'object') {
            return { payload: data, attachmentIds: [] };
        }
        const { attachmentIds, ...rest } = data;
        return {
            payload: rest,
            attachmentIds: Array.isArray(attachmentIds) ? attachmentIds : [],
        };
    }

    async function attach(record, attachmentIds, user) {
        if (!Array.isArray(attachmentIds) || attachmentIds.length === 0) return;
        const recordId = record?.[primaryKey];
        const kvkId = record?.[kvkKey];
        if (!recordId || !kvkId) return;
        await formAttachmentService.attachToRecord({
            attachmentIds,
            formCode,
            recordId,
            kvkId,
        }, user);
    }

    async function decorate(record, user) {
        if (!record || typeof record !== 'object') return record;
        const recordId = record[primaryKey];
        const kvkId = record[kvkKey];
        if (!recordId || !kvkId) return record;
        const attachments = await formAttachmentService.listByRecord({
            formCode,
            recordId,
            kvkId,
        }, user);
        const groups = { photos: [], datasheets: [], documents: [] };
        for (const att of attachments) {
            const key = KIND_KEY[att.kind] || 'documents';
            groups[key].push(att);
        }
        return { ...record, ...groups };
    }

    async function decorateMany(rows, user) {
        if (!Array.isArray(rows)) return rows;
        return Promise.all(rows.map((r) => decorate(r, user)));
    }

    async function cleanup(record, user) {
        if (!record) return;
        const recordId = record[primaryKey];
        const kvkId = record[kvkKey];
        if (!recordId || !kvkId) return;
        try {
            await formAttachmentService.deleteManyByRecord({
                formCode,
                recordId,
                kvkId,
            }, user);
        } catch { /* best-effort */ }
    }

    return { strip, attach, decorate, decorateMany, cleanup, formCode };
}

/**
 * Wrap a repository with the attachment-aware CRUD pattern. Each method
 * produces the same return shape the original service did, so existing
 * callers don't need to change.
 *
 *   const crud = createAttachmentAwareCrud({
 *     repo: nicraDetailsRepository,
 *     binding: createAttachmentBinding({ formCode: 'nicra_details', primaryKey: 'nicraDetailsId' }),
 *     onWrite: (record, user) => invalidate('nicra', record?.kvkId || user?.kvkId),
 *   });
 *
 * The optional onWrite hook fires after create / update / delete with the
 * record (or existing record on delete) and user.
 */
function createAttachmentAwareCrud({ repo, binding, onWrite }) {
    if (!repo || !binding) {
        throw new Error('createAttachmentAwareCrud requires repo and binding');
    }

    async function findAll(filters, user) {
        const rows = await repo.findAll(filters, user);
        if (rows && Array.isArray(rows.data)) {
            rows.data = await binding.decorateMany(rows.data, user);
            return rows;
        }
        return binding.decorateMany(rows, user);
    }

    async function findById(id, user) {
        const record = await repo.findById(id, user);
        return binding.decorate(record, user);
    }

    async function create(data, user) {
        const { payload, attachmentIds } = binding.strip(data);
        const result = await repo.create(payload, user);
        await binding.attach(result, attachmentIds, user);
        if (onWrite) await onWrite(result, user);
        return binding.decorate(result, user);
    }

    async function update(id, data, user) {
        const { payload, attachmentIds } = binding.strip(data);
        const existing = await repo.findById(id, user);
        const result = await repo.update(id, payload, user);
        await binding.attach(result ?? existing, attachmentIds, user);
        if (onWrite) await onWrite(result ?? existing, user);
        return binding.decorate(result, user);
    }

    async function remove(id, user) {
        const existing = await repo.findById(id, user);
        const result = await repo.delete(id, user);
        await binding.cleanup(existing, user);
        if (onWrite) await onWrite(existing, user);
        return result;
    }

    return { findAll, findById, create, update, delete: remove };
}

module.exports = { createAttachmentBinding, createAttachmentAwareCrud };
