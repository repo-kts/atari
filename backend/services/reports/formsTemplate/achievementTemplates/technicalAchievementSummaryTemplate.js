/**
 * Technical Achievement Summary (§2.1).
 * Target vs Achievement across the main activity blocks + caste×gender
 * beneficiary demographics where captured. Bound to reportTemplateService.
 */
function n(v) { return v === null || v === undefined || v === '' ? 0 : v; }

function demoTable(esc, demo) {
    if (!demo) return '';
    const d = demo;
    const row = (label, m, f, t) =>
        `<tr><td class="L">${label}</td><td>${m}</td><td>${f}</td><td>${t}</td></tr>`;
    return `
        <table class="data-table" style="width:auto;margin-top:6px;font-size:8pt;">
            <thead><tr><th>Category</th><th>Male</th><th>Female</th><th>Total</th></tr></thead>
            <tbody>
                ${row('General', n(d.gm), n(d.gf), n(d.gm) + n(d.gf))}
                ${row('OBC', n(d.om), n(d.of), n(d.om) + n(d.of))}
                ${row('SC', n(d.sm), n(d.sf), n(d.sm) + n(d.sf))}
                ${row('ST', n(d.stm), n(d.stf), n(d.stm) + n(d.stf))}
                <tr style="font-weight:bold;">${`<td class="L">Total</td><td>${n(d.totM)}</td><td>${n(d.totF)}</td><td>${n(d.totT)}</td>`}</tr>
            </tbody>
        </table>`;
}

function kv(esc, pairs) {
    return `
        <table class="data-table" style="width:auto;font-size:9pt;">
            <tbody>${pairs.map(([k, v]) => `<tr><td class="L" style="font-weight:bold;">${esc(k)}</td><td>${esc(String(v))}</td></tr>`).join('')}</tbody>
        </table>`;
}

function block(esc, title, kvPairs, demo) {
    return `
        <div style="margin:14px 0;">
            <h2 class="section-subtitle">${esc(title)}</h2>
            ${kv(esc, kvPairs)}
            ${demo ? demoTable(esc, demo) : ''}
        </div>`;
}

function renderTechnicalAchievementSummarySection(section, data, sectionId, isFirstSection) {
    const esc = (v) => this._escapeHtml(v != null ? String(v) : '');
    const d = data || {};
    const pageClass = isFirstSection ? 'section-page section-page-first' : 'section-page section-page-continued';

    const hasAny = d.oft || d.fld || d.training || d.extension || (d.production && d.production.length);
    if (!hasAny) {
        return this._generateEmptySection(section, null, sectionId, isFirstSection);
    }

    let html = `
<div id="${sectionId}" class="${pageClass}">
    <h1 class="section-title">${esc(section.id)} ${esc(section.title)}</h1>`;

    if (d.oft) {
        html += block(esc, 'OFT', [
            ['Target', n(d.oft.target)],
            ['Achievement (No. of OFTs)', n(d.oft.achievement)],
            ['No. of Locations', n(d.oft.locations)],
            ['No. of Trials', n(d.oft.trials)],
        ], null);
    }
    if (d.fld) {
        html += block(esc, 'FLD', [
            ['Target', n(d.fld.target)],
            ['Achievement (No. of FLDs)', n(d.fld.achievement)],
            ['No. of Demonstrations', n(d.fld.demos)],
            ['Area (ha)', n(d.fld.area)],
        ], d.fld.farmers);
    }
    if (d.training) {
        html += block(esc, 'Training', [
            ['Target (No. of Courses)', n(d.training.target)],
            ['Achievement (No. of Courses)', n(d.training.courses)],
        ], d.training.participants);
    }
    if (d.extension) {
        html += block(esc, 'Extension Activities', [
            ['Target (No. of Activities)', n(d.extension.target)],
            ['Achievement (No. of Activities)', n(d.extension.activities)],
        ], d.extension.participants);
    }
    for (const p of (d.production || [])) {
        html += block(esc, `Production / Supply — ${p.category}`, [
            ['Target', n(p.target)],
            ['Quantity', n(p.quantity)],
            ['Value (Rs.)', n(p.value)],
        ], p.beneficiaries);
    }

    html += `
</div>`;
    return html;
}

module.exports = { renderTechnicalAchievementSummarySection };
