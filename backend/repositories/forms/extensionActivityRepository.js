const prisma = require('../../config/prisma.js');

const extensionActivityRepository = {
    create: async (data, entityType = null, user = null) => {
        const toInt = (v) => (v === null || v === undefined) ? NaN : parseInt(String(v), 10);

        let staffId = toInt(data.staffId);
        if (isNaN(staffId) && data.staffName) {
            const staffRows = await prisma.$queryRawUnsafe(`SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1 LIMIT 1`, String(data.staffName));
            if (staffRows && staffRows.length > 0) staffId = Number(String(staffRows[0].kvk_staff_id));
        }

        let activityId = toInt(data.activityId);
        if (isNaN(activityId) && data.extensionActivityType) {
            const activityRows = await prisma.$queryRawUnsafe(`SELECT activity_id FROM fld_activity WHERE activity_name = $1 LIMIT 1`, String(data.extensionActivityType));
            if (activityRows && activityRows.length > 0) activityId = Number(String(activityRows[0].activity_id));
        }

        if (isNaN(staffId)) staffId = null;
        if (isNaN(activityId)) activityId = null;

        // Use kvkId from authenticated user; fallback to form data; default to KVK Gaya (2)
        const kvkId = toInt((user && user.kvkId) ? user.kvkId : (data.kvkId || 2));
        const fldId = data.fldId ? toInt(data.fldId) : null;

        const isOther = entityType === 'ACHIEVEMENT_OTHER_EXTENSION' || data.isOther;

        if (isOther) {
            const inserted = await prisma.$queryRawUnsafe(`
                INSERT INTO kvk_other_extension_activity 
                ("kvkId", "fldId", "staffId", "activityTypeId", number_of_activities, start_date, end_date)
                VALUES ($1, $2, $3, $4, $5, $6::timestamp, $7::timestamp)
                RETURNING kvk_other_extension_activity_id;
            `, kvkId, fldId, staffId, activityId, toInt(data.activityCount || data.numberOfActivities || 1) || 1, new Date(data.startDate || new Date()).toISOString(), new Date(data.endDate || new Date()).toISOString());
            return { otherExtensionActivityId: Number(String(inserted[0].kvk_other_extension_activity_id)) };
        } else {
            const inserted = await prisma.$queryRawUnsafe(`
                INSERT INTO kvk_extension_activity 
                ("kvkId", "fldId", "staffId", "activityId", number_of_activities, start_date, end_date, farmers_general_m, farmers_general_f, farmers_obc_m, farmers_obc_f, farmers_sc_m, farmers_sc_f, farmers_st_m, farmers_st_f, officials_general_m, officials_general_f, officials_obc_m, officials_obc_f, officials_sc_m, officials_sc_f, officials_st_m, officials_st_f)
                VALUES ($1, $2, $3, $4, $5, $6::timestamp, $7::timestamp, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                RETURNING kvk_extension_activity_id;
            `, kvkId, fldId, staffId, activityId, toInt(data.numberOfActivities || 1) || 1, new Date(data.startDate || new Date()).toISOString(), new Date(data.endDate || new Date()).toISOString(),
                toInt(data.farmersGeneralM || data.gen_m || 0) || 0, toInt(data.farmersGeneralF || data.gen_f || 0) || 0,
                toInt(data.farmersObcM || data.obc_m || 0) || 0, toInt(data.farmersObcF || data.obc_f || 0) || 0,
                toInt(data.farmersScM || data.sc_m || 0) || 0, toInt(data.farmersScF || data.sc_f || 0) || 0,
                toInt(data.farmersStM || data.st_m || 0) || 0, toInt(data.farmersStF || data.st_f || 0) || 0,
                toInt(data.officialsGeneralM || data.ext_gen_m || 0) || 0, toInt(data.officialsGeneralF || data.ext_gen_f || 0) || 0,
                toInt(data.officialsObcM || data.ext_obc_m || 0) || 0, toInt(data.officialsObcF || data.ext_obc_f || 0) || 0,
                toInt(data.officialsScM || data.ext_sc_m || 0) || 0, toInt(data.officialsScF || data.ext_sc_f || 0) || 0,
                toInt(data.officialsStM || data.ext_st_m || 0) || 0, toInt(data.officialsStF || data.ext_st_f || 0) || 0);
            return { extensionActivityId: Number(String(inserted[0].kvk_extension_activity_id)) };
        }
    },

    findAll: async (filters = {}, user) => {
        const isOther = filters.isOther === 'true' || filters.isOther === true;

        // Build KVK filter
        let kvkWhere = '';
        const kvkParams = [];
        if (user && user.kvkId) {
            kvkWhere = `WHERE e."kvkId" = $1`;
            kvkParams.push(parseInt(String(user.kvkId)));
        }

        if (isOther) {
            const rows = await prisma.$queryRawUnsafe(`
                SELECT o.*, k.kvk_name, s.staff_name, t.activity_name
                FROM kvk_other_extension_activity o
                LEFT JOIN kvk k ON o."kvkId" = k.kvk_id
                LEFT JOIN kvk_staff s ON o."staffId" = s.kvk_staff_id
                LEFT JOIN other_extension_activity_type t ON o."activityTypeId" = t.activity_type_id
                ${kvkWhere ? kvkWhere.replace('e.', 'o.') : ''}
                ORDER BY o.kvk_other_extension_activity_id DESC;
            `, ...kvkParams);
            return rows.map(r => extensionActivityRepository._mapOtherResponse(r));
        } else {
            const rows = await prisma.$queryRawUnsafe(`
                SELECT e.*, k.kvk_name, s.staff_name, a.activity_name
                FROM kvk_extension_activity e
                LEFT JOIN kvk k ON e."kvkId" = k.kvk_id
                LEFT JOIN kvk_staff s ON e."staffId" = s.kvk_staff_id
                LEFT JOIN fld_activity a ON e."activityId" = a.activity_id
                ${kvkWhere}
                ORDER BY e.kvk_extension_activity_id DESC;
            `, ...kvkParams);
            return rows.map(r => extensionActivityRepository._mapRegularResponse(r));
        }
    },

    findById: async (id) => {
        // We try finding in Regular first, then Other if not found (or based on some logic)
        // Given the ambiguity, we'll try Regular first as it's more common
        let rows = await prisma.$queryRawUnsafe(`
            SELECT e.*, k.kvk_name, s.staff_name, a.activity_name
            FROM kvk_extension_activity e
            LEFT JOIN kvk k ON e."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON e."staffId" = s.kvk_staff_id
            LEFT JOIN fld_activity a ON e."activityId" = a.activity_id
            WHERE e.kvk_extension_activity_id = $1;
        `, parseInt(id));

        if (rows && rows.length > 0) return extensionActivityRepository._mapRegularResponse(rows[0]);

        rows = await prisma.$queryRawUnsafe(`
            SELECT o.*, k.kvk_name, s.staff_name, t.activity_name
            FROM kvk_other_extension_activity o
            LEFT JOIN kvk k ON o."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON o."staffId" = s.kvk_staff_id
            LEFT JOIN other_extension_activity_type t ON o."activityTypeId" = t.activity_type_id
            WHERE o.kvk_other_extension_activity_id = $1;
        `, parseInt(id));

        if (rows && rows.length > 0) return extensionActivityRepository._mapOtherResponse(rows[0]);

        return null;
    },

    _mapRegularResponse: (r) => {
        const startDate = r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '';
        const endDate = r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '';

        // Derive Reporting Year from Start Date
        let reportingYearStr = '2023-24';
        if (startDate) {
            const date = new Date(startDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const startYear = month >= 4 ? year : year - 1;
            reportingYearStr = `${startYear}-${(startYear + 1).toString().slice(2)}`;
        }

        return {
            ...r,
            extensionActivityId: r.kvk_extension_activity_id,
            kvk: { kvkName: r.kvk_name },
            kvkName: r.kvk_name,
            staff: { staffName: r.staff_name },
            staffName: r.staff_name,
            extensionActivityType: r.activity_name, // Map for select text
            activityId: r.activityId, // Map for select value
            activityCount: r.number_of_activities,
            startDate,
            endDate,
            reportingYear: reportingYearStr,
            gen_m: r.farmers_general_m, gen_f: r.farmers_general_f,
            obc_m: r.farmers_obc_m, obc_f: r.farmers_obc_f,
            sc_m: r.farmers_sc_m, sc_f: r.farmers_sc_f,
            st_m: r.farmers_st_m, st_f: r.farmers_st_f,
            ext_gen_m: r.officials_general_m, ext_gen_f: r.officials_general_f,
            ext_obc_m: r.officials_obc_m, ext_obc_f: r.officials_obc_f,
            ext_sc_m: r.officials_sc_m, ext_sc_f: r.officials_sc_f,
            ext_st_m: r.officials_st_m, ext_st_f: r.officials_st_f,
            // Header-matching keys for Data Table
            'Reporting Year': reportingYearStr,
            'KVK Name': r.kvk_name,
            'Name of Extension activities': r.activity_name,
            'No. of Activities': r.number_of_activities,
            'No. of Participants': (r.farmers_general_m || 0) + (r.farmers_general_f || 0) + (r.farmers_obc_m || 0) + (r.farmers_obc_f || 0) + (r.farmers_sc_m || 0) + (r.farmers_sc_f || 0) + (r.farmers_st_m || 0) + (r.farmers_st_f || 0)
        };
    },

    _mapOtherResponse: (r) => {
        const startDate = r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '';
        const endDate = r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '';

        // Derive Reporting Year from Start Date
        let reportingYearStr = '2023-24';
        if (startDate) {
            const date = new Date(startDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const startYear = month >= 4 ? year : year - 1;
            reportingYearStr = `${startYear}-${(startYear + 1).toString().slice(2)}`;
        }

        return {
            ...r,
            otherExtensionActivityId: r.kvk_other_extension_activity_id,
            extensionActivityId: r.kvk_other_extension_activity_id, // fallback for shared forms
            kvk: { kvkName: r.kvk_name },
            kvkName: r.kvk_name,
            staff: { staffName: r.staff_name },
            staffName: r.staff_name,
            extensionActivityType: r.activity_name,
            activityId: r.activityTypeId,
            activityCount: r.number_of_activities,
            startDate,
            endDate,
            reportingYear: reportingYearStr,
            // Header-matching keys for Data Table
            'Reporting Year': reportingYearStr,
            'KVK Name': r.kvk_name,
            'Nature of Extension Activity': r.activity_name,
            'No. of activities': r.number_of_activities
        };
    },

    update: async (id, data, entityType = null) => {
        const isOther = entityType === 'ACHIEVEMENT_OTHER_EXTENSION' || data.isOther;
        const tableName = isOther ? 'kvk_other_extension_activity' : 'kvk_extension_activity';
        const idCol = isOther ? 'kvk_other_extension_activity_id' : 'kvk_extension_activity_id';

        const updates = [];
        const values = [];
        let index = 1;

        if (data.kvkId !== undefined) { updates.push(`"kvkId" = $${index++}`); values.push(parseInt(data.kvkId)); }

        if (data.staffName) {
            const staffRows = await prisma.$queryRawUnsafe(`SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1 LIMIT 1`, String(data.staffName));
            if (staffRows && staffRows.length > 0) { updates.push(`"staffId" = $${index++}`); values.push(staffRows[0].kvk_staff_id); }
        } else if (data.staffId !== undefined) {
            updates.push(`"staffId" = $${index++}`); values.push(parseInt(data.staffId));
        }

        if (data.extensionActivityType || data.activityId) {
            let actId = parseInt(data.activityId);
            if (isNaN(actId)) {
                if (isOther) {
                    const activityRows = await prisma.$queryRawUnsafe(`SELECT activity_type_id FROM other_extension_activity_type WHERE activity_name = $1 LIMIT 1`, String(data.extensionActivityType));
                    if (activityRows && activityRows.length > 0) actId = activityRows[0].activity_type_id;
                } else {
                    const activityRows = await prisma.$queryRawUnsafe(`SELECT activity_id FROM fld_activity WHERE activity_name = $1 LIMIT 1`, String(data.extensionActivityType));
                    if (activityRows && activityRows.length > 0) actId = activityRows[0].activity_id;
                }
            }
            if (!isNaN(actId)) {
                const col = isOther ? '"activityTypeId"' : '"activityId"';
                updates.push(`${col} = $${index++}`); values.push(actId);
            }
        }

        if (data.activityCount !== undefined || data.numberOfActivities !== undefined) {
            const val = parseInt(data.activityCount || data.numberOfActivities) || 0;
            updates.push(`number_of_activities = $${index++}`); values.push(val);
        }
        if (data.startDate !== undefined) { updates.push(`start_date = $${index++}::timestamp`); values.push(new Date(data.startDate || new Date()).toISOString()); }
        if (data.endDate !== undefined) { updates.push(`end_date = $${index++}::timestamp`); values.push(new Date(data.endDate || new Date()).toISOString()); }

        if (!isOther) {
            const participantFields = [
                'gen_m', 'gen_f', 'obc_m', 'obc_f', 'sc_m', 'sc_f', 'st_m', 'st_f',
                'ext_gen_m', 'ext_gen_f', 'ext_obc_m', 'ext_obc_f', 'ext_sc_m', 'ext_sc_f', 'ext_st_m', 'ext_st_f',
                'farmersGeneralM', 'farmersGeneralF', 'farmersObcM', 'farmersObcF', 'farmersScM', 'farmersScF', 'farmersStM', 'farmersStF',
                'officialsGeneralM', 'officialsGeneralF', 'officialsObcM', 'officialsObcF', 'officialsScM', 'officialsScF', 'officialsStM', 'officialsStF'
            ];
            const dbParticipantMap = {
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
                officialsStM: 'officials_st_m', officialsStF: 'officials_st_f'
            };

            for (const feKey of participantFields) {
                const dbCol = dbParticipantMap[feKey];
                if (data[feKey] !== undefined) {
                    if (!updates.some(u => u.startsWith(`${dbCol} =`))) {
                        updates.push(`${dbCol} = $${index++}`);
                        values.push(parseInt(data[feKey]) || 0);
                    }
                }
            }
        }

        if (updates.length > 0) {
            const sql = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE ${idCol} = $${index}`;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_extension_activity WHERE kvk_extension_activity_id = $1`, parseInt(id));
        return { success: true };
    },
};

module.exports = extensionActivityRepository;
