const prisma = require('../../config/prisma.js');

const farmerAwardRepository = {
    create: async (data, user) => {
        // Always use kvkId from authenticated user — never trust frontend data
        const kvkId = parseInt(String((user && user.kvkId) ? user.kvkId : (data.kvkId || 1)));
        const amount = parseInt(data.amount || 0);

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO farmer_award 
            ("kvkId", farmer_name, contact_number, address, award_name, amount, achievement, conferring_authority, reporting_year, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING farmer_award_id;
        `, kvkId, data.farmerName || '', data.contactNumber || data.contactNo || '', data.address || '', data.awardName || '', amount, data.achievement || '', data.conferringAuthority || '', parseInt(String(data.reportingYear || data.year).split('-')[0]) || null, data.image || '');

        return { farmerAwardID: inserted[0].farmer_award_id };
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
            FROM farmer_award a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            ${whereClause}
            ORDER BY a.farmer_award_id DESC;
        `, ...params);

        return rows.map(r => ({
            ...r,
            farmerAwardID: r.farmer_award_id,
            kvk: { kvkName: r.kvk_name },
            farmerName: r.farmer_name,
            contactNumber: r.contact_number,
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority,
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            image: r.image
        }));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT a.*, k.kvk_name 
            FROM farmer_award a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            WHERE a.farmer_award_id = $1;
        `, parseInt(id));
        if (!rows || !rows.length) return null;
        let r = rows[0];
        return {
            ...r,
            farmerAwardID: r.farmer_award_id,
            kvk: { kvkName: r.kvk_name },
            farmerName: r.farmer_name,
            contactNumber: r.contact_number,
            awardName: r.award_name,
            conferringAuthority: r.conferring_authority,
            reportingYear: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            year: r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : r.reporting_year,
            image: r.image
        };
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;

        if (data.kvkId !== undefined) { updates.push('"kvkId" = $' + (index++)); values.push(parseInt(data.kvkId) || 1); }
        if (data.farmerName !== undefined) { updates.push('farmer_name = $' + (index++)); values.push(data.farmerName || ''); }
        if (data.contactNumber !== undefined || data.contactNo !== undefined) {
            updates.push('contact_number = $' + (index++));
            values.push(data.contactNumber || data.contactNo || '');
        }
        if (data.address !== undefined) { updates.push('address = $' + (index++)); values.push(data.address || ''); }
        if (data.awardName !== undefined) { updates.push('award_name = $' + (index++)); values.push(data.awardName || ''); }
        if (data.amount !== undefined) { updates.push('amount = $' + (index++)); values.push(parseInt(data.amount) || 0); }
        if (data.achievement !== undefined) { updates.push('achievement = $' + (index++)); values.push(data.achievement || ''); }
        if (data.conferringAuthority !== undefined) { updates.push('conferring_authority = $' + (index++)); values.push(data.conferringAuthority || ''); }
        if (data.image !== undefined) { updates.push('image = $' + (index++)); values.push(data.image || ''); }
        if (data.reportingYear !== undefined || data.year !== undefined) {
            updates.push('reporting_year = $' + (index++));
            const ry = data.reportingYear || data.year;
            values.push(parseInt(String(ry).split('-')[0]) || null);
        }

        if (updates.length > 0) {
            const sql = 'UPDATE farmer_award SET ' + updates.join(', ') + ' WHERE farmer_award_id = $' + index;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe('DELETE FROM farmer_award WHERE farmer_award_id = $1', parseInt(id));
        return { success: true };
    },
};

module.exports = farmerAwardRepository;
