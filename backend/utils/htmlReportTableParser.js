/**
 * htmlReportTableParser
 *
 * Dependency-free parser that turns a rendered report-section HTML chunk (the
 * exact same HTML the PDF uses) into structured headings + tables, so the Excel
 * export can mirror the PDF layout with one reusable converter instead of a
 * bespoke renderer per section.
 *
 * Output shape:
 *   {
 *     headings: string[],                       // section title + sub-titles
 *     tables: [{ rows: [ [cell, ...], ... ] }]  // each cell: { text, colspan, rowspan, header }
 *   }
 *
 * Cells keep their colspan/rowspan so the writer can reproduce merged cells.
 */

function decodeEntities(text) {
    return String(text)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(html) {
    return decodeEntities(
        String(html)
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]+>/g, ''),
    ).replace(/\s+/g, ' ').trim();
}

function getAttr(attrs, name) {
    const m = String(attrs).match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i'));
    return m ? m[1] : null;
}

function toSpan(value) {
    const n = parseInt(value || '1', 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
}

function extractHeadings(cleanHtml) {
    const headings = [];
    const push = (raw) => {
        const t = stripTags(raw);
        if (t && !headings.includes(t)) headings.push(t);
    };
    let m;
    const headingRe = /<(h1|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    while ((m = headingRe.exec(cleanHtml))) push(m[2]);
    // Descriptive sub-titles/captions templates render as <div>/<p>.
    const subRe = /<(div|p)\b[^>]*class="[^"]*(?:subtitle|sub-title|caption|page-sub|page-sec|nbf-subtitle)[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;
    while ((m = subRe.exec(cleanHtml))) push(m[2]);
    return headings;
}

function parseTable(innerHtml) {
    const theadMatch = innerHtml.match(/<thead\b[^>]*>([\s\S]*?)<\/thead>/i);
    const theadHtml = theadMatch ? theadMatch[1] : '';
    const rows = [];
    const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let tr;
    while ((tr = trRe.exec(innerHtml))) {
        const isHeaderRow = theadHtml.includes(tr[0]);
        const cells = [];
        const cellRe = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
        let c;
        while ((c = cellRe.exec(tr[1]))) {
            cells.push({
                text: stripTags(c[3]),
                colspan: toSpan(getAttr(c[2], 'colspan')),
                rowspan: toSpan(getAttr(c[2], 'rowspan')),
                header: c[1].toLowerCase() === 'th' || isHeaderRow,
            });
        }
        if (cells.length) rows.push(cells);
    }
    return rows.length ? { rows } : null;
}

function parseSectionHtml(html) {
    const clean = String(html || '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const headings = extractHeadings(clean);
    const tables = [];
    const tableRe = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
    let m;
    while ((m = tableRe.exec(clean))) {
        const table = parseTable(m[1]);
        if (table) tables.push(table);
    }
    return { headings, tables };
}

module.exports = { parseSectionHtml, stripTags, decodeEntities };
