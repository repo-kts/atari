const kvkOtherProgrammeRepository = require('../../repositories/forms/kvkOtherProgrammeRepository');

const kvkOtherProgrammeService = {
    getAll: (filters, user) => kvkOtherProgrammeRepository.findAll(filters, user),
    getById: (id, user) => kvkOtherProgrammeRepository.findById(id, user),
    create: (data, user) => kvkOtherProgrammeRepository.create(data, user),
    update: (id, data, user) => kvkOtherProgrammeRepository.update(id, data, user),
    delete: (id, user) => kvkOtherProgrammeRepository.delete(id, user),
};

module.exports = kvkOtherProgrammeService;
