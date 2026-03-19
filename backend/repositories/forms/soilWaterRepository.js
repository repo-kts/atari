const prisma = require('../../config/prisma.js');

// Mapping functions to avoid duplicate fields from spreading raw DB objects
function _mapEquipmentResponse(r) {
    if (!r) return null;
    const yName = r.year_name;
    const yLabel = yName ? String(yName) : null;
    const analysisName = r.analysis_name;
    const reportingYearId = r.reporting_year_id;
    return {
        id: r.soil_water_equipment_id,
        soilWaterEquipmentId: r.soil_water_equipment_id,
        kvkId: r.kvkId,
        kvkName: r.kvk_name,
        reportingYear: yLabel,
        reportingYearId,
        analysisName,
        equipmentName: r.equipment_name,
        soilWaterAnalysisId: r.soilWaterAnalysisId,
        quantity: r.quantity,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

function _mapAnalysisResponse(r) {
    if (!r) return null;
    const yName = r.year_name;
    const yLabel = yName ? String(yName) : null;
    const analysisName = r.analysis_name;
    const reportingYearId = r.reporting_year_id;
    return {
        id: r.soil_water_analysis_id,
        soilWaterAnalysisId: r.soil_water_analysis_id,
        kvkId: r.kvkId,
        kvkName: r.kvk_name,
        analysisName,
        analysisId: r.analysis_id,
        startDate: r.start_date ? r.start_date.toISOString().split('T')[0] : null,
        endDate: r.end_date ? r.end_date.toISOString().split('T')[0] : null,
        samplesAnalysedThrough: r.samples_analysed_through,
        samplesAnalysed: r.samples_analysed,
        villagesNumber: r.villages_number,
        amountRealized: r.amount_realized,
        reportingYear: yLabel,
        reportingYearId,
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
    const yName = r.year_name;
    const yLabel = yName ? String(yName) : null;
    const reportingYearId = r.reporting_year_id;
    return {
        id: r.world_soil_celebration_id,
        worldSoilCelebrationId: r.world_soil_celebration_id,
        kvkId: r.kvkId,
        kvkName: r.kvk_name,
        activitiesConducted: r.activities_conducted,
        soilHealthCardDistributed: r.soil_health_card_distributed,
        noOfVips: r.no_of_vips,
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
        reportingYear: yLabel,
        reportingYearId,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

const soilWaterRepository = {
    // Helper to resolve year_id from ID or string like "2022-23" or "2022"
    // Prioritizes yearId/reportingYearId if provided, otherwise resolves from string
    resolveYearId: async (data) => {
        // If data is a number or string that looks like an ID, use it directly
        if (typeof data === 'number' || (typeof data === 'string' && /^\d+$/.test(data))) {
            const yearId = parseInt(data);
            if (!isNaN(yearId) && yearId > 0) {
                return yearId;
            }
        }
        
        // If data is an object, check for yearId or reportingYearId first
        if (data && typeof data === 'object') {
            const yearId = data.yearId || data.reportingYearId;
            if (yearId) {
                const parsed = parseInt(yearId);
                if (!isNaN(parsed) && parsed > 0) {
                    return parsed;
                }
            }
            // Fall back to year string if ID not found
            data = data.reportingYear || data.year || data.yearName;
        }
        
        // If we have a year string, resolve it (but don't create new years - only find existing)
        if (data && typeof data === 'string') {
            let yearStr = String(data).split('-')[0]; // Extract "2022" from "2022-23" or just "2022"
            const yearInt = parseInt(yearStr);
            if (isNaN(yearInt)) return null;

            const rows = await prisma.$queryRawUnsafe(`SELECT year_id FROM year_master WHERE year_name = $1 LIMIT 1`, String(yearInt));
            if (rows && rows.length > 0) {
                return rows[0].year_id;
            }
            // Don't create new years - return null if not found
            return null;
        }
        
        return null;
    },

    // ============================================
    // Soil Water Equipment
    // ============================================
    createEquipment: async (data, user) => {
        // Resolve kvkId: prioritized from user session (if linked to a KVK like Gaya), then from data.
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) kvkId = 1; // Fallback to 1 if absolutely nothing found

        const rYearId = await soilWaterRepository.resolveYearId(data);
        const analysisId = parseInt(data.soilWaterAnalysisId);
        const qty = parseInt(data.quantity);

        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_equipment 
            ("kvkId", reporting_year_id, "soilWaterAnalysisId", equipment_name, quantity, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, rYearId, isNaN(analysisId) ? null : analysisId, data.equipmentName || '', isNaN(qty) ? 0 : qty);

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
            SELECT e.*, k.kvk_name, a.analysis_name, y.year_name
            FROM kvk_soil_water_equipment e
            LEFT JOIN kvk k ON e."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis a ON e."soilWaterAnalysisId" = a.soil_water_analysis_id
            LEFT JOIN year_master y ON e.reporting_year_id = y.year_id
            ${whereClause}
            ORDER BY e.soil_water_equipment_id DESC
        `, ...params);

        return rows.map(_mapEquipmentResponse);
    },

    findEquipmentById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT e.*, y.year_name 
            FROM kvk_soil_water_equipment e
            LEFT JOIN year_master y ON e.reporting_year_id = y.year_id
            WHERE e.soil_water_equipment_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        return _mapEquipmentResponse(rows[0]);
    },

    updateEquipment: async (id, data, user) => {
        const updates = [];
        const values = [];
        let index = 1;

        if (data.reportingYearId !== undefined || data.yearId !== undefined || data.reportingYear !== undefined || data.year !== undefined) {
            updates.push(`reporting_year_id = $${index++}`);
            const rYearId = await soilWaterRepository.resolveYearId(data);
            values.push(rYearId);
        }
        if (data.soilWaterAnalysisId !== undefined) {
            updates.push(`"soilWaterAnalysisId" = $${index++}`);
            const val = parseInt(data.soilWaterAnalysisId);
            values.push(isNaN(val) ? null : val);
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
        const rYearId = await soilWaterRepository.resolveYearId(data);

        // All NOT NULL columns MUST have values.
        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_analysis 
            ("kvkId", start_date, end_date, analysis_id, samples_analysed_through, samples_analysed, villages_number, amount_realized, general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f, reporting_year_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId,
            data.startDate ? new Date(data.startDate) : new Date(),
            data.endDate ? new Date(data.endDate) : new Date(),
            isNaN(aId) ? null : aId,
            data.samplesAnalysedThrough || 'Other',
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
            SELECT a.*, k.kvk_name, m.analysis_name, y.year_name
            FROM kvk_soil_water_analysis a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis m ON a.analysis_id = m.soil_water_analysis_id
            LEFT JOIN year_master y ON a.reporting_year_id = y.year_id
            ${whereClause}
            ORDER BY a.soil_water_analysis_id DESC
        `, ...params);

        return rows.map(_mapAnalysisResponse);
    },

    findAnalysisById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, y.year_name 
            FROM kvk_soil_water_analysis a
            LEFT JOIN year_master y ON a.reporting_year_id = y.year_id
            WHERE a.soil_water_analysis_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        return _mapAnalysisResponse(rows[0]);
    },

    updateAnalysis: async (id, data, user) => {
        const updates = [];
        const values = [];
        let index = 1;

        const fieldMap = {
            startDate: 'start_date',
            endDate: 'end_date',
            analysisId: 'analysis_id',
            samplesAnalysedThrough: 'samples_analysed_through',
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

        for (const [key, dbCol] of Object.entries(fieldMap)) {
            if (data[key] !== undefined) {
                updates.push(`${dbCol} = $${index++}`);
                if (key === 'startDate' || key === 'endDate') {
                    values.push(new Date(data[key]));
                } else if (typeof data[key] === 'string' && key !== 'samplesAnalysedThrough') {
                    const parsed = parseInt(data[key]);
                    values.push(isNaN(parsed) ? (key === 'analysisId' ? null : 0) : parsed);
                } else {
                    values.push(data[key]);
                }
            }
        }

        if (data.reportingYearId !== undefined || data.yearId !== undefined || data.reportingYear !== undefined || data.year !== undefined) {
            updates.push(`reporting_year_id = $${index++}`);
            const rYearId = await soilWaterRepository.resolveYearId(data);
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
        const rYearId = await soilWaterRepository.resolveYearId(data);

        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_world_soil_celebration 
            ("kvkId", activities_conducted, soil_health_card_distributed, vip_names, participants, general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f, reporting_year_id, created_at, updated_at)
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
            SELECT w.*, k.kvk_name, y.year_name
            FROM kvk_world_soil_celebration w
            LEFT JOIN kvk k ON w."kvkId" = k.kvk_id
            LEFT JOIN year_master y ON w.reporting_year_id = y.year_id
            ${whereClause}
            ORDER BY w.world_soil_celebration_id DESC
        `, ...params);

        return rows.map(_mapWorldSoilDayResponse);
    },

    findWorldSoilDayById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT w.*, y.year_name 
            FROM kvk_world_soil_celebration w
            LEFT JOIN year_master y ON w.reporting_year_id = y.year_id
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

        if (data.reportingYearId !== undefined || data.yearId !== undefined || data.reportingYear !== undefined || data.year !== undefined) {
            updates.push(`reporting_year_id = $${index++}`);
            const rYearId = await soilWaterRepository.resolveYearId(data);
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
