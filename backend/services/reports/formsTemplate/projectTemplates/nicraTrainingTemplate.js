function esc(t) { if (t === null || t === undefined) return ''; const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(t).replace(/[&<>"']/g, c => m[c]); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }
function d(dt) { if (!dt) return ''; const s = new Date(dt); return isNaN(s) ? '' : s.toISOString().slice(0, 10); }

function renderNicraTrainingSection(section, data, sectionId, isFirstSection) {
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    if (rows.length === 0) { return this._generateEmptySection(section, null, sectionId, isFirstSection); }
    const body = rows.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td class="l">${esc(r.titleOfTraining || '')}</td>
      <td>${esc(d(r.startDate))} to ${esc(d(r.endDate))}</td>
      <td>${n(r.durationDays)}</td>
      <td>${esc(r.campusType === 'ON_CAMPUS' ? 'On-campus' : (r.campusType === 'OFF_CAMPUS' ? 'Off-campus' : (r.campusType || '')))}</td>
      <td>${n(r.genM)}</td><td>${n(r.genF)}</td><td>${n(r.genT)}</td>
      <td>${n(r.obcM)}</td><td>${n(r.obcF)}</td><td>${n(r.obcT)}</td>
      <td>${n(r.scM)}</td><td>${n(r.scF)}</td><td>${n(r.scT)}</td>
      <td>${n(r.stM)}</td><td>${n(r.stF)}</td><td>${n(r.stT)}</td>
      <td>${n(r.totM)}</td><td>${n(r.totF)}</td><td>${n(r.totT)}</td>
    </tr>
  `).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>
    .nicra-train { width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
    .nicra-train th,.nicra-train td { border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nicra-train thead th { background:#fff; font-weight:bold; }
    .nicra-train .l { text-align:left; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <table class="nicra-train">
    <thead>
      <tr>
        <th rowspan="2">S.No.</th>
        <th rowspan="2">Title of the training course</th>
        <th rowspan="2">Period of Training program</th>
        <th rowspan="2">Duration</th>
        <th rowspan="2">Training Type</th>
        <th colspan="3">General</th>
        <th colspan="3">OBC</th>
        <th colspan="3">SC</th>
        <th colspan="3">ST</th>
        <th colspan="3">Total</th>
      </tr>
      <tr>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
        <th>M</th><th>F</th><th>T</th>
      </tr>
    </thead>
    <tbody>
      ${body}
    </tbody>
  </table>
</div>`;
}

module.exports = { renderNicraTrainingSection };
