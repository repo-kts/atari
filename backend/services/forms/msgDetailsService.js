const msgDetailsRepository = require('../../repositories/forms/msgDetailsRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

class MsgDetailsService {
    async create(data, user) {
        try { return await msgDetailsRepository.create(data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findAll(filters, user) {
        try { return await msgDetailsRepository.findAll(filters, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findById(id, user) {
        try { return await msgDetailsRepository.findById(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async update(id, data, user) {
        try { return await msgDetailsRepository.update(id, data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async delete(id, user) {
        try { return await msgDetailsRepository.delete(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
}

module.exports = new MsgDetailsService();
