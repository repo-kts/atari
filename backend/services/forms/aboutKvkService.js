const aboutKvkRepository = require('../../repositories/forms/aboutKvkRepository.js');
const prisma = require('../../config/prisma.js');
const { ValidationError } = require('../../utils/errorHandler.js');
const { parseReportingYearDate, ensureNotFutureDate } = require('../../utils/reportingYearUtils.js');
const { sanitizeDate, sanitizeString } = require('../../utils/dataSanitizer.js');
const { createAttachmentBinding } = require('./formAttachmentBinding.js');

/** Roles scoped to a specific KVK */
const KVK_ROLES = ['kvk_admin', 'kvk_user'];

const STAFF_ATTACHMENT_ENTITIES = new Set(['kvk-employees', 'kvk-staff-transferred']);
const staffAttachmentBinding = createAttachmentBinding({
    formCode: 'kvk_staff',
    primaryKey: 'kvkStaffId',
});

/**
 * About KVK Service
 * Business logic layer for About KVK forms
 */

class AboutKvkService {
    async getAll(entityName, options = {}, user = null) {
        options.filters = options.filters || {};

        // Check if KVK role user doesn't have kvkId linked
        if (user && KVK_ROLES.includes(user.roleName) && !user.kvkId) {
            // Return empty result with a flag indicating no KVK linked
            return {
                data: [],
                total: 0,
                page: options.page || 1,
                limit: options.limit || 100,
                noKvkLinked: true,
            };
        }

        // KVK role users (kvk_admin, kvk_user) with kvkId should only see their own KVK data
        if (user && user.kvkId) {
            if (entityName === 'kvk-staff-transferred') {
                options.filters.sourceKvkIds = user.kvkId;
            } else if (entityName === 'kvks') {
                // For KVKs list, filter to show only their KVK
                options.filters.kvkId = user.kvkId;
            } else {
                // For all other entities (bank-accounts, employees, etc.), filter by kvkId
                options.filters.kvkId = user.kvkId;
            }
        } else if (user && user.roleName !== 'super_admin') {
            // Admin users without kvkId: apply geographic scope
            if (entityName === 'kvks') {
                this._applyGeoFilter(options.filters, user);
            } else {
                const scopedKvkIds = await this._getScopedKvkIds(user);
                if (scopedKvkIds !== null) {
                    options.filters.kvkId = { in: scopedKvkIds };
                }
            }
        }

        const result = await aboutKvkRepository.findAll(entityName, options, user);
        if (STAFF_ATTACHMENT_ENTITIES.has(entityName) && Array.isArray(result?.data)) {
            result.data = await staffAttachmentBinding.decorateMany(result.data, user);
        }
        return {
            ...result,
            page: options.page || 1,
            limit: options.limit || 100,
        };
    }

