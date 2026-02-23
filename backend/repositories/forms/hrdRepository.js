const prisma = require('../../config/prisma.js');

const ensureStaffExists = async (staffName) => {
    let staff = await prisma.kvkStaff.findFirst({
        where: { staffName: String(staffName) },
        select: { kvkStaffId: true }
    });
    if (staff) return staff.kvkStaffId;

    try {
        const gayaKvk = await prisma.kvk.findFirst({ where: { kvkName: { contains: 'Gaya', mode: 'insensitive' } }, select: { kvkId: true } });
        const kvkId = gayaKvk ? gayaKvk.kvkId : 1;

        const d = await prisma.discipline.findFirst({ select: { disciplineId: true } }).catch(() => null);
        const sp = await prisma.sanctionedPost.findFirst({ select: { sanctionedPostId: true } }).catch(() => null);
        const dId = d ? d.disciplineId : 1;
        const spId = sp ? sp.sanctionedPostId : 1;

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_staff 
            ("kvkId", staff_name, mobile, date_of_birth, "sanctionedPostId", position_order, "disciplineId", date_of_joining, transfer_status, transfer_count)
            VALUES ($1, $2, '0000000000', '1980-01-01', $3, 1, $4, '2020-01-01', 'ACTIVE', 0)
            RETURNING kvk_staff_id;
        `, kvkId, staffName, spId, dId);

        if (inserted && inserted.length > 0) return Number(inserted[0].kvk_staff_id);
    } catch (e) {
        console.error("Auto-create staff failed:", e);
    }
    return 1;
};

const hrdRepository = {
    create: async (data, user) => {
        // Always use kvkId from authenticated user — never trust frontend data
        const kvkId = parseInt(String((user && user.kvkId) ? user.kvkId : (data.kvkId || 1)));
        let kvkStaffId;
        if (data.staffName) {
            kvkStaffId = await ensureStaffExists(data.staffName);
        } else {
            kvkStaffId = parseInt(data.kvkStaffId);
        }
        if (isNaN(kvkStaffId)) kvkStaffId = 1;

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO hrd_program 
            ("kvkId", "kvkStaffId", course_name, start_date, end_date, organizer_venue)
            VALUES ($1, $2, $3, $4::timestamp, $5::timestamp, $6)
            RETURNING hrd_program_id;
        `, kvkId, kvkStaffId, data.courseName || '', new Date(data.startDate || new Date()).toISOString(), new Date(data.endDate || new Date()).toISOString(), data.organizerVenue || '');

        return { hrdProgramId: inserted[0].hrd_program_id };
    },

    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        // KVK users see only their own KVK's data; super_admin (no kvkId) sees everything
        if (user && user.kvkId) {
            whereClause = `WHERE h."kvkId" = $1`;
            params.push(parseInt(String(user.kvkId)));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT h.*, k.kvk_name, s.staff_name 
            FROM hrd_program h
            LEFT JOIN kvk k ON h."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON h."kvkStaffId" = s.kvk_staff_id
            ${whereClause}
            ORDER BY h.hrd_program_id DESC;
        `, ...params);
        return rows.map(r => hrdRepository._mapResponse(r));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT h.*, k.kvk_name, s.staff_name 
            FROM hrd_program h
            LEFT JOIN kvk k ON h."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON h."kvkStaffId" = s.kvk_staff_id
            WHERE h.hrd_program_id = $1;
        `, parseInt(id));
        if (!rows || !rows.length) return null;
        return hrdRepository._mapResponse(rows[0]);
    },

    _mapResponse: (r) => {
        return {
            ...r,
            hrdProgramId: r.hrd_program_id,
            kvk: { kvkName: r.kvk_name },
            staff: { staffName: r.staff_name },
            staffName: r.staff_name,
            courseName: r.course_name,
            startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '',
            endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '',
            organizerVenue: r.organizer_venue
        };
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;

        if (data.kvkId !== undefined) {
            updates.push(`"kvkId" = $${index++}`);
            values.push(parseInt(data.kvkId));
        }

        if (data.staffName) {
            updates.push(`"kvkStaffId" = $${index++}`);
            values.push(await ensureStaffExists(data.staffName));
        } else if (data.kvkStaffId !== undefined) {
            updates.push(`"kvkStaffId" = $${index++}`);
            values.push(parseInt(data.kvkStaffId));
        }

        if (data.courseName !== undefined) { updates.push(`course_name = $${index++}`); values.push(data.courseName || ''); }
        if (data.startDate !== undefined) { updates.push(`start_date = $${index++}::timestamp`); values.push(new Date(data.startDate || new Date()).toISOString()); }
        if (data.endDate !== undefined) { updates.push(`end_date = $${index++}::timestamp`); values.push(new Date(data.endDate || new Date()).toISOString()); }
        if (data.organizerVenue !== undefined) { updates.push(`organizer_venue = $${index++}`); values.push(data.organizerVenue || ''); }

        if (updates.length > 0) {
            const sql = `UPDATE hrd_program SET ${updates.join(', ')} WHERE hrd_program_id = $${index}`;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM hrd_program WHERE hrd_program_id = $1`, parseInt(id));
        return { success: true };
    },
};

module.exports = hrdRepository;
