const prisma = require('../../../config/prisma.js');

async function getKvkBasicInfo(kvkId) {
    return await prisma.kvk.findUnique({
        where: { kvkId },
        include: {
            zone: {
                select: { zoneId: true, zoneName: true },
            },
            state: {
                select: { stateId: true, stateName: true },
            },
            district: {
                select: { districtId: true, districtName: true },
            },
            org: {
                select: { orgId: true, orgName: true },
            },
            university: {
                select: { universityId: true, universityName: true },
            },
        },
    });
}

module.exports = {
    getKvkBasicInfo,
};
