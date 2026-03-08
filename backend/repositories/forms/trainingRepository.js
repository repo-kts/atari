const prisma = require('../../config/prisma.js');
const { sanitizeString, sanitizeInteger, sanitizeNumber, sanitizeDate, safeGet } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');
const {
    validateInput,
    resolveKvkId,
    buildRoleBasedWhere,
    validateRequiredInteger,
    validateRequiredString,
    validateRequiredNumber,
    validateRequiredDate,
    validateFarmerCounts,
    checkRecordOwnership,
    validateId,
} = require('../../utils/formRepositoryHelpers.js');

/**
 * Training Repository
 * Handles all database operations for Training Achievement forms
 * Refactored for maximum reusability, maintainability, and validation
 */

/**
 * Map coordinator name to coordinatorId
 * If coordinator doesn't exist, create it
 * @param {string} coordinatorName - Coordinator name
 * @param {Object} tx - Transaction-bound Prisma client (optional, defaults to global prisma)
 * @returns {Promise<number|null>} Coordinator ID or null
 */
const resolveCoordinatorId = async (coordinatorName, tx = prisma) => {
    if (!coordinatorName || typeof coordinatorName !== 'string') return null;
    
    const name = sanitizeString(coordinatorName);
    if (!name || name.length === 0) return null;

    // Try to find existing coordinator
    let coordinator = await tx.courseCoordinatorMaster.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });

    // If not found, create it
    if (!coordinator) {
        coordinator = await tx.courseCoordinatorMaster.create({
            data: { name }
        });
    }

    return coordinator.coordinatorId;
};

/**
 * Map staff name to coordinatorId
 * First tries to find staff, then creates/finds coordinator
 * @param {string} staffName - Staff name
 * @param {number} staffId - Staff ID (optional)
 * @param {Object} tx - Transaction-bound Prisma client (optional, defaults to global prisma)
 * @returns {Promise<number|null>} Coordinator ID or null
 */
const resolveCoordinatorFromStaff = async (staffName, staffId, tx = prisma) => {
    // If staffId is provided, try to get staff name
    if (staffId && !staffName) {
        const sanitizedStaffId = sanitizeInteger(staffId);
        if (sanitizedStaffId) {
            const staff = await tx.kvkStaff.findUnique({
                where: { kvkStaffId: sanitizedStaffId },
                select: { staffName: true }
            });
            if (staff) staffName = staff.staffName;
        }
    }

    if (!staffName) return null;
    return await resolveCoordinatorId(staffName, tx);
};

/**
 * Map response to frontend-friendly format
 */
