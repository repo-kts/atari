/**
 * Report Index Taxonomy (frontend mirror)
 *
 * Mirrors backend/config/reportIndexTaxonomy.js so the report-module sidebar can
 * present the same grouped, lettered structure used in the report PDF index:
 *
 *   chapter  →  group (Section)  →  feature (Sub-Section / Feature)
 *
 * Each feature maps to a real report `sectionId`. Keep this in sync with the
 * backend file — both must list the same sectionIds in the same order.
 */

export interface TaxonomyFeature {
    label: string
    sectionId: string
}

export interface TaxonomyGroup {
    label: string
    features: TaxonomyFeature[]
}

export interface TaxonomyChapter {
    /** Sidebar tab id this chapter renders under. */
    tabId: string
    title: string
    groups: TaxonomyGroup[]
}

export const REPORT_INDEX_TAXONOMY: Record<string, TaxonomyChapter> = {
    about: {
        tabId: 'about',
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
    achievements: {
        tabId: 'achievements',
        title: 'Achievements',
        // Order, groups and lettered features follow the approved sheet exactly.
        // sectionId '' = no backing report section yet (shown disabled).
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
                features: [{ label: 'Production and Supply', sectionId: '2.12' }],
            },
            {
                label: 'Soil and Water Testing',
                features: [{ label: 'Analysis Details', sectionId: '2.14' }],
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

    // Mirrors backend REPORT_INDEX_TAXONOMY['3'] — keep sectionIds in sync.
    projects: {
        tabId: 'projects',
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
                    { label: 'Details', sectionId: '' },
                    { label: 'Training', sectionId: '2.35' },
                    { label: 'Extension Activity', sectionId: '2.36' },
                ],
            },
            {
                label: 'NICRA Others',
                features: [
                    { label: 'Intervention', sectionId: '2.37' },
                    { label: 'Revenue Generated', sectionId: '' },
                    { label: 'Custom Hiring', sectionId: '2.38' },
                    { label: 'VCRMC', sectionId: '2.39' },
                    { label: 'Soil Health Card', sectionId: '2.40' },
                    { label: 'Convergence Programme', sectionId: '' },
                    { label: 'Dignitaries Visited', sectionId: '' },
                    { label: 'PI/Co-PI List', sectionId: '' },
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
                    { label: 'Geographical Information', sectionId: '' },
                    { label: 'Physical Information', sectionId: '2.44' },
                    { label: 'Demonstration Information', sectionId: '2.46' },
                    { label: 'Farmers Practicing', sectionId: '2.47' },
                    { label: 'Beneficiaries', sectionId: '' },
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
}

/** Chapter numbers shown in the sidebar (match the report: About=1, Achievements=2). */
export const TAXONOMY_CHAPTER_NUMBER: Record<string, number> = {
    about: 1,
    achievements: 2,
    projects: 3,
}

/**
 * Build the numbered, grouped view for a taxonomy tab. The full sheet structure
 * is preserved (every group + lettered feature), so numbering matches the sheet
 * exactly. Features whose section is missing/empty are marked `disabled` — they
 * show in the list for completeness but can't be toggled.
 */
export function buildTaxonomyView(
    tabId: string,
    availableSectionIds: Set<string>,
) {
    const chapter = REPORT_INDEX_TAXONOMY[tabId]
    if (!chapter) return null
    const chapterNo = TAXONOMY_CHAPTER_NUMBER[tabId]

    const groups = chapter.groups.map((group, gi) => {
        const groupNo = `${chapterNo}.${gi + 1}`
        // Collapse features that map to the SAME report section into a single
        // selectable row. Several sub-views (e.g. FLD Summary / State-wise /
        // Details) are produced by one section, so listing them as separate
        // checkboxes made one click select all of them at once (#233).
        // Keep the first label for each distinct sectionId; empty-sectionId
        // (not-yet-backed) rows are always kept so they still show as disabled.
        const seen = new Set<string>()
        const deduped = group.features.filter((f) => {
            if (!f.sectionId) return true
            if (seen.has(f.sectionId)) return false
            seen.add(f.sectionId)
            return true
        })
        return {
            number: groupNo,
            label: group.label,
            features: deduped.map((f, fi) => ({
                number: `${groupNo}.${String.fromCharCode(65 + fi)}`,
                label: f.label,
                sectionId: f.sectionId,
                disabled: !f.sectionId || !availableSectionIds.has(f.sectionId),
            })),
        }
    })

    return { title: chapter.title, groups }
}
