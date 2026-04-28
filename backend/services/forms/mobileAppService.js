const mobileAppRepository = require('../../repositories/forms/mobileAppRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

class MobileAppService {
    async create(data, user) {
        try { return await mobileAppRepository.create(data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findAll(filters, user) {
        try { return await mobileAppRepository.findAll(filters, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findById(id, user) {
        try { return await mobileAppRepository.findById(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async update(id, data, user) {
        try { return await mobileAppRepository.update(id, data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async delete(id, user) {
        try { return await mobileAppRepository.delete(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
}

module.exports = new MobileAppService();
