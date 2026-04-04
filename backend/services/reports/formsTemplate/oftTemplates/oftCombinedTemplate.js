/**
 * OFT Combined Template
 *
 * Renders BOTH Section 2.1 (Summary) and Section 2.2 (Detail Cards)
 * in a single PDF, matching the original ATARI website KVK-side report.
 *
 * Used by the module-level export (DataManagementView → exportController).
 * Fetches OFT subjects from DB so the summary shows all thematic areas.
 *
 * Bound to reportTemplateService (`this`).
 */

const { renderOftSummarySection } = require('./oftSummaryTemplate.js');
const { renderOftDetailCardsSection } = require('./oftDetailCardsTemplate.js');
const { getOftSubjectsWithThematicAreas } = require('../../../../repositories/reports/oftReport/index.js');

async function renderOftCombinedSection(section, data, sectionId, isFirstSection) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const records = Array.isArray(data) ? data : [data];

    // Fetch subjects from DB for the summary to show all thematic areas
    let subjects = [];
    try {
        subjects = await getOftSubjectsWithThematicAreas();
    } catch (e) {
        // If DB fetch fails, summary will still work with data-driven areas
    }

    // Section 2.1 — OFT Summary (pass { records, subjects })
    const summaryHtml = renderOftSummarySection.call(
        this,
        { id: '2.1', title: 'OFT Summary' },
        { records, subjects },
        'section-2-1',
        isFirstSection
    );

    // Section 2.2 — OFT Detail Cards
    const detailHtml = renderOftDetailCardsSection.call(
        this,
        { id: '2.2', title: 'OFT' },
        records,
        'section-2-2',
        false
    );

    return summaryHtml + detailHtml;
}

module.exports = { renderOftCombinedSection };
