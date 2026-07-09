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
    const headingRe = /<(h1|h2|h3|h4)\b[^>]*>([\s\S]*?)<\/\1>/gi;
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

// Returns [{ src, caption }]. <figure> blocks pair an <img> with an optional
// <figcaption>; bare <img> tags (outside a figure) come back with caption ''.
function extractImages(cleanHtml) {
    const images = [];
    const seen = new Set();
    const imgSrcRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i;
    const push = (rawSrc, caption) => {
        const src = decodeEntities(String(rawSrc)).trim();
        if (src && !seen.has(src)) {
            seen.add(src);
            images.push({ src, caption: caption ? stripTags(caption) : '' });
        }
    };

    // Figures first (image + caption), so their <img> is claimed before the
    // bare-<img> sweep below.
    const figureRe = /<figure\b[^>]*>([\s\S]*?)<\/figure>/gi;
    let f;
    while ((f = figureRe.exec(cleanHtml))) {
        const inner = f[1];
        const img = inner.match(imgSrcRe);
        if (!img) continue;
        const cap = inner.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i);
        push(img[1], cap ? cap[1] : '');
    }

    // Any remaining bare images.
    const imgRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = imgRe.exec(cleanHtml))) push(m[1], '');

    return images;
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
    const images = extractImages(clean);
    return { headings, tables, images };
}

/**
 * Walk h1/h2/h3 headings and <table>s in DOCUMENT ORDER, so a writer can
 * interleave headings with their tables (instead of headings-then-tables).
 * Used by the CFLD exports where state/KVK headings must appear before each
 * table block. Returns: [{ type:'heading', level:1|2|3, text } | { type:'table', table }]
 */
function parseOrderedBlocks(html) {
    const clean = String(html || '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const blocks = [];
    const re = /<(h1|h2|h3|h4)\b[^>]*>([\s\S]*?)<\/\1>|<table\b[^>]*>([\s\S]*?)<\/table>/gi;
    let m;
    while ((m = re.exec(clean))) {
        if (m[1]) {
            const text = stripTags(m[2]);
            if (text) blocks.push({ type: 'heading', level: Number(m[1].slice(1)), text });
        } else {
            const table = parseTable(m[3]);
            if (table) blocks.push({ type: 'table', table });
        }
    }
    return blocks;
}

module.exports = { parseSectionHtml, parseOrderedBlocks, stripTags, decodeEntities };
