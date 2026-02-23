const prisma = require('../../config/prisma.js');

/**
 * Prisma $queryRawUnsafe returns BigInt for integer columns.
 * Always use Number() to convert before returning to JSON.
 */
const toNum = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'bigint') return Number(v);
    return parseInt(String(v), 10) || 0;
};

const toStr = (v) => (v === null || v === undefined) ? '' : String(v);

const soilEquipmentRepository = {
    create: async (data, user) => {
        const kvkId = toNum((user && user.kvkId) ? user.kvkId : (data.kvkId || 0));
        // year arrives as '2023-24' — store just the integer year (2023)
        const rawYear = data.reportingYear || data.year || String(new Date().getFullYear());
        const reportingYear = parseInt(String(rawYear).split('-')[0], 10) || new Date().getFullYear();
        const quantity = toNum(data.quantity);

        // Resolve soilWaterAnalysisId from analysis name or direct ID
        let soilWaterAnalysisId = toNum(data.soilWaterAnalysisId);
        if (!soilWaterAnalysisId && data.analysis) {
            const analysisName = String(data.analysis);
            const rows = await prisma.$queryRawUnsafe(
                `SELECT soil_water_analysis_id FROM soil_water_analysis WHERE analysis_name = $1 LIMIT 1;`,
                analysisName
            );
            if (rows && rows.length > 0) {
                soilWaterAnalysisId = toNum(rows[0].soil_water_analysis_id);
            } else {
                // Auto-create if not found
                const ins = await prisma.$queryRawUnsafe(
                    `INSERT INTO soil_water_analysis (analysis_name) VALUES ($1) RETURNING soil_water_analysis_id;`,
                    analysisName
                );
                soilWaterAnalysisId = toNum(ins[0].soil_water_analysis_id);
            }
        }

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_equipment
            ("kvkId", reporting_year, soil_water_analysis_id, equipment_name, quantity)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING soil_water_equipment_id;
        `, kvkId, reportingYear, soilWaterAnalysisId, toStr(data.equipmentName), quantity);

        return { id: toNum(inserted[0].soil_water_equipment_id) };
    },

    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = `WHERE e."kvkId" = $1`;
            params.push(toNum(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                e.soil_water_equipment_id,
                e."kvkId",
                e.reporting_year,
                e.soil_water_analysis_id,
                e.equipment_name,
                e.quantity,
                k.kvk_name,
                a.analysis_name
            FROM kvk_soil_water_equipment e
            LEFT JOIN kvk k ON e."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis a ON e.soil_water_analysis_id = a.soil_water_analysis_id
            ${whereClause}
            ORDER BY e.soil_water_equipment_id DESC;
        `, ...params);

        return rows.map(r => soilEquipmentRepository._mapResponse(r));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                e.soil_water_equipment_id,
                e."kvkId",
                e.reporting_year,
                e.soil_water_analysis_id,
                e.equipment_name,
                e.quantity,
                k.kvk_name,
                a.analysis_name
            FROM kvk_soil_water_equipment e
            LEFT JOIN kvk k ON e."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis a ON e.soil_water_analysis_id = a.soil_water_analysis_id
            WHERE e.soil_water_equipment_id = $1;
        `, toNum(id));

        if (!rows || !rows.length) return null;
        return soilEquipmentRepository._mapResponse(rows[0]);
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];
        let idx = 1;

        if (data.reportingYear !== undefined || data.year !== undefined) {
            const rawYear = data.reportingYear || data.year;
            updates.push(`reporting_year = $${idx++}`);
            values.push(parseInt(String(rawYear).split('-')[0], 10) || 0);
        }
        if (data.equipmentName !== undefined) {
            updates.push(`equipment_name = $${idx++}`);
            values.push(toStr(data.equipmentName));
        }
        if (data.quantity !== undefined) {
            updates.push(`quantity = $${idx++}`);
            values.push(toNum(data.quantity));
        }
        if (data.analysis !== undefined) {
            const analysisName = String(data.analysis);
            const rows = await prisma.$queryRawUnsafe(
                `SELECT soil_water_analysis_id FROM soil_water_analysis WHERE analysis_name = $1 LIMIT 1;`,
                analysisName
            );
            if (rows && rows.length > 0) {
                updates.push(`soil_water_analysis_id = $${idx++}`);
                values.push(toNum(rows[0].soil_water_analysis_id));
            }
        }
        if (data.soilWaterAnalysisId !== undefined) {
            updates.push(`soil_water_analysis_id = $${idx++}`);
            values.push(toNum(data.soilWaterAnalysisId));
        }

        if (updates.length > 0) {
            const sql = `UPDATE kvk_soil_water_equipment SET ${updates.join(', ')} WHERE soil_water_equipment_id = $${idx}`;
            values.push(toNum(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(
            `DELETE FROM kvk_soil_water_equipment WHERE soil_water_equipment_id = $1`,
            toNum(id)
        );
        return { success: true };
    },

    getAllAnalysisTypes: async () => {
        const rows = await prisma.$queryRawUnsafe(
            `SELECT soil_water_analysis_id, analysis_name FROM soil_water_analysis ORDER BY soil_water_analysis_id ASC;`
        );
        return rows.map(r => ({
            id: toNum(r.soil_water_analysis_id),
            analysisName: toStr(r.analysis_name),
        }));
    },

    _mapResponse: (r) => ({
        id: toNum(r.soil_water_equipment_id),
        soilWaterEquipmentId: toNum(r.soil_water_equipment_id),
        kvkId: toNum(r.kvkId),
        kvkName: toStr(r.kvk_name),
        reportingYear: toNum(r.reporting_year),
        year: toNum(r.reporting_year),
        soilWaterAnalysisId: toNum(r.soil_water_analysis_id),
        analysis: toStr(r.analysis_name),
        equipmentName: toStr(r.equipment_name),
        quantity: toNum(r.quantity),
    }),
};

module.exports = soilEquipmentRepository;
