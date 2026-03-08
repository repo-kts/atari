const prisma = require('../../config/prisma.js');
const scientistAwardRepository = {
    create: async (data, user) => {
        // Enforce KVK ID from user context or data
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : null);
        const amount = parseInt(data.amount || 0);
        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO scientist_award
            ("kvkId", scientist_name, award_name, amount, achievement, conferring_authority, reporting_year, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING scientist_award_id;
        `, kvkId, data.scientistName || '', data.awardName || '', amount, data.achievement || '', data.conferringAuthority || '', parseInt(data.reportingYear || data.year) || null);
        return { scientistAwardID: inserted[0].scientist_award_id };
    },
    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        // Strict isolation for KVK roles
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            whereClause = 'WHERE a."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        } else if (user && user.kvkId) {
            whereClause = 'WHERE a."kvkId" = $1';
            params.push(parseInt(user.kvkId));
        }
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, k.kvk_name 
            FROM scientist_award a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            ${whereClause}
            ORDER BY a.scientist_award_id DESC;
        `, ...params);
        return rows.map(r => ({
            ...r,
            id: r.scientist_award_id,
            scientistAwardID: r.scientist_award_id,
            kvk: { kvkName: r.kvk_name },
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority,
            scientistName: r.scientist_name,
            reportingYear: r.reporting_year ? String(r.reporting_year) : r.reporting_year,
            year: r.reporting_year ? String(r.reporting_year) : r.reporting_year,
            kvkId: r.kvkId || r.kvk_id || r['kvkId']
        }));
    },
    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, k.kvk_name 
            FROM scientist_award a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            WHERE a.scientist_award_id = $1;
        `, parseInt(id));
        if (!rows || !rows.length) return null;
        let r = rows[0];
        return {
            ...r,
            id: r.scientist_award_id,
            scientistAwardID: r.scientist_award_id,
            kvk: { kvkName: r.kvk_name },
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority,
            scientistName: r.scientist_name,
            reportingYear: r.reporting_year ? String(r.reporting_year) : r.reporting_year,
            year: r.reporting_year ? String(r.reporting_year) : r.reporting_year,
            kvkId: r.kvkId || r.kvk_id || r['kvkId']
        };
    },
    update: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;
        if (data.kvkId !== undefined) {
            updates.push('"kvkId" = $' + (index++));
            values.push(data.kvkId ? parseInt(data.kvkId) : null);
        }
        if (data.awardName !== undefined) { updates.push('award_name = $' + (index++)); values.push(data.awardName || ''); }
        if (data.amount !== undefined) { updates.push('amount = $' + (index++)); values.push(parseInt(data.amount) || 0); }
        if (data.achievement !== undefined) { updates.push('achievement = $' + (index++)); values.push(data.achievement || ''); }
        if (data.conferringAuthority !== undefined) { updates.push('conferring_authority = $' + (index++)); values.push(data.conferringAuthority || ''); }
        if (data.scientistName !== undefined) { updates.push('scientist_name = $' + (index++)); values.push(data.scientistName || ''); }
        if (data.reportingYear !== undefined || data.year !== undefined) {
            updates.push('reporting_year = $' + (index++));
            values.push(parseInt(data.reportingYear || data.year) || null);
        }
        if (updates.length > 0) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            const sql = 'UPDATE scientist_award SET ' + updates.join(', ') + ' WHERE scientist_award_id = $' + index;
            values.push(parseInt(id));
            console.log('--- Scientist Award Update ---');
            console.log('SQL:', sql);
            console.log('Values:', values);
            await prisma.$queryRawUnsafe(sql, ...values);
            console.log('Update executed successfully');
        }
        return await scientistAwardRepository.findById(id);
    },
    delete: async (id) => {
        await prisma.$queryRawUnsafe('DELETE FROM scientist_award WHERE scientist_award_id = $1', parseInt(id));
        return { success: true };
    },
};
module.exports = scientistAwardRepository;
