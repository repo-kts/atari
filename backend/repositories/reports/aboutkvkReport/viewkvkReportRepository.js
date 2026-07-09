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
                select: {
                    universityId: true,
                    universityName: true,
                    hostAddress: true,
                    hostMobile: true,
                    hostLandline: true,
                    hostFax: true,
                    hostEmail: true,
                },
            },
            landDetails: {
                select: {
                    landId: true,
                    item: true,
                    landItemMasterId: true,
                    specifyItemName: true,
                    description: true,
                    areaHa: true,
                    landItemMaster: { select: { name: true, isOther: true } },
                },
                orderBy: { landId: 'asc' },
            },
        },
    });
}

module.exports = {
    getKvkBasicInfo,
};
