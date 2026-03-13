const prisma = require('../../config/prisma.js');

const soilWaterRepository = {
    // Helper to resolve year_id from string like "2022-23" or "2022"
    resolveYearId: async (yearValue) => {
        if (!yearValue) return null;
        let yearStr = String(yearValue).split('-')[0]; // Extract "2022" from "2022-23" or just "2022"
        const yearInt = parseInt(yearStr);
        if (isNaN(yearInt)) return null;

        return await prisma.$transaction(async (tx) => {
            const rows = await tx.$queryRawUnsafe(`SELECT year_id FROM year_master WHERE year_name = $1 LIMIT 1`, String(yearInt));
            if (rows && rows.length > 0) {
                return rows[0].year_id;
            } else {
                const inserted = await tx.$queryRawUnsafe(`INSERT INTO year_master (year_name, created_at, updated_at) VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING year_id`, String(yearInt));
                return inserted[0].year_id;
            }
        });
    },

    // ============================================
    // Soil Water Equipment
    // ============================================
    createEquipment: async (data, user) => {
        // Resolve kvkId: prioritized from user session (if linked to a KVK like Gaya), then from data.
        let kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        if (!kvkId) kvkId = 1; // Fallback to 1 if absolutely nothing found

        const rYearId = await soilWaterRepository.resolveYearId(data.reportingYear || data.year);
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

        return rows.map(r => {
            const yName = r.year_name;
            const yLabel = yName ? String(yName) : null;
            return {
                ...r,
                id: r.soil_water_equipment_id,
                kvkName: r.kvk_name,
                reportingYear: yLabel,
                reportingYearLabel: yLabel,
                analysisName: r.analysis_name,
                equipmentName: r.equipment_name,
                soilWaterAnalysisId: r.soilWaterAnalysisId,
                quantity: r.quantity,
                // Frontend FIELD_NAMES alignment
                analysis: r.analysis_name
            };
        });
    },

    findEquipmentById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT e.*, y.year_name 
            FROM kvk_soil_water_equipment e
            LEFT JOIN year_master y ON e.reporting_year_id = y.year_id
            WHERE e.soil_water_equipment_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        const r = rows[0];
        const yName = r.year_name;
        const yLabel = yName ? String(yName) : null;
        return {
            ...r,
            id: r.soil_water_equipment_id,
            kvkId: r.kvkId,
            reportingYear: yLabel,
            equipmentName: r.equipment_name,
            soilWaterAnalysisId: r.soilWaterAnalysisId,
            quantity: r.quantity,
            // Frontend FIELD_NAMES alignment
            analysis: r.analysis_name
        };
    },

    updateEquipment: async (id, data, user) => {
        const updates = [];
        const values = [];
        let index = 1;

        if (data.reportingYear !== undefined || data.year !== undefined) {
            updates.push(`reporting_year_id = $${index++}`);
            const rYearId = await soilWaterRepository.resolveYearId(data.reportingYear || data.year);
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
        const rYearId = await soilWaterRepository.resolveYearId(data.reportingYear || data.year);

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

        return rows.map(r => {
            const yName = r.year_name;
            const yLabel = yName ? String(yName) : null;
            return {
                ...r,
                id: r.soil_water_analysis_id,
                kvkName: r.kvk_name,
                analysis: r.analysis_name,
                startDate: r.start_date,
                endDate: r.end_date,
                noOfSamplesAnalyzed: r.samples_analysed,
                noOfVillagesCovered: r.villages_number,
                amountReleased: r.amount_realized,
                reportingYear: yLabel,
                year: yLabel,
                // Legacy fields
                samplesAnalysed: r.samples_analysed,
                villagesNumber: r.villages_number,
                amountRealized: r.amount_realized,
                generalM: r.general_m,
                generalF: r.general_f,
                obcM: r.obc_m,
                obcF: r.obc_f,
                scM: r.sc_m,
                scF: r.sc_f,
                stM: r.st_m,
                stF: r.st_f,
            };
        });
    },

    findAnalysisById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, y.year_name 
            FROM kvk_soil_water_analysis a
            LEFT JOIN year_master y ON a.reporting_year_id = y.year_id
            WHERE a.soil_water_analysis_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        const r = rows[0];
        const yName = r.year_name;
        const yLabel = yName ? String(yName) : null;
        return {
            ...r,
            id: r.soil_water_analysis_id,
            kvkId: r.kvkId,
            startDate: r.start_date,
            endDate: r.end_date,
            analysisId: r.analysis_id,
            samplesAnalysedThrough: r.samples_analysed_through,
            noOfSamplesAnalyzed: r.samples_analysed, // Changed from samplesAnalysed
            noOfVillagesCovered: r.villages_number, // Changed from villagesNumber
            amountReleased: r.amount_realized, // Changed from amountRealized
            generalM: r.general_m,
            generalF: r.general_f,
            obcM: r.obc_m,
            obcF: r.obc_f,
            scM: r.sc_m,
            scF: r.sc_f,
            stM: r.st_m,
            stF: r.st_f,
            reportingYear: yLabel,
            year: yLabel,
            // Legacy fields
            samplesAnalysed: r.samples_analysed,
            villagesNumber: r.villages_number,
            amountRealized: r.amount_realized,
        };
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

        if (data.reportingYear !== undefined || data.year !== undefined) {
            updates.push(`reporting_year_id = $${index++}`);
            const rYearId = await soilWaterRepository.resolveYearId(data.reportingYear || data.year);
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
        const rYearId = await soilWaterRepository.resolveYearId(data.reportingYear || data.year);

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

        return rows.map(r => {
            const yName = r.year_name;
            const yLabel = yName ? String(yName) : null;
            return {
                ...r,
                id: r.world_soil_celebration_id,
                kvkName: r.kvk_name,
                noOfActivitiesConducted: r.activities_conducted,
                soilHealthCardsDistributed: r.soil_health_card_distributed,
                noOfVips: r.no_of_vips, // Assuming 'no_of_vips' exists in the DB or is a new field to be added
                vipNames: r.vip_names,
                totalParticipantsAttended: r.participants,
                generalM: r.general_m,
                generalF: r.general_f,
                obcM: r.obc_m,
                obcF: r.obc_f,
                scM: r.sc_m,
                scF: r.sc_f,
                stM: r.st_m,
                stF: r.st_f,
                reportingYear: yLabel,
                year: yLabel,
                // Legacy fields
                activitiesConducted: r.activities_conducted,
                soilHealthCardDistributed: r.soil_health_card_distributed,
                participants: r.participants,
            };
        });
    },

    findWorldSoilDayById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT w.*, y.year_name 
            FROM kvk_world_soil_celebration w
            LEFT JOIN year_master y ON w.reporting_year_id = y.year_id
            WHERE w.world_soil_celebration_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        const r = rows[0];
        const yName = r.year_name;
        const yLabel = yName ? String(yName) : null;
        return {
            ...r,
            id: r.world_soil_celebration_id,
            kvkId: r.kvkId,
            noOfActivitiesConducted: r.activities_conducted,
            soilHealthCardsDistributed: r.soil_health_card_distributed,
            noOfVips: r.no_of_vips, // Assuming 'no_of_vips' exists in the DB or is a new field to be added
            vipNames: r.vip_names,
            totalParticipantsAttended: r.participants,
            generalM: r.general_m,
            generalF: r.general_f,
            obcM: r.obc_m,
            obcF: r.obc_f,
            scM: r.sc_m,
            scF: r.sc_f,
            stM: r.st_m,
            stF: r.st_f,
            reportingYear: yLabel,
            year: yLabel,
            // Legacy fields
            activitiesConducted: r.activities_conducted,
            soilHealthCardDistributed: r.soil_health_card_distributed,
            participants: r.participants,
        };
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

        if (data.reportingYear !== undefined || data.year !== undefined) {
            updates.push(`reporting_year_id = $${index++}`);
            const rYearId = await soilWaterRepository.resolveYearId(data.reportingYear || data.year);
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
