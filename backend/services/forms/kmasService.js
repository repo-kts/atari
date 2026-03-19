const kmasRepository = require('../../repositories/forms/kmasRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

class KmasService {
    async create(data, user) {
        try { return await kmasRepository.create(data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findAll(filters, user) {
        try { return await kmasRepository.findAll(filters, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findById(id, user) {
        try { return await kmasRepository.findById(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async update(id, data, user) {
        try { return await kmasRepository.update(id, data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async delete(id, user) {
        try { return await kmasRepository.delete(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
}

module.exports = new KmasService();
