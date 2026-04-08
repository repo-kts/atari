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

function yearFromReportingYear(d) {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return String(dt.getUTCFullYear());
}

/**
 * Rows for modular KVK report: one line per publication entry (detailed layout).
 */
async function getKvPublicationDetailsReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.kvkPublicationDetails.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                    district: { select: { districtName: true } },
                },
            },
            publication: { select: { publicationName: true } },
        },
        orderBy: [{ reportingYear: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((r) => ({
        publicationDetailsId: r.publicationDetailsId,
        kvkName: r.kvk?.kvkName || '',
        stateName: r.kvk?.state?.stateName || '',
        districtName: r.kvk?.district?.districtName || '',
        category: r.publication?.publicationName || '-',
        title: r.title || '',
        authorName: r.authorName || '',
        journalName: r.journalName || '',
        year: yearFromReportingYear(r.reportingYear),
        volume: '',
        issue: '',
        pageNo: '',
        impactFactor: '',
    }));
}

module.exports = {
    getKvPublicationDetailsReportData,
};
