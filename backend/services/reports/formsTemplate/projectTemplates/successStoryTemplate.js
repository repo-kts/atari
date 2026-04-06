/**
 * Success Story Template
 * Handles rendering the Success Story section (Section 10.3)
 */

function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toISOString().split('T')[0];
}

function renderSuccessStoryItem(ctx, record, index) {
    return `
    <div class="success-story-item" style="${index > 0 ? 'margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 20px;' : ''}">
        <h2 class="about-kvk-subheading" style="text-align: left; margin-bottom: 15px;">1. Personal information</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tbody>
                <tr><td style="width: 40%; font-weight: 500;">Name of the farmer/ entrepreneur</td><td>${ctx._escapeHtml(record.farmerName)}</td></tr>
                <tr><td style="font-weight: 500;">Date of Birth</td><td>${formatDate(record.dateOfBirth)}</td></tr>
                <tr><td style="font-weight: 500;">Education</td><td>${ctx._escapeHtml(record.education)}</td></tr>
                <tr><td style="font-weight: 500;">Farming Experience/ Experience in enterprise</td><td>${ctx._escapeHtml(record.experience)}</td></tr>
                <tr><td style="font-weight: 500;">Cell no./ e-mail</td><td>${ctx._escapeHtml(record.contact)}</td></tr>
                <tr><td style="font-weight: 500;">Full address</td><td>${ctx._escapeHtml(record.fullAddress)}</td></tr>
                <tr><td style="font-weight: 500;">Professional membership(Farmer club/SHG/ATMA/etc.)</td><td>${ctx._escapeHtml(record.professionalMembership)}</td></tr>
                <tr><td style="font-weight: 500;">Major achievement of the farmers</td><td>${ctx._escapeHtml(record.majorAchievement)}</td></tr>
                <tr><td style="font-weight: 500;">Awards received</td><td>${ctx._escapeHtml(record.awardsReceived)}</td></tr>
            </tbody>
        </table>

        <h2 class="about-kvk-subheading" style="text-align: left; margin-bottom: 15px;">2. Professional Information</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tbody>
                <tr><td style="width: 40%; font-weight: 500;">Title of the success story/case study</td><td>${ctx._escapeHtml(record.storyTitle)}</td></tr>
                <tr><td style="font-weight: 500;">Situation analysis/Problem statement</td><td>${ctx._escapeHtml(record.problemStatement)}</td></tr>
                <tr><td style="font-weight: 500;">Plan, Implement and Support/KVK Intervention(s)</td><td>${ctx._escapeHtml(record.kvkIntervention)}</td></tr>
                <tr><td style="font-weight: 500;">Details of Practices followed by the farmer</td><td>${ctx._escapeHtml(record.practicesFollowed)}</td></tr>
                <tr><td style="font-weight: 500;">Results/ Output (economical/ social/ etc.)</td><td>${ctx._escapeHtml(record.results)}</td></tr>
                <tr><td style="font-weight: 500;">Impact/ Outcome</td><td>${ctx._escapeHtml(record.impact)}</td></tr>
                <tr><td style="font-weight: 500;">Future plans</td><td>${ctx._escapeHtml(record.futurePlans)}</td></tr>
            </tbody>
        </table>

        <h2 class="about-kvk-subheading" style="text-align: left; margin-bottom: 15px;">3. Economic Information</h2>
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <tbody>
                <tr><td style="width: 40%; font-weight: 500;">Enterprise</td><td>${ctx._escapeHtml(record.enterprise)}</td></tr>
                <tr><td style="font-weight: 500;">Gross Income(annual)</td><td>${record.grossIncome}</td></tr>
                <tr><td style="font-weight: 500;">Net income</td><td>${record.netIncome}</td></tr>
                <tr><td style="font-weight: 500;">Cost-Benefit ratio</td><td>${record.costBenefitRatio}</td></tr>
            </tbody>
        </table>
    </div>`;
}

function renderSuccessStorySection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const content = records.map((record, index) => renderSuccessStoryItem(this, record, index)).join('');
    
    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px;">Success stories/Case studies, if any</h2>
    ${content}
</div>`;
}

module.exports = {
    renderSuccessStorySection,
};
