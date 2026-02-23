const prisma = require('../../config/prisma.js');

const celebrationDaysRepository = {
    create: async (data, user) => {
        const toInt = (v) => (v === null || v === undefined) ? 0 : parseInt(String(v), 10) || 0;

        // KVK ID — from authenticated user, else form, else KVK Gaya (2)
        const kvkId = toInt((user && user.kvkId) ? user.kvkId : (data.kvkId || 2));

        // Resolve importantDayId from name or direct ID
        let importantDayId = toInt(data.importantDayId);
        const importantDayName = String(data.importantDay || data.importantDayName || '');
        if (!importantDayId && importantDayName) {
            // Try to find existing
            let rows = await prisma.$queryRawUnsafe(
                `SELECT important_day_id FROM important_day WHERE day_name = $1 LIMIT 1;`, importantDayName
            );
            if (rows && rows.length > 0) {
                importantDayId = Number(String(rows[0].important_day_id));
            } else {
                // Auto-insert if not found (e.g. "Others" typed variant)
                const ins = await prisma.$queryRawUnsafe(
                    `INSERT INTO important_day (day_name) VALUES ($1) RETURNING important_day_id;`, importantDayName
                );
                importantDayId = Number(String(ins[0].important_day_id));
            }
        }
        if (!importantDayId) importantDayId = 1; // fallback

        const eventDate = new Date(data.eventDate || new Date()).toISOString();
        const numberOfActivities = toInt(data.activityCount || data.numberOfActivities || 0);

        const gen_m = toInt(data.gen_m || data.farmersGeneralM || 0);
        const gen_f = toInt(data.gen_f || data.farmersGeneralF || 0);
        const obc_m = toInt(data.obc_m || data.farmersObcM || 0);
        const obc_f = toInt(data.obc_f || data.farmersObcF || 0);
        const sc_m = toInt(data.sc_m || data.farmersScM || 0);
        const sc_f = toInt(data.sc_f || data.farmersScF || 0);
        const st_m = toInt(data.st_m || data.farmersStM || 0);
        const st_f = toInt(data.st_f || data.farmersStF || 0);
        const ext_gen_m = toInt(data.ext_gen_m || data.officialsGeneralM || 0);
        const ext_gen_f = toInt(data.ext_gen_f || data.officialsGeneralF || 0);
        const ext_obc_m = toInt(data.ext_obc_m || data.officialsObcM || 0);
        const ext_obc_f = toInt(data.ext_obc_f || data.officialsObcF || 0);
        const ext_sc_m = toInt(data.ext_sc_m || data.officialsScM || 0);
        const ext_sc_f = toInt(data.ext_sc_f || data.officialsScF || 0);
        const ext_st_m = toInt(data.ext_st_m || data.officialsStM || 0);
        const ext_st_f = toInt(data.ext_st_f || data.officialsStF || 0);

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_important_day_celebration
            ("kvkId", event_date, "importantDayId", number_of_activities,
             farmers_general_m, farmers_general_f, farmers_obc_m, farmers_obc_f,
             farmers_sc_m, farmers_sc_f, farmers_st_m, farmers_st_f,
             officials_general_m, officials_general_f, officials_obc_m, officials_obc_f,
             officials_sc_m, officials_sc_f, officials_st_m, officials_st_f)
            VALUES ($1, $2::timestamp, $3, $4,
                    $5, $6, $7, $8, $9, $10, $11, $12,
                    $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING celebration_id;
        `, kvkId, eventDate, importantDayId, numberOfActivities,
            gen_m, gen_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f,
            ext_gen_m, ext_gen_f, ext_obc_m, ext_obc_f, ext_sc_m, ext_sc_f, ext_st_m, ext_st_f);

        return { id: Number(String(inserted[0].celebration_id)) };
    },

    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = `WHERE c."kvkId" = $1`;
            params.push(parseInt(String(user.kvkId)));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT c.*, k.kvk_name, d.day_name
            FROM kvk_important_day_celebration c
            LEFT JOIN kvk k ON c."kvkId" = k.kvk_id
            LEFT JOIN important_day d ON c."importantDayId" = d.important_day_id
            ${whereClause}
            ORDER BY c.celebration_id DESC;
        `, ...params);

        return rows.map(r => celebrationDaysRepository._mapResponse(r));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT c.*, k.kvk_name, d.day_name
            FROM kvk_important_day_celebration c
            LEFT JOIN kvk k ON c."kvkId" = k.kvk_id
            LEFT JOIN important_day d ON c."importantDayId" = d.important_day_id
            WHERE c.celebration_id = $1;
        `, parseInt(String(id)));
        if (!rows || !rows.length) return null;
        return celebrationDaysRepository._mapResponse(rows[0]);
    },

    update: async (id, data) => {
        const toInt = (v) => (v === null || v === undefined) ? NaN : parseInt(String(v), 10);
        const updates = [];
        const values = [];
        let idx = 1;

        if (data.eventDate !== undefined) {
            updates.push(`event_date = $${idx++}::timestamp`);
            values.push(new Date(data.eventDate).toISOString());
        }

        // Handle important day name → ID resolution
        const importantDayName = data.importantDay || data.importantDayName;
        if (importantDayName) {
            const rows = await prisma.$queryRawUnsafe(
                `SELECT important_day_id FROM important_day WHERE day_name = $1 LIMIT 1;`, String(importantDayName)
            );
            if (rows && rows.length > 0) {
                updates.push(`"importantDayId" = $${idx++}`);
                values.push(Number(String(rows[0].important_day_id)));
            }
        } else if (data.importantDayId !== undefined) {
            updates.push(`"importantDayId" = $${idx++}`);
            values.push(toInt(data.importantDayId) || 1);
        }

        const numAct = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
        if (numAct !== undefined) {
            updates.push(`number_of_activities = $${idx++}`);
            values.push(toInt(numAct) || 0);
        }

        const pMap = {
            gen_m: 'farmers_general_m', gen_f: 'farmers_general_f',
            obc_m: 'farmers_obc_m', obc_f: 'farmers_obc_f',
            sc_m: 'farmers_sc_m', sc_f: 'farmers_sc_f',
            st_m: 'farmers_st_m', st_f: 'farmers_st_f',
            ext_gen_m: 'officials_general_m', ext_gen_f: 'officials_general_f',
            ext_obc_m: 'officials_obc_m', ext_obc_f: 'officials_obc_f',
            ext_sc_m: 'officials_sc_m', ext_sc_f: 'officials_sc_f',
            ext_st_m: 'officials_st_m', ext_st_f: 'officials_st_f',
            farmersGeneralM: 'farmers_general_m', farmersGeneralF: 'farmers_general_f',
            farmersObcM: 'farmers_obc_m', farmersObcF: 'farmers_obc_f',
            farmersScM: 'farmers_sc_m', farmersScF: 'farmers_sc_f',
            farmersStM: 'farmers_st_m', farmersStF: 'farmers_st_f',
            officialsGeneralM: 'officials_general_m', officialsGeneralF: 'officials_general_f',
            officialsObcM: 'officials_obc_m', officialsObcF: 'officials_obc_f',
            officialsScM: 'officials_sc_m', officialsScF: 'officials_sc_f',
            officialsStM: 'officials_st_m', officialsStF: 'officials_st_f',
        };
        for (const [fk, col] of Object.entries(pMap)) {
            if (data[fk] !== undefined && !updates.some(u => u.startsWith(`${col} =`))) {
                updates.push(`${col} = $${idx++}`);
                values.push(toInt(data[fk]) || 0);
            }
        }

        if (updates.length > 0) {
            const sql = `UPDATE kvk_important_day_celebration SET ${updates.join(', ')} WHERE celebration_id = $${idx}`;
            values.push(toInt(id));
            console.log('[CelebrationDays Update] SQL:', sql);
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(
            `DELETE FROM kvk_important_day_celebration WHERE celebration_id = $1`,
            parseInt(String(id))
        );
        return { success: true };
    },

    _mapResponse: (r) => {
        const safeNum = (v) => (v === null || v === undefined) ? 0 : Number(String(v));
        const eventDate = r.event_date ? new Date(r.event_date).toISOString().split('T')[0] : '';

        let reportingYear = '2023-24';
        if (eventDate) {
            const yr = new Date(eventDate).getFullYear();
            const mo = new Date(eventDate).getMonth() + 1;
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
        const ext_gen_m = safeNum(r.officials_general_m);
        const ext_gen_f = safeNum(r.officials_general_f);
        const ext_obc_m = safeNum(r.officials_obc_m);
        const ext_obc_f = safeNum(r.officials_obc_f);
        const ext_sc_m = safeNum(r.officials_sc_m);
        const ext_sc_f = safeNum(r.officials_sc_f);
        const ext_st_m = safeNum(r.officials_st_m);
        const ext_st_f = safeNum(r.officials_st_f);
        const totalParticipants = gen_m + gen_f + obc_m + obc_f + sc_m + sc_f + st_m + st_f
            + ext_gen_m + ext_gen_f + ext_obc_m + ext_obc_f
            + ext_sc_m + ext_sc_f + ext_st_m + ext_st_f;

        return {
            id: safeNum(r.celebration_id),
            celebrationId: safeNum(r.celebration_id),
            kvkId: safeNum(r['kvkId'] ?? r.kvkId),
            kvkName: r.kvk_name || '',
            kvk: { kvkName: r.kvk_name || '' },
            eventDate,
            importantDayId: safeNum(r['importantDayId'] ?? r.importantDayId),
            importantDay: r.day_name || '',       // string name for form
            importantDayName: r.day_name || '',
            numberOfActivities: safeNum(r.number_of_activities),
            activityCount: safeNum(r.number_of_activities),
            // Farmer fields
            farmersGeneralM: gen_m, farmersGeneralF: gen_f,
            farmersObcM: obc_m, farmersObcF: obc_f,
            farmersScM: sc_m, farmersScF: sc_f,
            farmersStM: st_m, farmersStF: st_f,
            gen_m, gen_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f,
            // Officials fields
            officialsGeneralM: ext_gen_m, officialsGeneralF: ext_gen_f,
            officialsObcM: ext_obc_m, officialsObcF: ext_obc_f,
            officialsScM: ext_sc_m, officialsScF: ext_sc_f,
            officialsStM: ext_st_m, officialsStF: ext_st_f,
            ext_gen_m, ext_gen_f, ext_obc_m, ext_obc_f,
            ext_sc_m, ext_sc_f, ext_st_m, ext_st_f,
            totalParticipants,
            reportingYear,
            // Header-matching keys — must match routeConfig.ts fields + table screenshot exactly
            'KVK Name': r.kvk_name || '',
            'Important Days': r.day_name || '',
            'Important Dates': r.day_name || '',   // routeConfig alias
            'Event Date': eventDate,
            'Event date': eventDate,
            'No. of Activities': safeNum(r.number_of_activities),
            'No. of activities': safeNum(r.number_of_activities),
            'Reporting Year': reportingYear,
        };
    },
};

module.exports = celebrationDaysRepository;
