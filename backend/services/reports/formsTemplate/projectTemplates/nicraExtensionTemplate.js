function esc(t) { if (t === null || t === undefined) return ''; const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(t).replace(/[&<>"']/g, c => m[c]); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }

function pickFirst(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return '';
}

function resolveStateName(row) {
  return pickFirst(
    row?.stateName,
    row?.state,
    row?.kvk?.stateName,
    row?.kvk?.state?.stateName,
    row?.kvks?.stateName,
    row?.kvks?.state?.stateName
  );
}

function resolveKvkName(row) {
  return pickFirst(
    row?.kvkName,
    row?.kvk?.kvkName,
    row?.kvks?.kvkName
  );
}

function normalizeRow(r) {
  // Supports aggregated rows and raw module rows
  if (r && (r.generalM !== undefined || r.genMale !== undefined)) {
    const genM = Number(r.genM ?? r.genMale ?? r.generalM ?? 0);
    const genF = Number(r.genF ?? r.genFemale ?? r.generalF ?? 0);
    const obcM = Number(r.obcM ?? r.obcMale ?? 0);
    const obcF = Number(r.obcF ?? r.obcFemale ?? 0);
    const scM = Number(r.scM ?? r.scMale ?? 0);
    const scF = Number(r.scF ?? r.scFemale ?? 0);
    const stM = Number(r.stM ?? r.stMale ?? 0);
    const stF = Number(r.stF ?? r.stFemale ?? 0);
    const genT = genM + genF, obcT = obcM + obcF, scT = scM + scF, stT = stM + stF;
    const totM = genM + obcM + scM + stM;
    const totF = genF + obcF + scF + stF;
    return {
      stateName: resolveStateName(r),
      kvkName: resolveKvkName(r),
      activityName: r.activityName || r.activity || '',
      numProgrammes: Number(r.numProgrammes ?? 1),
      genM, genF, genT, obcM, obcF, obcT, scM, scF, scT, stM, stF, stT, totM, totF, totT: totM + totF,
    };
  }
  return r;
}

function renderNicraExtensionSection(section, data, sectionId, isFirstSection) {
  const rowsRaw = Array.isArray(data) ? data : (data ? [data] : []);
  const rows = rowsRaw.map(normalizeRow);
  if (rows.length === 0) { return this._generateEmptySection(section, null, sectionId, isFirstSection); }
  const body = rows.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td class="l">${esc(r.stateName || '')}</td>
      <td class="l">${esc(r.kvkName || '')}</td>
      <td class="l">${esc(r.activityName || '')}</td>
      <td>${n(r.numProgrammes)}</td>
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
    .nicra-ext { width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
    .nicra-ext th,.nicra-ext td { border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nicra-ext thead th { background:#fff; font-weight:bold; }
    .nicra-ext .l { text-align:left; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  <table class="nicra-ext">
    <thead>
      <tr>
        <th rowspan="2">S.No.</th>
        <th rowspan="2">State</th>
        <th rowspan="2">KVK</th>
        <th rowspan="2">Name of the activity</th>
        <th rowspan="2">Number of Programmes</th>
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

module.exports = { renderNicraExtensionSection };
