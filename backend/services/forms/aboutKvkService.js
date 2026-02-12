const aboutKvkRepository = require('../../repositories/forms/aboutKvkRepository.js');
const prisma = require('../../config/prisma.js');

/**
 * About KVK Service
 * Business logic layer for About KVK forms
 */

class AboutKvkService {
    async getAll(entityName, options = {}, user = null) {
        options.filters = options.filters || {};

        if (user && user.kvkId) {
            // KVK role: filter by their specific KVK
            if (entityName === 'kvk-staff-transferred') {
                options.filters.sourceKvkIds = user.kvkId;
            } else {
                options.filters.kvkId = user.kvkId;
            }
        } else if (user && user.roleName !== 'super_admin') {
            // Admin with geographic scope: filter to KVKs within their area
            if (entityName === 'kvks') {
                // For KVKs entity, filter directly on geographic columns
                this._applyGeoFilter(options.filters, user);
            } else {
                // For other entities, look up kvkIds in scope then filter
                const scopedKvkIds = await this._getScopedKvkIds(user);
                if (scopedKvkIds !== null) {
                    options.filters.kvkId = { in: scopedKvkIds };
                }
            }
        }

        const result = await aboutKvkRepository.findAll(entityName, options, user);
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
        // Exception: For transferred employees, allow source KVKs to view (but not edit/delete)
        if (user && user.kvkId && entity.kvkId && entity.kvkId !== user.kvkId) {
            // Check if this is a transferred employee and user's KVK is in sourceKvkIds
            if ((entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') &&
                entity.transferStatus === 'TRANSFERRED' && entity.sourceKvkIds) {
                const sourceIds = Array.isArray(entity.sourceKvkIds)
                    ? entity.sourceKvkIds
                    : (typeof entity.sourceKvkIds === 'string' ? JSON.parse(entity.sourceKvkIds) : []);
                if (Array.isArray(sourceIds) && sourceIds.includes(user.kvkId)) {
                    // Allow view access for source KVK
                    return entity;
                }
            }
            throw new Error('Access denied: You can only access your own KVK data');
        }

        // Admin with geographic scope: ensure entity's KVK is within their area
        if (user && !user.kvkId && user.roleName !== 'super_admin') {
            const entityKvkId = entityName === 'kvks' ? entity.kvkId : entity.kvkId;
            if (entityKvkId) {
                const scopedKvkIds = await this._getScopedKvkIds(user);
                if (scopedKvkIds !== null && !scopedKvkIds.includes(entityKvkId)) {
                    throw new Error('Access denied: This data is outside your geographic scope');
                }
            }
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
            
            // For employees: set originalKvkId to the current kvkId (first KVK where staff is created)
            if ((entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') && !data.originalKvkId) {
                data.originalKvkId = user.kvkId;
            }
        }

        // Validate required fields based on entity type
        this.validateRequiredFields(entityName, data);

        // Sanitize optional enum fields: convert empty strings to null
        const sanitizedData = this.sanitizeEnumFields(entityName, data);
        
        // Convert numeric fields
        const finalData = this.sanitizeNumericFields(entityName, sanitizedData);

        return await aboutKvkRepository.create(entityName, finalData);
    }

    async update(entityName, id, data, user = null) {
        // Ensure entity exists and user has access (getById enforces geographic scope)
        const currentEntity = await this.getById(entityName, id, user);

        // Authorization checks
        if (entityName === 'kvks') {
            // Admin roles can update KVKs (scope already enforced by getById)
            if (!user || user.kvkId) {
                throw new Error('Only admin users can update KVKs');
            }
        } else {
            // For all other About KVK entities, only KVK role can update their own data
            if (!user || user.roleName !== 'kvk') {
                throw new Error('Only KVK users can update this resource');
            }
            
            // For employees: prevent source KVKs from updating transferred employees
            // Only the current KVK (where employee is now) can update
            if ((entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') && 
                currentEntity.transferStatus === 'TRANSFERRED') {
                if (currentEntity.kvkId !== user.kvkId) {
                    throw new Error('You cannot update employees that were transferred from your KVK. Only the current KVK can manage this employee.');
                }
            }
        }

        // Prevent changing kvkId
        if (data.kvkId && data.kvkId !== currentEntity.kvkId) {
            throw new Error('Cannot change kvkId');
        }

        // Sanitize data: remove read-only fields and nested objects
        const sanitizedData = this.sanitizeUpdateData(entityName, data);

        // Sanitize optional enum fields: convert empty strings to null
        const enumSanitized = this.sanitizeEnumFields(entityName, sanitizedData);
        
        // Convert numeric fields
        const finalData = this.sanitizeNumericFields(entityName, enumSanitized);

        return await aboutKvkRepository.update(entityName, id, finalData);
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
            
            // For employees: prevent source KVKs from deleting transferred employees
            // Only the current KVK (where employee is now) can delete
            if ((entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') && 
                currentEntity.transferStatus === 'TRANSFERRED') {
                if (currentEntity.kvkId !== user.kvkId) {
                    throw new Error('You cannot delete employees that were transferred from your KVK. Only the current KVK can manage this employee.');
                }
            }
        }

        return await aboutKvkRepository.deleteEntity(entityName, id);
    }

    /**
     * Sanitize update data by removing read-only fields and nested objects
     */
    sanitizeUpdateData(entityName, data) {
        // List of fields that should never be updated (read-only)
        const readOnlyFields = [
            // ID fields
            'kvkId', 'bankAccountId', 'kvkStaffId', 'employeeId', 'infraId',
            'vehicleId', 'vehicleDetailId', 'equipmentId', 'equipmentDetailId', 'implementId',
            'zoneId', 'stateId', 'districtId', 'orgId',
            // Timestamps
            'createdAt', 'updatedAt',
            // Metadata
            '_count',
            // Nested objects (these are relations, not data fields)
            'kvk', 'zone', 'state', 'district', 'org', 'organization',
            'sanctionedPost', 'discipline', 'infraMaster',
            'vehicle', 'equipment'
        ];

        // Create a clean copy of data without read-only fields
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            // Skip read-only fields
            if (readOnlyFields.includes(key)) {
                continue;
            }
            // Skip nested objects (relations)
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                continue;
            }
            // Keep the field
            sanitized[key] = value;
        }

        return sanitized;
    }

    /**
     * Sanitize optional enum fields: convert empty strings to null
     * Prisma requires null for optional enum fields, not empty strings
     */
    sanitizeEnumFields(entityName, data) {
        const sanitized = { ...data };
        
        // Optional enum fields that should be null if empty string
        const optionalEnumFields = {
            'kvk-employees': ['payLevel'],
            'kvk-staff-transferred': ['payLevel'],
        };

        const fieldsToSanitize = optionalEnumFields[entityName] || [];
        
        for (const field of fieldsToSanitize) {
            if (field in sanitized && sanitized[field] === '') {
                sanitized[field] = null;
            }
        }

        return sanitized;
    }

    /**
     * Sanitize numeric fields: convert strings to numbers where needed
     */
    sanitizeNumericFields(entityName, data) {
        const sanitized = { ...data };
        
        // Fields that should be integers (convert from string if needed)
        // Note: vehicle-details uses String for reportingYear, only equipment-details uses Int
        const integerFields = {
            'kvk-equipment-details': ['reportingYear'],
        };

        const fieldsToConvert = integerFields[entityName] || [];
        
        for (const field of fieldsToConvert) {
            if (field in sanitized && sanitized[field] !== null && sanitized[field] !== undefined && sanitized[field] !== '') {
                const parsed = parseInt(sanitized[field], 10);
                if (!isNaN(parsed)) {
                    sanitized[field] = parsed;
                } else {
                    // If parsing fails, set to null for optional fields
                    sanitized[field] = null;
                }
            } else if (field in sanitized && (sanitized[field] === '' || sanitized[field] === null || sanitized[field] === undefined)) {
                // Convert empty strings to null for optional integer fields
                sanitized[field] = null;
            }
        }

        return sanitized;
    }

    /**
     * Validate required fields based on entity type
     */
    validateRequiredFields(entityName, data) {
        const requiredFields = {
            'kvks': ['kvkName', 'zoneId', 'stateId', 'districtId', 'orgId', 'hostOrg', 'mobile', 'email', 'address', 'yearOfSanction'],
            'kvk-bank-accounts': ['kvkId', 'accountType', 'accountName', 'bankName', 'location', 'accountNumber'],
            'kvk-employees': ['kvkId', 'staffName', 'mobile', 'dateOfBirth', 'sanctionedPostId', 'positionOrder', 'disciplineId', 'dateOfJoining', 'category', 'photoPath'],
            'kvk-staff-transferred': ['kvkId', 'staffName', 'mobile', 'dateOfBirth', 'sanctionedPostId', 'positionOrder', 'disciplineId', 'dateOfJoining', 'category', 'photoPath'],
            'kvk-infrastructure': ['kvkId', 'infraMasterId', 'notYetStarted', 'completedPlinthLevel', 'completedLintelLevel', 'completedRoofLevel', 'totallyCompleted', 'plinthAreaSqM', 'underUse', 'sourceOfFunding'],
            'kvk-vehicles': ['kvkId', 'vehicleName', 'registrationNo', 'yearOfPurchase', 'presentStatus'],
            'kvk-vehicle-details': ['kvkId', 'reportingYear', 'vehicleId', 'totalRun', 'presentStatus'],
            'kvk-equipments': ['kvkId', 'equipmentName', 'yearOfPurchase', 'totalCost', 'presentStatus', 'sourceOfFunding'],
            'kvk-equipment-details': ['kvkId', 'reportingYear', 'equipmentId', 'presentStatus'],
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

    /**
     * Get all sanctioned posts (for dropdown)
     */
    async getAllSanctionedPosts() {
        return await aboutKvkRepository.getAllSanctionedPosts();
    }

    /**
     * Get all disciplines (for dropdown)
     */
    async getAllDisciplines() {
        return await aboutKvkRepository.getAllDisciplines();
    }

    /**
     * Get all infrastructure masters (for dropdown)
     */
    async getAllInfraMasters() {
        return await aboutKvkRepository.getAllInfraMasters();
    }

    /**
     * Get all KVKs without user filtering (for dropdowns like transfer)
     * This bypasses the normal filtering to allow KVK admins to see all KVKs
     */
    async getAllKvksForDropdown(options = {}) {
        const result = await aboutKvkRepository.findAll('kvks', options);
        return {
            ...result,
            page: options.page || 1,
            limit: options.limit || 1000,
        };
    }

    /**
     * Transfer an employee from one KVK to another
     * Only KVK admins can transfer employees from their KVK (or Super Admin from any KVK)
     * @param {number} employeeId - ID of the employee to transfer
     * @param {number} targetKvkId - ID of the target KVK
     * @param {object} user - Current user (must be KVK admin or Super Admin)
     * @param {string} transferReason - Optional reason for transfer
     * @param {string} notes - Optional notes
     * @returns {Promise<object>} Updated employee record with transfer history
     */
    async transferEmployee(employeeId, targetKvkId, user = null, transferReason = null, notes = null) {
        if (!user) {
            throw new Error('User is required for transfer');
        }

        // Authorization: Only KVK role or Super Admin can transfer employees
        if (user.roleName !== 'kvk' && user.roleName !== 'super_admin') {
            throw new Error('Only KVK admins and Super Admins can transfer employees');
        }

        // Ensure employee exists
        const employee = await aboutKvkRepository.findById('kvk-employees', employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found`);
        }

        // Verify employee belongs to user's KVK (unless Super Admin)
        if (user.roleName === 'kvk' && employee.kvkId !== user.kvkId) {
            throw new Error('You can only transfer employees from your own KVK');
        }

        // Verify target KVK exists
        const targetKvk = await aboutKvkRepository.findById('kvks', targetKvkId);
        if (!targetKvk) {
            throw new Error(`Target KVK with ID ${targetKvkId} not found`);
        }

        // Prevent transferring to the same KVK
        if (employee.kvkId === targetKvkId) {
            throw new Error('Cannot transfer employee to the same KVK');
        }

        // Track source KVK(s) - add current KVK to the source list
        let sourceKvkIds = [];
        if (employee.sourceKvkIds) {
            try {
                sourceKvkIds = Array.isArray(employee.sourceKvkIds) 
                    ? [...employee.sourceKvkIds] 
                    : JSON.parse(employee.sourceKvkIds);
            } catch (e) {
                sourceKvkIds = [];
            }
        }
        
        // Add current KVK to source list if not already present
        const currentKvkId = employee.kvkId;
        if (!sourceKvkIds.includes(currentKvkId)) {
            sourceKvkIds.push(currentKvkId);
        }

        // Set original KVK if not set (first KVK where staff was created)
        const originalKvkId = employee.originalKvkId || currentKvkId;

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Update employee record
            const updatedEmployee = await tx.kvkStaff.update({
                where: { kvkStaffId: employeeId },
                data: {
                    kvkId: targetKvkId,
                    transferStatus: 'TRANSFERRED',
                    sourceKvkIds: sourceKvkIds,
                    originalKvkId: originalKvkId,
                    transferCount: (employee.transferCount || 0) + 1,
                    lastTransferDate: new Date(),
                },
                include: {
                    kvk: {
                        select: { kvkId: true, kvkName: true }
                    },
                    sanctionedPost: {
                        select: { sanctionedPostId: true, postName: true }
                    },
                    discipline: {
                        select: { disciplineId: true, disciplineName: true }
                    }
                }
            });

            // Create transfer history record
            const transferHistory = await aboutKvkRepository.createTransferHistory({
                kvkStaffId: employeeId,
                fromKvkId: currentKvkId,
                toKvkId: targetKvkId,
                transferredBy: user.userId,
                transferReason: transferReason,
                notes: notes,
                isReversal: false,
            });

            return { employee: updatedEmployee, transferHistory };
        });

        return result;
    }

    /**
     * Get transfer history for a specific staff member
     */
    async getStaffTransferHistory(staffId, options = {}) {
        const filters = { staffId: staffId };
        const result = await aboutKvkRepository.findAll('staff-transfer-history', {
            ...options,
            filters,
        });
        return {
            ...result,
            page: options.page || 1,
            limit: options.limit || 100,
        };
    }

    /**
     * Get all transfers with filters
     */
    async getAllTransfers(filters = {}, options = {}, user = null) {
        // If user is KVK admin, filter to only show transfers involving their KVK
        if (user && user.kvkId && user.roleName === 'kvk') {
            // For KVK admins, show transfers where their KVK is either source or target
            // We'll need to handle this with OR condition, but for now we'll filter in memory
            // Better approach: modify repository to support OR conditions
        }

        const result = await aboutKvkRepository.findAll('staff-transfer-history', {
            ...options,
            filters,
        });
        return {
            ...result,
            page: options.page || 1,
            limit: options.limit || 100,
        };
    }

    /**
     * Get KVK IDs within the user's geographic scope.
     * Returns null for super_admin (no filter needed).
     * @param {object} user
     * @returns {Promise<number[]|null>}
     */
    async _getScopedKvkIds(user) {
        if (!user || user.roleName === 'super_admin') return null;
        if (user.kvkId) return [user.kvkId];

        const where = {};
        switch (user.roleName) {
            case 'zone_admin':
                if (user.zoneId) where.zoneId = user.zoneId;
                break;
            case 'state_admin':
            case 'state_user':
                if (user.stateId) where.stateId = user.stateId;
                break;
            case 'district_admin':
            case 'district_user':
                if (user.districtId) where.districtId = user.districtId;
                break;
            case 'org_admin':
            case 'org_user':
                if (user.orgId) where.orgId = user.orgId;
                break;
            default:
                return null;
        }

        if (Object.keys(where).length === 0) return null;

        const kvks = await prisma.kvk.findMany({
            where,
            select: { kvkId: true },
        });
        return kvks.map(k => k.kvkId);
    }

    /**
     * Apply geographic filter directly on the KVK entity's columns.
     * Used when querying the 'kvks' entity itself.
     */
    _applyGeoFilter(filters, user) {
        switch (user.roleName) {
            case 'zone_admin':
                if (user.zoneId) filters.zoneId = user.zoneId;
                break;
            case 'state_admin':
            case 'state_user':
                if (user.stateId) filters.stateId = user.stateId;
                break;
            case 'district_admin':
            case 'district_user':
                if (user.districtId) filters.districtId = user.districtId;
                break;
            case 'org_admin':
            case 'org_user':
                if (user.orgId) filters.orgId = user.orgId;
                break;
        }
    }

    /**
     * Revert a transfer (Super Admin only)
     */
    async revertTransfer(transferId, targetKvkId, user = null, reason = null, notes = null) {
        if (!user || user.roleName !== 'super_admin') {
            throw new Error('Only Super Admins can revert transfers');
        }

        // Get the transfer record
        const transfer = await aboutKvkRepository.findById('staff-transfer-history', transferId);
        if (!transfer) {
            throw new Error(`Transfer with ID ${transferId} not found`);
        }

        const staffId = transfer.kvkStaffId;
        const employee = await aboutKvkRepository.findById('kvk-employees', staffId);
        if (!employee) {
            throw new Error(`Employee with ID ${staffId} not found`);
        }

        // Determine target KVK
        let revertToKvkId = targetKvkId;
        if (!revertToKvkId) {
            // Revert to original KVK (first in sourceKvkIds or originalKvkId)
            revertToKvkId = employee.originalKvkId || 
                (Array.isArray(employee.sourceKvkIds) && employee.sourceKvkIds.length > 0 
                    ? employee.sourceKvkIds[0] 
                    : transfer.fromKvkId);
        }

        // Verify target KVK exists
        const targetKvk = await aboutKvkRepository.findById('kvks', revertToKvkId);
        if (!targetKvk) {
            throw new Error(`Target KVK with ID ${revertToKvkId} not found`);
        }

        // Use transaction
        const result = await prisma.$transaction(async (tx) => {
            const updatedEmployee = await tx.kvkStaff.update({
                where: { kvkStaffId: staffId },
                data: {
                    kvkId: revertToKvkId,
                    transferStatus: revertToKvkId === employee.originalKvkId ? 'ACTIVE' : 'TRANSFERRED',
                    lastTransferDate: new Date(),
                },
                include: {
                    kvk: {
                        select: { kvkId: true, kvkName: true }
                    },
                    sanctionedPost: {
                        select: { sanctionedPostId: true, postName: true }
                    },
                    discipline: {
                        select: { disciplineId: true, disciplineName: true }
                    }
                }
            });

            // Create reversal history record
            const reversalHistory = await aboutKvkRepository.createTransferHistory({
                kvkStaffId: staffId,
                fromKvkId: employee.kvkId,
                toKvkId: revertToKvkId,
                transferredBy: user.userId,
                transferReason: reason || 'Transfer reversal',
                notes: notes,
                isReversal: true,
                reversedTransferId: transferId,
            });

            return { employee: updatedEmployee, transferHistory: reversalHistory };
        });

        return result;
    }
}

module.exports = new AboutKvkService();
