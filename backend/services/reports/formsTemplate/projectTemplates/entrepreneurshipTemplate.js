/**
 * Entrepreneurship Template
 * Handles rendering the Entrepreneurship section (Section 10.2)
 */

function renderEntrepreneurshipTable(ctx, record, index) {
    return `
    <div class="entrepreneurship-item" style="${index > 0 ? 'margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 20px;' : ''}">
        <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <tbody>
                <tr>
                    <td style="width: 50%; font-weight: 500;">Name of the entrepreneur/ Name of the enterprise/firm</td>
                    <td>${ctx._escapeHtml(record.entrepreneurName)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Registered address of the entrepreneur/firm</td>
                    <td>${ctx._escapeHtml(record.registeredAddress)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Year of establishment</td>
                    <td>${record.yearOfEstablishment}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Type of Enterprise</td>
                    <td>${ctx._escapeHtml(record.enterpriseType)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Registration details</td>
                    <td>${ctx._escapeHtml(record.registrationDetails)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">No of members associated</td>
                    <td>${record.membersAssociated}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Technical components of the enterprise (with commodity)</td>
                    <td>${ctx._escapeHtml(record.technicalComponents)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Annual Income/revenue of the enterprise</td>
                    <td>${record.annualIncome}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Role of KVK/Technology backstopping(quantitative data support)</td>
                    <td>${ctx._escapeHtml(record.kvkRole)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Period/Timeline of the entrepreneurship development</td>
                    <td>${ctx._escapeHtml(record.developmentTimeline)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Economic and Social status of entrepreneur before and after the enterprise</td>
                    <td>${ctx._escapeHtml(record.statusBeforeAfter)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Present working condition of enterprise in terms of raw materials availability, labour availability, consumer preference, marketing the product etc. (Economic viability of the enterprise)</td>
                    <td>${ctx._escapeHtml(record.presentWorkingCondition)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Major achievements</td>
                    <td>${ctx._escapeHtml(record.majorAchievements)}</td>
                </tr>
                <tr>
                    <td style="font-weight: 500;">Major constraints</td>
                    <td>${ctx._escapeHtml(record.majorConstraints)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
}

function renderEntrepreneurshipSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    const content = records.map((record, index) => renderEntrepreneurshipTable(this, record, index)).join('');
    
    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 20px;">Details of entrepreneurship/startup developed by KVK</h2>
    ${content}
</div>`;
}

module.exports = {
    renderEntrepreneurshipSection,
};
