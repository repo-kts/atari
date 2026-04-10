const prisma = require('../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate && filters.endDate) {
        where.reportingYear = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
        };
    } else if (filters.year) {
        const yearStr = String(filters.year);
        where.reportingYear = {
            gte: new Date(`${yearStr}-01-01`),
            lte: new Date(`${yearStr}-12-31T23:59:59.999Z`),
        };
    }

    return where;
}

async function getPriorityThrustAreaReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.priorityThrustArea.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
        },
        orderBy: [{ createdAt: 'asc' }],
    });

    return rows.map((r) => ({
        priorityThrustAreaId: r.priorityThrustAreaId,
        kvkId: r.kvkId,
        kvkName: r.kvk?.kvkName || '',
        thrustArea: r.thrustArea || '',
    }));
}

module.exports = {
    getPriorityThrustAreaReportData,
};
