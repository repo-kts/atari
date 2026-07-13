const prisma = require('../../config/prisma.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../../utils/reportingYearUtils.js');
const { KVK_ROLES } = require('../../utils/formListOrderBy.js');
const { assertOtherFieldsValid } = require('../../utils/formRepositoryHelpers.js');

const SOIL_WATER_EQUIPMENT_OTHER_RULES = [
    { idField: 'soilWaterAnalysisId', otherField: 'analysisOther', model: 'soilWaterAnalysis', idKey: 'soilWaterAnalysisId', label: 'Analysis' },
];
const SOIL_WATER_ANALYSIS_OTHER_RULES = [
    { idField: 'analysisId', otherField: 'analysisOther', model: 'soilWaterAnalysis', idKey: 'soilWaterAnalysisId', label: 'Analysis' },
];

function normalizeSamplesAnalysedThroughOther(data, current = {}) {
    const through = data.samplesAnalysedThrough !== undefined
        ? data.samplesAnalysedThrough
        : current.samplesAnalysedThrough;
    const isOther = String(through || '').trim().toLowerCase() === 'other';

    if (!isOther) return null;

    const rawOther = data.samplesAnalysedThroughOther !== undefined
        ? data.samplesAnalysedThroughOther
        : current.samplesAnalysedThroughOther;
    const other = String(rawOther || '').trim();
    if (!other) {
        throw new Error('samplesAnalysedThroughOther is required when samples analyzed through is Other');
    }
    return other;
}

// Raw-SQL ORDER BY matching buildFormListOrderBy: reporting year newest first,
// then KVK name A→Z (superadmin) or latest entry first (KVK-scoped user).
function _soilOrderBy(user, alias, pk) {
    const isKvk = !!user && KVK_ROLES.includes(user.roleName);
    const secondary = isKvk ? `${alias}.created_at DESC` : 'k.kvk_name ASC';
    // reporting_year is a month-level DATE — group by the YEAR only so a whole
    // year stays together (matches sortFormListRows on the Prisma side).
    return `ORDER BY EXTRACT(YEAR FROM ${alias}.reporting_year) DESC NULLS LAST, ${secondary}, ${alias}.${pk} DESC`;
}