const _mapResponse = (r) => {
    if (!r) return null;

    const startDate = r.startDate ? new Date(r.startDate) : null;
    let reportingYear = null;
    if (startDate && !isNaN(startDate.getTime())) {
        const month = startDate.getMonth() + 1;
        const startYear = month >= 4 ? startDate.getFullYear() : startDate.getFullYear() - 1;
        reportingYear = String(startYear);
    }

    // Calculate total participants
    const totalParticipants = 
        (r.generalM || 0) + (r.generalF || 0) +
        (r.obcM || 0) + (r.obcF || 0) +
        (r.scM || 0) + (r.scF || 0) +
        (r.stM || 0) + (r.stF || 0);

    return {
        ...r,
        id: r.trainingAchievementId,
        trainingAchievementId: r.trainingAchievementId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        
        // Master data references
        clienteleId: r.clienteleId,
        clientele: r.clientele ? r.clientele.name : undefined,
        trainingTypeId: r.trainingTypeId,
        trainingType: r.trainingType ? r.trainingType.name : undefined,
        trainingAreaId: r.trainingAreaId,
        trainingArea: r.trainingArea ? r.trainingArea.name : undefined,
        thematicAreaId: r.thematicAreaId,
        trainingThematicAreaId: r.thematicAreaId, // Map to trainingThematicAreaId for frontend compatibility
        thematicArea: r.thematicArea ? r.thematicArea.name : undefined,
        coordinatorId: r.coordinatorId,
        coordinator: r.coordinator ? r.coordinator.name : undefined,
        fundingSourceId: r.fundingSourceId,
        fundingSource: r.fundingSource ? r.fundingSource.name : undefined,
        
        // Training details
        title: r.titleOfTraining,
        titleOfTraining: r.titleOfTraining,
        startDate: r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '',
        endDate: r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '',
        venue: r.venue,
        fundingAgency: r.fundingAgencyName,
        fundingAgencyName: r.fundingAgencyName,
        campusType: r.campusType,
        
        // Participants
        gen_m: r.generalM,
        gen_f: r.generalF,
        obc_m: r.obcM,
        obc_f: r.obcF,
        sc_m: r.scM,
        sc_f: r.scF,
        st_m: r.stM,
        st_f: r.stF,
        generalM: r.generalM,
        generalF: r.generalF,
        obcM: r.obcM,
        obcF: r.obcF,
        scM: r.scM,
        scF: r.scF,
        stM: r.stM,
        stF: r.stF,
        
        // Computed fields
        reportingYear,
        totalParticipants,
        
        // Frontend-friendly aliases
        'Reporting Year': reportingYear,
        'KVK Name': r.kvk ? r.kvk.kvkName : undefined,
        'Start Date': r.startDate ? new Date(r.startDate).toLocaleDateString('en-GB') : undefined,
        'End Date': r.endDate ? new Date(r.endDate).toLocaleDateString('en-GB') : undefined,
        'Title of Training': r.titleOfTraining,
        'Venue': r.venue,
        'No. of Participants': totalParticipants,
    };
};

