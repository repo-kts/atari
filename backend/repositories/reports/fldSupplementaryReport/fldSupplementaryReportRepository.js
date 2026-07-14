const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');

function reportWhere(kvkId, filters) {
    const where = {};
    if (kvkId != null) where.kvkId = Number(kvkId);
    const reportingYear = buildReportingYearFilter(filters);
    if (reportingYear) where.reportingYear = reportingYear;
    return where;
}

async function getFldExtensionTrainingReportData(kvkId, filters = {}) {
    return prisma.fldExtension.findMany({
        where: reportWhere(kvkId, filters),
        include: {
            kvk: { select: { kvkName: true } },
            fld: { select: { fldName: true } },
            fldActivity: { select: { activityName: true } },
        },
        orderBy: [{ reportingYear: 'desc' }, { extensionId: 'desc' }],
    });
}

async function getFldTechnicalFeedbackReportData(kvkId, filters = {}) {
    return prisma.fldTechnicalFeedback.findMany({
        where: reportWhere(kvkId, filters),
        include: {
            kvk: { select: { kvkName: true } },
            fld: { select: { fldName: true } },
            crop: { select: { cropName: true } },
        },
        orderBy: [{ reportingYear: 'desc' }, { feedbackId: 'desc' }],
    });
}

module.exports = {
    getFldExtensionTrainingReportData,
    getFldTechnicalFeedbackReportData,
};
