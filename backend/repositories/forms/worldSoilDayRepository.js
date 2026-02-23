const prisma = require('../../config/prisma.js');

const toNum = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'bigint') return Number(v);
    return parseInt(String(v), 10) || 0;
};
const toStr = (v) => (v === null || v === undefined) ? '' : String(v);

const worldSoilDayRepository = {

    create: async (data, user) => {
        const kvkId = toNum((user && user.kvkId) ? user.kvkId : (data.kvkId || 0));

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_world_soil_celebration
            ("kvkId", activities_conducted, soil_health_card_distributed, 
             vip_names, participants,
             general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING world_soil_celebration_id;
        `,
            kvkId,
            toNum(data.activityConducted || data.activitiesConducted || 0),
            toNum(data.soilHealthCards || data.soilHealthCardDistributed || 0),
            toStr(data.vipNames || ''),
            toNum(data.participants || 0),
            toNum(data.generalM || 0),
            toNum(data.generalF || 0),
            toNum(data.obcM || 0),
            toNum(data.obcF || 0),
            toNum(data.scM || 0),
            toNum(data.scF || 0),
            toNum(data.stM || 0),
            toNum(data.stF || 0)
        );

        return { id: toNum(inserted[0].world_soil_celebration_id) };
    },

    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        if (user && user.kvkId) {
            whereClause = `WHERE a."kvkId" = $1`;
            params.push(toNum(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                a.world_soil_celebration_id,
                a."kvkId",
                a.activities_conducted,
                a.soil_health_card_distributed,
                a.vip_names,
                a.participants,
                a.general_m, a.general_f,
                a.obc_m, a.obc_f,
                a.sc_m, a.sc_f,
                a.st_m, a.st_f,
                k.kvk_name
            FROM kvk_world_soil_celebration a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            ${whereClause}
            ORDER BY a.world_soil_celebration_id DESC;
        `, ...params);

        return rows.map(r => worldSoilDayRepository._mapResponse(r));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                a.world_soil_celebration_id,
                a."kvkId",
                a.activities_conducted,
                a.soil_health_card_distributed,
                a.vip_names,
                a.participants,
                a.general_m, a.general_f,
                a.obc_m, a.obc_f,
                a.sc_m, a.sc_f,
                a.st_m, a.st_f,
                k.kvk_name
            FROM kvk_world_soil_celebration a
            LEFT JOIN kvk k ON a."kvkId" = k.kvk_id
            WHERE a.world_soil_celebration_id = $1;
        `, toNum(id));

        if (!rows || !rows.length) return null;
        return worldSoilDayRepository._mapResponse(rows[0]);
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];
        let idx = 1;

        if (data.activityConducted !== undefined || data.activitiesConducted !== undefined) {
            updates.push(`activities_conducted = $${idx++}`);
            values.push(toNum(data.activityConducted || data.activitiesConducted));
        }
        if (data.soilHealthCards !== undefined || data.soilHealthCardDistributed !== undefined) {
            updates.push(`soil_health_card_distributed = $${idx++}`);
            values.push(toNum(data.soilHealthCards || data.soilHealthCardDistributed));
        }
        if (data.vipNames !== undefined) {
            updates.push(`vip_names = $${idx++}`);
            values.push(toStr(data.vipNames));
        }
        if (data.participants !== undefined) {
            updates.push(`participants = $${idx++}`);
            values.push(toNum(data.participants));
        }
        if (data.generalM !== undefined) { updates.push(`general_m = $${idx++}`); values.push(toNum(data.generalM)); }
        if (data.generalF !== undefined) { updates.push(`general_f = $${idx++}`); values.push(toNum(data.generalF)); }
        if (data.obcM !== undefined) { updates.push(`obc_m = $${idx++}`); values.push(toNum(data.obcM)); }
        if (data.obcF !== undefined) { updates.push(`obc_f = $${idx++}`); values.push(toNum(data.obcF)); }
        if (data.scM !== undefined) { updates.push(`sc_m = $${idx++}`); values.push(toNum(data.scM)); }
        if (data.scF !== undefined) { updates.push(`sc_f = $${idx++}`); values.push(toNum(data.scF)); }
        if (data.stM !== undefined) { updates.push(`st_m = $${idx++}`); values.push(toNum(data.stM)); }
        if (data.stF !== undefined) { updates.push(`st_f = $${idx++}`); values.push(toNum(data.stF)); }

        if (updates.length > 0) {
            values.push(toNum(id));
            await prisma.$queryRawUnsafe(
                `UPDATE kvk_world_soil_celebration SET ${updates.join(', ')} WHERE world_soil_celebration_id = $${idx}`,
                ...values
            );
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(
            `DELETE FROM kvk_world_soil_celebration WHERE world_soil_celebration_id = $1`,
            toNum(id)
        );
        return { success: true };
    },

    _mapResponse: (r) => ({
        id: toNum(r.world_soil_celebration_id),
        worldSoilCelebrationId: toNum(r.world_soil_celebration_id),
        kvkId: toNum(r.kvkId),
        kvkName: toStr(r.kvk_name),
        activityConducted: toNum(r.activities_conducted),
        activitiesConducted: toNum(r.activities_conducted),
        soilHealthCards: toNum(r.soil_health_card_distributed),
        soilHealthCardDistributed: toNum(r.soil_health_card_distributed),
        vipNames: toStr(r.vip_names),
        participants: toNum(r.participants),
        generalM: toNum(r.general_m),
        generalF: toNum(r.general_f),
        obcM: toNum(r.obc_m),
        obcF: toNum(r.obc_f),
        scM: toNum(r.sc_m),
        scF: toNum(r.sc_f),
        stM: toNum(r.st_m),
        stF: toNum(r.st_f),
        // Computed field for the table
        noOfVip: r.vip_names ? r.vip_names.split(',').filter(name => name.trim().length > 0).length : 0
    }),
};

module.exports = worldSoilDayRepository;
