/**
 * Special Programme Template
 * Handles rendering the Special Programme section (Section 10.20)
 */

function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function formatCurrency(value) {
    const n = toNumber(value, 0);
    return `Rs.${n.toLocaleString('en-IN')}/-`;
}

function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toISOString().split('T')[0];
}

function renderSpecialProgrammeTable(ctx, records) {
    const headers = `
        <tr>
            <th style="width: 50px;">Sr.No.</th>
            <th style="width: 150px;">Programme Type</th>
            <th style="width: 250px;">Name of the Programme/Scheme</th>
            <th>Purpose of programme</th>
            <th style="width: 100px;">Date/Month of initiation</th>
            <th style="width: 150px;">Funding agency</th>
            <th style="width: 120px;">Amount(Rs.)</th>
        </tr>`;

    const rows = records.map((record, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${ctx._escapeHtml(record.programmeType)}</td>
            <td>${ctx._escapeHtml(record.programmeName)}</td>
            <td>${ctx._escapeHtml(record.programmePurpose)}</td>
            <td style="text-align: center;">${formatDate(record.initiationDate)}</td>
            <td>${ctx._escapeHtml(record.fundingAgency)}</td>
            <td style="text-align: right;">${formatCurrency(record.amount)}</td>
        </tr>`).join('');

    return `
    <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>${headers}</thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function renderSpecialProgrammeSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    // Normalize data - handle both single record and array
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    
    if (records.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    
    return `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
    <h2 class="about-kvk-heading" style="text-align: left; margin-bottom: 15px;">List of Special Programmes Undertaken by the KVK</h2>
    ${renderSpecialProgrammeTable(this, records)}
</div>`;
}

module.exports = {
    renderSpecialProgrammeSection,
};
