const prisma = require('../../config/prisma.js');
const { sanitizeString, sanitizeInteger, sanitizeNumber, sanitizeDate, safeGet, removeIdFieldsForUpdate } = require('../../utils/dataSanitizer.js');
const { ValidationError } = require('../../utils/errorHandler.js');
const { OFT_STATUS, normalizeOftStatus } = require('../../constants/oftStatus.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const crypto = require('crypto');

const OFT_INCLUDE = {
    kvk: { select: { kvkName: true } },
    staff: { select: { staffName: true } },
    season: { select: { seasonName: true } },
    oftSubject: { select: { subjectName: true } },
    oftThematicArea: { select: { thematicAreaName: true } },
    discipline: { select: { disciplineName: true } },
    unit: { select: { unitId: true, name: true } },
    sourceOfFunding: { select: { fundingSourceId: true, name: true } },
    technologies: {
        include: { oftTechnologyType: true },
        orderBy: { kvkOftTechnologyId: 'asc' },
    }
};

const oftRepository = {
    create: async (data, user) => {
        // Validate input
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new ValidationError('Invalid data: must be an object');
        }

        if (!user || typeof user !== 'object') {
            throw new ValidationError('User information is required');
        }

        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? safeGet(user, 'kvkId') : safeGet(data, 'kvkId');
        const kvkId = sanitizeInteger(kvkIdSource);

        if (kvkId === null || kvkId === undefined || isNaN(kvkId)) {
            throw new ValidationError('Valid kvkId is required');
        }

        const technologiesData = await _buildTechnologiesCreateData(data);
        const createData = _buildOftCreateData(data, kvkId);

        // Add technologies if any
        if (technologiesData.length > 0) {
            createData.technologies = {
                create: technologiesData
            };
        }

        // CRITICAL: Remove ID fields from createData - Prisma doesn't accept them in data object
        const finalCreateData = removeIdFieldsForUpdate(createData, ['kvkOftId', 'id']);

        const result = await prisma.kvkoft.create({
            data: finalCreateData,
            include: OFT_INCLUDE
        });

        return _mapOftResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.expectedCompletionDateFrom || filters.expectedCompletionDateTo) {
            where.expectedCompletionDate = {};
            if (filters.expectedCompletionDateFrom) {
                const from = parseReportingYearDate(filters.expectedCompletionDateFrom);
                if (from) {
                    from.setHours(0, 0, 0, 0);
                    where.expectedCompletionDate.gte = from;
                }
            }
            if (filters.expectedCompletionDateTo) {
                const to = parseReportingYearDate(filters.expectedCompletionDateTo);
                if (to) {
                    to.setHours(23, 59, 59, 999);
                    where.expectedCompletionDate.lte = to;
                }
            }
        }

        if (filters.createdAtFrom || filters.createdAtTo) {
            where.createdAt = {};
            if (filters.createdAtFrom) {
                const from = new Date(filters.createdAtFrom);
                if (!isNaN(from.getTime())) {
                    from.setHours(0, 0, 0, 0);
                    where.createdAt.gte = from;
                }
            }
            if (filters.createdAtTo) {
                const to = new Date(filters.createdAtTo);
                if (!isNaN(to.getTime())) {
                    to.setHours(23, 59, 59, 999);
                    where.createdAt.lte = to;
                }
            }
        }

        const results = await prisma.kvkoft.findMany({
            where,
            include: OFT_INCLUDE,
            orderBy: { kvkOftId: 'desc' }
        });

        return results.map(_mapOftResponse);
    },

    findById: async (id, user) => {
        const where = { kvkOftId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkoft.findFirst({
            where,
            include: OFT_INCLUDE
        });

        return result ? _mapOftResponse(result) : null;
    },

    update: async (id, data, user) => {
        const where = { kvkOftId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        // Check existence and ownership
        const existing = await prisma.kvkoft.findFirst({ where });
        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = _buildOftUpdateData(data, existing);

        // Handle technology options update
        if (data.hasTechnologiesUpdate || Array.isArray(data.technologyOptions) || Object.keys(data).some(k => k.startsWith('tech_'))) {
            await prisma.kvkoftTechnology.deleteMany({
                where: { kvkOftId: parseInt(id) }
            });

            const technologiesData = await _buildTechnologiesCreateData(data);
            updateData.technologies = {
                create: technologiesData
            };
        }

        // CRITICAL: Remove ID fields from updateData - Prisma doesn't accept them in data object
        const finalUpdateData = removeIdFieldsForUpdate(updateData, ['kvkOftId', 'id']);

        const result = await prisma.kvkoft.update({
            where: { kvkOftId: parseInt(id) },
            data: finalUpdateData,
            include: OFT_INCLUDE
        });

        return _mapOftResponse(result);
    },

    delete: async (id, user) => {
        const where = { kvkOftId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        // Check existence and ownership
        const existing = await prisma.kvkoft.findFirst({ where });
        if (!existing) throw new Error("Record not found or unauthorized");

        // Delete related technologies first (cascading might not be configured)
        await prisma.kvkoftTechnology.deleteMany({
            where: { kvkOftId: parseInt(id) }
        });

        await prisma.kvkoft.delete({
            where: { kvkOftId: parseInt(id) }
        });

        return { success: true };
    },

    findRawById: async (id, user) => {
        const where = { kvkOftId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }
        return prisma.kvkoft.findFirst({ where, include: OFT_INCLUDE });
    },

    updateStatus: async (id, status) => {
        return prisma.kvkoft.update({
            where: { kvkOftId: parseInt(id) },
            data: { status: normalizeOftStatus(status) },
            include: OFT_INCLUDE,
        });
    },

    transferToNextYearTx: async (sourceOft, targetExpectedCompletionDate) => {
        const sourceId = sourceOft.kvkOftId;
        return prisma.$transaction(async (tx) => {
            await tx.kvkoft.update({
                where: { kvkOftId: sourceId },
                data: { status: OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR },
            });

            const createData = removeIdFieldsForUpdate({
                kvkId: sourceOft.kvkId,
                expectedCompletionDate: targetExpectedCompletionDate instanceof Date
                    ? targetExpectedCompletionDate
                    : sanitizeDate(targetExpectedCompletionDate),
                seasonId: sourceOft.seasonId,
                staffId: sourceOft.staffId,
                oftSubjectId: sourceOft.oftSubjectId,
                oftThematicAreaId: sourceOft.oftThematicAreaId,
                disciplineId: sourceOft.disciplineId,
                unitId: sourceOft.unitId,
                sourceOfFundingId: sourceOft.sourceOfFundingId,
                title: sourceOft.title,
                problemDiagnosed: sourceOft.problemDiagnosed,
                sourceOfTechnology: sourceOft.sourceOfTechnology,
                productionSystem: sourceOft.productionSystem,
                performanceIndicators: sourceOft.performanceIndicators,
                quantity: sourceOft.quantity,
                numberOfLocation: sourceOft.numberOfLocation,
                numberOfTrialReplication: sourceOft.numberOfTrialReplication,
                oftStartDate: sourceOft.oftStartDate,
                criticalInput: sourceOft.criticalInput,
                costOfOft: sourceOft.costOfOft,
                farmersGeneralM: sourceOft.farmersGeneralM,
                farmersGeneralF: sourceOft.farmersGeneralF,
                farmersObcM: sourceOft.farmersObcM,
                farmersObcF: sourceOft.farmersObcF,
                farmersScM: sourceOft.farmersScM,
                farmersScF: sourceOft.farmersScF,
                farmersStM: sourceOft.farmersStM,
                farmersStF: sourceOft.farmersStF,
                status: OFT_STATUS.ONGOING,
                technologies: {
                    create: (sourceOft.technologies || []).map((tech) => ({
                        oftTechnologyTypeId: tech.oftTechnologyTypeId || null,
                        optionKey: tech.optionKey || _generateOptionKey(tech.optionName || tech.oftTechnologyType?.name, tech.kvkOftTechnologyId || 0),
                        optionName: tech.optionName || tech.oftTechnologyType?.name || 'Technology',
                        details: tech.details || null,
                    })),
                },
            }, ['kvkOftId', 'id']);

            const newRecord = await tx.kvkoft.create({
                data: createData,
                include: OFT_INCLUDE,
            });

            const sourceRecord = await tx.kvkoft.findUnique({
                where: { kvkOftId: sourceId },
                include: OFT_INCLUDE,
            });

            return {
                source: _mapOftResponse(sourceRecord),
                transferred: _mapOftResponse(newRecord),
            };
        });
    },

    createResultReportTx: async (kvkOftId, payload) => {
        return prisma.$transaction(async (tx) => {
            const report = await tx.oftResultReport.create({
                data: _buildResultReportBaseData(kvkOftId, payload),
            });
            await _replaceResultTablesTx(tx, report.oftResultReportId, payload.tables || []);
            return tx.oftResultReport.findUnique({
                where: { oftResultReportId: report.oftResultReportId },
                include: _resultInclude(),
            });
        });
    },

    updateResultReportTx: async (kvkOftId, payload) => {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.oftResultReport.findUnique({
                where: { kvkOftId: parseInt(kvkOftId) },
                select: { oftResultReportId: true },
            });
            if (!existing) {
                throw new ValidationError('Result report not found for this OFT');
            }

            await tx.oftResultReport.update({
                where: { oftResultReportId: existing.oftResultReportId },
                data: _buildResultReportBaseData(kvkOftId, payload),
            });
            await _replaceResultTablesTx(tx, existing.oftResultReportId, payload.tables || []);
            return tx.oftResultReport.findUnique({
                where: { oftResultReportId: existing.oftResultReportId },
                include: _resultInclude(),
            });
        });
    },

    getResultByOftId: async (kvkOftId) => {
        return prisma.oftResultReport.findUnique({
            where: { kvkOftId: parseInt(kvkOftId) },
            include: _resultInclude(),
        });
    },

    getTechnologyOptionsByOftId: async (kvkOftId) => {
        const rows = await prisma.kvkoftTechnology.findMany({
            where: { kvkOftId: parseInt(kvkOftId) },
            orderBy: { kvkOftTechnologyId: 'asc' },
        });

        return rows.map((row, index) => ({
            optionKey: row.optionKey || _generateOptionKey(row.optionName, row.kvkOftTechnologyId || index),
            optionName: row.optionName || '',
            details: row.details || '',
            sortOrder: index + 1,
        })).filter((row) => row.optionName);
    }
};

