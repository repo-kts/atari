const prisma = require('../../config/prisma.js');

const toNum = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'bigint') return Number(v);
    return parseInt(String(v), 10) || 0;
};
const toStr = (v) => (v === null || v === undefined) ? '' : String(v);

const soilAnalysisRepository = {

    create: async (data, user) => {
        const kvkId = toNum((user && user.kvkId) ? user.kvkId : (data.kvkId || 0));

        // Resolve analysisId from name or direct ID
        let analysisId = toNum(data.analysisId || data.soilWaterAnalysisId);
        if (!analysisId && data.analysis) {
            const rows = await prisma.$queryRawUnsafe(
                `SELECT soil_water_analysis_id FROM soil_water_analysis WHERE analysis_name = $1 LIMIT 1;`,
                String(data.analysis)
            );
            if (rows && rows.length > 0) {
                analysisId = toNum(rows[0].soil_water_analysis_id);
            } else {
                const ins = await prisma.$queryRawUnsafe(
                    `INSERT INTO soil_water_analysis (analysis_name) VALUES ($1) RETURNING soil_water_analysis_id;`,
                    String(data.analysis)
                );
                analysisId = toNum(ins[0].soil_water_analysis_id);
            }
        }

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_soil_water_analysis
            ("kvkId", start_date, end_date, analysis_id, samples_analysed_through,
             samples_analysed, number_of_villages, amount_realized,
             general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING soil_water_analysis_id;
        `,
            kvkId,
            data.startDate || data.start_date || null,
            data.endDate || data.end_date || null,
            analysisId,
            toStr(data.samplesAnalyzedThrough || data.samplesAnalysedThrough || ''),
            toNum(data.numberOfSamples || data.samplesAnalysed || 0),
            toNum(data.numberOfVillages || data.villagesNumber || 0),
            toNum(data.amountRealized || 0),
            toNum(data.generalM || 0),
            toNum(data.generalF || 0),
            toNum(data.obcM || 0),
            toNum(data.obcF || 0),
            toNum(data.scM || 0),
            toNum(data.scF || 0),
            toNum(data.stM || 0),
            toNum(data.stF || 0)
        );

        return { id: toNum(inserted[0].soil_water_analysis_id) };
    },

    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = `WHERE a."kvkId" = $1`;
            params.push(toNum(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                a.soil_water_analysis_id,
                a."kvkId",
                a.start_date,
                a.end_date,
                a.analysis_id,
                a.samples_analysed_through,
                a.samples_analysed,
                a.number_of_villages,
                a.amount_realized,
                a.general_m, a.general_f,
                a.obc_m, a.obc_f,
                a.sc_m, a.sc_f,
                a.st_m, a.st_f,
                k.kvk_name,
                s.analysis_name
            FROM kvk_soil_water_analysis a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis s ON a.analysis_id = s.soil_water_analysis_id
            ${whereClause}
            ORDER BY a.soil_water_analysis_id DESC;
        `, ...params);

        return rows.map(r => soilAnalysisRepository._mapResponse(r));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                a.soil_water_analysis_id,
                a."kvkId",
                a.start_date,
                a.end_date,
                a.analysis_id,
                a.samples_analysed_through,
                a.samples_analysed,
                a.number_of_villages,
                a.amount_realized,
                a.general_m, a.general_f,
                a.obc_m, a.obc_f,
                a.sc_m, a.sc_f,
                a.st_m, a.st_f,
                k.kvk_name,
                s.analysis_name
            FROM kvk_soil_water_analysis a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            LEFT JOIN soil_water_analysis s ON a.analysis_id = s.soil_water_analysis_id
            WHERE a.soil_water_analysis_id = $1;
        `, toNum(id));

        if (!rows || !rows.length) return null;
        return soilAnalysisRepository._mapResponse(rows[0]);
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];
        let idx = 1;

        if (data.startDate !== undefined) { updates.push(`start_date = $${idx++}`); values.push(data.startDate); }
        if (data.endDate !== undefined) { updates.push(`end_date = $${idx++}`); values.push(data.endDate); }
        if (data.samplesAnalyzedThrough !== undefined) { updates.push(`samples_analysed_through = $${idx++}`); values.push(toStr(data.samplesAnalyzedThrough)); }
        if (data.numberOfSamples !== undefined) { updates.push(`samples_analysed = $${idx++}`); values.push(toNum(data.numberOfSamples)); }
        if (data.numberOfVillages !== undefined) { updates.push(`number_of_villages = $${idx++}`); values.push(toNum(data.numberOfVillages)); }
        if (data.amountRealized !== undefined) { updates.push(`amount_realized = $${idx++}`); values.push(toNum(data.amountRealized)); }
        if (data.generalM !== undefined) { updates.push(`general_m = $${idx++}`); values.push(toNum(data.generalM)); }
        if (data.generalF !== undefined) { updates.push(`general_f = $${idx++}`); values.push(toNum(data.generalF)); }
        if (data.obcM !== undefined) { updates.push(`obc_m = $${idx++}`); values.push(toNum(data.obcM)); }
        if (data.obcF !== undefined) { updates.push(`obc_f = $${idx++}`); values.push(toNum(data.obcF)); }
        if (data.scM !== undefined) { updates.push(`sc_m = $${idx++}`); values.push(toNum(data.scM)); }
        if (data.scF !== undefined) { updates.push(`sc_f = $${idx++}`); values.push(toNum(data.scF)); }
        if (data.stM !== undefined) { updates.push(`st_m = $${idx++}`); values.push(toNum(data.stM)); }
        if (data.stF !== undefined) { updates.push(`st_f = $${idx++}`); values.push(toNum(data.stF)); }

        if (data.analysis !== undefined) {
            const rows = await prisma.$queryRawUnsafe(
                `SELECT soil_water_analysis_id FROM soil_water_analysis WHERE analysis_name = $1 LIMIT 1;`,
                String(data.analysis)
            );
            if (rows && rows.length > 0) {
                updates.push(`analysis_id = $${idx++}`);
                values.push(toNum(rows[0].soil_water_analysis_id));
            }
        }

        if (updates.length > 0) {
            values.push(toNum(id));
            await prisma.$queryRawUnsafe(
                `UPDATE kvk_soil_water_analysis SET ${updates.join(', ')} WHERE soil_water_analysis_id = $${idx}`,
                ...values
            );
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(
            `DELETE FROM kvk_soil_water_analysis WHERE soil_water_analysis_id = $1`,
            toNum(id)
        );
        return { success: true };
    },

    _mapResponse: (r) => ({
        id: toNum(r.soil_water_analysis_id),
        soilWaterAnalysisId: toNum(r.soil_water_analysis_id),
        kvkId: toNum(r.kvkId),
        kvkName: toStr(r.kvk_name),
        startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '',
        endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '',
        analysisId: toNum(r.analysis_id),
        analysis: toStr(r.analysis_name),
        samplesAnalyzedThrough: toStr(r.samples_analysed_through),
        numberOfSamples: toNum(r.samples_analysed),
        numberOfVillages: toNum(r.number_of_villages),
        amountRealized: toNum(r.amount_realized),
        generalM: toNum(r.general_m),
        generalF: toNum(r.general_f),
        obcM: toNum(r.obc_m),
        obcF: toNum(r.obc_f),
        scM: toNum(r.sc_m),
        scF: toNum(r.sc_f),
        stM: toNum(r.st_m),
        stF: toNum(r.st_f),
    }),
};

module.exports = soilAnalysisRepository;
