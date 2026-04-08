/**
 * Normalize KVK id for Prisma (Int) and consistent auth comparisons.
 * JWT / JSON bodies often send kvkId as string; DB expects Int.
 */
function normalizeReportKvkId(kvkId) {
    if (kvkId == null || kvkId === '') return null;
    const n = parseInt(String(kvkId), 10);
    return Number.isFinite(n) ? n : null;
}

module.exports = { normalizeReportKvkId };
