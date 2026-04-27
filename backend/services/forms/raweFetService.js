const raweFetRepository = require('../../repositories/forms/raweFetRepository');
const { createAttachmentBinding } = require('./formAttachmentBinding');

const attachments = createAttachmentBinding({
    formCode: 'rawe_fet',
    primaryKey: 'raweProgrammeId',
});

const raweFetService = {
    create: async (data, user) => {
        const { payload, attachmentIds } = attachments.strip(data);
        const result = await raweFetRepository.create(payload, user);
        await attachments.attach(result, attachmentIds, user);
        return attachments.decorate(result, user);
    },
    findAll: async (filters, user) => {
        const rows = await raweFetRepository.findAll(filters, user);
        return attachments.decorateMany(rows, user);
    },
    findById: async (id, user) => {
        const record = await raweFetRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return attachments.decorate(record, user);
    },
    update: async (id, data, user) => {
        const { payload, attachmentIds } = attachments.strip(data);
        const existing = await raweFetRepository.findById(id, user);
        const result = await raweFetRepository.update(id, payload, user);
        await attachments.attach(result ?? existing, attachmentIds, user);
        return attachments.decorate(result, user);
    },
    delete: async (id, user) => {
        const existing = await raweFetRepository.findById(id, user);
        const result = await raweFetRepository.delete(id, user);
        await attachments.cleanup(existing, user);
        return result;
    },
    findAllAttachmentTypes: async () => raweFetRepository.findAllAttachmentTypes(),
};

module.exports = raweFetService;
