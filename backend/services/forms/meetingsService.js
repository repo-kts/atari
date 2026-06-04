const meetingsRepository = require('../../repositories/forms/meetingsRepository.js');
const { createAttachmentBinding } = require('./formAttachmentBinding.js');

const sacAttachments = createAttachmentBinding({
    formCode: 'sac_meeting',
    primaryKey: 'sacMeetingId',
});

const meetingsService = {
    sac: {
        findAll: async (filters, user) => {
            const rows = await meetingsRepository.sac.findAll(filters, user);
            return sacAttachments.decorateMany(rows, user);
        },
        findById: async (id, user) => {
            const record = await meetingsRepository.sac.findById(id, user);
            return sacAttachments.decorate(record, user);
        },
        create: async (data, user) => {
            const { payload, attachmentIds } = sacAttachments.strip(data);
            const result = await meetingsRepository.sac.create(payload, user);
            await sacAttachments.attach(result, attachmentIds, user);
            return sacAttachments.decorate(result, user);
        },
        update: async (id, data, user) => {
            const { payload, attachmentIds } = sacAttachments.strip(data);
            const existing = await meetingsRepository.sac.findById(id, user);
            const result = await meetingsRepository.sac.update(id, payload, user);
            await sacAttachments.attach(result ?? existing, attachmentIds, user);
            return sacAttachments.decorate(result, user);
        },
        delete: async (id, user) => {
            const existing = await meetingsRepository.sac.findById(id, user);
            const result = await meetingsRepository.sac.delete(id, user);
            await sacAttachments.cleanup(existing, user);
            return result;
        },
    },
    other: {
        findAll: async (filters, user) => meetingsRepository.other.findAll(filters, user),
        findById: async (id, user) => meetingsRepository.other.findById(id, user),
        create: async (data, user) => meetingsRepository.other.create(data, user),
        update: async (id, data, user) => meetingsRepository.other.update(id, data, user),
        delete: async (id, user) => meetingsRepository.other.delete(id, user),
    },
};

module.exports = meetingsService;