function _buildOftCreateData(data, kvkId) {
    const expectedCompletionDate = sanitizeDate(safeGet(data, 'expectedCompletionDate'));
    const seasonId = sanitizeInteger(safeGet(data, 'seasonId'), { defaultValue: 1 });
    const staffId = sanitizeInteger(safeGet(data, 'staffId') || safeGet(data, 'staffName'), { defaultValue: 1 });
    const oftSubjectId = sanitizeInteger(safeGet(data, 'oftSubjectId'));
    const oftThematicAreaId = sanitizeInteger(safeGet(data, 'oftThematicAreaId') || safeGet(data, 'thematicArea'), { defaultValue: 1 });
    const disciplineId = sanitizeInteger(safeGet(data, 'disciplineId') || safeGet(data, 'discipline'), { defaultValue: 1 });
    const unitId = sanitizeInteger(safeGet(data, 'unitId'));
    const sourceOfFundingId = sanitizeInteger(safeGet(data, 'sourceOfFundingId'));

    if (!oftSubjectId || oftSubjectId === null) {
        throw new ValidationError('oftSubjectId is required', 'oftSubjectId');
    }

    return {
        kvkId,
        expectedCompletionDate,
        seasonId,
        staffId,
        oftSubjectId,
        oftThematicAreaId,
        disciplineId,
        unitId,
        sourceOfFundingId,
        title: sanitizeString(safeGet(data, 'title'), { allowEmpty: true }) || '',
        problemDiagnosed: sanitizeString(safeGet(data, 'problemDiagnosed'), { allowEmpty: true }) || '',
        sourceOfTechnology: sanitizeString(safeGet(data, 'sourceOfTechnology'), { allowEmpty: true }) || '',
        productionSystem: sanitizeString(safeGet(data, 'productionSystem'), { allowEmpty: true }) || '',
        performanceIndicators: sanitizeString(safeGet(data, 'performanceIndicators'), { allowEmpty: true }) || '',
        quantity: sanitizeNumber(safeGet(data, 'quantity') ?? safeGet(data, 'areaHaNumber') ?? safeGet(data, 'area'), { defaultValue: 0 }),
        numberOfLocation: sanitizeInteger(safeGet(data, 'numberOfLocation') || safeGet(data, 'locations'), { defaultValue: 0 }),
        numberOfTrialReplication: sanitizeInteger(safeGet(data, 'numberOfTrialReplication') || safeGet(data, 'replications'), { defaultValue: 0 }),
        oftStartDate: sanitizeDate(safeGet(data, 'oftStartDate') || safeGet(data, 'duration')) || new Date(),
        criticalInput: sanitizeString(safeGet(data, 'criticalInput'), { allowEmpty: true }) || '',
        costOfOft: sanitizeNumber(safeGet(data, 'costOfOft') || safeGet(data, 'cost'), { defaultValue: 0 }),
        farmersGeneralM: sanitizeInteger(safeGet(data, 'farmersGeneralM') || safeGet(data, 'gen_m'), { defaultValue: 0 }),
        farmersGeneralF: sanitizeInteger(safeGet(data, 'farmersGeneralF') || safeGet(data, 'gen_f'), { defaultValue: 0 }),
        farmersObcM: sanitizeInteger(safeGet(data, 'farmersObcM') || safeGet(data, 'obc_m'), { defaultValue: 0 }),
        farmersObcF: sanitizeInteger(safeGet(data, 'farmersObcF') || safeGet(data, 'obc_f'), { defaultValue: 0 }),
        farmersScM: sanitizeInteger(safeGet(data, 'farmersScM') || safeGet(data, 'sc_m'), { defaultValue: 0 }),
        farmersScF: sanitizeInteger(safeGet(data, 'farmersScF') || safeGet(data, 'sc_f'), { defaultValue: 0 }),
        farmersStM: sanitizeInteger(safeGet(data, 'farmersStM') || safeGet(data, 'st_m'), { defaultValue: 0 }),
        farmersStF: sanitizeInteger(safeGet(data, 'farmersStF') || safeGet(data, 'st_f'), { defaultValue: 0 }),
        status: OFT_STATUS.ONGOING,
    };
}

