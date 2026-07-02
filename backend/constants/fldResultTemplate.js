const FLD_RESULT_TEMPLATES = Object.freeze({
    CROP_ECONOMICS: 'crop-economics',
    DEMO_ECONOMICS: 'demo-economics',
    MECHANIZATION: 'mechanization',
    FULL_WITH_OTHER_PARAMETERS: 'full-with-other-parameters',
});

const normalizeName = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, ' ');

function getFldResultTemplate(source = {}) {
    const sectorName = normalizeName(source.sectorOther || source.sectorName || source.sector?.sectorName);
    const categoryName = normalizeName(source.categoryOther || source.categoryName || source.category?.categoryName);

    if (categoryName.includes('other crops')) {
        return FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS;
    }

    if (categoryName.includes('crop hybrid varieties')) {
        return FLD_RESULT_TEMPLATES.DEMO_ECONOMICS;
    }

    if (
        sectorName.includes('farm implement') ||
        sectorName.includes('farm imp') ||
        categoryName.includes('tools and machiner')
    ) {
        return FLD_RESULT_TEMPLATES.MECHANIZATION;
    }

    if (
        sectorName.includes('livestock') ||
        sectorName.includes('fisheries') ||
        isWomenEmpowermentName(sectorName) ||
        sectorName.includes('other enterprise') ||
        categoryName.includes('other enterprise')
    ) {
        return FLD_RESULT_TEMPLATES.FULL_WITH_OTHER_PARAMETERS;
    }

    return FLD_RESULT_TEMPLATES.CROP_ECONOMICS;
}

function isWomenEmpowermentName(value) {
    return /women.*empower/.test(normalizeName(value));
}

module.exports = {
    FLD_RESULT_TEMPLATES,
    getFldResultTemplate,
    isWomenEmpowermentName,
};
