function esc(t) { if (t === null || t === undefined) return ''; const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(t).replace(/[&<>"']/g, c => m[c]); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }

const OTHER_KEY = '__other_activities__';

/* ── Row normalizer (handles both repository & form-page field names) ── */
function normalizeRow(r) {
    const genM = n(r.genM ?? r.genMale ?? r.generalM);
    const genF = n(r.genF ?? r.genFemale ?? r.generalF);
    const obcM = n(r.obcM ?? r.obcMale);
    const obcF = n(r.obcF ?? r.obcFemale);
    const scM  = n(r.scM ?? r.scMale);
    const scF  = n(r.scF ?? r.scFemale);
    const stM  = n(r.stM ?? r.stMale);
    const stF  = n(r.stF ?? r.stFemale);
    return {
        ...r,
        trainingTitle: r.trainingTitle || '',
        trainingDate: r.trainingDate || '',
        venue: r.venue || '',
        activityName: r.activityName || (r.activityMaster && r.activityMaster.activityName) || '',
        remarks: r.remarks || '',
        innovativeProgrammeName: r.innovativeProgrammeName || '',
        significanceOfInnovativeProgramme: r.significanceOfInnovativeProgramme || '',
        stateName: r.stateName || (r.kvk && r.kvk.state && r.kvk.state.stateName) || '',
        kvkName: r.kvkName || (r.kvk && r.kvk.kvkName) || '',
        genM, genF, genT: genM + genF,
        obcM, obcF, obcT: obcM + obcF,
        scM,  scF,  scT:  scM  + scF,
        stM,  stF,  stT:  stM  + stF,
        totM: genM + obcM + scM + stM,
        totF: genF + obcF + scF + stF,
        totT: (genM + obcM + scM + stM) + (genF + obcF + scF + stF),
    };
}

function isOtherRow(r) {
    return (!r.trainingTitle && !r.trainingDate && !r.venue);
}

/**
 * Build dynamic grouped structure from either:
 *   – a pre-grouped object from the report repository  { activityGroups, activityOrder, activityNames, stateAggregates }
 *   – a flat array of PhysicalInfo records from the form page
 */
function buildGroupedData(data) {
    // Already grouped (from report data service)
    if (data && !Array.isArray(data) && data.activityGroups) {
        return data;
    }
    // Flat array (from form page export)
    const flatRows = Array.isArray(data) ? data : (data ? [data] : []);
    const activityGroups = {};
    const activityOrder = [];
    const stateMap = new Map();

    for (const raw of flatRows) {
        const r = normalizeRow(raw);
        const key = isOtherRow(r) ? OTHER_KEY : (r.activityName || 'Uncategorised');
        if (!activityGroups[key]) {
            activityGroups[key] = [];
            activityOrder.push(key);
        }
        activityGroups[key].push(r);

        const stKey = r.stateName || '-';
        if (!stateMap.has(stKey)) {
            stateMap.set(stKey, { stateName: stKey, totalProgrammes: 0, totM: 0, totF: 0, totT: 0, other: 0 });
        }
        const agg = stateMap.get(stKey);
        if (isOtherRow(r)) {
            agg.other += 1;
        } else {
            const aName = r.activityName || 'Uncategorised';
            if (agg[aName] === undefined) agg[aName] = 0;
            agg[aName] += 1;
        }
        agg.totalProgrammes += 1;
        agg.totM += n(r.totM);
        agg.totF += n(r.totF);
        agg.totT += n(r.totT);
    }
    const activityNames = activityOrder.filter(k => k !== OTHER_KEY);
    const stateAggregates = Array.from(stateMap.values()).sort((a, b) => a.stateName.localeCompare(b.stateName));
    return { activityGroups, activityOrder, activityNames, stateAggregates };
}

/* ── CSS ── */
function tableCss() {
    return `
  .nfpi{ width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
  .nfpi th,.nfpi td{ border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
  .nfpi .l{ text-align:left; }
  .nfpi thead th{ font-weight:bold; }
`;
}

/* ── State-wise aggregate table (dynamic activity columns) ── */
function renderAggregateTop(stateAggregates, activityNames) {
    if (!Array.isArray(stateAggregates) || stateAggregates.length === 0) return '';
    const actCols = Array.isArray(activityNames) && activityNames.length > 0 ? activityNames : [];
    const headerCells = actCols.map(a => `<th>${esc(a)}</th>`).join('');
    const body = stateAggregates.map((r, i) => {
        const actCells = actCols.map(a => `<td>${n(r[a])}</td>`).join('');
        return `
    <tr>
      <td>${i + 1}</td>
      <td class="l">${esc(r.stateName || '')}</td>
      ${actCells}
      <td>${n(r.other)}</td>
      <td>${n(r.totalProgrammes)}</td>
      <td>${n(r.totM)}</td>
      <td>${n(r.totF)}</td>
      <td>${n(r.totT)}</td>
    </tr>`;
    }).join('');
    return `
    <h2 class="sub-title">State-wise overall Physical Information</h2>
    <table class="nfpi">
      <thead>
        <tr>
          <th>S.No.</th>
          <th>State</th>
          ${headerCells}
          <th>Other activities</th>
          <th>Total programmes</th>
          <th>Total M</th>
          <th>Total F</th>
          <th>Total T</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

/* ── Activity detail table (same layout for every dynamic activity) ── */
function renderActivityBlock(title, rows) {
    if (!rows || rows.length === 0) return '';
    const body = rows.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td class="l">${esc(r.trainingTitle || r.activityName || '')}</td>
      <td>${esc(r.trainingDate || '')}</td>
      <td class="l">${esc(r.venue || '')}</td>
      <td>${n(r.genM)}</td><td>${n(r.genF)}</td><td>${n(r.genT)}</td>
      <td>${n(r.obcM)}</td><td>${n(r.obcF)}</td><td>${n(r.obcT)}</td>
      <td>${n(r.scM)}</td><td>${n(r.scF)}</td><td>${n(r.scT)}</td>
      <td>${n(r.stM)}</td><td>${n(r.stF)}</td><td>${n(r.stT)}</td>
      <td>${n(r.totM)}</td><td>${n(r.totF)}</td><td>${n(r.totT)}</td>
      <td class="l">${esc(r.remarks || '')}</td>
    </tr>
  `).join('');
    return `
    <h2 class="sub-title">${esc(title)}</h2>
    <table class="nfpi">
      <thead>
        <tr>
          <th rowspan="2">S.No.</th>
          <th rowspan="2">Title of Natural Farming ${esc(title)} programme</th>
          <th rowspan="2">Date of programme</th>
          <th rowspan="2">Venue of programme</th>
          <th colspan="3">General</th>
          <th colspan="3">OBC</th>
          <th colspan="3">SC</th>
          <th colspan="3">ST</th>
          <th colspan="3">Total</th>
          <th rowspan="2">Remarks/ Observation/Feedback Recorded</th>
        </tr>
        <tr>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
          <th>M</th><th>F</th><th>T</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

/* ── "Other activities" block (different column layout) ── */
function renderOtherActivitiesBlock(rows) {
    if (!rows || rows.length === 0) return '';
    const body = rows.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td class="l">${esc(r.innovativeProgrammeName || '')}</td>
      <td class="l">${esc(r.significanceOfInnovativeProgramme || '')}</td>
      <td class="l">${esc(r.remarks || '')}</td>
    </tr>
  `).join('');
    return `
    <h2 class="sub-title">Other activities</h2>
    <table class="nfpi">
      <thead>
        <tr>
          <th>S.No.</th>
          <th>Name of the Innovative programme organized</th>
          <th>Significance of innovative programme</th>
          <th>Remarks/Observation/Feedback Recorded</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

/* ── Main render function ── */
function renderNaturalFarmingPhysicalSection(section, data, sectionId, isFirstSection) {
    const resolved = buildGroupedData(data);
    const activityGroups = resolved.activityGroups || {};
    const activityOrder = resolved.activityOrder || [];
    const activityNames = resolved.activityNames || [];
    const stateAggregates = resolved.stateAggregates || [];

    // Dynamically render one block per activity category (in insertion order)
    const activityBlocksHtml = activityOrder.map(key => {
        if (key === OTHER_KEY) {
            return renderOtherActivitiesBlock(activityGroups[key]);
        }
        return renderActivityBlock(key, activityGroups[key]);
    }).join('');

    return `
<div id="${sectionId}" class="${isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued'}">
  <style>${tableCss()}</style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  ${renderAggregateTop(stateAggregates, activityNames)}
  ${activityBlocksHtml}
</div>`;
}

module.exports = { renderNaturalFarmingPhysicalSection };