function _buildOftUpdateData(data, existing) {
    const updateData = {};
    if (data.expectedCompletionDate !== undefined) {
        updateData.expectedCompletionDate = sanitizeDate(data.expectedCompletionDate);
    }
    if (data.seasonId !== undefined) updateData.seasonId = sanitizeInteger(data.seasonId);
    if (data.staffId !== undefined || data.staffName !== undefined) updateData.staffId = sanitizeInteger(data.staffId || data.staffName);
    if (data.oftSubjectId !== undefined) updateData.oftSubjectId = sanitizeInteger(data.oftSubjectId);
    if (data.oftThematicAreaId !== undefined || data.thematicArea !== undefined) updateData.oftThematicAreaId = sanitizeInteger(data.oftThematicAreaId || data.thematicArea);
    if (data.disciplineId !== undefined || data.discipline !== undefined) updateData.disciplineId = sanitizeInteger(data.disciplineId || data.discipline);
    if (data.unitId !== undefined) updateData.unitId = sanitizeInteger(data.unitId);
    if (data.sourceOfFundingId !== undefined) updateData.sourceOfFundingId = sanitizeInteger(data.sourceOfFundingId);
    if (data.title !== undefined) updateData.title = sanitizeString(data.title, { allowEmpty: true }) || '';
    if (data.problemDiagnosed !== undefined) updateData.problemDiagnosed = sanitizeString(data.problemDiagnosed, { allowEmpty: true }) || '';
    if (data.sourceOfTechnology !== undefined) updateData.sourceOfTechnology = sanitizeString(data.sourceOfTechnology, { allowEmpty: true }) || '';
    if (data.productionSystem !== undefined) updateData.productionSystem = sanitizeString(data.productionSystem, { allowEmpty: true }) || '';
    if (data.performanceIndicators !== undefined) updateData.performanceIndicators = sanitizeString(data.performanceIndicators, { allowEmpty: true }) || '';
    if (data.quantity !== undefined || data.areaHaNumber !== undefined || data.area !== undefined) {
        updateData.quantity = sanitizeNumber(data.quantity ?? data.areaHaNumber ?? data.area, { defaultValue: existing.quantity || 0 });
    }
    if (data.numberOfLocation !== undefined || data.locations !== undefined) updateData.numberOfLocation = sanitizeInteger(data.numberOfLocation ?? data.locations, { defaultValue: existing.numberOfLocation || 0 });
    if (data.numberOfTrialReplication !== undefined || data.replications !== undefined) updateData.numberOfTrialReplication = sanitizeInteger(data.numberOfTrialReplication ?? data.replications, { defaultValue: existing.numberOfTrialReplication || 0 });
    if (data.oftStartDate !== undefined || data.duration !== undefined) updateData.oftStartDate = sanitizeDate(data.oftStartDate || data.duration) || existing.oftStartDate;
    if (data.criticalInput !== undefined) updateData.criticalInput = sanitizeString(data.criticalInput, { allowEmpty: true }) || '';
    if (data.costOfOft !== undefined || data.cost !== undefined) updateData.costOfOft = sanitizeNumber(data.costOfOft ?? data.cost, { defaultValue: existing.costOfOft || 0 });

    const farmersMapping = {
        gen_m: 'farmersGeneralM', gen_f: 'farmersGeneralF',
        obc_m: 'farmersObcM', obc_f: 'farmersObcF',
        sc_m: 'farmersScM', sc_f: 'farmersScF',
        st_m: 'farmersStM', st_f: 'farmersStF'
    };
    for (const [front, back] of Object.entries(farmersMapping)) {
        const val = data[front] !== undefined ? data[front] : data[back];
        if (val !== undefined) updateData[back] = sanitizeInteger(val, { defaultValue: existing[back] || 0 });
    }
    return updateData;
}

