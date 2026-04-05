/**
 * RAWE/FET/FIT Attachment Training Template
 *
 * Renders a flat table matching the original ATARI website:
 *   KVK | Type of attachment | No. of student trained | No. of days stayed
 *
 * Title: "Details of attachment training (RAWE) through KVK"
 * Bound to reportTemplateService (`this`).
 */

function _computeDays(startDate, endDate) {
    if (!startDate || !endDate) return '-';
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return '-';
    const diffMs = e.getTime() - s.getTime();
    const days = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
    return String(days);
}

function renderRaweFetFitSection(section, data, sectionId, isFirstSection) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    const pageClass = isFirstSection
        ? 'section-page section-page-first'
        : 'section-page section-page-continued';

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title" style="margin-bottom:10px;">Details of attachment training (RAWE) through KVK</h1>
    <table class="data-table" style="width:100%;table-layout:fixed;">
        <colgroup>
            <col style="width:15%;">
            <col style="width:60%;">
            <col style="width:12%;">
            <col style="width:13%;">
        </colgroup>
        <thead>
            <tr>
                <th>KVK</th>
                <th>Type of attachment</th>
                <th>No. of student trained</th>
                <th>No. of days stayed</th>
            </tr>
        </thead>
        <tbody>`;

    if (records.length === 0) {
        html += `
            <tr>
                <td colspan="4" style="text-align:center;color:#666;font-style:italic;padding:12px;">No data available for this section.</td>
            </tr>`;
    }

    records.forEach((row) => {
        const kvk = row.kvk?.kvkName || '-';
        const typeName = row.attachmentType?.name || '-';
        const male = Number(row.maleStudents) || 0;
        const female = Number(row.femaleStudents) || 0;
        const totalStudents = male + female;
        const days = _computeDays(row.startDate, row.endDate);

        html += `
            <tr>
                <td>${this._escapeHtml(kvk)}</td>
                <td style="word-wrap:break-word;word-break:break-word;">${this._escapeHtml(typeName)}</td>
                <td style="text-align:center;">${totalStudents}</td>
                <td style="text-align:center;">${this._escapeHtml(days)}</td>
            </tr>`;
    });

    html += `
        </tbody>
    </table>
</div>`;

    return html;
}

module.exports = { renderRaweFetFitSection };
