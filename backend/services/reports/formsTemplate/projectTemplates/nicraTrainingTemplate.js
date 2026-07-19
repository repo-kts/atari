function esc(t) { if (t === null || t === undefined) return ''; const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(t).replace(/[&<>"']/g, c => m[c]); }
function n(v) { const x = Number(v); return Number.isFinite(x) ? x : 0; }
function d(dt) { if (!dt) return ''; const s = new Date(dt); return isNaN(s) ? '' : s.toISOString().slice(0, 10); }

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function campusLabel(v) {
    if (v === 'ON_CAMPUS') return 'On-campus';
    if (v === 'OFF_CAMPUS') return 'Off-campus';
    return v || '';
}

function displayRow(r) {
    return {
        title: r.titleOfTraining || r.trainingTitle || '',
        period: `${d(r.startDate)} to ${d(r.endDate)}`,
        duration: n(r.durationDays),
        type: campusLabel(r.campusType),
        genM: n(r.genM), genF: n(r.genF), genT: n(r.genT),
        obcM: n(r.obcM), obcF: n(r.obcF), obcT: n(r.obcT),
        scM: n(r.scM), scF: n(r.scF), scT: n(r.scT),
        stM: n(r.stM), stF: n(r.stF), stT: n(r.stT),
        totM: n(r.totM), totF: n(r.totF), totT: n(r.totT),
    };
}

/**
 * Groups NICRA training rows by KVK so admins see each KVK as its own block and
 * a KVK user sees a single block — the KVK name shows as a header band.
 * @returns {{ groups: {kvkName: string, rows: object[]}[], isMultiKvk: boolean }}
 */
function buildNicraTrainingGroups(rawData) {
    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    const byKvk = new Map();
    for (const r of rows) {
        const k = (r && (r.kvkName || (r.kvk && r.kvk.kvkName)) && String(r.kvkName || r.kvk.kvkName).trim()) || 'Unknown KVK';
        if (!byKvk.has(k)) byKvk.set(k, []);
        byKvk.get(k).push(r);
    }
    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => ({
        kvkName,
        rows: byKvk.get(kvkName).map((r, i) => ({ sl: i + 1, ...displayRow(r) })),
    }));
    return { groups, isMultiKvk: groups.length > 1 };
}

// Wide Title/Period columns; the caste M/F/T cells are numeric so they shrink.
function kvkColGroup() {
    return `
    <colgroup>
      <col style="width:3.5%" />
      <col style="width:23%" />
      <col style="width:13%" />
      <col style="width:6.5%" />
      <col style="width:9%" />
      ${Array.from({ length: 15 }).map(() => '<col style="width:3%" />').join('')}
    </colgroup>`;
}

function stateColGroup() {
    return `
    <colgroup>
      <col style="width:16%" />
      <col style="width:10%" />
      ${Array.from({ length: 15 }).map(() => '<col style="width:4.9%" />').join('')}
    </colgroup>`;
}

function headHtml() {
    return `
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
    </thead>`;
}

// ── Superadmin view: state-wise participant summary ─────────────────────────
const CASTE_KEYS = ['genM', 'genF', 'obcM', 'obcF', 'scM', 'scF', 'stM', 'stF', 'totM', 'totF'];

function emptyCaste() {
    const z = { count: 0 };
    for (const k of CASTE_KEYS) z[k] = 0;
    return z;
}

function addCaste(z, r) {
    z.count += 1;
    for (const k of CASTE_KEYS) z[k] += n(r[k]);
}

function casteDerived(z) {
    return {
        ...z,
        genT: z.genM + z.genF,
        obcT: z.obcM + z.obcF,
        scT: z.scM + z.scF,
        stT: z.stM + z.stF,
        totT: z.totM + z.totF,
    };
}

function stateHeadHtml(labelCol, countCol) {
    return `
    <thead>
      <tr>
        <th rowspan="2" class="l">${esc(labelCol)}</th>
        <th rowspan="2">${esc(countCol)}</th>
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

function casteRowCells(r) {
    return `
        <td>${r.genM}</td><td>${r.genF}</td><td>${r.genT}</td>
        <td>${r.obcM}</td><td>${r.obcF}</td><td>${r.obcT}</td>
        <td>${r.scM}</td><td>${r.scF}</td><td>${r.scT}</td>
        <td>${r.stM}</td><td>${r.stF}</td><td>${r.stT}</td>
        <td>${r.totM}</td><td>${r.totF}</td><td>${r.totT}</td>`;
}

function renderTrainingStateView(ctx, section, sectionId, isFirstSection, rows) {
    const byState = new Map();
    const grand = emptyCaste();
    for (const r of rows) {
        const st = (r && r.stateName && String(r.stateName).trim()) || 'Unknown';
        if (!byState.has(st)) byState.set(st, emptyCaste());
        addCaste(byState.get(st), r);
        addCaste(grand, r);
    }
    const states = [...byState.keys()].sort(sortStr);
    const body = states.map((st) => {
        const d = casteDerived(byState.get(st));
        return `
      <tr>
        <td class="l">${esc(st)}</td>
        <td>${d.count}</td>
        ${casteRowCells(d)}
      </tr>`;
    }).join('');
    const g = casteDerived(grand);
    const grandRow = `
      <tr class="grand">
        <td class="l">Grand Total</td>
        <td>${g.count}</td>
        ${casteRowCells(g)}
      </tr>`;

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';
    return `
<div id="${sectionId}" class="${pageClass}">
  <style>
    .nicra-train { width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.4pt; line-height:1.15; }
    .nicra-train th,.nicra-train td { border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nicra-train thead th { background:#e8e8e8; font-weight:bold; }
    .nicra-train .l { text-align:left; }
    .nicra-train .grand td { font-weight:bold; background:#f5f5f5; }
  </style>
  <h1 class="section-title">${section.id} ${ctx._escapeHtml(section.title)}</h1>
  <table class="nicra-train">${stateColGroup()}${stateHeadHtml('State', 'No. of Trainings')}
    <tbody>${body}${grandRow}</tbody>
  </table>
</div>`;
}

function renderNicraTrainingSection(section, data, sectionId, isFirstSection, reportContext = {}) {
    if (reportContext.isAggregatedView) {
        const rows = Array.isArray(data) ? data : (data ? [data] : []);
        if (rows.length === 0) { return this._generateEmptySection(section, null, sectionId, isFirstSection); }
        return renderTrainingStateView(this, section, sectionId, isFirstSection, rows);
    }

    const { groups } = buildNicraTrainingGroups(data);
    if (groups.length === 0) { return this._generateEmptySection(section, null, sectionId, isFirstSection); }

    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const groupsHtml = groups.map((g) => {
        const body = g.rows.map((r) => `
      <tr>
        <td>${r.sl}</td>
        <td class="l">${esc(r.title)}</td>
        <td>${esc(r.period)}</td>
        <td>${r.duration}</td>
        <td>${esc(r.type)}</td>
        <td>${r.genM}</td><td>${r.genF}</td><td>${r.genT}</td>
        <td>${r.obcM}</td><td>${r.obcF}</td><td>${r.obcT}</td>
        <td>${r.scM}</td><td>${r.scF}</td><td>${r.scT}</td>
        <td>${r.stM}</td><td>${r.stF}</td><td>${r.stT}</td>
        <td>${r.totM}</td><td>${r.totF}</td><td>${r.totT}</td>
      </tr>`).join('');

        return `
  <div class="nicra-train-group">
    <div class="nicra-train-kvk-hd">${esc(g.kvkName)}</div>
    <table class="nicra-train">${kvkColGroup()}${headHtml()}
      <tbody>${body}</tbody>
    </table>
  </div>`;
    }).join('');

    return `
<div id="${sectionId}" class="${pageClass}">
  <style>
    .nicra-train-group { page-break-inside:avoid; break-inside:avoid; margin-bottom:8px; }
    .nicra-train-kvk-hd { font-size:8pt; font-weight:bold; background:#dce6f1; padding:3px 5px; border:0.2px solid #000; border-bottom:0; page-break-after:avoid; break-after:avoid; }
    .nicra-train { width:100%; table-layout:fixed; border-collapse:collapse; font-size:6.2pt; line-height:1.15; }
    .nicra-train th,.nicra-train td { border:0.2px solid #000; padding:2px 3px; text-align:center; vertical-align:middle; word-break:break-word; }
    .nicra-train thead th { background:#e8e8e8; font-weight:bold; }
    .nicra-train .l { text-align:left; }
  </style>
  <h1 class="section-title">${section.id} ${this._escapeHtml(section.title)}</h1>
  ${groupsHtml}
</div>`;
}

module.exports = { renderNicraTrainingSection, buildNicraTrainingGroups };
