/**
 * Report Index Taxonomy
 *
 * Curated 2-level index structure for the report PDF, matching the approved
 * sheet layout:
 *
 *   <chapter>  About KVK
 *     <chapter>.<group>        Basic Information           (group heading)
 *       <chapter>.<group>.<A>  KVKs Details                (feature → a section)
 *       <chapter>.<group>.<B>  Bank Account Details
 *
 * Only the chapters listed here use grouped+lettered numbering; every other
 * chapter falls back to flat sequential numbering (see buildSectionNumbering).
 *
 * Each feature maps to a real report `sectionId` (from reportConfig). Multiple
 * features may point at the same section when that section renders several
 * sub-tables (e.g. Infrastructure also contains Land and Staff-Quarters tables);
 * in that case the section's page heading shows the GROUP label, while the index
 * still lists each feature row.
 *
 * To re-map a row, just change its `sectionId` / `label` here — nothing else.
 */

const REPORT_INDEX_TAXONOMY = {
    // ── 1. About KVK ─────────────────────────────────────────────────────────
    '1': {
        title: 'About KVK',
        groups: [
            {
                label: 'Basic Information',
                features: [
                    { label: 'KVKs Details', sectionId: '1.1' },
                    { label: 'Bank Account Details', sectionId: '1.2' },
                ],
            },
            {
                label: 'Employee Information',
                features: [
                    { label: 'Employee Details', sectionId: '1.3' },
                    { label: 'Staff Transferred', sectionId: '1.4' },
                ],
            },
            {
                label: 'Land & Infrastructure Information',
                features: [
                    { label: 'Infrastructure Details', sectionId: '1.5' },
                    { label: 'Land Details', sectionId: '1.5' },
                    { label: 'Staff Quarters Details', sectionId: '1.5' },
                ],
            },
            {
                label: 'Vehicles Information',
                features: [
                    { label: 'Vehicles Details', sectionId: '1.6' },
                    { label: 'Vehicle Status', sectionId: '1.7' },
                ],
            },
            {
                label: 'Equipments Information',
                features: [
                    { label: 'Equipments Details', sectionId: '1.8' },
                    { label: 'Equipment Status', sectionId: '1.9' },
                ],
            },
        ],
    },

    // ── 2. Achievements ──────────────────────────────────────────────────────
    // Swachh Bharat sections (real parent "7") are intentionally grouped here,
    // matching the sheet; chapter 7 therefore no longer renders separately.
    // Order, groups and lettered features follow the approved sheet exactly.
    // Some rows are sub-views of one section (shared sectionId) or have no
    // backing report section yet (sectionId ''): the latter show in the sidebar
    // as disabled rows and are skipped in the report until a section exists.
    '2': {
        title: 'Achievements',
        groups: [
            {
                label: 'Technical Achievement',
                features: [
                    { label: 'Technical Achievement Summary', sectionId: '' },
                ],
            },
            {
                label: 'On Farm Trial',
                features: [
                    { label: 'OFT Summary', sectionId: '2.2' },
                    { label: 'State Wise OFT Details', sectionId: '2.2' },
                    { label: 'KVK Wise OFT Details', sectionId: '2.3' },
                ],
            },
            {
                label: 'Front Line Demonstration',
                features: [
                    { label: 'FLD Summary', sectionId: '2.4' },
                    { label: 'State Wise OFT Details', sectionId: '2.4' },
                    { label: 'FLD Details', sectionId: '2.4' },
                    { label: 'Extension & Training activities under FLD', sectionId: '2.5' },
                    { label: 'Technical Feedback on FLD', sectionId: '2.6' },
                ],
            },
            {
                label: 'Training',
                features: [{ label: 'Trainings', sectionId: '2.7' }],
            },
            {
                label: 'Extension',
                features: [
                    { label: 'Extension Activities', sectionId: '2.8' },
                    { label: 'Other Extension Activities', sectionId: '2.9' },
                ],
            },
            {
                label: 'Special Days',
                features: [
                    { label: 'Technology Week', sectionId: '2.10' },
                    { label: 'Celebration Days', sectionId: '2.11' },
                    { label: 'World Soil Day', sectionId: '2.15' },
                    { label: 'Poshan Maha', sectionId: '' },
                ],
            },
            {
                label: 'Swacha Bharat Abhiyan',
                features: [
                    { label: 'Swachhta hi Sewa', sectionId: '7.1' },
                    { label: 'Swachta Pakhwada', sectionId: '7.2' },
                    { label: 'Budget Expenditure', sectionId: '7.3' },
                ],
            },
            {
                label: 'Production & Supply',
                features: [
                    { label: 'Production and Supply', sectionId: '2.12' },
                ],
            },
            {
                label: 'Soil and Water Testing',
                features: [
                    { label: 'Analysis Details', sectionId: '2.14' },
                ],
            },
            {
                label: 'Publications',
                features: [{ label: 'Publications', sectionId: '2.55' }],
            },
            {
                label: 'Human Resources Development',
                features: [
                    { label: 'Human Resources Development', sectionId: '2.59' },
                ],
            },
            {
                label: 'Award and Recognition',
                features: [
                    { label: 'KVK Awards', sectionId: '2.56' },
                    { label: 'Scientist Awards', sectionId: '2.57' },
                    { label: 'Farmer Awards', sectionId: '2.58' },
                ],
            },
        ],
    },
};

module.exports = { REPORT_INDEX_TAXONOMY };
