const prisma = require('../../config/prisma.js');

const soilWaterRepository = {
    // ============================================
    // Soil Water Equipment
    // ============================================
    createEquipment: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);

        const rYear = parseInt(data.reportingYear);
        const analysisId = parseInt(data.soilWaterAnalysisId);
        const qty = parseInt(data.quantity);

        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_equipment 
            ("kvkId", reporting_year, "soilWaterAnalysisId", equipment_name, quantity)
            VALUES ($1, $2, $3, $4, $5)
        `, kvkId, isNaN(rYear) ? null : rYear, isNaN(analysisId) ? null : analysisId, data.equipmentName || '', isNaN(qty) ? 0 : qty);

        return { success: true };
    },

    findAllEquipment: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereClause = 'WHERE e."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT e.*, k.kvk_name, a.analysis_name
            FROM kvk_soil_water_equipment e
            LEFT JOIN kvk k ON e."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis a ON e."soilWaterAnalysisId" = a.soil_water_analysis_id
            ${whereClause}
            ORDER BY e.soil_water_equipment_id DESC
        `, ...params);

        return rows.map(r => ({
            ...r,
            id: r.soil_water_equipment_id,
            kvkName: r.kvk_name,
            reportingYear: r.reporting_year,
            reportingYearLabel: r.reporting_year,
            analysisName: r.analysis_name,
            equipmentName: r.equipment_name,
            soilWaterAnalysisId: r.soilWaterAnalysisId,
            quantity: r.quantity
        }));
    },

    findEquipmentById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT * FROM kvk_soil_water_equipment WHERE soil_water_equipment_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        const r = rows[0];
        return {
            ...r,
            id: r.soil_water_equipment_id,
            kvkId: r.kvkId,
            reportingYear: r.reporting_year,
            equipmentName: r.equipment_name,
            soilWaterAnalysisId: r.soilWaterAnalysisId,
            quantity: r.quantity
        };
    },

    updateEquipment: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;

        if (data.reportingYear !== undefined) {
            updates.push(`reporting_year = $${index++}`);
            const val = parseInt(data.reportingYear);
            values.push(isNaN(val) ? null : val);
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
            const sql = `UPDATE kvk_soil_water_equipment SET ${updates.join(', ')} WHERE soil_water_equipment_id = $${index}`;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    deleteEquipment: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_soil_water_equipment WHERE soil_water_equipment_id = $1`, parseInt(id));
        return { success: true };
    },

    // ============================================
    // Soil Water Analysis
    // ============================================
    createAnalysis: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);

        const aId = parseInt(data.analysisId || data.soilWaterAnalysisId);
        const sAnalysed = parseInt(data.samplesAnalysed || 0);
        const vNum = parseInt(data.villagesNumber || data.numberOfVillages || 0);
        const aRealized = parseInt(data.amountRealized || 0);
        const rYear = parseInt(data.reportingYear || data.year);

        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_analysis 
            ("kvkId", start_date, end_date, analysis_id, samples_analysed_through, samples_analysed, number_of_villages, amount_realized, general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f, reporting_year)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, kvkId, new Date(data.startDate), new Date(data.endDate),
            isNaN(aId) ? null : aId,
            data.samplesAnalysedThrough || '',
            isNaN(sAnalysed) ? 0 : sAnalysed,
            isNaN(vNum) ? 0 : vNum,
            isNaN(aRealized) ? 0 : aRealized,
            parseInt(data.generalM || 0) || 0,
            parseInt(data.generalF || 0) || 0,
            parseInt(data.obcM || 0) || 0,
            parseInt(data.obcF || 0) || 0,
            parseInt(data.scM || 0) || 0,
            parseInt(data.scF || 0) || 0,
            parseInt(data.stM || 0) || 0,
            parseInt(data.stF || 0) || 0,
            isNaN(rYear) ? null : rYear
        );

        return { success: true };
    },

    findAllAnalysis: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereClause = 'WHERE a."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, k.kvk_name, m.analysis_name
            FROM kvk_soil_water_analysis a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis m ON a.analysis_id = m.soil_water_analysis_id
            ${whereClause}
            ORDER BY a.soil_water_analysis_id DESC
        `, ...params);

        return rows.map(r => ({
            ...r,
            id: r.soil_water_analysis_id,
            kvkName: r.kvk_name,
            analysisName: r.analysis_name,
            startDate: r.start_date,
            endDate: r.end_date,
            analysisId: r.analysis_id,
            samplesAnalysedThrough: r.samples_analysed_through,
            samplesAnalysed: r.samples_analysed,
            villagesNumber: r.number_of_villages,
            amountRealized: r.amount_realized,
            generalM: r.general_m,
            generalF: r.general_f,
            obcM: r.obc_m,
            obcF: r.obc_f,
            scM: r.sc_m,
            scF: r.sc_f,
            stM: r.st_m,
            stF: r.st_f,
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year
        }));
    },

    findAnalysisById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT * FROM kvk_soil_water_analysis WHERE soil_water_analysis_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        const r = rows[0];
        return {
            ...r,
            id: r.soil_water_analysis_id,
            kvkId: r.kvkId,
            startDate: r.start_date,
            endDate: r.end_date,
            analysisId: r.analysis_id,
            samplesAnalysedThrough: r.samples_analysed_through,
            samplesAnalysed: r.samples_analysed,
            villagesNumber: r.number_of_villages,
            amountRealized: r.amount_realized,
            generalM: r.general_m,
            generalF: r.general_f,
            obcM: r.obc_m,
            obcF: r.obc_f,
            scM: r.sc_m,
            scF: r.sc_f,
            stM: r.st_m,
            stF: r.st_f,
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year
        };
    },

    updateAnalysis: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;

        const fieldMap = {
            startDate: 'start_date',
            endDate: 'end_date',
            analysisId: 'analysis_id',
            samplesAnalysedThrough: 'samples_analysed_through',
            samplesAnalysed: 'samples_analysed',
            villagesNumber: 'number_of_villages',
            amountRealized: 'amount_realized',
            generalM: 'general_m',
            generalF: 'general_f',
            obcM: 'obc_m',
            obcF: 'obc_f',
            scM: 'sc_m',
            scF: 'sc_f',
            stM: 'st_m',
            stF: 'st_f',
            reportingYear: 'reporting_year'
        };

        for (const [key, dbCol] of Object.entries(fieldMap)) {
            if (data[key] !== undefined) {
                updates.push(`${dbCol} = $${index++}`);
                if (key === 'startDate' || key === 'endDate') {
                    values.push(new Date(data[key]));
                } else if (typeof data[key] === 'string' && key !== 'samplesAnalysedThrough' && key !== 'vipNames') {
                    const parsed = parseInt(data[key]);
                    values.push(isNaN(parsed) ? (key === 'reportingYear' || key === 'analysisId' ? null : 0) : parsed);
                } else {
                    values.push(data[key]);
                }
            }
        }

        if (updates.length > 0) {
            const sql = `UPDATE kvk_soil_water_analysis SET ${updates.join(', ')} WHERE soil_water_analysis_id = $${index}`;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    deleteAnalysis: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_soil_water_analysis WHERE soil_water_analysis_id = $1`, parseInt(id));
        return { success: true };
    },

    // ============================================
    // World Soil Day
    // ============================================
    createWorldSoilDay: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);

        const actCond = parseInt(data.activitiesConducted || 0);
        const shcDist = parseInt(data.soilHealthCardDistributed || 0);
        const part = parseInt(data.participants || 0);
        const rYear = parseInt(data.reportingYear || data.year);

        await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_world_soil_celebration 
            ("kvkId", activities_conducted, soil_health_card_distributed, vip_names, participants, general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f, reporting_year)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
            isNaN(rYear) ? null : rYear
        );

        return { success: true };
    },

    findAllWorldSoilDay: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereClause = 'WHERE w."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT w.*, k.kvk_name
            FROM kvk_world_soil_celebration w
            LEFT JOIN kvk k ON w."kvkId" = k.kvk_id
            ${whereClause}
            ORDER BY w.world_soil_celebration_id DESC
        `, ...params);

        return rows.map(r => ({
            ...r,
            id: r.world_soil_celebration_id,
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
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year
        }));
    },

    findWorldSoilDayById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT * FROM kvk_world_soil_celebration WHERE world_soil_celebration_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        const r = rows[0];
        return {
            ...r,
            id: r.world_soil_celebration_id,
            kvkId: r.kvkId,
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
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year
        };
    },

    updateWorldSoilDay: async (id, data) => {
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
            stF: 'st_f',
            reportingYear: 'reporting_year'
        };

        for (const [key, dbCol] of Object.entries(fieldMap)) {
            if (data[key] !== undefined) {
                updates.push(`${dbCol} = $${index++}`);
                if (typeof data[key] === 'string' && key !== 'vipNames') {
                    const parsed = parseInt(data[key]);
                    values.push(isNaN(parsed) ? (key === 'reportingYear' ? null : 0) : parsed);
                } else {
                    values.push(data[key]);
                }
            }
        }

        if (updates.length > 0) {
            const sql = `UPDATE kvk_world_soil_celebration SET ${updates.join(', ')} WHERE world_soil_celebration_id = $${index}`;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    deleteWorldSoilDay: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_world_soil_celebration WHERE world_soil_celebration_id = $1`, parseInt(id));
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
