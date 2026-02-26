const prisma = require('../../config/prisma.js');
const otherExtensionActivityRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : parseInt(data.kvkId || 1);
        const fldId = data.fldId ? parseInt(data.fldId) : null;
        let staffId = parseInt(data.staffId);
        if (isNaN(staffId) && data.staffName) {
            const staffRows = await prisma.$queryRawUnsafe(
                `SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1 LIMIT 1`,
                String(data.staffName)
            );
            if (staffRows && staffRows.length > 0) staffId = staffRows[0].kvk_staff_id;
        }
        let activityTypeId = parseInt(data.activityTypeId);
        if (isNaN(activityTypeId) && data.extensionActivityType) {
            const activityName = String(data.extensionActivityType);
            const activityRows = await prisma.$queryRawUnsafe(
                `SELECT activity_type_id FROM other_extension_activity_type WHERE activity_name ILIKE $1 LIMIT 1`,
                activityName
            );
            if (activityRows && activityRows.length > 0) {
                activityTypeId = activityRows[0].activity_type_id;
            } else {
                const insertedType = await prisma.$queryRawUnsafe(
                    `INSERT INTO other_extension_activity_type (activity_name) VALUES ($1) RETURNING activity_type_id`,
                    activityName
                );
                activityTypeId = insertedType[0].activity_type_id;
            }
        }
        if (isNaN(staffId)) staffId = null;
        if (isNaN(activityTypeId)) activityTypeId = null;
        const safeInt = (v) => (v === null || v === undefined || isNaN(parseInt(String(v)))) ? 0 : parseInt(String(v), 10);
        const numberOfActivities = safeInt(data.activityCount || data.numberOfActivities);
        const startDate = data.startDate ? new Date(data.startDate).toISOString() : null;
        const endDate = data.endDate ? new Date(data.endDate).toISOString() : null;

        const farmersGeneralM = safeInt(data.gen_m || data.farmersGeneralM);
        const farmersGeneralF = safeInt(data.gen_f || data.farmersGeneralF);
        const farmersObcM = safeInt(data.obc_m || data.farmersObcM);
        const farmersObcF = safeInt(data.obc_f || data.farmersObcF);
        const farmersScM = safeInt(data.sc_m || data.farmersScM);
        const farmersScF = safeInt(data.sc_f || data.farmersScF);
        const farmersStM = safeInt(data.st_m || data.farmersStM);
        const farmersStF = safeInt(data.st_f || data.farmersStF);

        const officialsGeneralM = safeInt(data.ext_gen_m || data.officialsGeneralM);
        const officialsGeneralF = safeInt(data.ext_gen_f || data.officialsGeneralF);
        const officialsObcM = safeInt(data.ext_obc_m || data.officialsObcM);
        const officialsObcF = safeInt(data.ext_obc_f || data.officialsObcF);
        const officialsScM = safeInt(data.ext_sc_m || data.officialsScM);
        const officialsScF = safeInt(data.ext_sc_f || data.officialsScF);
        const officialsStM = safeInt(data.ext_st_m || data.officialsStM);
        const officialsStF = safeInt(data.ext_st_f || data.officialsStF);

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_other_extension_activity 
            ("kvkId", "fldId", "staffId", "activityTypeId", number_of_activities, start_date, end_date,
             farmers_general_m, farmers_general_f, farmers_obc_m, farmers_obc_f,
             farmers_sc_m, farmers_sc_f, farmers_st_m, farmers_st_f,
             officials_general_m, officials_general_f, officials_obc_m, officials_obc_f,
             officials_sc_m, officials_sc_f, officials_st_m, officials_st_f)
            VALUES ($1, $2, $3, $4, $5, $6::timestamp, $7::timestamp,
                    $8, $9, $10, $11, $12, $13, $14, $15,
                    $16, $17, $18, $19, $20, $21, $22, $23)
            RETURNING kvk_other_extension_activity_id;
        `, kvkId, fldId, staffId, activityTypeId, numberOfActivities, startDate, endDate,
            farmersGeneralM, farmersGeneralF, farmersObcM, farmersObcF,
            farmersScM, farmersScF, farmersStM, farmersStF,
            officialsGeneralM, officialsGeneralF, officialsObcM, officialsObcF,
            officialsScM, officialsScF, officialsStM, officialsStF);
        return { otherExtensionActivityId: inserted[0].kvk_other_extension_activity_id };
    },
    findAll: async (filters = {}, user) => {
        let whereClause = '';
        const queryParams = [];
        // Strict isolation for KVK roles
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereClause = `WHERE o."kvkId" = $1`;
            queryParams.push(parseInt(user.kvkId));
        } else if (filters.kvkId) {
            whereClause = `WHERE o."kvkId" = $1`;
            queryParams.push(parseInt(filters.kvkId));
        }
        const sql = `
            SELECT o.*, k.kvk_name, s.staff_name, t.activity_name
            FROM kvk_other_extension_activity o
            LEFT JOIN kvk k ON o."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON o."staffId" = s.kvk_staff_id
            LEFT JOIN other_extension_activity_type t ON o."activityTypeId" = t.activity_type_id
            ${whereClause}
            ORDER BY o.kvk_other_extension_activity_id DESC;
        `;
        const rows = await prisma.$queryRawUnsafe(sql, ...queryParams);
        return rows.map(r => otherExtensionActivityRepository._mapResponse(r));
    },
    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT o.*, k.kvk_name, s.staff_name, t.activity_name
            FROM kvk_other_extension_activity o
            LEFT JOIN kvk k ON o."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON o."staffId" = s.kvk_staff_id
            LEFT JOIN other_extension_activity_type t ON o."activityTypeId" = t.activity_type_id
            WHERE o.kvk_other_extension_activity_id = $1;
        `, parseInt(id));
        if (!rows || !rows.length) return null;
        return otherExtensionActivityRepository._mapResponse(rows[0]);
    },
    _mapResponse: (r) => {
        const startDate = r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '';
        const endDate = r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '';
        let reportingYearStr = null;
        if (startDate) {
            const date = new Date(startDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const startYear = month >= 4 ? year : year - 1;
            reportingYearStr = `${startYear}-${(startYear + 1).toString().slice(2)}`;
        } else {
            // Compute from current date when startDate is missing
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const startYear = month >= 4 ? year : year - 1;
            reportingYearStr = `${startYear}-${(startYear + 1).toString().slice(2)}`;
        }
        const safeInt = (v) => (v === null || v === undefined) ? null : Number(String(v));
        const activityCount = safeInt(r.number_of_activities);
        const recordId = safeInt(r.kvk_other_extension_activity_id);
        return {
            id: recordId,
            otherExtensionActivityId: recordId,
            extensionActivityId: recordId,
            kvkId: safeInt(r['kvkId'] ?? r.kvkId),
            kvkName: r.kvk_name,
            kvk: { kvkName: r.kvk_name },
            staffId: safeInt(r['staffId'] ?? r.staffId),
            staffName: r.staff_name,
            staff: { staffName: r.staff_name },
            activityTypeId: safeInt(r['activityTypeId'] ?? r.activityTypeId),
            activityId: safeInt(r['activityTypeId'] ?? r.activityTypeId),
            extensionActivityType: r.activity_name,
            activity: { activityName: r.activity_name },
            activityCount,
            numberOfActivities: activityCount,
            startDate,
            endDate,
            reportingYear: reportingYearStr,

            // Participant fields
            gen_m: safeInt(r.farmers_general_m), gen_f: safeInt(r.farmers_general_f),
            obc_m: safeInt(r.farmers_obc_m), obc_f: safeInt(r.farmers_obc_f),
            sc_m: safeInt(r.farmers_sc_m), sc_f: safeInt(r.farmers_sc_f),
            st_m: safeInt(r.farmers_st_m), st_f: safeInt(r.farmers_st_f),
            ext_gen_m: safeInt(r.officials_general_m), ext_gen_f: safeInt(r.officials_general_f),
            ext_obc_m: safeInt(r.officials_obc_m), ext_obc_f: safeInt(r.officials_obc_f),
            ext_sc_m: safeInt(r.officials_sc_m), ext_sc_f: safeInt(r.officials_sc_f),
            ext_st_m: safeInt(r.officials_st_m), ext_st_f: safeInt(r.officials_st_f),

            'Reporting Year': reportingYearStr,
            'KVK Name': r.kvk_name,
            'Nature of Extension Activity': r.activity_name,
            'No. of activities': activityCount,
        };
    },
    update: async (id, data, user) => {
        const updates = [];
        const values = [];
        let index = 1;
        const toInt = (v) => (v === null || v === undefined || isNaN(parseInt(String(v)))) ? 0 : parseInt(String(v), 10);

        if (data.fldId !== undefined) {
            updates.push('"fldId" = $' + (index++));
            values.push(data.fldId ? parseInt(data.fldId) : null);
        }

        if (data.staffName !== undefined) {
            const staffRows = await prisma.$queryRawUnsafe(`SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1 LIMIT 1`, String(data.staffName));
            if (staffRows && staffRows.length > 0) {
                updates.push('"staffId" = $' + (index++));
                values.push(Number(String(staffRows[0].kvk_staff_id)));
            }
        } else if (data.staffId !== undefined) {
            updates.push('"staffId" = $' + (index++));
            values.push(data.staffId ? parseInt(data.staffId) : null);
        }

        if (data.extensionActivityType !== undefined) {
            const typeName = String(data.extensionActivityType);
            const typeRows = await prisma.$queryRawUnsafe(`SELECT activity_type_id FROM other_extension_activity_type WHERE activity_name ILIKE $1 LIMIT 1`, typeName);
            let typeId;
            if (typeRows && typeRows.length > 0) {
                typeId = Number(String(typeRows[0].activity_type_id));
            } else {
                const inserted = await prisma.$queryRawUnsafe(`INSERT INTO other_extension_activity_type (activity_name) VALUES ($1) RETURNING activity_type_id`, typeName);
                typeId = Number(String(inserted[0].activity_type_id));
            }
            updates.push('"activityTypeId" = $' + (index++));
            values.push(typeId);
        } else if (data.activityTypeId !== undefined) {
            updates.push('"activityTypeId" = $' + (index++));
            values.push(data.activityTypeId ? parseInt(data.activityTypeId) : null);
        }

        if (data.activityCount !== undefined || data.numberOfActivities !== undefined) {
            updates.push('number_of_activities = $' + (index++));
            const rawVal = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
            values.push(toInt(rawVal));
        }

        if (data.startDate !== undefined) {
            updates.push('start_date = $' + (index++) + '::timestamp');
            values.push(new Date(data.startDate).toISOString());
        }
        if (data.endDate !== undefined) {
            updates.push('end_date = $' + (index++) + '::timestamp');
            values.push(new Date(data.endDate).toISOString());
        }

        // Participant fields mapping
        const participantMapping = {
            gen_m: 'farmers_general_m', gen_f: 'farmers_general_f',
            obc_m: 'farmers_obc_m', obc_f: 'farmers_obc_f',
            sc_m: 'farmers_sc_m', sc_f: 'farmers_sc_f',
            st_m: 'farmers_st_m', st_f: 'farmers_st_f',
            ext_gen_m: 'officials_general_m', ext_gen_f: 'officials_general_f',
            ext_obc_m: 'officials_obc_m', ext_obc_f: 'officials_obc_f',
            ext_sc_m: 'officials_sc_m', ext_sc_f: 'officials_sc_f',
            ext_st_m: 'officials_st_m', ext_st_f: 'officials_st_f'
        };

        for (const [front, back] of Object.entries(participantMapping)) {
            const val = data[front] !== undefined ? data[front] : data[back];
            if (val !== undefined) {
                updates.push(`${back} = $${index++}`);
                values.push(toInt(val));
            }
        }

        if (updates.length > 0) {
            const sql = 'UPDATE kvk_other_extension_activity SET ' + updates.join(', ') + ' WHERE kvk_other_extension_activity_id = $' + index;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },
    delete: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_other_extension_activity WHERE kvk_other_extension_activity_id = $1`, parseInt(id));
        return { success: true };
    },
};
module.exports = otherExtensionActivityRepository;
