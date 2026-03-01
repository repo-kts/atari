const prisma = require('../../config/prisma.js');
const kvkAwardRepository = {
    create: async (data, user) => {
        // Enforce KVK ID from user context if possible
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : parseInt(data.kvkId || 1);
        const amount = parseInt(data.amount || 0);
        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_award 
            ("kvkId", award_name, amount, achievement, conferring_authority, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING kvk_award_id;
        `, kvkId, data.awardName || '', amount, data.achievement || '', data.conferringAuthority || '');
        return { kvkAwardID: inserted[0].kvk_award_id };
    },
    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        // Strict isolation for KVK roles
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereClause = 'WHERE a."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        } else if (user && user.kvkId) {
            // Fallback for other roles that might have a kvkId set
            whereClause = 'WHERE a."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, k.kvk_name 
            FROM kvk_award a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            ${whereClause}
            ORDER BY a.kvk_award_id DESC;
        `, ...params);
        return rows.map(r => ({
            ...r,
            id: r.kvk_award_id,
            kvkAwardID: r.kvk_award_id,
            kvk: { kvkName: r.kvk_name },
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority
        }));
    },
    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, k.kvk_name 
            FROM kvk_award a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            WHERE a.kvk_award_id = $1;
        `, parseInt(id));
        if (!rows || !rows.length) return null;
        let r = rows[0];
        return {
            ...r,
            id: r.kvk_award_id,
            kvkAwardID: r.kvk_award_id,
            kvk: { kvkName: r.kvk_name },
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority
        };
    },
    update: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;
        if (data.kvkId !== undefined) { updates.push('"kvkId" = $' + (index++)); values.push(parseInt(data.kvkId) || 1); }
        if (data.awardName !== undefined) { updates.push('award_name = $' + (index++)); values.push(data.awardName || ''); }
        if (data.amount !== undefined) { updates.push('amount = $' + (index++)); values.push(parseInt(data.amount) || 0); }
        if (data.achievement !== undefined) { updates.push('achievement = $' + (index++)); values.push(data.achievement || ''); }
        if (data.conferringAuthority !== undefined) { updates.push('conferring_authority = $' + (index++)); values.push(data.conferringAuthority || ''); }
        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            const sql = 'UPDATE kvk_award SET ' + updates.join(', ') + ' WHERE kvk_award_id = $' + index;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },
    delete: async (id) => {
        await prisma.$queryRawUnsafe('DELETE FROM kvk_award WHERE kvk_award_id = $1', parseInt(id));
        return { success: true };
    },
};
module.exports = kvkAwardRepository;
