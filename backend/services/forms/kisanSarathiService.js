const kisanSarathiRepository = require('../../repositories/forms/kisanSarathiRepository.js');
const { RepositoryError } = require('../../utils/repositoryHelpers.js');

class KisanSarathiService {
    async create(data, user) {
        try { return await kisanSarathiRepository.create(data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findAll(filters, user) {
        try { return await kisanSarathiRepository.findAll(filters, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async findById(id, user) {
        try { return await kisanSarathiRepository.findById(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async update(id, data, user) {
        try { return await kisanSarathiRepository.update(id, data, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
    async delete(id, user) {
        try { return await kisanSarathiRepository.delete(id, user); }
        catch (error) { throw error instanceof RepositoryError ? error : new RepositoryError(error.message, 'SERVICE_ERROR', 500); }
    }
}

module.exports = new KisanSarathiService();
