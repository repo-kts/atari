const prisma = require('../../config/prisma.js');

const hrdRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);

        await prisma.$queryRawUnsafe(`
            INSERT INTO hrd_program 
            ("kvkId", "kvkStaffId", course_name, start_date, end_date, organizer_venue, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, parseInt(data.kvkStaffId || data.staffId), data.courseName, new Date(data.startDate), new Date(data.endDate), data.organizerVenue);

        return { success: true };
    },

    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereClause = 'WHERE h."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT h.*, k.kvk_name, s.staff_name as staff_name
            FROM hrd_program h
            LEFT JOIN kvk k ON h."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON h."kvkStaffId" = s.kvk_staff_id
            ${whereClause}
            ORDER BY h.hrd_program_id DESC
        `, ...params);

        return rows.map(r => ({
            ...r,
            id: r.hrd_program_id,
            kvkName: r.kvk_name,
            staffName: r.staff_name,
            courseName: r.course_name,
            startDate: r.start_date,
            endDate: r.end_date,
            organizerVenue: r.organizer_venue,
            kvkStaffId: r.kvkStaffId
        }));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT * FROM hrd_program WHERE hrd_program_id = $1
        `, parseInt(id));
        if (!rows[0]) return null;
        const r = rows[0];
        return {
            ...r,
            id: r.hrd_program_id,
            courseName: r.course_name,
            startDate: r.start_date,
            endDate: r.end_date,
            organizerVenue: r.organizer_venue,
            kvkStaffId: r.kvkStaffId
        };
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;

        if (data.kvkStaffId !== undefined || data.staffId !== undefined) {
            updates.push(`"kvkStaffId" = $${index++}`);
            values.push(parseInt(data.kvkStaffId || data.staffId));
        }
        if (data.courseName !== undefined) {
            updates.push(`course_name = $${index++}`);
            values.push(data.courseName);
        }
        if (data.startDate !== undefined) {
            updates.push(`start_date = $${index++}`);
            values.push(new Date(data.startDate));
        }
        if (data.endDate !== undefined) {
            updates.push(`end_date = $${index++}`);
            values.push(new Date(data.endDate));
        }
        if (data.organizerVenue !== undefined) {
            updates.push(`organizer_venue = $${index++}`);
            values.push(data.organizerVenue);
        }

        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            const sql = `UPDATE hrd_program SET ${updates.join(', ')} WHERE hrd_program_id = $${index}`;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM hrd_program WHERE hrd_program_id = $1`, parseInt(id));
        return { success: true };
    }
};

module.exports = hrdRepository;
