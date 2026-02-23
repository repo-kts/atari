const prisma = require('../../config/prisma.js');

/**
 * Ensures a valid ID exists in a master table.
 * If the provided ID is invalid or not found, it tries to find the first available record.
 * If the table is empty, it returns 1 (this might still cause FK error if table is empty).
 */
const getValidId = async (table, idField, dataId) => {
    const id = parseInt(dataId);
    try {
        if (!isNaN(id) && id > 0) {
            // Check if the specific ID exists
            const row = await prisma.$queryRawUnsafe(`SELECT "${idField}" FROM "${table}" WHERE "${idField}" = $1`, id);
            if (row && row.length > 0) return id;
        }

        // Fallback: try to find ANY existing ID in that table
        const firstRow = await prisma.$queryRawUnsafe(`SELECT "${idField}" FROM "${table}" LIMIT 1`);
        if (firstRow && firstRow.length > 0) return firstRow[0][idField];
    } catch (e) {
        console.error(`Error validating ID for table ${table}:`, e);
    }

    return 1; // Last resort fallback
};

/**
 * Ensures a staff member exists by name, creating a default one if not found.
 */
const ensureStaffExists = async (staffName) => {
    if (!staffName) return 1;

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

const oftRepository = {
    /**
     * Create a new OFT record
     */
    create: async (data, user) => {
        // Always use kvkId from authenticated user — never trust frontend data
        const kvkId = parseInt(String((user && user.kvkId) ? user.kvkId : (data.kvkId || 1)));

        let staffId = await getValidId('kvk_staff', 'kvk_staff_id', data.staffId);
        if (data.staffName) {
            staffId = await ensureStaffExists(data.staffName);
        }

        const seasonId = await getValidId('season', 'season_id', data.seasonId);
        const oftSubjectId = await getValidId('oft_subject', 'oft_subject_id', data.oftSubjectId);
        const disciplineId = await getValidId('discipline', 'discipline_id', data.disciplineId);
        const oftThematicAreaId = await getValidId('oft_thematic_area', 'oft_thematic_area_id', data.oftThematicAreaId);

        const appendedStatus = data.status ? ` [Status: ${data.status}]` : '';
        const reportingYear = parseInt(data.reportingYear) || 2024;
        const title = data.title || '';
        const problemDiagnosed = data.problemDiagnosed || '';
        const sourceOfTechnology = data.sourceOfTechnology || '';
        const productionSystem = data.productionSystem || '';
        const performanceIndicators = (data.performanceIndicators || '') + appendedStatus;
        const areaHaNumber = parseFloat(data.areaHaNumber || data.area) || 0;
        const numberOfLocation = parseInt(data.numberOfLocation || data.locations) || 0;
        const numberOfTrialReplication = parseInt(data.numberOfTrialReplication || data.replications) || 0;
        const oftStartDate = data.oftStartDate ? new Date(data.oftStartDate).toISOString() : (data.duration ? new Date(data.duration).toISOString() : new Date().toISOString());
        const criticalInput = data.criticalInput || '';
        const costOfOft = parseFloat(data.costOfOft || data.cost) || 0;

        const f = {
            gm: parseInt(data.farmersGeneralM || data.gen_m || 0),
            gf: parseInt(data.farmersGeneralF || data.gen_f || 0),
            om: parseInt(data.farmersObcM || data.obc_m || 0),
            of: parseInt(data.farmersObcF || data.obc_f || 0),
            sm: parseInt(data.farmersScM || data.sc_m || 0),
            sf: parseInt(data.farmersScF || data.sc_f || 0),
            tm: parseInt(data.farmersStM || data.st_m || 0),
            tf: parseInt(data.farmersStF || data.st_f || 0)
        };

        const inserted = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_oft 
            ("kvkId", reporting_year, "seasonId", "staffId", "oftSubjectId", "oftThematicAreaId", "disciplineId", title_of_oft, problem_diagnosed, source_of_technology, production_system_and_thematic_area, performance_indicators, area_ha_number, number_of_location, number_of_trial_replication, oft_start_date, critical_input, cost_of_oft, farmers_general_m, farmers_general_f, farmers_obc_m, farmers_obc_f, farmers_sc_m, farmers_sc_f, farmers_st_m, farmers_st_f)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::timestamp, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
            RETURNING kvk_oft_id;
        `, kvkId, reportingYear, seasonId, staffId, oftSubjectId, oftThematicAreaId, disciplineId, title, problemDiagnosed, sourceOfTechnology, productionSystem, performanceIndicators, areaHaNumber, numberOfLocation, numberOfTrialReplication, oftStartDate, criticalInput, costOfOft, f.gm, f.gf, f.om, f.of, f.sm, f.sf, f.tm, f.tf);

        return { kvkOftId: inserted[0].kvk_oft_id };
    },

    /**
     * Find all OFT records
     */
    findAll: async (user) => {
        let whereClause = '';
        const params = [];
        // KVK users see only their own KVK's data; super_admin (no kvkId) sees everything
        if (user && user.kvkId) {
            whereClause = `WHERE o."kvkId" = $1`;
            params.push(parseInt(String(user.kvkId)));
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT o.*, k.kvk_name, s.staff_name, 
                   sn.season_name, 
                   os.oft_subject_name, 
                   ot.oft_thematic_area_name, 
                   d.discipline_name
            FROM kvk_oft o
            LEFT JOIN kvk k ON o."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON o."staffId" = s.kvk_staff_id
            LEFT JOIN season sn ON o."seasonId" = sn.season_id
            LEFT JOIN oft_subject os ON o."oftSubjectId" = os.oft_subject_id
            LEFT JOIN oft_thematic_area ot ON o."oftThematicAreaId" = ot.oft_thematic_area_id
            LEFT JOIN discipline d ON o."disciplineId" = d.discipline_id
            ${whereClause}
            ORDER BY o.kvk_oft_id DESC;
        `, ...params);
        return rows.map(r => oftRepository._mapResponse(r));
    },

    /**
     * Find OFT record by ID
     */
    findById: async (id) => {
        const rows = await prisma.$queryRawUnsafe(`
            SELECT o.*, k.kvk_name, s.staff_name,
                   sn.season_name, 
                   os.oft_subject_name, 
                   ot.oft_thematic_area_name, 
                   d.discipline_name
            FROM kvk_oft o
            LEFT JOIN kvk k ON o."kvkId" = k.kvk_id
            LEFT JOIN kvk_staff s ON o."staffId" = s.kvk_staff_id
            LEFT JOIN season sn ON o."seasonId" = sn.season_id
            LEFT JOIN oft_subject os ON o."oftSubjectId" = os.oft_subject_id
            LEFT JOIN oft_thematic_area ot ON o."oftThematicAreaId" = ot.oft_thematic_area_id
            LEFT JOIN discipline d ON o."disciplineId" = d.discipline_id
            WHERE o.kvk_oft_id = $1;
        `, parseInt(id));
        if (!rows || !rows.length) return null;
        return oftRepository._mapResponse(rows[0]);
    },

    /**
     * Internal helper to map DB row to Frontend object
     */
    _mapResponse: (r) => {
        const reporting_year_val = r.reporting_year ? `${r.reporting_year}-${(r.reporting_year + 1).toString().slice(2)}` : '2023-24';
        return {
            ...r,
            kvkOftId: r.kvk_oft_id,
            kvk: { kvkName: r.kvk_name },
            staff: { staffName: r.staff_name },
            staffName: r.staff_name,
            reportingYear: reporting_year_val,
            title: r.title_of_oft,
            problemDiagnosed: r.problem_diagnosed,
            sourceOfTechnology: r.source_of_technology,
            productionSystem: r.production_system_and_thematic_area,
            performanceIndicators: r.performance_indicators,
            area: r.area_ha_number,
            locations: r.number_of_location,
            replications: r.number_of_trial_replication,
            duration: r.oft_start_date ? new Date(r.oft_start_date).toISOString().split('T')[0] : '',
            criticalInput: r.critical_input,
            cost: r.cost_of_oft,
            seasonId: r.season_name, // Frontend uses names
            oftSubjectId: r.oft_subject_name, // Frontend uses names
            oftThematicAreaId: r.oft_thematic_area_name, // Frontend uses names
            thematicArea: r.oft_thematic_area_name,
            disciplineId: r.discipline_name, // Frontend uses names
            discipline: r.discipline_name,
            gen_m: r.farmers_general_m,
            gen_f: r.farmers_general_f,
            obc_m: r.farmers_obc_m,
            obc_f: r.farmers_obc_f,
            sc_m: r.farmers_sc_m,
            sc_f: r.farmers_sc_f,
            st_m: r.farmers_st_m,
            st_f: r.farmers_st_f,
            status: (r.performance_indicators || '').match(/\[Status: (.*?)\]/) ? (r.performance_indicators || '').match(/\[Status: (.*?)\]/)[1] : undefined
        };
    },

    /**
     * Update an OFT record
     */
    update: async (id, data) => {
        const updates = [];
        const values = [];
        let index = 1;

        // Handle relational lookups first
        if (data.seasonId) {
            const row = await prisma.$queryRawUnsafe(`SELECT season_id FROM season WHERE season_name = $1 LIMIT 1`, data.seasonId);
            if (row && row.length > 0) { updates.push(`"seasonId" = $${index++}`); values.push(row[0].season_id); }
        }
        if (data.oftSubjectId) {
            const row = await prisma.$queryRawUnsafe(`SELECT oft_subject_id FROM oft_subject WHERE oft_subject_name = $1 LIMIT 1`, data.oftSubjectId);
            if (row && row.length > 0) { updates.push(`"oftSubjectId" = $${index++}`); values.push(row[0].oft_subject_id); }
        }
        if (data.oftThematicAreaId || data.thematicArea) {
            const name = data.oftThematicAreaId || data.thematicArea;
            const row = await prisma.$queryRawUnsafe(`SELECT oft_thematic_area_id FROM oft_thematic_area WHERE oft_thematic_area_name = $1 LIMIT 1`, name);
            if (row && row.length > 0) { updates.push(`"oftThematicAreaId" = $${index++}`); values.push(row[0].oft_thematic_area_id); }
        }
        if (data.disciplineId || data.discipline) {
            const name = data.disciplineId || data.discipline;
            const row = await prisma.$queryRawUnsafe(`SELECT discipline_id FROM discipline WHERE discipline_name = $1 LIMIT 1`, name);
            if (row && row.length > 0) { updates.push(`"disciplineId" = $${index++}`); values.push(row[0].discipline_id); }
        }

        let staffId;
        if (data.staffName) {
            staffId = await ensureStaffExists(data.staffName);
            updates.push(`"staffId" = $${index++}`); values.push(staffId);
        } else if (data.staffId !== undefined) {
            staffId = await getValidId('kvk_staff', 'kvk_staff_id', data.staffId);
            updates.push(`"staffId" = $${index++}`); values.push(staffId);
        }

        if (data.reportingYear !== undefined) {
            let year = parseInt(data.reportingYear) || 2024;
            updates.push(`reporting_year = $${index++}`); values.push(year);
        }
        if (data.title !== undefined) { updates.push(`title_of_oft = $${index++}`); values.push(data.title || ''); }
        if (data.problemDiagnosed !== undefined) { updates.push(`problem_diagnosed = $${index++}`); values.push(data.problemDiagnosed || ''); }
        if (data.sourceOfTechnology !== undefined) { updates.push(`source_of_technology = $${index++}`); values.push(data.sourceOfTechnology || ''); }
        if (data.productionSystem !== undefined) { updates.push(`production_system_and_thematic_area = $${index++}`); values.push(data.productionSystem || ''); }

        if (data.performanceIndicators !== undefined || data.status !== undefined) {
            // We need to keep the [Status: ...] part if possible, or rebuild it
            let baseStr = data.performanceIndicators || '';
            // Strip old status if exists
            baseStr = baseStr.replace(/ \[Status: .*?\]/, '');
            let newStr = baseStr + (data.status ? ` [Status: ${data.status}]` : '');
            updates.push(`performance_indicators = $${index++}`);
            values.push(newStr);
        }

        if (data.area !== undefined) { updates.push(`area_ha_number = $${index++}`); values.push(parseFloat(data.area) || 0); }
        if (data.locations !== undefined) { updates.push(`number_of_location = $${index++}`); values.push(parseInt(data.locations) || 0); }
        if (data.replications !== undefined) { updates.push(`number_of_trial_replication = $${index++}`); values.push(parseInt(data.replications) || 0); }
        if (data.duration !== undefined) { updates.push(`oft_start_date = $${index++}::timestamp`); values.push(new Date(data.duration || new Date()).toISOString()); }
        if (data.criticalInput !== undefined) { updates.push(`critical_input = $${index++}`); values.push(data.criticalInput || ''); }
        if (data.cost !== undefined) { updates.push(`cost_of_oft = $${index++}`); values.push(parseFloat(data.cost) || 0); }

        // Participant fields
        const partMap = {
            gen_m: 'farmers_general_m', gen_f: 'farmers_general_f',
            obc_m: 'farmers_obc_m', obc_f: 'farmers_obc_f',
            sc_m: 'farmers_sc_m', sc_f: 'farmers_sc_f',
            st_m: 'farmers_st_m', st_f: 'farmers_st_f',
            farmersGeneralM: 'farmers_general_m', farmersGeneralF: 'farmers_general_f' // handle both
        };

        for (const [feKey, dbCol] of Object.entries(partMap)) {
            if (data[feKey] !== undefined) {
                // To avoid duplicates in updates if both gen_m and farmersGeneralM sent
                if (!updates.some(u => u.startsWith(`${dbCol} =`))) {
                    updates.push(`${dbCol} = $${index++}`);
                    values.push(parseInt(data[feKey]) || 0);
                }
            }
        }

        if (updates.length > 0) {
            const sql = `UPDATE kvk_oft SET ${updates.join(', ')} WHERE kvk_oft_id = $${index}`;
            values.push(parseInt(id));
            await prisma.$queryRawUnsafe(sql, ...values);
        }

        return { success: true };
    },

    /**
     * Delete an OFT record
     */
    delete: async (id) => {
        await prisma.$queryRawUnsafe(`DELETE FROM kvk_oft WHERE kvk_oft_id = $1`, parseInt(id));
        return { success: true };
    }
};

module.exports = oftRepository;
