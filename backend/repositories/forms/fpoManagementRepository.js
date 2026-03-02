const prisma = require('../../config/prisma.js');

const fpoManagementRepository = {
    create: async (data, user) => {
        const kvkId = (user && user.kvkId) ? parseInt(user.kvkId) : (data.kvkId ? parseInt(data.kvkId) : 1);
        const reportingYear = parseInt(data.yearId ?? data.reportingYear) || new Date().getFullYear();
        const fpoName = data.fpoName || '';
        const address = data.fpoAddress ?? data.address ?? '';
        const registrationNumber = data.registrationNo ?? data.registrationNumber ?? '';
        const registrationDate = (() => {
            const dateVal = data.registrationDate && typeof data.registrationDate === 'object' && data.registrationDate.value
                ? data.registrationDate.value
                : data.registrationDate;
            if (!dateVal) return new Date();
            const parsedDate = new Date(dateVal);
            if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() > 2100 || parsedDate.getFullYear() < 1900) {
                return new Date();
            }
            return parsedDate;
        })();
        const proposedActivity = data.proposedActivity || '';
        const commodityIdentified = data.commodityIdentified || '';
        const totalBomMembers = parseInt(data.bomMembersCount ?? data.totalBomMembers) || 0;
        const totalFarmersAttached = parseInt(data.farmersAttachedCount ?? data.totalFarmersAttached) || 0;
        const financialPositionLakh = parseFloat(data.financialPosition ?? data.financialPositionLakh) || 0;
        const successIndicator = data.successIndicator || '';

        await prisma.$executeRawUnsafe(`
            INSERT INTO fpo_management (
                "kvkId", reporting_year, fpo_name, address, registration_number, 
                registration_date, proposed_activity, commodity_identified, 
                total_bom_members, total_farmers_attached, financial_position_lakh, 
                success_indicator, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, kvkId, reportingYear, fpoName, address, registrationNumber, registrationDate,
            proposedActivity, commodityIdentified, totalBomMembers, totalFarmersAttached,
            financialPositionLakh, successIndicator);

        const result = await prisma.fpoManagement.findFirst({
            where: {
                kvkId,
                reportingYear,
                fpoName
            },
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { fpoManagementId: 'desc' }
        });

        return _mapResponse(result);
    },

    findAll: async (filters = {}, user) => {
        const where = {};
        if (user && ['kvk_admin', 'kvk_user'].includes(user.roleName)) {
            where.kvkId = parseInt(user.kvkId);
        } else if (filters.kvkId) {
            where.kvkId = parseInt(filters.kvkId);
        }

        if (filters.reportingYear) {
            where.reportingYear = parseInt(filters.reportingYear);
        }

        const results = await prisma.fpoManagement.findMany({
            where,
            include: {
                kvk: { select: { kvkName: true } }
            },
            orderBy: { fpoManagementId: 'desc' }
        });

        return results.map(_mapResponse);
    },

    findById: async (id) => {
        const result = await prisma.fpoManagement.findUnique({
            where: { fpoManagementId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return result ? _mapResponse(result) : null;
    },

    update: async (id, data) => {
        const existing = await prisma.fpoManagement.findUnique({
            where: { fpoManagementId: parseInt(id) }
        });
        if (!existing) throw new Error("Record not found");

        const updateData = {};

        if (data.yearId !== undefined || data.reportingYear !== undefined) updateData.reportingYear = parseInt(data.yearId ?? data.reportingYear);
        if (data.fpoName !== undefined) updateData.fpoName = data.fpoName || '';
        if (data.fpoAddress !== undefined || data.address !== undefined) updateData.address = data.fpoAddress ?? data.address ?? '';
        if (data.registrationNo !== undefined || data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNo ?? data.registrationNumber ?? '';
        if (data.registrationDate !== undefined) {
            const dateVal = data.registrationDate && typeof data.registrationDate === 'object' && data.registrationDate.value
                ? data.registrationDate.value
                : data.registrationDate;
            const parsedDate = new Date(dateVal);
            if (!isNaN(parsedDate.getTime())) {
                updateData.registrationDate = parsedDate;
            }
        }
        if (data.proposedActivity !== undefined) updateData.proposedActivity = data.proposedActivity || '';
        if (data.commodityIdentified !== undefined) updateData.commodityIdentified = data.commodityIdentified || '';
        if (data.bomMembersCount !== undefined || data.totalBomMembers !== undefined) updateData.totalBomMembers = parseInt(data.bomMembersCount ?? data.totalBomMembers);
        if (data.farmersAttachedCount !== undefined || data.totalFarmersAttached !== undefined) updateData.totalFarmersAttached = parseInt(data.farmersAttachedCount ?? data.totalFarmersAttached);
        if (data.financialPosition !== undefined || data.financialPositionLakh !== undefined) updateData.financialPositionLakh = parseFloat(data.financialPosition ?? data.financialPositionLakh);
        if (data.successIndicator !== undefined) updateData.successIndicator = data.successIndicator || '';

        await prisma.$executeRawUnsafe(`
            UPDATE fpo_management 
            SET 
                reporting_year = $1, fpo_name = $2, address = $3, 
                registration_number = $4, registration_date = $5, 
                proposed_activity = $6, commodity_identified = $7, 
                total_bom_members = $8, total_farmers_attached = $9, 
                financial_position_lakh = $10, success_indicator = $11, 
                updated_at = CURRENT_TIMESTAMP
            WHERE fpo_management_id = $12
        `,
            updateData.reportingYear ?? existing.reportingYear,
            updateData.fpoName ?? existing.fpoName,
            updateData.address ?? existing.address,
            updateData.registrationNumber ?? existing.registrationNumber,
            updateData.registrationDate ?? existing.registrationDate,
            updateData.proposedActivity ?? existing.proposedActivity,
            updateData.commodityIdentified ?? existing.commodityIdentified,
            updateData.totalBomMembers ?? existing.totalBomMembers,
            updateData.totalFarmersAttached ?? existing.totalFarmersAttached,
            updateData.financialPositionLakh ?? existing.financialPositionLakh,
            updateData.successIndicator ?? existing.successIndicator,
            parseInt(id)
        );

        const result = await prisma.fpoManagement.findUnique({
            where: { fpoManagementId: parseInt(id) },
            include: {
                kvk: { select: { kvkName: true } }
            }
        });

        return _mapResponse(result);
    },

    delete: async (id) => {
        return await prisma.fpoManagement.delete({
            where: { fpoManagementId: parseInt(id) }
        });
    }
};

function _mapResponse(r) {
    if (!r) return null;
    return {
        id: r.fpoManagementId,
        kvkId: r.kvkId,
        yearId: r.reportingYear, // Frontend alias
        kvkName: r.kvk ? r.kvk.kvkName : undefined,
        reportingYear: r.reportingYear,
        fpoName: r.fpoName,
        address: r.address,
        fpoAddress: r.address, // Frontend alias
        registrationNumber: r.registrationNumber,
        registrationNo: r.registrationNumber, // Frontend alias
        registrationDate: r.registrationDate,
        proposedActivity: r.proposedActivity,
        commodityIdentified: r.commodityIdentified,
        totalBomMembers: r.totalBomMembers,
        bomMembersCount: r.totalBomMembers, // Frontend alias
        totalFarmersAttached: r.totalFarmersAttached,
        farmersAttachedCount: r.totalFarmersAttached, // Frontend alias
        financialPositionLakh: r.financialPositionLakh,
        financialPosition: r.financialPositionLakh, // Frontend alias
        successIndicator: r.successIndicator,
    };
}

module.exports = fpoManagementRepository;
