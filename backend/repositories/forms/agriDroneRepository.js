const prisma = require('../../config/prisma.js');

const agriDroneRepository = {
    create: async (data, user) => {
        const isKvkScoped = user && ['kvk_admin', 'kvk_user'].includes(user.roleName);
        const kvkIdSource = isKvkScoped ? user.kvkId : data.kvkId;
        const kvkId = kvkIdSource !== undefined && kvkIdSource !== null ? parseInt(kvkIdSource, 10) : NaN;

        if (isNaN(kvkId)) {
            throw new Error('Valid kvkId is required');
        }

        const result = await prisma.$queryRawUnsafe(`
            INSERT INTO kvk_agri_drone (
                "kvkId", reporting_year, project_implementing_centre, 
                drones_sanctioned, drones_purchased, amount_sanctioned, 
                cost_per_drone, drone_company, drone_model, 
                pilot_name, pilot_contact, target_area_ha, 
                demo_amount_sanctioned, demo_amount_utilised, 
                operation_type, advantages_observed,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING agri_drone_id
        `,
            kvkId,
            parseInt(data.yearId ?? data.reportingYear),
            data.picName ?? data.projectImplementingCentre,
            parseInt(data.dronesSanctioned || 0),
            parseInt(data.dronesPurchased || 0),
            parseFloat(data.amountSanctioned || 0),
            parseFloat(data.droneCost ?? data.costPerDrone ?? 0),
            data.droneCompany,
            data.droneModel,
            data.pilotName,
            data.pilotContact,
            parseFloat(data.targetArea ?? data.targetAreaHa ?? 0),
            parseFloat(data.demoAmountSanctioned || 0),
            parseFloat(data.demoAmountUtilised || 0),
            data.operations ?? data.operationType,
            data.advantages ?? data.advantagesObserved);

        return await agriDroneRepository.findById(result[0].agri_drone_id, user);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        const records = await prisma.kvkAgriDrone.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { agriDroneId: 'desc' }
        });

        return records.map(r => agriDroneRepository._mapResponse(r));
    },

    findById: async (id, user) => {
        const where = { agriDroneId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const record = await prisma.kvkAgriDrone.findFirst({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            }
        });
        return agriDroneRepository._mapResponse(record);
    },

    update: async (id, data, user) => {
        const where = { agriDroneId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const existing = await prisma.kvkAgriDrone.findFirst({
            where,
            select: { agriDroneId: true }
        });

        if (!existing) throw new Error("Record not found or unauthorized");

        const updateData = {};
        const yearId = data.yearId ?? data.reportingYear;
        if (yearId !== undefined) updateData.reporting_year = parseInt(yearId);
        const picName = data.picName ?? data.projectImplementingCentre;
        if (picName !== undefined) updateData.project_implementing_centre = picName;
        if (data.dronesSanctioned !== undefined) updateData.drones_sanctioned = parseInt(data.dronesSanctioned);
        if (data.dronesPurchased !== undefined) updateData.drones_purchased = parseInt(data.dronesPurchased);
        if (data.amountSanctioned !== undefined) updateData.amount_sanctioned = parseFloat(data.amountSanctioned);
        const droneCost = data.droneCost ?? data.costPerDrone;
        if (droneCost !== undefined) updateData.cost_per_drone = parseFloat(droneCost);
        if (data.droneCompany !== undefined) updateData.drone_company = data.droneCompany;
        if (data.droneModel !== undefined) updateData.drone_model = data.droneModel;
        if (data.pilotName !== undefined) updateData.pilot_name = data.pilotName;
        if (data.pilotContact !== undefined) updateData.pilot_contact = data.pilotContact;
        const targetArea = data.targetArea ?? data.targetAreaHa;
        if (targetArea !== undefined) updateData.target_area_ha = parseFloat(targetArea);
        if (data.demoAmountSanctioned !== undefined) updateData.demo_amount_sanctioned = parseFloat(data.demoAmountSanctioned);
        if (data.demoAmountUtilised !== undefined) updateData.demo_amount_utilised = parseFloat(data.demoAmountUtilised);
        const operationType = data.operations ?? data.operationType;
        if (operationType !== undefined) updateData.operation_type = operationType;
        const advantages = data.advantages ?? data.advantagesObserved;
        if (advantages !== undefined) updateData.advantages_observed = advantages;

        const updates = [];
        const values = [];
        let index = 1;

        for (const [key, val] of Object.entries(updateData)) {
            updates.push(`${key} = $${index++}`);
            values.push(val);
        }

        if (updates.length > 0) {
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            let sql = `UPDATE kvk_agri_drone SET ${updates.join(', ')} WHERE agri_drone_id = $${index++}`;
            const params = [...values, parseInt(id)];

            if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
                sql += ` AND "kvkId" = $${index++}`;
                params.push(parseInt(user.kvkId));
            }

            const result = await prisma.$executeRawUnsafe(sql, ...params);
            if (result === 0) throw new Error("Record not found or unauthorized");
        }

        return await agriDroneRepository.findById(id, user);
    },

    delete: async (id, user) => {
        const where = { agriDroneId: parseInt(id) };
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        }

        const result = await prisma.kvkAgriDrone.deleteMany({
            where
        });

        if (result.count === 0) throw new Error("Record not found or unauthorized");

        return { success: true };
    },

    _mapResponse: (r) => {
        if (!r) return null;
        return {
            ...r,
            id: r.agriDroneId,
            'KVK Name': r.kvk?.kvkName,
            'Year': r.reportingYear,
            'Project Implementing centre name': r.projectImplementingCentre,
            'Company of Drone': r.droneCompany,
            'Model of Drone': r.droneModel,
            'No. of Agri Drones Sanctioned': r.dronesSanctioned,
            'No. of Agri Drones Purchased': r.dronesPurchased,
            'Cost Sanctioned': r.amountSanctioned
        };
    }
};

module.exports = agriDroneRepository;