// Mapping functions to avoid duplicate fields from spreading raw DB objects
function _mapEquipmentResponse(r) {
    if (!r) return null;
    const analysisName = r.analysis_other || r.analysis_name;
    const reportingYear = formatReportingYear(r.reporting_year);
    return {
        id: r.soil_water_equipment_id,
        soilWaterEquipmentId: r.soil_water_equipment_id,
        kvkId: r.kvkId,
        kvkName: r.kvk_name,
        reportingYear,
        analysisName,
        equipmentName: r.equipment_name,
        soilWaterAnalysisId: r.soilWaterAnalysisId,
        analysisOther: r.analysis_other ?? '',
        quantity: r.quantity,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

function _mapAnalysisResponse(r) {
    if (!r) return null;
    const analysisName = r.analysis_other || r.analysis_name;
    const reportingYear = formatReportingYear(r.reporting_year);
    return {
        id: r.soil_water_analysis_id,
        soilWaterAnalysisId: r.soil_water_analysis_id,
        kvkId: r.kvkId,
        kvkName: r.kvk_name,
        analysisName,
        analysisId: r.analysis_id,
        analysisOther: r.analysis_other ?? '',
        startDate: r.start_date ? r.start_date.toISOString().split('T')[0] : null,
        endDate: r.end_date ? r.end_date.toISOString().split('T')[0] : null,
        samplesAnalysedThrough: r.samples_analysed_through,
        samplesAnalysedThroughOther: r.samples_analysed_through_other ?? '',
        samplesAnalysed: r.samples_analysed,
        villagesNumber: r.villages_number,
        amountRealized: r.amount_realized,
        reportingYear,
        generalM: r.general_m,
        generalF: r.general_f,
        obcM: r.obc_m,
        obcF: r.obc_f,
        scM: r.sc_m,
        scF: r.sc_f,
        stM: r.st_m,
        stF: r.st_f,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

function _mapWorldSoilDayResponse(r) {
    if (!r) return null;
    const reportingYear = formatReportingYear(r.reporting_year);
    return {
        id: r.world_soil_celebration_id,
        worldSoilCelebrationId: r.world_soil_celebration_id,
        kvkId: r.kvkId,
        kvkName: r.kvk_name,
        activitiesConducted: r.activities_conducted,
        soilHealthCardDistributed: r.soil_health_card_distributed,
        vipNames: r.vip_names,
        participants: r.participants,
        generalM: r.general_m,
        generalF: r.general_f,
        obcM: r.obc_m,
        obcF: r.obc_f,
        scM: r.sc_m,
        scF: r.sc_f,
        stM: r.st_m,
        stF: r.st_f,
        reportingYear,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

const soilWaterRepository = {
    resolveReportingYear: (data) => {
        const value = data && typeof data === "object" ? data.reportingYear : data;
        const parsed = parseReportingYearDate(value);
        ensureNotFutureDate(parsed);
        return parsed;
    },

    // ============================================
    // Soil Water Equipment
    // ============================================
    createEquipment: async (data, user) => {
        // Resolve kvkId: prioritized from user session (if linked to a KVK like Gaya), then from data.
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) kvkId = 1; // Fallback to 1 if absolutely nothing found

        const rYearId = await soilWaterRepository.resolveReportingYear(data);
        const analysisId = parseInt(data.soilWaterAnalysisId);
        const qty = parseInt(data.quantity);
        await assertOtherFieldsValid(SOIL_WATER_EQUIPMENT_OTHER_RULES, data);

        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_equipment
            ("kvkId", reporting_year, "soilWaterAnalysisId", analysis_other, equipment_name, quantity, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, rYearId, isNaN(analysisId) ? null : analysisId, (data.analysisOther && String(data.analysisOther).trim()) || null, data.equipmentName || '', isNaN(qty) ? 0 : qty);

        return { success: true };
    },

    findAllEquipment: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = 'WHERE e."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT e.*, k.kvk_name, a.analysis_name
            FROM kvk_soil_water_equipment e
            LEFT JOIN kvk k ON e."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis a ON e."soilWaterAnalysisId" = a.soil_water_analysis_id
            
            ${whereClause}
            ${_soilOrderBy(user, 'e', 'soil_water_equipment_id')}
        `, ...params);

        return rows.map(_mapEquipmentResponse);
    },

    findEquipmentById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT e.* 
            FROM kvk_soil_water_equipment e
            
            WHERE e.soil_water_equipment_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        return _mapEquipmentResponse(rows[0]);
    },

    updateEquipment: async (id, data, user) => {
        await assertOtherFieldsValid(SOIL_WATER_EQUIPMENT_OTHER_RULES, data);
        const updates = [];
        const values = [];
        let index = 1;

        if (data.reportingYear !== undefined) {
            updates.push(`reporting_year = $${index++}`);
            const rYearId = await soilWaterRepository.resolveReportingYear(data);
            values.push(rYearId);
        }
        if (data.soilWaterAnalysisId !== undefined) {
            updates.push(`"soilWaterAnalysisId" = $${index++}`);
            const val = parseInt(data.soilWaterAnalysisId);
            values.push(isNaN(val) ? null : val);
        }
        if (data.analysisOther !== undefined) {
            updates.push(`analysis_other = $${index++}`);
            values.push((String(data.analysisOther).trim()) || null);
        }
        if (data.equipmentName !== undefined) {
            updates.push(`equipment_name = $${index++}`);
            values.push(data.equipmentName || '');
        }
        if (data.quantity !== undefined) {
            updates.push(`quantity = $${index++}`);
            const val = parseInt(data.quantity);
            values.push(isNaN(val) ? 0 : val);
        }

        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            let sql = `UPDATE kvk_soil_water_equipment SET ${updates.join(', ')} WHERE soil_water_equipment_id = $${index++}`;
            const finalParams = [...values, parseInt(id)];
            if (user && user.kvkId) {
                sql += ` AND "kvkId" = $${index++}`;
                finalParams.push(parseInt(user.kvkId));
            }
            await prisma.$queryRawUnsafe(sql, ...finalParams);
        }
        return { success: true };
    },

    deleteEquipment: async (id, user) => {
        let sql = `DELETE FROM kvk_soil_water_equipment WHERE soil_water_equipment_id = $1`;
        const params = [parseInt(id)];
        if (user && user.kvkId) {
            sql += ` AND "kvkId" = $2`;
            params.push(parseInt(user.kvkId));
        }
        await prisma.$queryRawUnsafe(sql, ...params);
        return { success: true };
    },

    // ============================================
    // Soil Water Analysis
    // ============================================
    createAnalysis: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) { throw new Error('Valid kvkId is required'); }

        const aId = parseInt(data.analysisId || data.soilWaterAnalysisId);
        const sAnalysed = parseInt(data.samplesAnalysed || 0);
        const vNum = parseInt(data.villagesNumber || data.numberOfVillages || 0);
        const aRealized = parseInt(data.amountRealized || 0);
        const rYearId = await soilWaterRepository.resolveReportingYear(data);
        await assertOtherFieldsValid(SOIL_WATER_ANALYSIS_OTHER_RULES, { analysisId: data.analysisId ?? data.soilWaterAnalysisId, analysisOther: data.analysisOther });
        const samplesAnalysedThroughOther = normalizeSamplesAnalysedThroughOther(data);

        // All NOT NULL columns MUST have values.
        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_analysis 
            ("kvkId", start_date, end_date, analysis_id, analysis_other, samples_analysed_through, samples_analysed_through_other, samples_analysed, villages_number, amount_realized, general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f, reporting_year, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId,
            data.startDate ? new Date(data.startDate) : new Date(),
            data.endDate ? new Date(data.endDate) : new Date(),
            isNaN(aId) ? null : aId,
            (data.analysisOther && String(data.analysisOther).trim()) || null,
            data.samplesAnalysedThrough || 'Other',
            samplesAnalysedThroughOther,
            isNaN(sAnalysed) ? 0 : sAnalysed,
            isNaN(vNum) ? 0 : vNum,
            isNaN(aRealized) ? 0 : aRealized,
            parseInt(data.generalM || 0),
            parseInt(data.generalF || 0),
            parseInt(data.obcM || 0),
            parseInt(data.obcF || 0),
            parseInt(data.scM || 0),
            parseInt(data.scF || 0),
            parseInt(data.stM || 0),
            parseInt(data.stF || 0),
            rYearId
        );

        return { success: true };
    },

    findAllAnalysis: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = 'WHERE a."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, k.kvk_name, m.analysis_name
            FROM kvk_soil_water_analysis a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis m ON a.analysis_id = m.soil_water_analysis_id
            
            ${whereClause}
            ${_soilOrderBy(user, 'a', 'soil_water_analysis_id')}
        `, ...params);

        return rows.map(_mapAnalysisResponse);
    },

    findAnalysisById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.* 
            FROM kvk_soil_water_analysis a
            
            WHERE a.soil_water_analysis_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        return _mapAnalysisResponse(rows[0]);
    },

    updateAnalysis: async (id, data, user) => {
        await assertOtherFieldsValid(SOIL_WATER_ANALYSIS_OTHER_RULES, data);
        const updates = [];
        const values = [];
        let index = 1;
        const normalizedData = { ...data };

        if (data.samplesAnalysedThrough !== undefined || data.samplesAnalysedThroughOther !== undefined) {
            const currentRows = await prisma.$queryRawUnsafe(`
                SELECT samples_analysed_through, samples_analysed_through_other
                FROM kvk_soil_water_analysis
                WHERE soil_water_analysis_id = $1
            `, parseInt(id));
            const current = currentRows[0]
                ? {
                    samplesAnalysedThrough: currentRows[0].samples_analysed_through,
                    samplesAnalysedThroughOther: currentRows[0].samples_analysed_through_other,
                }
                : {};
            normalizedData.samplesAnalysedThroughOther = normalizeSamplesAnalysedThroughOther(data, current);
        }

        const fieldMap = {
            startDate: 'start_date',
            endDate: 'end_date',
            analysisId: 'analysis_id',
            samplesAnalysedThrough: 'samples_analysed_through',
            samplesAnalysedThroughOther: 'samples_analysed_through_other',
            samplesAnalysed: 'samples_analysed',
            villagesNumber: 'villages_number',
            amountRealized: 'amount_realized',
            generalM: 'general_m',
            generalF: 'general_f',
            obcM: 'obc_m',
            obcF: 'obc_f',
            scM: 'sc_m',
            scF: 'sc_f',
            stM: 'st_m',
            stF: 'st_f'
        };

        if (normalizedData.analysisOther !== undefined) {
            updates.push(`analysis_other = $${index++}`);
            values.push((String(normalizedData.analysisOther).trim()) || null);
        }

        for (const [key, dbCol] of Object.entries(fieldMap)) {
            if (normalizedData[key] !== undefined) {
                updates.push(`${dbCol} = $${index++}`);
                if (key === 'startDate' || key === 'endDate') {
                    values.push(new Date(normalizedData[key]));
                } else if (typeof normalizedData[key] === 'string'
                    && key !== 'samplesAnalysedThrough'
                    && key !== 'samplesAnalysedThroughOther') {
                    const parsed = parseInt(normalizedData[key]);
                    values.push(isNaN(parsed) ? (key === 'analysisId' ? null : 0) : parsed);
                } else {
                    values.push(normalizedData[key]);
                }
            }
        }

        if (data.reportingYear !== undefined) {
            updates.push(`reporting_year = $${index++}`);
            const rYearId = await soilWaterRepository.resolveReportingYear(data);
            values.push(rYearId);
        }

        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            let sql = `UPDATE kvk_soil_water_analysis SET ${updates.join(', ')} WHERE soil_water_analysis_id = $${index++}`;
            const finalParams = [...values, parseInt(id)];
            if (user && user.kvkId) {
                sql += ` AND "kvkId" = $${index++}`;
                finalParams.push(parseInt(user.kvkId));
            }
            await prisma.$queryRawUnsafe(sql, ...finalParams);
        }
        return { success: true };
    },

    deleteAnalysis: async (id, user) => {
        let sql = `DELETE FROM kvk_soil_water_analysis WHERE soil_water_analysis_id = $1`;
        const params = [parseInt(id)];
        if (user && user.kvkId) {
            sql += ` AND "kvkId" = $2`;
            params.push(parseInt(user.kvkId));
        }
        await prisma.$queryRawUnsafe(sql, ...params);
        return { success: true };
    },

    // ============================================
    // World Soil Day
    // ============================================
    createWorldSoilDay: async (data, user) => {
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) { throw new Error('Valid kvkId is required'); }

        const actCond = parseInt(data.activitiesConducted || 0);
        const shcDist = parseInt(data.soilHealthCardDistributed || 0);
        const part = parseInt(data.participants || 0);
        const rYearId = await soilWaterRepository.resolveReportingYear(data);

        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_world_soil_celebration 
            ("kvkId", activities_conducted, soil_health_card_distributed, vip_names, participants, general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f, reporting_year, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId,
            isNaN(actCond) ? 0 : actCond,
            isNaN(shcDist) ? 0 : shcDist,
            data.vipNames || '',
            isNaN(part) ? 0 : part,
            parseInt(data.generalM || 0),
            parseInt(data.generalF || 0),
            parseInt(data.obcM || 0),
            parseInt(data.obcF || 0),
            parseInt(data.scM || 0),
            parseInt(data.scF || 0),
            parseInt(data.stM || 0),
            parseInt(data.stF || 0),
            rYearId
        );

        return { success: true };
    },

    findAllWorldSoilDay: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = 'WHERE w."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT w.*, k.kvk_name
            FROM kvk_world_soil_celebration w
            LEFT JOIN kvk k ON w."kvkId" = k.kvk_id
            
            ${whereClause}
            ${_soilOrderBy(user, 'w', 'world_soil_celebration_id')}
        `, ...params);

        return rows.map(_mapWorldSoilDayResponse);
    },

    findWorldSoilDayById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT w.* 
            FROM kvk_world_soil_celebration w
            
            WHERE w.world_soil_celebration_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        return _mapWorldSoilDayResponse(rows[0]);
    },

    updateWorldSoilDay: async (id, data, user) => {
        const updates = [];
        const values = [];
        let index = 1;

        const fieldMap = {
            activitiesConducted: 'activities_conducted',
            soilHealthCardDistributed: 'soil_health_card_distributed',
            vipNames: 'vip_names',
            participants: 'participants',
            generalM: 'general_m',
            generalF: 'general_f',
            obcM: 'obc_m',
            obcF: 'obc_f',
            scM: 'sc_m',
            scF: 'sc_f',
            stM: 'st_m',
            stF: 'st_f'
        };

        for (const [key, dbCol] of Object.entries(fieldMap)) {
            if (data[key] !== undefined) {
                updates.push(`${dbCol} = $${index++}`);
                if (typeof data[key] === 'string' && key !== 'vipNames') {
                    const parsed = parseInt(data[key]);
                    values.push(isNaN(parsed) ? 0 : parsed);
                } else {
                    values.push(data[key]);
                }
            }
        }

        if (data.reportingYear !== undefined) {
            updates.push(`reporting_year = $${index++}`);
            const rYearId = await soilWaterRepository.resolveReportingYear(data);
            values.push(rYearId);
        }

        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            let sql = `UPDATE kvk_world_soil_celebration SET ${updates.join(', ')} WHERE world_soil_celebration_id = $${index++}`;
            const finalParams = [...values, parseInt(id)];
            if (user && user.kvkId) {
                sql += ` AND "kvkId" = $${index++}`;
                finalParams.push(parseInt(user.kvkId));
            }
            await prisma.$queryRawUnsafe(sql, ...finalParams);
        }
        return { success: true };
    },

    deleteWorldSoilDay: async (id, user) => {
        let sql = `DELETE FROM kvk_world_soil_celebration WHERE world_soil_celebration_id = $1`;
        const params = [parseInt(id)];
        if (user && user.kvkId) {
            sql += ` AND "kvkId" = $2`;
            params.push(parseInt(user.kvkId));
        }
        await prisma.$queryRawUnsafe(sql, ...params);
        return { success: true };
    },

    // Master lookup
    findAllAnalysisMasters: async () => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT soil_water_analysis_id as "soilWaterAnalysisId", analysis_name as "analysisName"
            FROM soil_water_analysis
            ORDER BY analysis_name ASC
        `);
        return rows;
    }
};

module.exports = soilWaterRepository;
