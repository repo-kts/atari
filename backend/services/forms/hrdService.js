const hrdRepository = require('../../repositories/forms/hrdRepository.js');

const hrdService = {
    createHrdProgram: async (data, user) => {
        return await hrdRepository.create(data, user);
    },

    getAllHrdPrograms: async (user) => {
        return await hrdRepository.findAll(user);
    },

    getHrdProgramById: async (id) => {
        return await hrdRepository.findById(id);
    },

    updateHrdProgram: async (id, data) => {
        return await hrdRepository.update(id, data);
    },

    deleteHrdProgram: async (id) => {
        return await hrdRepository.delete(id);
    }
};

module.exports = hrdService;
