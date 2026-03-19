const webPortalRepository = require('../../repositories/forms/webPortalRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers');

class WebPortalService {
    async create(data, user) {
        try { return await webPortalRepository.create(data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findAll(filters, user) {
        try { return await webPortalRepository.findAll(filters, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findById(id, user) {
        try { return await webPortalRepository.findById(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async update(id, data, user) {
        try { return await webPortalRepository.update(id, data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async delete(id, user) {
        try { return await webPortalRepository.delete(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
}

module.exports = new WebPortalService();