async function _buildTechnologiesCreateData(data) {
    const options = _extractTechnologyOptions(data);
    _validateTechnologyOptions(options);
    return options.map((option, index) => ({
        optionKey: option.optionKey || _generateOptionKey(option.optionName, index),
        optionName: option.optionName,
        details: option.details || null,
    }));
}

function _mapOftResponse(r) {
    if (!r) return null;

    const mapped = {
        id: r.kvkOftId,
        kvkOftId: r.kvkOftId,
        kvkId: r.kvkId,
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        expectedCompletionDate: r.expectedCompletionDate ? r.expectedCompletionDate.toISOString().split('T')[0] : '',
        seasonId: r.seasonId,
        seasonName: r.season ? r.season.seasonName : undefined,
        staffId: r.staffId,
        staffName: r.staff ? r.staff.staffName : undefined,
        oftSubjectId: r.oftSubjectId,
        subjectName: r.oftSubject ? r.oftSubject.subjectName : undefined,
        oftThematicAreaId: r.oftThematicAreaId,
        thematicAreaName: r.oftThematicArea ? r.oftThematicArea.thematicAreaName : undefined,
        disciplineId: r.disciplineId,
        disciplineName: r.discipline ? r.discipline.disciplineName : undefined,
        unitId: r.unitId,
        unitName: r.unit ? r.unit.name : undefined,
        sourceOfFundingId: r.sourceOfFundingId,
        sourceOfFundingName: r.sourceOfFunding ? r.sourceOfFunding.name : undefined,
        title: r.title,
        problemDiagnosed: r.problemDiagnosed,
        sourceOfTechnology: r.sourceOfTechnology,
        productionSystem: r.productionSystem,
        performanceIndicators: r.performanceIndicators,
        quantity: r.quantity,
        numberOfLocation: r.numberOfLocation,
        locations: r.numberOfLocation,
        numberOfTrialReplication: r.numberOfTrialReplication,
        replications: r.numberOfTrialReplication,
        oftStartDate: r.oftStartDate,
        duration: r.oftStartDate ? r.oftStartDate.toISOString().split('T')[0] : '',
        criticalInput: r.criticalInput,
        costOfOft: r.costOfOft,
        cost: r.costOfOft,
        createdAt: r.createdAt,

        gen_m: r.farmersGeneralM, gen_f: r.farmersGeneralF,
        obc_m: r.farmersObcM, obc_f: r.farmersObcF,
        sc_m: r.farmersScM, sc_f: r.farmersScF,
        st_m: r.farmersStM, st_f: r.farmersStF,
        ongoingCompleted: normalizeOftStatus(r.status),
        status: normalizeOftStatus(r.status),
   };

    const technologyOptions = [];
    if (r.technologies) {
        r.technologies.forEach(t => {
            const optionName = t.optionName || t.oftTechnologyType?.name || '';
            const optionKey = t.optionKey || _generateOptionKey(optionName, t.kvkOftTechnologyId || 0);
            technologyOptions.push({
                optionKey,
                optionName,
                details: t.details || '',
            });
            if (optionName) {
                mapped[`tech_${optionName}`] = t.details || '';
            }
        });
    }
    mapped.technologyOptions = technologyOptions;

    return mapped;
}

