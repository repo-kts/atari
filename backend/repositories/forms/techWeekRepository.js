const prisma = require('../../config/prisma.js');

const techWeekRepository = {
    create: async (data, user) => {
        const toInt = (v) => (v === null || v === undefined) ? 0 : parseInt(String(v), 10) || 0;

        // Use kvkId from authenticated user; fallback to form data
        const kvkId = toInt((user && user.kvkId) ? user.kvkId : (data.kvkId || 2));
        const startDate = new Date(data.startDate || new Date()).toISOString();
        const endDate = new Date(data.endDate || new Date()).toISOString();

        const typeOfActivities = String(data.typeOfActivities || data.activityType || '');
        const numberOfActivities = toInt(data.numberOfActivities || data.activityCount || 0);
        const relatedTechnology = String(data.relatedTechnology || data.relatedCropLivestockTechnology || 'n/a');

        const gen_m = toInt(data.gen_m || data.farmersGeneralM || 0);
        const gen_f = toInt(data.gen_f || data.farmersGeneralF || 0);
        const obc_m = toInt(data.obc_m || data.farmersObcM || 0);
        const obc_f = toInt(data.obc_f || data.farmersObcF || 0);
        const sc_m = toInt(data.sc_m || data.farmersScM || 0);
        const sc_f = toInt(data.sc_f || data.farmersScF || 0);
        const st_m = toInt(data.st_m || data.farmersStM || 0);
        const st_f = toInt(data.st_f || data.farmersStF || 0);

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_technology_week_celebration
            ("kvkId", start_date, end_date, type_of_activities, number_of_activities,
             related_crop_livestock_technology,
             farmers_general_m, farmers_general_f,
             farmers_obc_m, farmers_obc_f,
             farmers_sc_m, farmers_sc_f,
             farmers_st_m, farmers_st_f)
            VALUES ($1, $2::timestamp, $3::timestamp, $4, $5, $6,
                    $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING tech_week_id;
        `, kvkId, startDate, endDate, typeOfActivities, numberOfActivities, relatedTechnology,
            gen_m, gen_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f);

        return { id: Number(String(inserted[0].tech_week_id)) };
    },

    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = `WHERE t."kvkId" = $1`;
            params.push(parseInt(String(user.kvkId)));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT t.*, k.kvk_name
            FROM kvk_technology_week_celebration t
            LEFT JOIN kvk k ON t."kvkId" = k.kvk_id
            ${whereClause}
            ORDER BY t.tech_week_id DESC;
        `, ...params);

        return rows.map(r => techWeekRepository._mapResponse(r));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT t.*, k.kvk_name
            FROM kvk_technology_week_celebration t
            LEFT JOIN kvk k ON t."kvkId" = k.kvk_id
            WHERE t.tech_week_id = $1;
        `, parseInt(String(id)));
        if (!rows || !rows.length) return null;
        return techWeekRepository._mapResponse(rows[0]);
    },

    update: async (id, data) => {
        const toInt = (v) => (v === null || v === undefined) ? NaN : parseInt(String(v), 10);

        const updates = [];
        const values = [];
        let idx = 1;

        if (data.startDate !== undefined) { updates.push(`start_date = $${idx++}::timestamp`); values.push(new Date(data.startDate).toISOString()); }
        if (data.endDate !== undefined) { updates.push(`end_date = $${idx++}::timestamp`); values.push(new Date(data.endDate).toISOString()); }

        const actType = data.typeOfActivities !== undefined ? data.typeOfActivities : data.activityType;
        if (actType !== undefined) { updates.push(`type_of_activities = $${idx++}`); values.push(String(actType)); }

        const numAct = data.numberOfActivities !== undefined ? data.numberOfActivities : data.activityCount;
        if (numAct !== undefined) { updates.push(`number_of_activities = $${idx++}`); values.push(toInt(numAct) || 0); }

        if (data.relatedTechnology !== undefined) { updates.push(`related_crop_livestock_technology = $${idx++}`); values.push(String(data.relatedTechnology)); }

        const pMap = {
            gen_m: 'farmers_general_m', gen_f: 'farmers_general_f',
            obc_m: 'farmers_obc_m', obc_f: 'farmers_obc_f',
            sc_m: 'farmers_sc_m', sc_f: 'farmers_sc_f',
            st_m: 'farmers_st_m', st_f: 'farmers_st_f',
            farmersGeneralM: 'farmers_general_m', farmersGeneralF: 'farmers_general_f',
            farmersObcM: 'farmers_obc_m', farmersObcF: 'farmers_obc_f',
            farmersScM: 'farmers_sc_m', farmersScF: 'farmers_sc_f',
            farmersStM: 'farmers_st_m', farmersStF: 'farmers_st_f',
        };
        for (const [fk, col] of Object.entries(pMap)) {
            if (data[fk] !== undefined && !updates.some(u => u.startsWith(`${col} =`))) {
                updates.push(`${col} = $${idx++}`);
                values.push(toInt(data[fk]) || 0);
            }
        }

        if (updates.length > 0) {
            const sql = `UPDATE kvk_technology_week_celebration SET ${updates.join(', ')} WHERE tech_week_id = $${idx}`;
            values.push(toInt(id));
            console.log('[TechWeek Update] SQL:', sql, 'Values:', values);
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_technology_week_celebration WHERE tech_week_id = $1`, parseInt(String(id)));
        return { success: true };
    },

    _mapResponse: (r) => {
        const safeNum = (v) => (v === null || v === undefined) ? 0 : Number(String(v));
        const startDate = r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '';
        const endDate = r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '';

        let reportingYear = '2023-24';
        if (startDate) {
            const yr = new Date(startDate).getFullYear();
            const mo = new Date(startDate).getMonth() + 1;
            const sy = mo >= 4 ? yr : yr - 1;
            reportingYear = `${sy}-${(sy + 1).toString().slice(2)}`;
        }

        const gen_m = safeNum(r.farmers_general_m);
        const gen_f = safeNum(r.farmers_general_f);
        const obc_m = safeNum(r.farmers_obc_m);
        const obc_f = safeNum(r.farmers_obc_f);
        const sc_m = safeNum(r.farmers_sc_m);
        const sc_f = safeNum(r.farmers_sc_f);
        const st_m = safeNum(r.farmers_st_m);
        const st_f = safeNum(r.farmers_st_f);
        const totalParticipants = gen_m + gen_f + obc_m + obc_f + sc_m + sc_f + st_m + st_f;

        return {
            id: safeNum(r.tech_week_id),
            techWeekId: safeNum(r.tech_week_id),
            kvkId: safeNum(r['kvkId'] ?? r.kvkId),
            kvkName: r.kvk_name || '',
            kvk: { kvkName: r.kvk_name || '' },
            startDate,
            endDate,
            typeOfActivities: r.type_of_activities || '',
            activityType: r.type_of_activities || '',  // form alias
            numberOfActivities: safeNum(r.number_of_activities),
            activityCount: safeNum(r.number_of_activities),  // form alias
            relatedTechnology: r.related_crop_livestock_technology || '',
            farmersGeneralM: gen_m, farmersGeneralF: gen_f,
            farmersObcM: obc_m, farmersObcF: obc_f,
            farmersScM: sc_m, farmersScF: sc_f,
            farmersStM: st_m, farmersStF: st_f,
            gen_m, gen_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f,
            totalParticipants,
            reportingYear,
            // Header-matching keys for DataTable — must match routeConfig.ts fields exactly
            'Reporting Year': reportingYear,
            'KVK Name': r.kvk_name || '',
            'KVK': r.kvk_name || '',
            'Start Date': startDate,
            'End Date': endDate,
            'Type Of Activities': r.type_of_activities || '',
            'No. of activities': safeNum(r.number_of_activities),
            'Related Crop/Live Stock Technology': r.related_crop_livestock_technology || '',
            'No. of Participants': totalParticipants,
            'Number of participants': totalParticipants,
        };
    },
};

module.exports = techWeekRepository;
