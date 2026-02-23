const prisma = require('../../config/prisma.js');
const otherExtensionActivityRepository = {
    create: async (data, user) => {
        const kvkId = parseInt((user && user.kvkId) ? user.kvkId : (data.kvkId || 1));
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
                `SELECT activity_type_id FROM other_extension_activity_type WHERE activity_name = $1 LIMIT 1`,
                activityName
            );
            if (activityRows && activityRows.length > 0) activityTypeId = activityRows[0].activity_type_id;
        }
        if (isNaN(staffId)) staffId = null;
        if (isNaN(activityTypeId)) activityTypeId = null;
        const numberOfActivities = parseInt(data.activityCount || data.numberOfActivities || 0);
        const startDate = new Date(data.startDate || new Date()).toISOString();
        const endDate = new Date(data.endDate || new Date()).toISOString();
        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_other_extension_activity 
            ("kvkId", "fldId", "staffId", "activityTypeId", number_of_activities, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5, $6::timestamp, $7::timestamp)
            RETURNING kvk_other_extension_activity_id;
        `, kvkId, fldId, staffId, activityTypeId, numberOfActivities, startDate, endDate);
        return { otherExtensionActivityId: inserted[0].kvk_other_extension_activity_id };
    },
    findAll: async (filters = {}, user) => {
        let whereClause = '';
        const queryParams = [];
        if (user && user.kvkId) {
            whereClause = `WHERE o."kvkId" = $1`;
            queryParams.push(parseInt(user.kvkId));
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
        let reportingYearStr = '2023-24';
        if (startDate) {
            const date = new Date(startDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const startYear = month >= 4 ? year : year - 1;
            reportingYearStr = `${startYear}-${(startYear + 1).toString().slice(2)}`;
        }
        const safeInt = (v) => (v === null || v === undefined) ? null : Number(String(v));
        const activityCount = safeInt(r.number_of_activities);
        const recordId = safeInt(r.kvk_other_extension_activity_id);
        return {
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
        const toInt = (v) => (v === null || v === undefined) ? NaN : parseInt(String(v), 10);
        if (data.fldId !== undefined) {
            updates.push('"fldId" = $' + (index++));
            values.push(data.fldId ? toInt(data.fldId) : null);
        }
        if (data.staffId !== undefined) {
            const parsedStaffId = toInt(data.staffId);
            if (!isNaN(parsedStaffId)) {
                updates.push('"staffId" = $' + (index++));
                values.push(parsedStaffId);
            } else if (data.staffName) {
                const staffRows = await prisma.$queryRawUnsafe(`SELECT kvk_staff_id FROM kvk_staff WHERE staff_name = $1 LIMIT 1`, String(data.staffName));
                if (staffRows && staffRows.length > 0) {
                    updates.push('"staffId" = $' + (index++));
                    values.push(Number(String(staffRows[0].kvk_staff_id)));
                }
            }
        }
        if (data.activityTypeId !== undefined) {
            const parsedTypeId = toInt(data.activityTypeId);
            if (!isNaN(parsedTypeId)) {
                updates.push('"activityTypeId" = $' + (index++));
                values.push(parsedTypeId);
            } else if (data.extensionActivityType) {
                const activityRows = await prisma.$queryRawUnsafe(`SELECT activity_type_id FROM other_extension_activity_type WHERE activity_name = $1 LIMIT 1`, String(data.extensionActivityType));
                if (activityRows && activityRows.length > 0) {
                    updates.push('"activityTypeId" = $' + (index++));
                    values.push(Number(String(activityRows[0].activity_type_id)));
                }
            }
        }
        if (data.activityCount !== undefined || data.numberOfActivities !== undefined) {
            updates.push('number_of_activities = $' + (index++));
            const rawVal = data.activityCount !== undefined ? data.activityCount : data.numberOfActivities;
            values.push(toInt(rawVal) || 0);
        }
        if (data.startDate !== undefined) {
            updates.push('start_date = $' + (index++) + '::timestamp');
            values.push(new Date(data.startDate).toISOString());
        }
        if (data.endDate !== undefined) {
            updates.push('end_date = $' + (index++) + '::timestamp');
            values.push(new Date(data.endDate).toISOString());
        }
        if (updates.length > 0) {
            const sql = 'UPDATE kvk_other_extension_activity SET ' + updates.join(', ') + ' WHERE kvk_other_extension_activity_id = $' + index;
            values.push(toInt(id));
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
