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
                    { label: 'All KVK Staff', sectionId: '1.4' },
                    { label: 'Staff Transferred', sectionId: '1.11' },
                ],
            },
            {
                label: 'Land & Infrastructure Information',
                features: [
                    { label: 'Infrastructure Details', sectionId: '1.5' },
                    { label: 'Land Details', sectionId: '1.10' },
                    { label: 'Staff Quarters Details', sectionId: '4.13' },
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
                    { label: 'Technical Achievement Summary', sectionId: '2.1' },
                ],
            },
            {
                label: 'On Farm Trial',
                features: [
                    { label: 'OFT Summary', sectionId: '2.2' },
                    // Its own aggregated-only section (2.2.1) — excluded from the
                    // single-KVK report, so it drops out of the KVK-side TOC too.
                    { label: 'State Wise OFT Details', sectionId: '2.2.1', aggregatedOnly: true },
                    { label: 'KVK Wise OFT Details', sectionId: '2.3' },
                ],
            },
            {
                label: 'Front Line Demonstration',
                features: [
                    { label: 'FLD Summary', sectionId: '2.4' },
                    // Sub-block of section 2.4 (rendered only in aggregated reports);
                    // hidden from the single-KVK-side TOC.
                    { label: 'State Wise FLD Details', sectionId: '2.4', aggregatedOnly: true },
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
                    { label: 'Poshan Maah', sectionId: '5.8' },
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

    // ── 3. Projects ──────────────────────────────────────────────────────────
    // Grouped to mirror the Projects form page: each card is a group, its links
    // are the lettered features. Features with sectionId '' have no backing
    // report section yet and are skipped in the report.
    '3': {
        title: 'Projects',
        groups: [
            {
                label: 'CFLD',
                features: [
                    { label: 'Technical Parameter', sectionId: '2.16' },
                    { label: 'Extension Activity', sectionId: '2.17' },
                    { label: 'Budget Utilization', sectionId: '2.18' },
                ],
            },
            {
                label: 'NICRA',
                features: [
                    { label: 'Basic Information', sectionId: '2.34' },
                    { label: 'Details', sectionId: '2.41' },
                    { label: 'Training', sectionId: '2.35' },
                    { label: 'Extension Activity', sectionId: '2.36' },
                ],
            },
            {
                label: 'NICRA Others',
                features: [
                    { label: 'Intervention', sectionId: '2.37' },
                    { label: 'Revenue Generated', sectionId: '2.42' },
                    { label: 'Custom Hiring', sectionId: '2.38' },
                    { label: 'VCRMC', sectionId: '2.39' },
                    { label: 'Soil Health Card', sectionId: '2.40' },
                    { label: 'Convergence Programme', sectionId: '2.43' },
                    { label: 'Dignitaries Visited', sectionId: '2.45' },
                    { label: 'PI/Co-PI List', sectionId: '2.61' },
                ],
            },
            {
                label: 'ARYA / SAFAL',
                features: [
                    { label: 'Current Year Details', sectionId: '2.30' },
                    { label: 'Previous Year Evaluation', sectionId: '2.31' },
                ],
            },
            {
                label: 'Natural Farming',
                features: [
                    { label: 'Geographical Information', sectionId: '2.60' },
                    { label: 'Physical Information', sectionId: '2.44' },
                    { label: 'Demonstration Information', sectionId: '2.46' },
                    { label: 'Farmers Practicing', sectionId: '2.47' },
                    { label: 'Beneficiaries', sectionId: '2.48' },
                    { label: 'Soil Data', sectionId: '2.49' },
                    { label: 'Budget Expenditure', sectionId: '2.50' },
                ],
            },
            {
                label: 'TSP/SCSP',
                features: [
                    { label: 'TSP Activities', sectionId: '2.33' },
                    { label: 'SCSP Activities', sectionId: '2.33' },
                ],
            },
            {
                label: 'NARI',
                features: [
                    { label: 'Nutrition Garden', sectionId: '2.25' },
                    { label: 'Bio-fortified Crops', sectionId: '2.26' },
                    { label: 'Value Addition', sectionId: '2.27' },
                    { label: 'Training Program', sectionId: '2.28' },
                    { label: 'Extension Activities', sectionId: '2.29' },
                ],
            },
            {
                label: 'Agri-Drone',
                features: [
                    { label: 'Introduction', sectionId: '2.51' },
                    { label: 'Demonstration', sectionId: '2.52' },
                ],
            },
            {
                label: 'FPO and CBBO',
                features: [
                    { label: 'Details FPO and CBBO', sectionId: '2.21' },
                    { label: 'FPO Management', sectionId: '2.22' },
                ],
            },
            {
                label: 'DRMR',
                features: [
                    { label: 'DRMR Details', sectionId: '2.23' },
                    { label: 'DRMR Activity', sectionId: '2.24' },
                ],
            },
            {
                label: 'Climate Resilient Agriculture (CRA)',
                features: [
                    { label: 'CRA Details', sectionId: '2.19' },
                    { label: 'Extension Activity', sectionId: '2.20' },
                ],
            },
            {
                label: 'CSISA',
                features: [
                    { label: 'CSISA', sectionId: '2.32' },
                ],
            },
            {
                label: 'Seed Hub Program',
                features: [
                    { label: 'Seed Hub Program', sectionId: '2.53' },
                ],
            },
            {
                label: 'Other Programmes',
                features: [
                    { label: 'Other Programmes', sectionId: '2.54' },
                ],
            },
        ],
    },
    '4': {
        title: 'Performance',
        groups: [
            {
                label: 'Impact',
                features: [
                    { label: 'Impact of KVK activities', sectionId: '4.1' },
                    { label: 'Entrepreneurship', sectionId: '4.2' },
                    { label: 'Success Stories', sectionId: '4.3' },
                ],
            },
            {
                label: 'District and Village Performance',
                features: [
                    { label: 'District Level Data', sectionId: '4.4' },
                    { label: 'Operational Area Details', sectionId: '4.5' },
                    { label: 'Village Adoption Programme', sectionId: '4.6' },
                    { label: 'Priority Thrust Area', sectionId: '4.7' },
                ],
            },
            {
                label: 'Infrastructure Performance',
                features: [
                    { label: 'Demonstration Units', sectionId: '4.8' },
                    { label: 'Instructional Farm (crops)', sectionId: '4.9' },
                    { label: 'Production Units', sectionId: '4.10' },
                    { label: 'Instructional Farm (livestock)', sectionId: '4.11' },
                    { label: 'Hostel Facilities', sectionId: '4.12' },
                    { label: 'Rain Water Harvesting', sectionId: '4.14' },
                ],
            },
            {
                label: 'Financial Performance',
                features: [
                    { label: 'Budget Details', sectionId: '4.15' },
                    { label: 'Project-wise Budget Details', sectionId: '4.16' },
                    { label: 'Status of revolving fund', sectionId: '4.17' },
                    { label: 'Revenue generation', sectionId: '4.18' },
                    { label: 'Resource Generation', sectionId: '4.19' },
                ],
            },
            {
                label: 'Linkages',
                features: [
                    { label: 'Functional Linkage with Different Organizations', sectionId: '4.20' },
                ],
            },
        ],
    },
    '5': {
        title: 'Miscellaneous',
        groups: [
            {
                label: 'Prevalent Diseases',
                features: [
                    { label: 'Prevalent diseases in Crops', sectionId: '5.1' },
                    { label: 'Prevalent diseases in Livestock/Fishery', sectionId: '5.2' },
                ],
            },
            {
                label: 'Nehru Yuva Kendra',
                features: [
                    { label: 'Nehru Yuva Kendra (NYK) Training', sectionId: '5.3' },
                ],
            },
            {
                label: 'PPV & FRA Sensitization',
                features: [
                    { label: 'Training & Awareness Program', sectionId: '5.4' },
                    { label: 'Details of Plant Varieties', sectionId: '5.5' },
                ],
            },
            {
                label: 'Digital Information',
                features: [
                    { label: 'RAWE/FET programme', sectionId: '5.7' },
                    { label: 'List of VIP visitors', sectionId: '5.6' },
                    { label: 'Details of Mobile App', sectionId: '6.1' },
                    { label: 'Details of Web Portal', sectionId: '6.2' },
                    { label: 'Details of Kisan Sarathi', sectionId: '6.3' },
                    { label: 'Kisan Mobile Advisory Services/KMAS', sectionId: '6.4' },
                    { label: 'Details of messages send through other channels', sectionId: '6.5' },
                ],
            },
        ],
    },
};

module.exports = { REPORT_INDEX_TAXONOMY };