function _extractTechnologyOptions(data = {}) {
    const directOptions = Array.isArray(data.technologyOptions) ? data.technologyOptions : null;
    if (directOptions && directOptions.length > 0) {
        return directOptions.map((item, index) => ({
            optionKey: sanitizeString(item?.optionKey, { allowEmpty: false }) || '',
            optionName: sanitizeString(item?.optionName, { allowEmpty: false }) || '',
            details: sanitizeString(item?.details, { allowEmpty: true }) || '',
            sortOrder: sanitizeInteger(item?.sortOrder, { defaultValue: index + 1 }),
        }));
    }

    const legacyOptions = Object.keys(data)
        .filter((key) => key.startsWith('tech_'))
        .map((key, index) => ({
            optionKey: '',
            optionName: key.replace(/^tech_/, '').trim(),
            details: sanitizeString(safeGet(data, key), { allowEmpty: true }) || '',
            sortOrder: index + 1,
        }))
        .filter((item) => item.optionName);
    return legacyOptions;
}

function _validateTechnologyOptions(options) {
    if (!Array.isArray(options) || options.length === 0) {
        throw new ValidationError('At least one technology option is required', 'technologyOptions');
    }

    const seen = new Set();
    options.forEach((item, index) => {
        const name = sanitizeString(item.optionName, { allowEmpty: false });
        if (!name) {
            throw new ValidationError(`technologyOptions[${index}].optionName is required`, `technologyOptions.${index}.optionName`);
        }
        const dedupeKey = String(name).trim().toLowerCase();
        if (seen.has(dedupeKey)) {
            throw new ValidationError(`Duplicate technology option name: ${name}`, 'technologyOptions');
        }
        seen.add(dedupeKey);
    });
}