const trainingRepository = {
    /**
     * Create a new Training Achievement
     */
    create: async (data, opts, user) => {
        // Validate input
        validateInput(data, user);
        const kvkId = resolveKvkId(data, user);

        // Use transaction to ensure atomicity of master data creation
        try {
            return await prisma.$transaction(async (tx) => {
            // Resolve coordinatorId from staffId or coordinator name (within transaction)
            let coordinatorId = null;
            if (data.coordinatorId) {
                coordinatorId = validateRequiredInteger(
                    data,
                    ['coordinatorId'],
                    'Valid coordinator ID is required',
                    'coordinatorId'
                );
            } else if (data.staffId || data.coordinator || data.staffName) {
                const staffId = data.staffId ? sanitizeInteger(data.staffId) : null;
                const coordinatorName = sanitizeString(data.coordinator || data.staffName);
                coordinatorId = await resolveCoordinatorFromStaff(coordinatorName, staffId, tx);
            }
            
            if (!coordinatorId || isNaN(coordinatorId)) {
                throw new ValidationError('Valid coordinator is required. Please select a course coordinator.', 'coordinator');
            }

        // Validate and sanitize required fields
        const clienteleId = data.clienteleId ? validateRequiredInteger(
            data,
            ['clienteleId'],
            'Invalid clientele ID',
            'clienteleId'
        ) : null;

        const trainingTypeId = data.trainingTypeId ? validateRequiredInteger(
            data,
            ['trainingTypeId'],
            'Invalid training type ID',
            'trainingTypeId'
        ) : null;

        const trainingAreaId = data.trainingAreaId ? validateRequiredInteger(
            data,
            ['trainingAreaId'],
            'Invalid training area ID',
            'trainingAreaId'
        ) : null;

        // Handle thematicAreaId - can come as thematicAreaId or trainingThematicAreaId
        let thematicAreaId = null;
        if (data.thematicAreaId) {
            thematicAreaId = validateRequiredInteger(
                data,
                ['thematicAreaId'],
                'Invalid thematic area ID',
                'thematicAreaId'
            );
        } else if (data.trainingThematicAreaId) {
            // Try to find ThematicAreaMaster by matching with TrainingThematicArea name
            const trainingThematicAreaId = validateRequiredInteger(
                data,
                ['trainingThematicAreaId'],
                'Invalid training thematic area ID',
                'trainingThematicAreaId'
            );
            
            const trainingThematicArea = await tx.trainingThematicArea.findUnique({
                where: { trainingThematicAreaId },
                select: { trainingThematicAreaName: true }
            });
            
            if (trainingThematicArea) {
                // Find or create ThematicAreaMaster with the same name (within transaction)
                let thematicArea = await tx.thematicAreaMaster.findFirst({
                    where: { name: { equals: trainingThematicArea.trainingThematicAreaName, mode: 'insensitive' } }
                });
                
                if (!thematicArea) {
                    // Create if doesn't exist
                    thematicArea = await tx.thematicAreaMaster.create({
                        data: { name: sanitizeString(trainingThematicArea.trainingThematicAreaName) }
                    });
                }
                thematicAreaId = thematicArea.thematicAreaId;
            }
        }

        if (!thematicAreaId || isNaN(thematicAreaId)) {
            throw new ValidationError('Valid thematic area is required. Please select a thematic area.', 'thematicArea');
        }

        const fundingSourceId = data.fundingSourceId ? validateRequiredInteger(
            data,
            ['fundingSourceId'],
            'Invalid funding source ID',
            'fundingSourceId'
        ) : null;

        // Validate and sanitize required string fields
        const titleOfTraining = validateRequiredString(
            data,
            ['titleOfTraining', 'title'],
            'Title of training is required',
            'title'
        );

        const venue = validateRequiredString(
            data,
            ['venue'],
            'Venue is required',
            'venue'
        );

        // Validate and sanitize dates
        const startDate = validateRequiredDate(
            data,
            ['startDate'],
            'Start date is required and must be a valid date',
            'startDate'
        );

        const endDate = validateRequiredDate(
            data,
            ['endDate'],
            'End date is required and must be a valid date',
            'endDate'
        );

        // Validate date logic
        if (endDate < startDate) {
            throw new ValidationError('End date must be after start date', 'endDate');
        }

        // Sanitize campus type (ON_CAMPUS or OFF_CAMPUS)
        let campusType = sanitizeString(data.campusType || 'ON_CAMPUS');
        if (campusType) {
            campusType = campusType.toUpperCase().replace(/\s+/g, '_');
            if (campusType !== 'ON_CAMPUS' && campusType !== 'OFF_CAMPUS') {
                // Try to map common variations
                if (campusType.includes('ON')) campusType = 'ON_CAMPUS';
                else if (campusType.includes('OFF')) campusType = 'OFF_CAMPUS';
                else campusType = 'ON_CAMPUS'; // Default
            }
        } else {
            campusType = 'ON_CAMPUS'; // Default
        }

        // Sanitize optional funding agency name
        const fundingAgencyName = sanitizeString(data.fundingAgencyName || data.fundingAgency, { allowEmpty: true });

        // Validate and sanitize participant counts
        const farmerCounts = validateFarmerCounts(
            data,
            {
                gen_m: 'generalM',
                gen_f: 'generalF',
                obc_m: 'obcM',
                obc_f: 'obcF',
                sc_m: 'scM',
                sc_f: 'scF',
                st_m: 'stM',
                st_f: 'stF',
            },
            { defaultValue: 0, validateNonNegative: true }
        );

            // Create the record (within transaction)
            const result = await tx.trainingAchievement.create({
                data: {
                    kvkId,
                    clienteleId,
                    trainingTypeId,
                    trainingAreaId,
                    thematicAreaId,
                    coordinatorId,
                    fundingSourceId,
                    titleOfTraining,
                    startDate,
                    endDate,
                    venue,
                    fundingAgencyName,
                    campusType,
                    generalM: farmerCounts.generalM,
                    generalF: farmerCounts.generalF,
                    obcM: farmerCounts.obcM,
                    obcF: farmerCounts.obcF,
                    scM: farmerCounts.scM,
                    scF: farmerCounts.scF,
                    stM: farmerCounts.stM,
                    stF: farmerCounts.stF,
                },
                include: {
                    kvk: { select: { kvkName: true } },
                    clientele: { select: { name: true } },
                    trainingType: { select: { name: true } },
                    trainingArea: { select: { name: true } },
                    thematicArea: { select: { name: true } },
                    coordinator: { select: { name: true } },
                    fundingSource: { select: { name: true } },
                }
            });

                return _mapResponse(result);
            });
        } catch (error) {
            // Provide better error messages for common Prisma errors
            if (error.code === 'P2003') {
                // Foreign key constraint violation
                const fieldName = error.meta?.field_name || 'field';
                throw new ValidationError(
                    `Invalid reference: ${fieldName}. Please ensure the selected value exists in the database.`,
                    fieldName.replace('Id', '').replace('_', '')
                );
            }
            if (error.code === 'P2011' || error.code === 'P2012') {
                // Missing required field
                const fieldName = error.meta?.constraint || error.meta?.path || 'field';
                throw new ValidationError(
                    `Missing required field: ${fieldName}. Please provide a valid value.`,
                    fieldName
                );
            }
            // Re-throw other errors
            throw error;
        }
    },

    /**
     * Find all Training Achievements
     */
    findAll: async (filters = {}, user) => {
        const roleWhere = buildRoleBasedWhere(user, {});
        if (roleWhere === null) {
            return []; // User has no KVK access
        }

        // Merge role-based where with filters
        const where = { ...roleWhere, ...filters };

        const results = await prisma.trainingAchievement.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                clientele: { select: { name: true } },
                trainingType: { select: { name: true } },
                trainingArea: { select: { name: true } },
                thematicArea: { select: { name: true } },
                coordinator: { select: { name: true } },
                fundingSource: { select: { name: true } },
            },
            orderBy: { trainingAchievementId: 'desc' },
        });

        return results.map(_mapResponse);
    },

    /**
     * Find Training Achievement by ID
     */
    findById: async (id, user) => {
        // Validate ID first
        const parsedId = validateId(id, 'trainingAchievementId');
        const where = buildRoleBasedWhere(user, { trainingAchievementId: parsedId });
        if (where === null) {
            return null; // User has no KVK access
        }

        const result = await prisma.trainingAchievement.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } },
                clientele: { select: { name: true } },
                trainingType: { select: { name: true } },
                trainingArea: { select: { name: true } },
                thematicArea: { select: { name: true } },
                coordinator: { select: { name: true } },
                fundingSource: { select: { name: true } },
            },
        });

        return result ? _mapResponse(result) : null;
    },

    /**
     * Update Training Achievement
     */
    update: async (id, data, user) => {
        validateInput(data, user);
        
        // Validate ID first
        const parsedId = validateId(id, 'trainingAchievementId');
        const where = buildRoleBasedWhere(user, { trainingAchievementId: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        // Check if record exists and user has access, get existing record for date validation
        const existingRecord = await checkRecordOwnership(
            (query) => prisma.trainingAchievement.findFirst(query),
            where
        );

        const updateData = {};

        // Resolve coordinatorId if needed
        if (data.coordinatorId !== undefined) {
            updateData.coordinatorId = data.coordinatorId ? validateRequiredInteger(
                data,
                ['coordinatorId'],
                'Invalid coordinator ID',
                'coordinatorId'
            ) : null;
        } else if (data.staffId || data.coordinator || data.staffName) {
            // Use transaction for coordinator resolution in updates
            const staffId = data.staffId ? sanitizeInteger(data.staffId) : null;
            const coordinatorName = sanitizeString(data.coordinator || data.staffName);
            // Note: For updates, we'll resolve coordinator outside transaction for now
            // If needed, wrap entire update in transaction
            const coordinatorId = await resolveCoordinatorFromStaff(coordinatorName, staffId);
            if (coordinatorId) updateData.coordinatorId = coordinatorId;
        }

        // Update other optional integer fields
        if (data.clienteleId !== undefined) {
            updateData.clienteleId = data.clienteleId ? validateRequiredInteger(
                data,
                ['clienteleId'],
                'Invalid clientele ID',
                'clienteleId'
            ) : null;
        }

        if (data.trainingTypeId !== undefined) {
            updateData.trainingTypeId = data.trainingTypeId ? validateRequiredInteger(
                data,
                ['trainingTypeId'],
                'Invalid training type ID',
                'trainingTypeId'
            ) : null;
        }

        if (data.trainingAreaId !== undefined) {
            updateData.trainingAreaId = data.trainingAreaId ? validateRequiredInteger(
                data,
                ['trainingAreaId'],
                'Invalid training area ID',
                'trainingAreaId'
            ) : null;
        }

        // Handle thematicAreaId update
        if (data.thematicAreaId !== undefined) {
            updateData.thematicAreaId = validateRequiredInteger(
                data,
                ['thematicAreaId'],
                'Invalid thematic area ID',
                'thematicAreaId'
            );
        } else if (data.trainingThematicAreaId !== undefined) {
            // Try to find ThematicAreaMaster by matching with TrainingThematicArea name
            const trainingThematicAreaId = validateRequiredInteger(
                data,
                ['trainingThematicAreaId'],
                'Invalid training thematic area ID',
                'trainingThematicAreaId'
            );
            
            const trainingThematicArea = await prisma.trainingThematicArea.findUnique({
                where: { trainingThematicAreaId },
                select: { trainingThematicAreaName: true }
            });
            
            if (trainingThematicArea) {
                // Find or create ThematicAreaMaster with the same name
                // Note: For updates, we'll create outside transaction for now
                // If needed, wrap entire update in transaction
                let thematicArea = await prisma.thematicAreaMaster.findFirst({
                    where: { name: { equals: trainingThematicArea.trainingThematicAreaName, mode: 'insensitive' } }
                });
                
                if (!thematicArea) {
                    // Create if doesn't exist
                    thematicArea = await prisma.thematicAreaMaster.create({
                        data: { name: sanitizeString(trainingThematicArea.trainingThematicAreaName) }
                    });
                }
                updateData.thematicAreaId = thematicArea.thematicAreaId;
            }
        }

        if (data.fundingSourceId !== undefined) {
            updateData.fundingSourceId = data.fundingSourceId ? validateRequiredInteger(
                data,
                ['fundingSourceId'],
                'Invalid funding source ID',
                'fundingSourceId'
            ) : null;
        }

        // Update string fields
        if (data.titleOfTraining !== undefined || data.title !== undefined) {
            updateData.titleOfTraining = validateRequiredString(
                data,
                ['titleOfTraining', 'title'],
                'Title of training is required',
                'title'
            );
        }

        if (data.venue !== undefined) {
            updateData.venue = validateRequiredString(
                data,
                ['venue'],
                'Venue is required',
                'venue'
            );
        }

        if (data.fundingAgencyName !== undefined || data.fundingAgency !== undefined) {
            updateData.fundingAgencyName = sanitizeString(data.fundingAgencyName || data.fundingAgency, { allowEmpty: true });
        }

        // Update dates
        if (data.startDate !== undefined) {
            updateData.startDate = validateRequiredDate(
                data,
                ['startDate'],
                'Start date must be a valid date',
                'startDate'
            );
        }

        if (data.endDate !== undefined) {
            updateData.endDate = validateRequiredDate(
                data,
                ['endDate'],
                'End date must be a valid date',
                'endDate'
            );
        }

        // Validate date chronology with existing record dates
        // Compute effective dates (use updateData if provided, otherwise existing record)
        const effectiveStart = updateData.startDate || (existingRecord.startDate ? new Date(existingRecord.startDate) : null);
        const effectiveEnd = updateData.endDate || (existingRecord.endDate ? new Date(existingRecord.endDate) : null);
        
        if (effectiveStart && effectiveEnd && effectiveEnd < effectiveStart) {
            throw new ValidationError('End date must be after start date', 'endDate');
        }

        // Update campus type
        if (data.campusType !== undefined) {
            let campusType = sanitizeString(data.campusType);
            if (campusType) {
                campusType = campusType.toUpperCase().replace(/\s+/g, '_');
                if (campusType !== 'ON_CAMPUS' && campusType !== 'OFF_CAMPUS') {
                    if (campusType.includes('ON')) campusType = 'ON_CAMPUS';
                    else if (campusType.includes('OFF')) campusType = 'OFF_CAMPUS';
                    else campusType = 'ON_CAMPUS';
                }
            } else {
                campusType = 'ON_CAMPUS';
            }
            updateData.campusType = campusType;
        }

        // Update participant counts
        if (data.gen_m !== undefined || data.generalM !== undefined ||
            data.gen_f !== undefined || data.generalF !== undefined ||
            data.obc_m !== undefined || data.obcM !== undefined ||
            data.obc_f !== undefined || data.obcF !== undefined ||
            data.sc_m !== undefined || data.scM !== undefined ||
            data.sc_f !== undefined || data.scF !== undefined ||
            data.st_m !== undefined || data.stM !== undefined ||
            data.st_f !== undefined || data.stF !== undefined) {
            
            // Only validate and include fields that are explicitly provided
            const farmerCounts = validateFarmerCounts(
                data,
                {
                    gen_m: 'generalM',
                    gen_f: 'generalF',
                    obc_m: 'obcM',
                    obc_f: 'obcF',
                    sc_m: 'scM',
                    sc_f: 'scF',
                    st_m: 'stM',
                    st_f: 'stF',
                },
                { validateNonNegative: true } // Remove defaultValue to avoid emitting zeros
            );

            // Only assign fields that were actually provided in data
            Object.assign(updateData, farmerCounts);
        }

        // Only update if there are changes
        if (Object.keys(updateData).length === 0) {
            // Return existing record if no updates
            const existing = await prisma.trainingAchievement.findFirst({
                where: { trainingAchievementId: parseInt(id) },
                include: {
                    kvk: { select: { kvkName: true } },
                    clientele: { select: { name: true } },
                    trainingType: { select: { name: true } },
                    trainingArea: { select: { name: true } },
                    thematicArea: { select: { name: true } },
                    coordinator: { select: { name: true } },
                    fundingSource: { select: { name: true } },
                }
            });
            return _mapResponse(existing);
        }

        try {
            const result = await prisma.trainingAchievement.update({
                where: { trainingAchievementId: parsedId },
                data: updateData,
                include: {
                    kvk: { select: { kvkName: true } },
                    clientele: { select: { name: true } },
                    trainingType: { select: { name: true } },
                    trainingArea: { select: { name: true } },
                    thematicArea: { select: { name: true } },
                    coordinator: { select: { name: true } },
                    fundingSource: { select: { name: true } },
                }
            });

            return _mapResponse(result);
        } catch (error) {
            // Provide better error messages for common Prisma errors
            if (error.code === 'P2003') {
                const fieldName = error.meta?.field_name || 'field';
                throw new ValidationError(
                    `Invalid reference: ${fieldName}. Please ensure the selected value exists in the database.`,
                    fieldName.replace('Id', '').replace('_', '')
                );
            }
            if (error.code === 'P2011' || error.code === 'P2012') {
                const fieldName = error.meta?.constraint || error.meta?.path || 'field';
                throw new ValidationError(
                    `Missing required field: ${fieldName}. Please provide a valid value.`,
                    fieldName
                );
            }
            throw error;
        }
    },

    /**
     * Delete Training Achievement
     */
    delete: async (id, user) => {
        // Validate ID first
        const parsedId = validateId(id, 'trainingAchievementId');
        const where = buildRoleBasedWhere(user, { trainingAchievementId: parsedId });
        if (where === null) {
            throw new ValidationError('Record not found or unauthorized');
        }

        await checkRecordOwnership(
            (query) => prisma.trainingAchievement.findFirst(query),
            where
        );

        await prisma.trainingAchievement.delete({
            where: { trainingAchievementId: parsedId },
        });

        return { success: true };
    },
};

module.exports = trainingRepository;
