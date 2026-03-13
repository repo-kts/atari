const raweFetRepository = require('../../repositories/forms/raweFetRepository');

const raweFetService = {
    create: async (data, user) => raweFetRepository.create(data, user),
    findAll: async (filters, user) => raweFetRepository.findAll(filters, user),
    findById: async (id, user) => {
        const record = await raweFetRepository.findById(id, user);
        if (!record) throw new Error('Record not found');
        return record;
    },
    update: async (id, data, user) => raweFetRepository.update(id, data, user),
    delete: async (id, user) => raweFetRepository.delete(id, user),
    findAllAttachmentTypes: async () => raweFetRepository.findAllAttachmentTypes(),
};

module.exports = raweFetService;
