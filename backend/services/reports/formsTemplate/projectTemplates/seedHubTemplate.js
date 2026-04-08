function esc(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

function renderSeedHubSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }
    const body = rows.map(r => `
        <tr>
            <td class="l">${esc(r.kvkName || '-')}</td>
            <td>${esc(r.season || '')}</td>
            <td class="l">${esc(r.cropName || '')}</td>
            <td class="l">${esc(r.varietyName || '')}</td>
            <td>${num(r.areaCoveredHa)}</td>
            <td>${num(r.yieldQPerHa)}</td>
            <td>${num(r.quantityProducedQ)}</td>
            <td>${num(r.quantitySaleOutQ)}</td>
            <td>${num(r.farmersPurchased)}</td>
            <td>${num(r.quantitySaleToFarmersQ)}</td>
            <td>${num(r.villagesCovered)}</td>
            <td>${num(r.quantitySaleToOtherOrgQ)}</td>
            <td>${num(r.amountGeneratedLakh)}</td>
            <td>${num(r.totalAmountPresentLakh)}</td>
        </tr>
    `).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>
    .seedhub { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 6.2pt; line-height: 1.15; }
    .seedhub th, .seedhub td { border: 0.2px solid #000; padding: 2px 3px; text-align: center; vertical-align: middle; word-break: break-word; }
    .seedhub thead th { background: #fff; font-weight: bold; }
    .seedhub .l { text-align: left; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <table class="seedhub">
    <thead>
      <tr>
        <th>KVK</th>
        <th>Season</th>
        <th>Name of crop taken under seed production</th>
        <th>Name of variety taken under seed production</th>
        <th>Crop and variety wise area (ha) covered under seed production</th>
        <th>Crop and variety wise Yield (Q/ha)</th>
        <th>Crop and variety wise quantity of seed produced (Q)</th>
        <th>Crop and variety wise quantity of seed sale out (Q)</th>
        <th>Crop and variety wise number of farmers purchased seed from KVK</th>
        <th>Quantity of seed sale out to farmers (Q)</th>
        <th>No of village covered through sale of seed</th>
        <th>Quantity of seed sale out to other organization (Q)</th>
        <th>Amount generated (Lakh)</th>
        <th>Total amount (Lakh) in Seed Hub project presently</th>
      </tr>
    </thead>
    <tbody>
      ${body}
    </tbody>
  </table>
</div>`;
}

module.exports = { renderSeedHubSection };
