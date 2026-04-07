const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('../aboutkvkReport/commonFilters.js');

async function getSacMeetings(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);
    return await prisma.sacMeeting.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } } },
        orderBy: [{ startDate: 'desc' }],
    });
}

async function getOtherMeetings(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);
    return await prisma.atariMeeting.findMany({
        where,
        include: { kvk: { select: { kvkId: true, kvkName: true, state: { select: { stateName: true } }, district: { select: { districtName: true } } } } },
        orderBy: [{ meetingDate: 'desc' }],
    });
}

module.exports = { getSacMeetings, getOtherMeetings };
