const {
    resolveWorldSoilDayGroupedPayload,
    resolveWorldSoilDayStateSummaryPayload,
} = require('../../../../repositories/reports/worldSoilDayReport/worldSoilDayReportRepository.js');

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
  .wsd-page-wrap { width:100%; font-size:6pt; line-height:1.15; }
  .wsd-group { margin-bottom:8px; page-break-inside:avoid; break-inside:avoid; }
  .wsd-kvk-hd { font-size:7.5pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.35pt solid #000; border-bottom:0; margin:8px 0 0 0; page-break-after:avoid; break-after:avoid; }
  .wsd-page-tbl { width:100%; border-collapse:collapse; table-layout:fixed; }
  .wsd-page-tbl th, .wsd-page-tbl td { border:0.35pt solid #000; padding:2px 3px; vertical-align:middle; word-wrap:break-word; overflow-wrap:anywhere; }
  .wsd-page-tbl thead th { background:#e8e8e8; font-weight:bold; text-align:center; }
  .wsd-page-tbl .c { text-align:center; }
  .wsd-page-tbl .l { text-align:left; }
  .wsd-page-tbl .sub { font-weight:bold; background:#f1f5f9; }
  .wsd-page-tbl .grand { font-weight:bold; background:#f5f5f5; }
`;
}

function colGroup() {
    // 19 columns. Number cells kept tight; VIP name(s) gets the widest share.
    return `
  <colgroup>
    <col style="width:3%" />
    <col style="width:5%" />
    <col style="width:6%" />
    <col style="width:6%" />
    <col style="width:3.5%" /><col style="width:3.5%" /><col style="width:3.5%" />
    <col style="width:3.5%" /><col style="width:3.5%" /><col style="width:3.5%" />
    <col style="width:3.5%" /><col style="width:3.5%" /><col style="width:3.5%" />
    <col style="width:3.5%" /><col style="width:3.5%" /><col style="width:3.5%" />
    <col style="width:4%" />
    <col style="width:28%" />
    <col style="width:6%" />
  </colgroup>`;
}

function headHtml() {
    return `
      <thead>
        <tr>
          <th rowspan="3">Sl.</th>
          <th rowspan="3">Year</th>
          <th rowspan="3">No. of Activity conducted</th>
          <th rowspan="3">Soil Health Cards distributed</th>
          <th colspan="12">No. of Farmers Benefitted</th>
          <th rowspan="3">No. of VIPs</th>
          <th rowspan="3" class="l">Name(s) of VIP(s) involved if any</th>
          <th rowspan="3">Total No. of Participants attended the program</th>
        </tr>
        <tr>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
        </tr>
        <tr>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
        </tr>
      </thead>`;
}

function dataRow(r) {
    return `
      <tr>
        <td class="c">${fmtInt(r.sl)}</td>
        <td class="c">${esc(r.year || '—')}</td>
        <td class="c">${fmtInt(r.activitiesConducted)}</td>
        <td class="c">${fmtInt(r.soilHealthCards)}</td>
        <td class="c">${fmtInt(r.genM)}</td><td class="c">${fmtInt(r.genF)}</td><td class="c">${fmtInt(r.genT)}</td>
        <td class="c">${fmtInt(r.obcM)}</td><td class="c">${fmtInt(r.obcF)}</td><td class="c">${fmtInt(r.obcT)}</td>
        <td class="c">${fmtInt(r.scM)}</td><td class="c">${fmtInt(r.scF)}</td><td class="c">${fmtInt(r.scT)}</td>
        <td class="c">${fmtInt(r.stM)}</td><td class="c">${fmtInt(r.stF)}</td><td class="c">${fmtInt(r.stT)}</td>
        <td class="c">${fmtInt(r.vipCount)}</td>
        <td class="l">${esc(r.vipNames)}</td>
        <td class="c">${fmtInt(r.participants)}</td>
      </tr>`;
}

function totalRow(r, cls) {
    return `
      <tr class="${cls}">
        <td class="l" colspan="2">${esc(r.label)}</td>
        <td class="c">${fmtInt(r.activitiesConducted)}</td>
        <td class="c">${fmtInt(r.soilHealthCards)}</td>
        <td class="c">${fmtInt(r.genM)}</td><td class="c">${fmtInt(r.genF)}</td><td class="c">${fmtInt(r.genT)}</td>
        <td class="c">${fmtInt(r.obcM)}</td><td class="c">${fmtInt(r.obcF)}</td><td class="c">${fmtInt(r.obcT)}</td>
        <td class="c">${fmtInt(r.scM)}</td><td class="c">${fmtInt(r.scF)}</td><td class="c">${fmtInt(r.scT)}</td>
        <td class="c">${fmtInt(r.stM)}</td><td class="c">${fmtInt(r.stF)}</td><td class="c">${fmtInt(r.stT)}</td>
        <td class="c">${fmtInt(r.vipCount)}</td>
        <td class="l"></td>
        <td class="c">${fmtInt(r.participants)}</td>
      </tr>`;
}

function renderGroup(g, showKvkHeader) {
    const body = g.rows.map((r) => dataRow(r)).join('');
    const sub = totalRow(g.subtotal, 'sub');
    const kvkHd = showKvkHeader ? `<div class="wsd-kvk-hd">${esc(g.kvkName)}</div>` : '';
    return `
    <div class="wsd-group">${kvkHd}
      <table class="wsd-page-tbl">${colGroup()}${headHtml()}
        <tbody>${body}${sub}</tbody>
      </table>
</div>`;
}

function renderStateSummary(payload) {
    const rows = [...(payload.rows || []), payload.grandTotal].filter(Boolean);
    const body = rows.map((r) => {
        const isTotal = r.stateName === 'Total';
        return `
      <tr${isTotal ? ' class="grand"' : ''}>
        <td class="l">${esc(r.stateName)}</td>
        <td class="c">${fmtInt(r.noOfKvks)}</td>
        <td class="c">${fmtInt(r.activitiesConducted)}</td>
        <td class="c">${fmtInt(r.farmersBenefitted)}</td>
        <td class="c">${fmtInt(r.participants)}</td>
      </tr>`;
    }).join('');

    return `
    <table class="wsd-page-tbl wsd-state-summary">
      <colgroup>
        <col style="width:22%" />
        <col style="width:14%" />
        <col style="width:21%" />
        <col style="width:21%" />
        <col style="width:22%" />
      </colgroup>
      <thead>
        <tr>
          <th class="l">State</th>
          <th>No. of KVKs</th>
          <th>No. of activities conducted</th>
          <th>No. of farmers benefited</th>
          <th>Total number of participants</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

function renderWorldSoilDayPageReportSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    const useStateSummary = Boolean(
        reportContext.isAggregatedView
        || (reportContext.isStandalone && reportContext.isAggregatedReport),
    );
    if (useStateSummary) {
        const payload = resolveWorldSoilDayStateSummaryPayload(data);
        const isPromotedFeature = section.featureNumber && section.id === section.featureNumber;
        const headingTag = isPromotedFeature ? 'h2' : 'h1';
        const headingClass = isPromotedFeature ? 'section-subtitle' : 'section-title';
        const headingText = `${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}`;

        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="wsd-page-wrap">
    <${headingTag} class="${headingClass}">${headingText}</${headingTag}>
    ${renderStateSummary(payload)}
  </div>
</div>`;
    }

    const payload = resolveWorldSoilDayGroupedPayload(data);
    const groups = payload.groups || [];
    const isPromotedFeature = section.featureNumber && section.id === section.featureNumber;
    const headingTag = isPromotedFeature ? 'h2' : 'h1';
    const headingClass = isPromotedFeature ? 'section-subtitle' : 'section-title';
    const headingText = `${this._escapeHtml(section.id)} ${this._escapeHtml(section.title)}`;

    if (groups.length === 0) {
        return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <${headingTag} class="${headingClass}">${headingText}</${headingTag}>
  <p class="no-data">No World Soil Day celebration data for this period.</p>
</div>`;
    }

    const showKvkHeader = payload.isMultiKvk;
    const groupsHtml = groups.map((g) => renderGroup(g, showKvkHeader)).join('');

    const grandHtml = payload.isMultiKvk
        ? `
    <div class="wsd-group">
      <table class="wsd-page-tbl">${colGroup()}${headHtml()}
        <tbody>${totalRow(payload.grandTotal, 'grand')}</tbody>
      </table>
    </div>`
        : '';

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <div class="wsd-page-wrap">
    <${headingTag} class="${headingClass}">${headingText}</${headingTag}>
    ${groupsHtml}
    ${grandHtml}
  </div>
</div>`;
}

module.exports = {
    renderWorldSoilDayPageReportSection,
};
