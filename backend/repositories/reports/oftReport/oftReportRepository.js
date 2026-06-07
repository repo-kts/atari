const prisma = require('../../../config/prisma.js');
const { applyCreatedAtFilters } = require('../aboutkvkReport/commonFilters.js');

async function getOftSummaryData(kvkId, filters = {}) {
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

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
    const where = { kvkId };
    applyCreatedAtFilters(where, filters);

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
    return rows.map((r) => ({
        ...r,
        oftEndDate: r.oftEndDate ?? r.expectedCompletionDate ?? null,
    }));
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
