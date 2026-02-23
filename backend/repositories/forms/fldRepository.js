const prisma = require('../../config/prisma.js');

const toInt = (v) => (v === null || v === undefined) ? 0 : parseInt(String(v), 10) || 0;
const toFloat = (v) => (v === null || v === undefined) ? 0 : parseFloat(String(v)) || 0;
const safeNum = (v) => (v === null || v === undefined) ? 0 : Number(String(v));

const fldRepository = {
    create: async (data, user) => {
        const kvkId = toInt((user && user.kvkId) ? user.kvkId : (data.kvkId || 2));
        const kvkStaffId = toInt(data.kvkStaffId || data.staffId || 1);
        const seasonId = toInt(data.seasonId);
        const sectorId = toInt(data.sectorId);
        const thematicAreaId = toInt(data.thematicAreaId || 1);
        const categoryId = toInt(data.categoryId);
        const subCategoryId = toInt(data.subCategoryId);
        const cropId = toInt(data.cropId);
        const fldName = String(data.technologyName || data.fldName || '');
        const noOfDemo = toInt(data.demoCount || data.noOfDemonstration || 0);
        const areaHa = toFloat(data.area || data.areaHa || 0);
        const startDate = new Date(data.startDate || new Date()).toISOString();
        const gen_m = toInt(data.gen_m || data.generalM || 0);
        const gen_f = toInt(data.gen_f || data.generalF || 0);
        const obc_m = toInt(data.obc_m || 0);
        const obc_f = toInt(data.obc_f || 0);
        const sc_m = toInt(data.sc_m || 0);
        const sc_f = toInt(data.sc_f || 0);
        const st_m = toInt(data.st_m || 0);
        const st_f = toInt(data.st_f || 0);

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_fld_introduction
            ("kvkId","kvkStaffId","seasonId","sectorId","thematicAreaId","categoryId","subCategoryId","cropId",
             fld_name, no_of_demonstration, area_ha, start_date,
             general_m, general_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::timestamp,$13,$14,$15,$16,$17,$18,$19,$20)
            RETURNING kvk_fld_id;
        `, kvkId, kvkStaffId, seasonId, sectorId, thematicAreaId, categoryId, subCategoryId, cropId,
            fldName, noOfDemo, areaHa, startDate,
            gen_m, gen_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f);

        return { id: safeNum(inserted[0].kvk_fld_id) };
    },

    findAll: async (user) => {
        let where = '';
        const params = [];
        if (user && user.kvkId) {
            where = `WHERE f."kvkId" = $1`;
            params.push(toInt(user.kvkId));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                f.*,
                k.kvk_name,
                s.staff_name,
                se.season_name,
                sec.sector_name,
                fc.category_name,
                fsc.sub_category_name,
                fcr.crop_name
            FROM kvk_fld_introduction f
            LEFT JOIN kvk k             ON f."kvkId"         = k.kvk_id
            LEFT JOIN kvk_staff s       ON f."kvkStaffId"    = s.kvk_staff_id
            LEFT JOIN season se         ON f."seasonId"      = se.season_id
            LEFT JOIN sector sec        ON f."sectorId"      = sec.sector_id
            LEFT JOIN category fc       ON f."categoryId"    = fc.category_id
            LEFT JOIN sub_category fsc  ON f."subCategoryId" = fsc.sub_category_id
            LEFT JOIN crop fcr          ON f."cropId"        = fcr.crop_id
            ${where}
            ORDER BY f.kvk_fld_id DESC;
        `, ...params);

        return rows.map(r => fldRepository._mapResponse(r));
    },

    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT
                f.*,
                k.kvk_name,
                s.staff_name,
                se.season_name,
                sec.sector_name,
                fc.category_name,
                fsc.sub_category_name,
                fcr.crop_name
            FROM kvk_fld_introduction f
            LEFT JOIN kvk k             ON f."kvkId"         = k.kvk_id
            LEFT JOIN kvk_staff s       ON f."kvkStaffId"    = s.kvk_staff_id
            LEFT JOIN season se         ON f."seasonId"      = se.season_id
            LEFT JOIN sector sec        ON f."sectorId"      = sec.sector_id
            LEFT JOIN category fc       ON f."categoryId"    = fc.category_id
            LEFT JOIN sub_category fsc  ON f."subCategoryId" = fsc.sub_category_id
            LEFT JOIN crop fcr          ON f."cropId"        = fcr.crop_id
            WHERE f.kvk_fld_id = $1;
        `, toInt(id));
        if (!rows || !rows.length) return null;
        return fldRepository._mapResponse(rows[0]);
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];
        let idx = 1;

        const addIf = (col, val) => {
            if (val !== undefined) { updates.push(`"${col}" = $${idx++}`); values.push(val); }
        };

        addIf('seasonId', data.seasonId ? toInt(data.seasonId) : undefined);
        addIf('sectorId', data.sectorId ? toInt(data.sectorId) : undefined);
        addIf('thematicAreaId', data.thematicAreaId ? toInt(data.thematicAreaId) : undefined);
        addIf('categoryId', data.categoryId ? toInt(data.categoryId) : undefined);
        addIf('subCategoryId', data.subCategoryId ? toInt(data.subCategoryId) : undefined);
        addIf('cropId', data.cropId ? toInt(data.cropId) : undefined);

        if (data.technologyName !== undefined || data.fldName !== undefined) {
            updates.push(`fld_name = $${idx++}`);
            values.push(String(data.technologyName ?? data.fldName));
        }
        if (data.demoCount !== undefined || data.noOfDemonstration !== undefined) {
            updates.push(`no_of_demonstration = $${idx++}`);
            values.push(toInt(data.demoCount ?? data.noOfDemonstration));
        }
        if (data.area !== undefined || data.areaHa !== undefined) {
            updates.push(`area_ha = $${idx++}`);
            values.push(toFloat(data.area ?? data.areaHa));
        }
        if (data.startDate !== undefined) {
            updates.push(`start_date = $${idx++}::timestamp`);
            values.push(new Date(data.startDate).toISOString());
        }

        const pMap = {
            gen_m: 'general_m', gen_f: 'general_f',
            obc_m: 'obc_m', obc_f: 'obc_f',
            sc_m: 'sc_m', sc_f: 'sc_f',
            st_m: 'st_m', st_f: 'st_f',
            generalM: 'general_m', generalF: 'general_f',
        };
        for (const [fk, col] of Object.entries(pMap)) {
            if (data[fk] !== undefined && !updates.some(u => u.includes(`"${col}"`))) {
                updates.push(`${col} = $${idx++}`);
                values.push(toInt(data[fk]));
            }
        }

        if (updates.length > 0) {
            const sql = `UPDATE kvk_fld_introduction SET ${updates.join(', ')} WHERE kvk_fld_id = $${idx}`;
            values.push(toInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }
        return { success: true };
    },

    delete: async (id) => {
        await prisma.$queryRawUnsafe(
            `DELETE FROM kvk_fld_introduction WHERE kvk_fld_id = $1`, toInt(id)
        );
        return { success: true };
    },

    _mapResponse: (r) => {
        const startDate = r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '';
        let reportingYear = '2023-24';
        if (startDate) {
            const yr = new Date(startDate).getFullYear();
            const mo = new Date(startDate).getMonth() + 1;
            const sy = mo >= 4 ? yr : yr - 1;
            reportingYear = `${sy}-${(sy + 1).toString().slice(2)}`;
        }

        const gen_m = safeNum(r.general_m);
        const gen_f = safeNum(r.general_f);
        const obc_m = safeNum(r.obc_m);
        const obc_f = safeNum(r.obc_f);
        const sc_m = safeNum(r.sc_m);
        const sc_f = safeNum(r.sc_f);
        const st_m = safeNum(r.st_m);
        const st_f = safeNum(r.st_f);

        return {
            id: safeNum(r.kvk_fld_id),
            kvkFldId: safeNum(r.kvk_fld_id),
            kvkId: safeNum(r['kvkId'] ?? r.kvkId),
            kvkName: r.kvk_name || '',
            kvkStaffId: safeNum(r['kvkStaffId'] ?? r.kvkStaffId),
            staffName: r.staff_name || '',
            seasonId: safeNum(r['seasonId'] ?? r.seasonId),
            seasonName: r.season_name || '',
            sectorId: safeNum(r['sectorId'] ?? r.sectorId),
            sectorName: r.sector_name || '',
            thematicAreaId: safeNum(r['thematicAreaId'] ?? r.thematicAreaId),
            categoryId: safeNum(r['categoryId'] ?? r.categoryId),
            categoryName: r.category_name || '',
            subCategoryId: safeNum(r['subCategoryId'] ?? r.subCategoryId),
            subCategoryName: r.sub_category_name || '',
            cropId: safeNum(r['cropId'] ?? r.cropId),
            cropName: r.crop_name || '',
            technologyName: r.fld_name || '',
            fldName: r.fld_name || '',
            demoCount: safeNum(r.no_of_demonstration),
            noOfDemonstration: safeNum(r.no_of_demonstration),
            area: safeNum(r.area_ha),
            areaHa: safeNum(r.area_ha),
            startDate,
            gen_m, gen_f, obc_m, obc_f, sc_m, sc_f, st_m, st_f,
            generalM: gen_m, generalF: gen_f,
            totalParticipants: gen_m + gen_f + obc_m + obc_f + sc_m + sc_f + st_m + st_f,
            reportingYear,
            // Header-matching keys — must match routeConfig.ts fields exactly
            'Reporting Year': reportingYear,
            'Start Date': startDate,
            'End Date': '',
            'KVK Name': r.kvk_name || '',
            'Category': r.category_name || '',
            'Sub Category': r.sub_category_name || '',
            'Name of Technnology Demonstrated': r.fld_name || '',
            'Ongoing/Completed': '',
        };
    },
};

module.exports = fldRepository;
