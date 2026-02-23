const prisma = require('../../config/prisma.js');
const scientistAwardRepository = {
    create: async (data, user) => {
        const kvkId = parseInt(String((user && user.kvkId) ? user.kvkId : (data.kvkId || 1)));
        const amount = parseInt(data.amount || 0);
        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO scientist_award 
            ("kvkId", award_name, amount, achievement, conferring_authority, reporting_year, head_scientist)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING scientist_award_id;
        `, kvkId, data.awardName || '', amount, data.achievement || '', data.conferringAuthority || '', parseInt(data.reportingYear || data.year) || null, data.headScientist || data.scientistName || '');
        return { scientistAwardID: inserted[0].scientist_award_id };
    },
    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = 'WHERE a."kvkId" = $1';
            params.push(parseInt(String(user.kvkId)));
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
            scientistAwardID: r.scientist_award_id,
            kvk: { kvkName: r.kvk_name },
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority,
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            headScientist: r.head_scientist
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
            scientistAwardID: r.scientist_award_id,
            kvk: { kvkName: r.kvk_name },
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority,
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            headScientist: r.head_scientist
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
        if (data.headScientist !== undefined || data.scientistName !== undefined) {
            updates.push('head_scientist = $' + (index++));
            values.push(data.headScientist || data.scientistName || '');
        }
        if (data.reportingYear !== undefined || data.year !== undefined) {
            updates.push('reporting_year = $' + (index++));
            values.push(parseInt(data.reportingYear || data.year) || null);
        }
        if (updates.length > 0) {
            const sql = 'UPDATE scientist_award SET ' + updates.join(', ') + ' WHERE scientist_award_id = $' + index;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },
    delete: async (id) => {
        await prisma.$queryRawUnsafe('DELETE FROM scientist_award WHERE scientist_award_id = $1', parseInt(id));
        return { success: true };
    },
};
module.exports = scientistAwardRepository;
