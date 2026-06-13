const prisma = require('../../../config/prisma.js');
const { applyDateFilters } = require('../aboutkvkReport/commonFilters.js');
const { OFT_STATUS } = require('../../../constants/oftStatus.js');
const s3 = require('../../../services/storage/s3Service.js');

// Report section data (with these URLs) is cached up to 60 min, and aggregated
// reports reuse it — so a default 60-min presign can expire before the report is
// rendered/viewed, leaving blank images. Sign report photos for a window that
// comfortably outlives the cache.
const REPORT_PHOTO_URL_TTL_SECONDS = 6 * 60 * 60;

// Resolve an OFT result photograph (S3 key) to a presigned URL the report
// templates can embed. Returns null when no photo or S3 isn't configured (#241).
async function resolvePhotoUrl(key) {
    if (!key || !s3.isConfigured()) return null;
    try {
        return await s3.presignGet({ key, expiresIn: REPORT_PHOTO_URL_TTL_SECONDS });
    } catch {
        return null;
    }
}

// OFT result photos are stored as form attachments (formCode 'oft_result',
// kind PHOTO) keyed by the result-report id, each with its own caption — not in
// the legacy single photograph_path column. Pull them, presign each S3 key and
// keep the caption so the report can show every photo with its label.
async function resolveResultPhotos(kvkId, oftResultReportId) {
    if (!kvkId || !oftResultReportId || !s3.isConfigured()) return [];
    // Never let a photo lookup/presign hiccup reject the whole section — in an
    // aggregated (super-admin) report that would silently drop this KVK's OFTs.
    try {
        const attachments = await prisma.formAttachment.findMany({
            where: {
                kvkId,
                formCode: 'oft_result',
                recordId: String(oftResultReportId),
                kind: 'PHOTO',
            },
            orderBy: { sortOrder: 'asc' },
            select: { s3Key: true, caption: true, fileName: true },
        });
        const resolved = await Promise.all(
            attachments.map(async (a) => {
                const url = await resolvePhotoUrl(a.s3Key);
                return url ? { url, caption: a.caption || a.fileName || '' } : null;
            }),
        );
        return resolved.filter(Boolean);
    } catch {
        return [];
    }
}

async function getOftSummaryData(kvkId, filters = {}) {
    // Transferred rows are stale clones of the same trial — exclude to avoid double counting.
    const where = { kvkId, status: { not: OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR } };
    applyDateFilters(where, filters, 'oftStartDate');

    return await prisma.kvkoft.findMany({
        where,
        select: {
            kvkOftId: true,
            numberOfLocation: true,
            numberOfTrialReplication: true,
            farmersGeneralM: true,
            farmersGeneralF: true,
            farmersObcM: true,
            farmersObcF: true,
            farmersScM: true,
            farmersScF: true,
            farmersStM: true,
            farmersStF: true,
            oftSubjectId: true,
            oftThematicAreaId: true,
            oftSubject: {
                select: { oftSubjectId: true, subjectName: true },
            },
            oftThematicArea: {
                select: { oftThematicAreaId: true, thematicAreaName: true },
            },
            kvk: {
                select: {
                    kvkId: true,
                    kvkName: true,
                    stateId: true,
                    state: {
                        select: { stateId: true, stateName: true },
                    },
                },
            },
        },
        orderBy: [
            { oftSubject: { subjectName: 'asc' } },
            { oftThematicArea: { thematicAreaName: 'asc' } },
        ],
    });
}

async function getOftDetailCards(kvkId, filters = {}) {
    const where = { kvkId, status: { not: OFT_STATUS.TRANSFERRED_TO_NEXT_YEAR } };
    applyDateFilters(where, filters, 'oftStartDate');

    const rows = await prisma.kvkoft.findMany({
        where,
        include: {
            kvk: {
                select: { kvkId: true, kvkName: true },
            },
            discipline: {
                select: { disciplineId: true, disciplineName: true },
            },
            oftSubject: {
                select: { oftSubjectId: true, subjectName: true },
            },
            oftThematicArea: {
                select: { oftThematicAreaId: true, thematicAreaName: true },
            },
            season: {
                select: { seasonId: true, seasonName: true },
            },
            technologies: {
                orderBy: { optionKey: 'asc' },
                include: {
                    oftTechnologyType: {
                        select: { name: true },
                    },
                },
            },
            resultReport: {
                include: {
                    tables: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            columns: {
                                orderBy: { sortOrder: 'asc' },
                            },
                            rows: {
                                orderBy: { sortOrder: 'asc' },
                                include: {
                                    cells: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: [
            { discipline: { disciplineName: 'asc' } },
            { oftThematicArea: { thematicAreaName: 'asc' } },
            { title: 'asc' },
        ],
    });

    // The OFT form doesn't capture a dedicated end date yet (only the expected
    // completion date), so oftEndDate is always null. Fall back to it so the
    // report's "OFT End on" is populated instead of showing "-".
    // BUT: an ONGOING OFT has no end date yet — don't show the expected
    // completion date as if the trial had ended (#222). Also resolve the result
    // photograph to a presigned URL for embedding (#241).
    return Promise.all(rows.map(async (r) => ({
        ...r,
        oftEndDate:
            r.status === OFT_STATUS.ONGOING
                ? r.oftEndDate ?? null
                : r.oftEndDate ?? r.expectedCompletionDate ?? null,
        resultReport: r.resultReport
            ? {
                ...r.resultReport,
                photographUrl: await resolvePhotoUrl(r.resultReport.photographPath),
                photos: await resolveResultPhotos(kvkId, r.resultReport.oftResultReportId),
            }
            : r.resultReport,
    })));
}

/**
 * Get all OFT subjects with their thematic areas (master data).
 * Used to render ALL rows in the summary table even with 0 data.
 */
async function getOftSubjectsWithThematicAreas() {
    return await prisma.oftSubject.findMany({
        include: {
            thematicAreas: {
                select: { oftThematicAreaId: true, thematicAreaName: true },
                orderBy: { thematicAreaName: 'asc' },
            },
        },
        orderBy: { subjectName: 'asc' },
    });
}

module.exports = {
    getOftSummaryData,
    getOftDetailCards,
    getOftSubjectsWithThematicAreas,
};