function _generateOptionKey(optionName, seed = 0) {
    const safeName = String(optionName || '').trim().toLowerCase();
    const digest = crypto.createHash('sha1').update(`${safeName}:${seed}`).digest('hex').slice(0, 12);
    return `opt_${digest}`;
}

function _resultInclude() {
    return {
        tables: {
            orderBy: { sortOrder: 'asc' },
            include: {
                columns: { orderBy: { sortOrder: 'asc' } },
                rows: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        cells: true,
                    },
                },
            },
        },
    };
}

function _buildResultReportBaseData(kvkOftId, payload) {
    return {
        kvkOftId: parseInt(kvkOftId),
        finalRecommendation: sanitizeString(payload.finalRecommendation, { allowEmpty: true }) || '',
        constraintsFeedback: sanitizeString(payload.constraintsFeedback, { allowEmpty: true }) || '',
        farmersParticipationProcess: sanitizeString(payload.farmersParticipationProcess, { allowEmpty: true }) || '',
        resultText: sanitizeString(payload.resultText, { allowEmpty: true }) || '',
        remark: sanitizeString(payload.remark, { allowEmpty: true }) || '',
        supplementaryDatasheetPath: sanitizeString(payload.supplementaryDatasheetPath, { allowEmpty: true }) || null,
        supplementaryDatasheetName: sanitizeString(payload.supplementaryDatasheetName, { allowEmpty: true }) || null,
        supplementaryDatasheetSize: payload.supplementaryDatasheetSize ? sanitizeInteger(payload.supplementaryDatasheetSize) : null,
        supplementaryDatasheetMime: sanitizeString(payload.supplementaryDatasheetMime, { allowEmpty: true }) || null,
        photographPath: sanitizeString(payload.photographPath, { allowEmpty: true }) || null,
        photographName: sanitizeString(payload.photographName, { allowEmpty: true }) || null,
        photographSize: payload.photographSize ? sanitizeInteger(payload.photographSize) : null,
        photographMime: sanitizeString(payload.photographMime, { allowEmpty: true }) || null,
    };
}

