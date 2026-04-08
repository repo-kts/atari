const { resolveCelebrationDaysMatrixPayload } = require('../../../../repositories/reports/celebrationDaysReport/celebrationDaysReportRepository.js');

function esc(t) {
    if (t === null || t === undefined) return '';
    const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(t).replace(/[&<>"']/g, (c) => m[c]);
}

function fmtInt(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return String(Math.round(n));
}

function tableCss() {
    return `
  .cd-mx-wrap { width:100%; font-size:5pt; line-height:1.12; }
  .cd-mx-tbl { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:12px; page-break-inside:avoid; }
  .cd-mx-tbl th, .cd-mx-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; text-align:center; word-break:break-word; }
  .cd-mx-tbl thead th { background:#e8e8e8; font-weight:bold; }
  .cd-mx-tbl .l { text-align:left; }
`;
}

const SUB_LABELS = ['No. of KVKs celebrate', 'No. of Activities', 'No. of Participants'];

function subHeadRow() {
    return SUB_LABELS.map((lab) => `<th>${esc(lab)}</th>`).join('');
}

function renderCelebrationDaysStateMatrixReportSection(section, data, sectionId, isFirstSection) {
    const payload = resolveCelebrationDaysMatrixPayload(data);
    const stateColumns = payload.stateColumns || [];
    const matrixRows = payload.matrixRows || [];
    const y = payload.yearLabel || '';

    if (!matrixRows.length) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
  <p class="no-data">No important days celebration data for this period.</p>
</div>`;
    }

    const states = stateColumns;
    const topGroup = states.map((s) => `<th colspan="3">${esc(s)}</th>`).join('');
    const subRow = states.map(() => subHeadRow()).join('');

    const body = matrixRows.map((row) => {
        const cells = states.map((st) => {
            const v = row.valuesByState && row.valuesByState[st];
            const kv = v ? v.kvks : 0;
            const act = v ? v.activities : 0;
            const part = v ? v.participants : 0;
            return `<td>${fmtInt(kv)}</td><td>${fmtInt(act)}</td><td>${fmtInt(part)}</td>`;
        }).join('');
        const tot = row.total || {};
        return `
      <tr>
        <td class="l">${esc(row.label)}</td>
        ${cells}
        <td>${fmtInt(tot.kvks)}</td><td>${fmtInt(tot.activities)}</td><td>${fmtInt(tot.participants)}</td>
      </tr>`;
    }).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="cd-mx-wrap">
    <h1 class="section-title">${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}</h1>
    <p style="font-size:6pt; margin:4px 0 8px 0;">${esc(`(Reporting year ${y})`)}</p>
    <table class="cd-mx-tbl">
      <thead>
        <tr>
          <th rowspan="2" class="l">Important Days</th>
          ${topGroup}
          <th colspan="3">Total</th>
        </tr>
        <tr>
          ${subRow}
          ${subHeadRow()}
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  </div>
</div>`;
}

module.exports = {
    renderCelebrationDaysStateMatrixReportSection,
};