    async getById(entityName, id, user = null) {
        const entity = await aboutKvkRepository.findById(entityName, id);
        if (!entity) {
            throw new ValidationError(`${entityName} with ID ${id} not found`);
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
                    return staffAttachmentBinding.decorate(entity, user);
                }
            }
            throw new Error('Access denied: You can only access your own KVK data');
        }

        // Admin with geographic scope: ensure entity's KVK is within their area
        if (user && !user.kvkId && user.roleName !== 'super_admin') {
            const entityKvkId = entity.kvkId;
            if (entityKvkId) {
                const scopedKvkIds = await this._getScopedKvkIds(user);
                if (scopedKvkIds !== null && !scopedKvkIds.includes(entityKvkId)) {
                    throw new Error('Access denied: This data is outside your geographic scope');
                }
            }
        }

        if (STAFF_ATTACHMENT_ENTITIES.has(entityName)) {
            return staffAttachmentBinding.decorate(entity, user);
        }

        return entity;
    }

    async create(entityName, data, user = null) {
        const useStaffAttachments = STAFF_ATTACHMENT_ENTITIES.has(entityName);
        let attachmentIds = [];
        if (useStaffAttachments) {
            const stripped = staffAttachmentBinding.strip(data);
            data = stripped.payload;
            attachmentIds = stripped.attachmentIds;
        }

        // Authorization checks
        if (entityName === 'kvks') {
            // Only super_admin can create KVKs
            if (!user || user.roleName !== 'super_admin') {
                throw new ValidationError('Only super admin can create KVKs');
            }
        } else {
            // For other entities, permission is enforced by route middleware (requirePermission).
            if (!user) {
                throw new Error('Authentication required');
            }

            if (user.kvkId) {
                // KVK-scoped users: auto-fill kvkId from profile
                data.kvkId = user.kvkId;
            } else if (user.roleName !== 'super_admin') {
                // Admin users without kvkId: validate that data.kvkId is within their geographic scope
                const requestedKvkId = data.kvkId ? Number(data.kvkId) : null;
                if (!Number.isInteger(requestedKvkId)) {
                    throw new ValidationError('KVK ID is required');
                }
                const scopedKvkIds = await this._getScopedKvkIds(user);
                if (!scopedKvkIds.includes(requestedKvkId)) {
                    throw new Error('Access denied: This KVK is outside your geographic scope');
                }
                data.kvkId = requestedKvkId;
            }

            // For employees: set originalKvkId to the current kvkId (first KVK where staff is created)
            if ((entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') && !data.originalKvkId && data.kvkId) {
                data.originalKvkId = data.kvkId;
            }
        }

        // Validate required fields based on entity type
        this.validateRequiredFields(entityName, data);

        // Additional validation for KVK: validate university belongs to organization
        if (entityName === 'kvks' && data.orgId) {
            const org = await prisma.orgMaster.findUnique({
                where: { orgId: parseInt(data.orgId) }
            });

            if (!org) {
                throw new Error('Organization not found');
            }

            // Validate that university belongs to the organization
            if (data.universityId) {
                const university = await prisma.universityMaster.findUnique({
                    where: { universityId: parseInt(data.universityId) }
                });

                if (!university) {
                    throw new Error('University not found');
                }

                if (university.orgId !== parseInt(data.orgId)) {
                    throw new Error('University does not belong to the selected organization');
                }
            }
        }

        // Sanitize optional enum fields: convert empty strings to null
        const sanitizedData = this.sanitizeEnumFields(entityName, data);

        // Convert numeric fields
        const finalData = this.sanitizeNumericFields(entityName, sanitizedData);

        const created = await aboutKvkRepository.create(entityName, finalData);
        if (useStaffAttachments) {
            await staffAttachmentBinding.attach(created, attachmentIds, user);
            return staffAttachmentBinding.decorate(created, user);
        }
        return created;
    }

    async update(entityName, id, data, user = null) {
        const useStaffAttachments = STAFF_ATTACHMENT_ENTITIES.has(entityName);
        let attachmentIds = [];
        if (useStaffAttachments) {
            const stripped = staffAttachmentBinding.strip(data);
            data = stripped.payload;
            attachmentIds = stripped.attachmentIds;
        }

        // Ensure entity exists and user has access (getById enforces geographic scope)
        const currentEntity = await this.getById(entityName, id, user);

        // Authorization checks — permission enforced by route middleware (requirePermission).
        // KVK entity updates: scope already enforced by getById.
        // For employees: prevent source KVKs from updating transferred employees.
        if (entityName !== 'kvks' &&
            (entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') &&
            currentEntity.transferStatus === 'TRANSFERRED') {
            if (user && user.kvkId && currentEntity.kvkId !== user.kvkId) {
                throw new Error('You cannot update employees that were transferred from your KVK. Only the current KVK can manage this employee.');
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

        const updated = await aboutKvkRepository.update(entityName, id, finalData);
        if (useStaffAttachments) {
            await staffAttachmentBinding.attach(updated ?? currentEntity, attachmentIds, user);
            return staffAttachmentBinding.decorate(updated, user);
        }
        return updated;
    }

    async delete(entityName, id, user = null) {
        // Ensure entity exists and user has access
        const currentEntity = await this.getById(entityName, id, user);

        // Only super_admin can delete KVKs
        if (entityName === 'kvks') {
            if (!user || user.roleName !== 'super_admin') {
                throw new Error('Only super admin can delete KVKs');
            }
        }

        // For employees: prevent source KVKs from deleting transferred employees
        // Only the current KVK (where employee is now) can delete
        if ((entityName === 'kvk-employees' || entityName === 'kvk-staff-transferred') &&
            currentEntity.transferStatus === 'TRANSFERRED') {
            if (user && user.kvkId && currentEntity.kvkId !== user.kvkId) {
                throw new Error('You cannot delete employees that were transferred from your KVK. Only the current KVK can manage this employee.');
            }
        }

        const result = await aboutKvkRepository.deleteEntity(entityName, id);
        if (STAFF_ATTACHMENT_ENTITIES.has(entityName)) {
            await staffAttachmentBinding.cleanup(currentEntity, user);
        }
        return result;
    }

    /**
     * Sanitize update data by removing read-only fields and nested objects
     */
    sanitizeUpdateData(entityName, data) {
        // List of fields that should never be updated (read-only)
        const readOnlyFields = [
            // ID fields (primary keys and system-managed IDs)
            'kvkId', 'bankAccountId', 'kvkStaffId', 'employeeId', 'infraId',
            'vehicleId', 'vehicleDetailId', 'equipmentId', 'equipmentDetailId', 'implementId',
            'zoneId', 'stateId', 'districtId', 'orgId', 
            // Transfer-related fields (managed by transfer system)
            'originalKvkId', 'transferCount', 'lastTransferDate',
            // Timestamps
            'createdAt', 'updatedAt',
            // Metadata
            '_count',
            // Nested objects (these are relations, not data fields)
            'kvk', 'zone', 'state', 'district', 'org', 'organization',
            'sanctionedPost', 'discipline', 'infraMaster', 'staffCategory', 'payLevel',
            'payScale', 'vehicle', 'equipment'
        ];
        // Allow updating geo/org fields for KVK entity itself
        // Note: universityId should also be updatable
        let effectiveReadOnly = [...readOnlyFields];
        if (entityName === 'kvks') {
            effectiveReadOnly = readOnlyFields.filter(
                (f) => !['zoneId', 'stateId', 'districtId', 'orgId', 'universityId'].includes(f)
            );
        }
        // For employee updates, allow updating foreign key IDs but not the relation objects
        // Note: sanctionedPostId, disciplineId, staffCategoryId, and payLevelId are updatable
        // They are foreign keys that users should be able to change

        // Create a clean copy of data without read-only fields
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            // Skip read-only fields
            if (effectiveReadOnly.includes(key)) {
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
        const integerFields = {};

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

        if ((entityName === 'kvk-vehicle-details' || entityName === 'kvk-equipment-details') && 'reportingYear' in sanitized) {
            const parsedDate = parseReportingYearDate(sanitized.reportingYear);
            ensureNotFutureDate(parsedDate);
            sanitized.reportingYear = parsedDate ? parsedDate.toISOString() : null;
        }

        return sanitized;
    }

    /**
     * Validate required fields based on entity type
     */
    validateRequiredFields(entityName, data) {
        const requiredFields = {
            'kvks': ['kvkName', 'zoneId', 'stateId', 'districtId', 'orgId', 'universityId', 'hostOrg', 'mobile', 'email', 'address', 'yearOfSanction'],
            // Note: universityId is required as per the newest form requirements
            'kvk-bank-accounts': ['kvkId', 'accountType', 'accountName', 'bankName', 'location', 'accountNumber'],
            'kvk-employees': ['kvkId', 'staffName', 'mobile', 'dateOfBirth', 'sanctionedPostId', 'positionOrder', 'disciplineId', 'dateOfJoining', 'staffCategoryId'],
            'kvk-staff-transferred': ['kvkId', 'staffName', 'mobile', 'dateOfBirth', 'sanctionedPostId', 'positionOrder', 'disciplineId', 'dateOfJoining', 'staffCategoryId'],
            'kvk-infrastructure': ['kvkId', 'infraMasterId', 'notYetStarted', 'completedPlinthLevel', 'completedLintelLevel', 'completedRoofLevel', 'totallyCompleted', 'plinthAreaSqM', 'underUse', 'sourceOfFunding'],
            'kvk-vehicles': ['kvkId', 'vehicleName', 'registrationNo', 'yearOfPurchase', 'totalCost'],
            'kvk-vehicle-details': ['kvkId', 'reportingYear', 'vehicleId', 'totalRun', 'vehicleStatusId'],
            'kvk-equipments': ['kvkId', 'equipmentTypeId', 'equipmentMasterId', 'yearOfPurchase', 'totalCost'],
            'kvk-equipment-details': ['kvkId', 'reportingYear', 'equipmentId', 'equipmentStatusId'],
            'kvk-land-details': ['kvkId', 'item', 'areaHa'],
        };

        const required = requiredFields[entityName] || [];
        const missing = required.filter(field => {
            const value = data[field];
            // Check for null, undefined, or empty string (but allow 0 and false) 
            // Special handling: allow 0 for numeric fields, false for boolean fields
            if (value === 0 || value === false) return false;
            return value === null || value === undefined || value === '';
        });

        if (missing.length > 0) {
            throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
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
     * Get KVK staff for dropdown (filtered by kvkId)
     * @param {number} kvkId - KVK ID to filter staff
     * @returns {Promise<Array>} Array of staff with kvkStaffId, staffName, email, and sanctionedPost
     */
    async getStaffForDropdown(kvkId) {
        return await aboutKvkRepository.getStaffForDropdown(kvkId);
    }

    async getVehiclesForDropdown(kvkId, reportingYear) {
        if (!kvkId) {
            throw new ValidationError('kvkId is required');
        }
        return aboutKvkRepository.getVehiclesForDropdown(kvkId, reportingYear);
    }

    async getEquipmentsForDropdown(kvkId, reportingYear) {
        if (!kvkId) {
            throw new ValidationError('kvkId is required');
        }
        return aboutKvkRepository.getEquipmentsForDropdown(kvkId, reportingYear);
    }

    /**
     * Get all KVKs for dropdowns (e.g. transfer target selection).
     * Scoped by user's geographic area; super_admin sees all.
     */
    async getAllKvksForDropdown(options = {}, user = null) {
        options.filters = options.filters || {};

        if (user && user.kvkId) {
            // KVK role: no kvkId filter — they need to see other KVKs for transfers
        } else if (user && user.roleName !== 'super_admin') {
            this._applyGeoFilter(options.filters, user);
        }

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
    async transferEmployee(employeeId, targetKvkId, user = null, transferReason = null, notes = null, transferDate = null) {
        if (!user) {
            throw new Error('User is required for transfer');
        }

        // Authorization: Only KVK roles or Super Admin can transfer employees
        if (!KVK_ROLES.includes(user.roleName) && user.roleName !== 'super_admin') {
            throw new Error('Only KVK admins and Super Admins can transfer employees');
        }

        // Ensure employee exists
        const employee = await aboutKvkRepository.findById('kvk-employees', employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found`);
        }

        // Verify employee belongs to user's KVK (unless Super Admin)
        if (KVK_ROLES.includes(user.roleName) && employee.kvkId !== user.kvkId) {
            throw new Error('You can only transfer employees from your own KVK');
        }

        // Verify target KVK exists
        const targetKvk = await aboutKvkRepository.findById('kvks', targetKvkId);
        if (!targetKvk) {
            throw new Error(`Target KVK with ID ${targetKvkId} not found`);
        }

        // Prevent transferring to the same KVK
        if (employee.kvkId === targetKvkId) {
            throw new Error('Staff is already at this KVK');
        }

        // --- Transfer Date Validation ---
        const parsedTransferDate = sanitizeDate(transferDate);
        if (!parsedTransferDate) {
            throw new Error('Transfer date is required');
        }
        if (parsedTransferDate > new Date()) {
            throw new Error('Transfer date cannot be in the future');
        }

        // --- Consecutive-Duplicate Guard ---
        // Prevent immediate repeat of identical FROM->TO transfer for same staff.
        const lastTransfer = await aboutKvkRepository.getLastTransferRecord(employeeId);
        if (
            lastTransfer &&
            lastTransfer.fromKvkId === employee.kvkId &&
            lastTransfer.toKvkId === targetKvkId
        ) {
            throw new Error(
                'Cannot transfer: this staff member was already transferred away from this KVK in the most recent operation. Use the Revert option if the previous transfer was a mistake.'
            );
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
                    lastTransferDate: parsedTransferDate,
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
                transferDate: parsedTransferDate,
                transferReason: sanitizeString(transferReason, { allowEmpty: false }),
                notes: sanitizeString(notes, { allowEmpty: false }),
                isReversal: false,
            }, tx);

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
        // If user is KVK role, filter to only show transfers involving their KVK
        if (user && user.kvkId && KVK_ROLES.includes(user.roleName)) {
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
     * Single source of truth: role → geographic field mapping.
     * Returns e.g. { zoneId: 5 } or null if the role is unmapped
     * or the user lacks the corresponding field value (deny-by-default).
     */
    _getGeoScope(user) {
        const ROLE_GEO_FIELD = {
            zone_admin: 'zoneId',
            state_admin: 'stateId',
            state_user: 'stateId',
            district_admin: 'districtId',
            district_user: 'districtId',
            org_admin: 'orgId',
            org_user: 'orgId',
        };

        const field = ROLE_GEO_FIELD[user.roleName];
        if (!field || !user[field]) return null;
        return { [field]: user[field] };
    }

    /**
     * Get KVK IDs within the user's geographic scope.
     * Returns null for super_admin (no filter needed).
     * Returns [] for unknown/unmapped roles (deny-by-default).
     * @param {object} user
     * @returns {Promise<number[]|null>}
     */
    async _getScopedKvkIds(user) {
        if (!user || user.roleName === 'super_admin') return null;
        if (user.kvkId) return [user.kvkId];

        const scope = this._getGeoScope(user);
        if (!scope) return []; // deny-by-default for unmapped roles

        const kvks = await prisma.kvk.findMany({
            where: scope,
            select: { kvkId: true },
        });
        return kvks.map(k => k.kvkId);
    }

    /**
     * Apply geographic filter directly on the KVK entity's columns.
     * Used when querying the 'kvks' entity itself.
     */
    _applyGeoFilter(filters, user) {
        const scope = this._getGeoScope(user);
        Object.assign(filters, scope || {});
    }

    /**
     * Revert a transfer (Super Admin only)
     */
    async revertTransfer(transferId, targetKvkId, user = null, reason = null, notes = null, transferDate = null) {
        if (!user || user.roleName !== 'super_admin') {
            throw new Error('Only Super Admins can revert transfers');
        }

        const parsedTransferDate = sanitizeDate(transferDate);
        if (!parsedTransferDate) {
            throw new Error('Transfer date is required');
        }
        if (parsedTransferDate > new Date()) {
            throw new Error('Transfer date cannot be in the future');
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
                    lastTransferDate: parsedTransferDate,
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
                transferDate: parsedTransferDate,
                transferReason: sanitizeString(reason || 'Transfer reversal', { allowEmpty: false }),
                notes: sanitizeString(notes, { allowEmpty: false }),
                isReversal: true,
                reversedTransferId: transferId,
            }, tx);

            return { employee: updatedEmployee, transferHistory: reversalHistory };
        });

        return result;
    }
}

module.exports = new AboutKvkService();
