const prisma = require('../../config/prisma.js');

const hrdRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);
        const staffIdOrName = data.kvkStaffId || data.staffId;
        const staffId = await hrdRepository._resolveStaffId(staffIdOrName, kvkId);

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO hrd_program 
            ("kvkId", "kvkStaffId", course_name, start_date, end_date, organizer_venue, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING hrd_program_id;
        `, kvkId, staffId, data.courseName, new Date(data.startDate), new Date(data.endDate), data.organizerVenue);

        return await hrdRepository.findById(inserted[0].hrd_program_id);
    },

    _resolveStaffId: async (value, kvkId) => {
        if (!value) return null;
        if (!isNaN(parseInt(value))) return parseInt(value);

        // Value is a name, try to find in DB
        const existing = await prisma.kvkStaff.findFirst({
            where: { staffName: String(value), kvkId: parseInt(kvkId) }
        });

        if (existing) return existing.kvkStaffId;

        // Auto-create minimal staff if not found
        // Use default post and discipline if available
        const p = await prisma.sanctionedPost.findFirst();
        const d = await prisma.discipline.findFirst();

        const created = await prisma.kvkStaff.create({
            data: {
                kvkId: parseInt(kvkId),
                staffName: String(value),
                mobile: '0000000000',
                dateOfBirth: new Date('1980-01-01'),
                dateOfJoining: new Date('2010-01-01'),
                sanctionedPostId: p ? p.sanctionedPostId : 1,
                disciplineId: d ? d.disciplineId : 1,
                positionOrder: 0,
                transferStatus: 'ACTIVE'
            }
        });
        return created.kvkStaffId;
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
            const existing = await hrdRepository.findById(id);
            const kvkId = existing?.kvkId || 1;
            const staffId = await hrdRepository._resolveStaffId(data.kvkStaffId || data.staffId, kvkId);
            updates.push(`"kvkStaffId" = $${index++}`);
            values.push(staffId);
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
        return await hrdRepository.findById(id);
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM hrd_program WHERE hrd_program_id = $1`, parseInt(id));
        return { success: true };
    }
};

module.exports = hrdRepository;
