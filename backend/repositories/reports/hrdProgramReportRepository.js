const prisma = require('../../config/prisma.js');

function buildWhere(kvkId, filters = {}) {
    const where = { kvkId };

    if (filters.startDate && filters.endDate) {
        const rangeStart = new Date(filters.startDate);
        const rangeEnd = new Date(filters.endDate);
        where.AND = [
            { startDate: { lte: rangeEnd } },
            { endDate: { gte: rangeStart } },
        ];
    } else if (filters.year) {
        const yearStr = String(filters.year);
        const yStart = new Date(`${yearStr}-01-01T00:00:00.000Z`);
        const yEnd = new Date(`${yearStr}-12-31T23:59:59.999Z`);
        where.AND = [
            { startDate: { lte: yEnd } },
            { endDate: { gte: yStart } },
        ];
    }

    return where;
}

function formatStaffAndDesignation(staffName, postName) {
    const name = staffName != null && String(staffName).trim() !== '' ? String(staffName).trim() : '';
    const post = postName != null && String(postName).trim() !== '' ? String(postName).trim() : '';
    if (name && post) return `${name} and ${post}`;
    if (name) return name;
    return '—';
}

function inclusiveDurationDays(startDate, endDate) {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const utc1 = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const utc2 = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
    const days = Math.floor((utc2 - utc1) / 86400000) + 1;
    return days > 0 ? days : null;
}

/**
 * HRD rows for reports: one line per programme (same layout for page export and modular all-report).
 */
async function getHrdProgramReportData(kvkId, filters = {}) {
    const where = buildWhere(kvkId, filters);
    const rows = await prisma.hrdProgram.findMany({
        where,
        include: {
            kvk: { select: { kvkName: true } },
            staff: {
                select: {
                    staffName: true,
                    sanctionedPost: { select: { postName: true } },
                },
            },
        },
        orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
    });

    return rows.map((r) => {
        const staffName = r.staff?.staffName || '';
        const postName = r.staff?.sanctionedPost?.postName || '';
        const staffAndDesignation = formatStaffAndDesignation(staffName, postName);
        const durationDays = inclusiveDurationDays(r.startDate, r.endDate);

        return {
            hrdProgramId: r.hrdProgramId,
            kvkId: r.kvkId,
            kvkName: r.kvk?.kvkName || '',
            staffName,
            postName,
            staffAndDesignation,
            courseName: r.courseName || '',
            startDate: r.startDate,
            endDate: r.endDate,
            durationDays,
            organizer: r.organizer || '',
            venue: r.venue || '',
        };
    });
}

module.exports = {
    getHrdProgramReportData,
};