async function _replaceResultTablesTx(tx, oftResultReportId, tables) {
    await tx.oftResultTable.deleteMany({ where: { oftResultReportId } });
    for (let tableIndex = 0; tableIndex < tables.length; tableIndex += 1) {
        const table = tables[tableIndex];
        const createdTable = await tx.oftResultTable.create({
            data: {
                oftResultReportId,
                tableTitle: sanitizeString(table.tableTitle, { allowEmpty: true }) || `Table ${tableIndex + 1}`,
                sortOrder: sanitizeInteger(table.sortOrder, { defaultValue: tableIndex + 1 }),
            },
        });

        const columns = Array.isArray(table.columns) ? table.columns : [];
        const rows = Array.isArray(table.rows) ? table.rows : [];
        const createdColumnsByKey = {};

        for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
            const col = columns[colIndex];
            const columnKey = sanitizeString(col.columnKey, { allowEmpty: true }) || `col_${colIndex + 1}`;
            const createdColumn = await tx.oftResultTableColumn.create({
                data: {
                    oftResultTableId: createdTable.oftResultTableId,
                    columnKey,
                    columnLabel: sanitizeString(col.columnLabel, { allowEmpty: true }) || columnKey,
                    isMandatory: Boolean(col.isMandatory),
                    sortOrder: sanitizeInteger(col.sortOrder, { defaultValue: colIndex + 1 }),
                },
            });
            createdColumnsByKey[columnKey] = createdColumn;
        }

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
            const row = rows[rowIndex];
            const createdRow = await tx.oftResultTableRow.create({
                data: {
                    oftResultTableId: createdTable.oftResultTableId,
                    optionKey: sanitizeString(row.optionKey, { allowEmpty: true }) || null,
                    rowLabel: sanitizeString(row.rowLabel, { allowEmpty: true }) || `Row ${rowIndex + 1}`,
                    sortOrder: sanitizeInteger(row.sortOrder, { defaultValue: rowIndex + 1 }),
                },
            });

            const cells = row.cells && typeof row.cells === 'object' ? row.cells : {};
            const cellInserts = Object.entries(cells)
                .map(([columnKey, value]) => {
                    const column = createdColumnsByKey[columnKey];
                    if (!column) return null;
                    return {
                        oftResultTableRowId: createdRow.oftResultTableRowId,
                        oftResultTableColumnId: column.oftResultTableColumnId,
                        value: sanitizeString(value, { allowEmpty: true }) || '',
                    };
                })
                .filter(Boolean);

            if (cellInserts.length > 0) {
                await tx.oftResultTableCell.createMany({
                    data: cellInserts,
                });
            }
        }
    }
}

module.exports = oftRepository;
