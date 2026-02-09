const aboutKvkRepository = require('../../repositories/forms/aboutKvkRepository.js');

/**
 * About KVK Service
 * Business logic layer for About KVK forms
 */

class AboutKvkService {
    async getAll(entityName, options = {}, user = null) {
        // If user has kvkId (KVK role), filter by their KVK
        if (user && user.kvkId) {
            options.filters = options.filters || {};
            options.filters.kvkId = user.kvkId;
        }

        const result = await aboutKvkRepository.findAll(entityName, options);
        return {
            ...result,
            page: options.page || 1,
            limit: options.limit || 100,
        };
    }

    async getById(entityName, id, user = null) {
        const entity = await aboutKvkRepository.findById(entityName, id);
        if (!entity) {
            throw new Error(`${entityName} with ID ${id} not found`);
        }

        // If user has kvkId (KVK role), ensure they can only access their own data
        if (user && user.kvkId && entity.kvkId && entity.kvkId !== user.kvkId) {
            throw new Error('Access denied: You can only access your own KVK data');
        }

        return entity;
    }

    async create(entityName, data, user = null) {
        // Authorization checks
        if (entityName === 'kvks') {
            // Only super_admin can create KVKs
            if (!user || user.roleName !== 'super_admin') {
                throw new Error('Only super admin can create KVKs');
            }
        } else {
            // For all other About KVK entities, only KVK role can create
            if (!user || user.roleName !== 'kvk') {
                throw new Error('Only KVK users can create this resource');
            }
            // Auto-fill kvkId for KVK role users
            data.kvkId = user.kvkId;
        }

        // Validate required fields based on entity type
        this.validateRequiredFields(entityName, data);

        return await aboutKvkRepository.create(entityName, data);
    }

    async update(entityName, id, data, user = null) {
        // Ensure entity exists and user has access
        const currentEntity = await this.getById(entityName, id, user);

        // Authorization checks
        if (entityName === 'kvks') {
            // Only super_admin can update KVKs
            if (!user || user.roleName !== 'super_admin') {
                throw new Error('Only super admin can update KVKs');
            }
        } else {
            // For all other About KVK entities, only KVK role can update their own data
            if (!user || user.roleName !== 'kvk') {
                throw new Error('Only KVK users can update this resource');
            }
        }

        // Prevent changing kvkId
        if (data.kvkId && data.kvkId !== currentEntity.kvkId) {
            throw new Error('Cannot change kvkId');
        }

        return await aboutKvkRepository.update(entityName, id, data);
    }

    async delete(entityName, id, user = null) {
        // Ensure entity exists and user has access
        const currentEntity = await this.getById(entityName, id, user);

        // Authorization checks
        if (entityName === 'kvks') {
            // Only super_admin can delete KVKs
            if (!user || user.roleName !== 'super_admin') {
                throw new Error('Only super admin can delete KVKs');
            }
        } else {
            // For all other About KVK entities, only KVK role can delete their own data
            if (!user || user.roleName !== 'kvk') {
                throw new Error('Only KVK users can delete this resource');
            }
        }

        return await aboutKvkRepository.deleteEntity(entityName, id);
    }

    /**
     * Validate required fields based on entity type
     */
    validateRequiredFields(entityName, data) {
        const requiredFields = {
            'kvks': ['kvkName', 'zoneId', 'stateId', 'districtId', 'orgId', 'hostOrg', 'mobile', 'email', 'address', 'yearOfSanction'],
            'kvk-bank-accounts': ['kvkId', 'accountType', 'accountName', 'bankName', 'location', 'accountNumber'],
            'kvk-employees': ['kvkId', 'staffName', 'mobile', 'dateOfBirth', 'sanctionedPostId', 'positionOrder', 'disciplineId', 'payLevel', 'dateOfJoining', 'jobType', 'category'],
            'kvk-staff-transferred': ['kvkId', 'staffName', 'mobile', 'dateOfBirth', 'sanctionedPostId', 'positionOrder', 'disciplineId', 'payLevel', 'dateOfJoining', 'jobType', 'category'],
            'kvk-infrastructure': ['kvkId', 'infraMasterId', 'notYetStarted', 'completedPlinthLevel', 'completedLintelLevel', 'completedRoofLevel', 'totallyCompleted', 'plinthAreaSqM', 'underUse', 'sourceOfFunding'],
            'kvk-vehicles': ['kvkId', 'vehicleName', 'registrationNo', 'yearOfPurchase', 'totalCost', 'totalRun', 'presentStatus'],
            'kvk-vehicle-details': ['kvkId', 'vehicleName', 'registrationNo', 'yearOfPurchase', 'totalCost', 'totalRun', 'presentStatus'],
            'kvk-equipments': ['kvkId', 'equipmentName', 'yearOfPurchase', 'totalCost', 'presentStatus', 'sourceOfFunding', 'reportingYear'],
            'kvk-equipment-details': ['kvkId', 'equipmentName', 'yearOfPurchase', 'totalCost', 'presentStatus', 'sourceOfFunding', 'reportingYear'],
            'kvk-farm-implements': ['kvkId', 'implementName', 'yearOfPurchase', 'totalCost', 'presentStatus', 'sourceOfFund'],
        };

        const required = requiredFields[entityName] || [];
        const missing = required.filter(field => {
            const value = data[field];
            // Check for null, undefined, or empty string (but allow 0 and false)
            return value === null || value === undefined || value === '';
        });

        if (missing.length > 0) {
            console.error('❌ Validation failed for:', entityName);
            console.error('📦 Received data:', JSON.stringify(data, null, 2));
            console.error('❌ Missing fields:', missing);
            console.error('✅ Received fields:', Object.keys(data));
            throw new Error(`Missing required fields: ${missing.join(', ')}. Received: ${Object.keys(data).join(', ')}`);
        }
    }
}

module.exports = new AboutKvkService();
