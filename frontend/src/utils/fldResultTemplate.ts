export const FLD_RESULT_TEMPLATES = {
    CROP_ECONOMICS: 'crop-economics',
    DEMO_ECONOMICS: 'demo-economics',
    MECHANIZATION: 'mechanization',
    FULL_WITH_OTHER_PARAMETERS: 'full-with-other-parameters',
} as const

export type FldResultTemplate =
    (typeof FLD_RESULT_TEMPLATES)[keyof typeof FLD_RESULT_TEMPLATES]

const normalizeName = (value: unknown) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, ' ')

export function getFldResultTemplate(item?: any): FldResultTemplate {
    const sectorName = normalizeName(item?.sectorOther || item?.sectorName || item?.sector?.sectorName)
    const categoryName = normalizeName(item?.categoryOther || item?.categoryName || item?.category?.categoryName)

    if (categoryName.includes('other crops')) {
        return FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    }

    if (categoryName.includes('crop hybrid varieties')) {
        return FLD_RESULT_TEMPLATES.DEMO_ECONOMICS
    }

    if (
        sectorName.includes('farm implement') ||
        sectorName.includes('farm imp') ||
        categoryName.includes('tools and machiner')
    ) {
        return FLD_RESULT_TEMPLATES.MECHANIZATION
    }

    if (
        sectorName.includes('livestock') ||
        sectorName.includes('fisheries') ||
        isWomenEmpowermentName(sectorName) ||
        sectorName.includes('other enterprise') ||
        categoryName.includes('other enterprise')
    ) {
        return FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS
    }

    return FLD_RESULT_TEMPLATES.CROP_ECONOMICS
}

export function isWomenEmpowermentName(value: unknown): boolean {
    return /women.*empower/.test(normalizeName(value))
}
