function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function renderNicraBasicSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const body = rows.map(r => `
        <tr>
            <td class="l">${esc(r.kvkName || '-')}</td>
            <td>${num(r.rfMmDistrictNormal)}</td>
            <td>${num(r.rfMmDistrictReceived)}</td>
            <td>${num(r.maxTemperature)}</td>
            <td>${num(r.minTemperature)}</td>
            <td>${num(r.dry10)}</td>
            <td>${num(r.dry15)}</td>
            <td>${num(r.dry20)}</td>
            <td>${num(r.intensiveRain)}</td>
            <td>${num(r.waterDepth)}</td>
            <td>${esc(r.endDate ? new Date(r.endDate).toISOString().slice(0,10) : '')}</td>
        </tr>
    `).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
  <style>
    .nicra-basic { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 6.6pt; line-height: 1.2; }
    .nicra-basic th, .nicra-basic td { border: 0.2px solid #000; padding: 2px 3px; text-align: center; vertical-align: middle; word-break: break-word; }
    .nicra-basic .l { text-align: left; }
    .nicra-basic thead th { background: #fff; font-weight: bold; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <table class="nicra-basic">
    <thead>
      <tr>
        <th rowspan="2">KVKs Name</th>
        <th colspan="4">Districts data</th>
        <th colspan="3">Dry spell/ drought</th>
        <th colspan="1">NICRA Adopted village</th>
        <th colspan="2">Flood</th>
      </tr>
      <tr>
        <th>RF (mm) district Normal</th>
        <th>RF (mm) district Received</th>
        <th>Temperature 0C Max.</th>
        <th>Temperature 0C Min.</th>
        <th>> 10 days</th>
        <th>> 15 days</th>
        <th>> 20 days</th>
        <th>Intensive rain >60 mm</th>
        <th>Water depth (cm)</th>
        <th>Duration (days)</th>
      </tr>
    </thead>
    <tbody>
      ${body}
    </tbody>
  </table>
</div>`;
}

module.exports = { renderNicraBasicSection };
