function esc(t){if(t===null||t===undefined)return'';const m={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'};return String(t).replace(/[&<>"']/g,c=>m[c]);}
function n(v){const x=Number(v);return Number.isFinite(x)?x:0;}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function resolveKvkName(row){
    return (row && (row.kvkName || (row.kvk && row.kvk.kvkName)) && String(row.kvkName || row.kvk.kvkName).trim()) || 'Unknown KVK';
}

function resolveStateName(row){
    return (row && (row.stateName || (row.kvk && row.kvk.state && row.kvk.state.stateName)) && String(row.stateName || row.kvk.state.stateName).trim()) || '';
}

function displayRow(r){
    return {
        noOfSoilSamplesCollected: n(r.noOfSoilSamplesCollected),
        noOfSamplesAnalysed: n(r.noOfSamplesAnalysed),
        shcIssued: n(r.shcIssued),
        genM: n(r.genM), genF: n(r.genF), genT: n(r.genT),
        obcM: n(r.obcM), obcF: n(r.obcF), obcT: n(r.obcT),
        scM: n(r.scM), scF: n(r.scF), scT: n(r.scT),
        stM: n(r.stM), stF: n(r.stF), stT: n(r.stT),
        totM: n(r.totM), totF: n(r.totF), totT: n(r.totT),
    };
}

/**
 * Groups NICRA Soil Health Card rows by KVK so admins see each KVK as its own
 * block (KVK name as a header band) and a KVK user sees a single block.
 * @returns {{ groups: {kvkName: string, stateName: string, rows: object[]}[], isMultiKvk: boolean }}
 */
function buildNicraSoilHealthGroups(rawData){
    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byKvk = new Map();
    for (const r of rows) {
        const k = resolveKvkName(r);
        if (!byKvk.has(k)) byKvk.set(k, { stateName: resolveStateName(r), rows: [] });
        byKvk.get(k).rows.push(r);
    }
    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => ({
        kvkName,
        stateName: byKvk.get(kvkName).stateName,
        rows: byKvk.get(kvkName).rows.map((r, i) => ({ sl: i + 1, ...displayRow(r) })),
    }));
    return { groups, isMultiKvk: groups.length > 1 };
}

function headHtml(){
    return `
    <thead>
      <tr>
        <th rowspan="2">S.No.</th>
        <th rowspan="2">No. of soil samples collected</th>
        <th rowspan="2">No. of samples analysed</th>
        <th rowspan="2">SHC issued</th>
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
    </thead>`;
}

function renderNicraSoilHealthSection(section, data, sectionId, isFirstSection){
    const { groups } = buildNicraSoilHealthGroups(data);
    if(groups.length===0){ return this._generateEmptySection(section,null,sectionId,isFirstSection); }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const groupsHtml = groups.map((g) => {
        const body = g.rows.map((r) => `
      <tr>
        <td>${r.sl}</td>
        <td>${r.noOfSoilSamplesCollected}</td>
        <td>${r.noOfSamplesAnalysed}</td>
        <td>${r.shcIssued}</td>
        <td>${r.genM}</td><td>${r.genF}</td><td>${r.genT}</td>
        <td>${r.obcM}</td><td>${r.obcF}</td><td>${r.obcT}</td>
        <td>${r.scM}</td><td>${r.scF}</td><td>${r.scT}</td>
        <td>${r.stM}</td><td>${r.stF}</td><td>${r.stT}</td>
        <td>${r.totM}</td><td>${r.totF}</td><td>${r.totT}</td>
      </tr>`).join('');

        const band = g.stateName ? `${esc(g.kvkName)} — ${esc(g.stateName)}` : esc(g.kvkName);
        return `
  <div class="nicra-shc-group">
    <div class="nicra-shc-kvk-hd">${band}</div>
    <table class="nicra-shc">${headHtml()}
      <tbody>${body}</tbody>
    </table>
  </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
  <style>
    .nicra-shc-group{ page-break-inside:avoid; break-inside:avoid; margin-bottom:8px; }
    .nicra-shc-kvk-hd{ font-size:8pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.2px solid #000; border-bottom:0; page-break-after:avoid; break-after:avoid; }
    .nicra-shc{ width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
    .nicra-shc th,.nicra-shc td{ border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nicra-shc thead th{ background:#e8e8e8; font-weight:bold; }
    .nicra-shc .l{ text-align:left; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  ${groupsHtml}
</div>`;
}

module.exports = { renderNicraSoilHealthSection, buildNicraSoilHealthGroups };
