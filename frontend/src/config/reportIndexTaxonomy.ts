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
    achievements: {
        tabId: 'achievements',
        title: 'Achievements',
        // Order, groups and lettered features follow the approved sheet exactly.
        // sectionId '' = no backing report section yet (shown disabled).
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
}

/** Chapter numbers shown in the sidebar (match the report: About=1, Achievements=2). */
export const TAXONOMY_CHAPTER_NUMBER: Record<string, number> = {
    about: 1,
    achievements: 2,
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
        return {
            number: groupNo,
            label: group.label,
            features: group.features.map((f, fi) => ({
                number: `${groupNo}.${String.fromCharCode(65 + fi)}`,
                label: f.label,
                sectionId: f.sectionId,
                disabled: !f.sectionId || !availableSectionIds.has(f.sectionId),
            })),
        }
    })

    return { title: chapter.title, groups }
}
