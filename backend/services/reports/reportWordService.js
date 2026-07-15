const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    VerticalMerge,
    ShadingType,
    BorderStyle,
    InternalHyperlink,
    Bookmark,
    PageBreak,
    ImageRun,
    TableLayoutType,
    PageOrientation,
} = require('docx');
const reportTemplateService = require('./reportTemplateService.js');
const { parseSectionHtml, parseOrderedBlocks } = require('../../utils/htmlReportTableParser.js');
const { fetchImageBuffer } = require('../../utils/fetchImageBuffer.js');

/**
 * Report Word (DOCX) Service
 *
 * Builds the all-reports Word export to match the PDF exactly: a cover, a
 * clickable Table of Contents, then every rendered section in the same order
 * and numbering, with the same tables. Like the Excel export it reuses the PDF
 * section HTML (reportTemplateService.generateSectionChunks) and the shared
 * htmlReportTableParser — one converter for all ~50 templates, no duplication.
 */

const HEADER_SHADE = 'E8E8E8';
const TOTAL_SHADE = 'D9EAD3'; // light green — Total / Sub Total / Grand Total rows

function isTotalRow(row) {
    const first = String((row[0] && row[0].text) || '').trim().toLowerCase();
    return /^(sub\s*total|grand\s*total|total)\b/.test(first);
}
const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const CELL_BORDERS = { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER };
// Table-level borders (incl. inside grid lines) — cell-only borders don't render
// reliably in all viewers, so set both.
const TABLE_BORDERS = {
    top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER,
    insideHorizontal: CELL_BORDER, insideVertical: CELL_BORDER,
};

function bookmarkIdFor(sectionId) {
    return `sec_${String(sectionId).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

function textCell(text, { colSpan = 1, vMerge = null, header = false, total = false } = {}) {
    const run = new TextRun({ text: String(text ?? ''), bold: header || total, size: 12 });
    const shadeFill = header ? HEADER_SHADE : (total ? TOTAL_SHADE : null);
    return new TableCell({
        children: [new Paragraph({
            children: [run],
            alignment: header ? AlignmentType.CENTER : AlignmentType.LEFT,
        })],
        columnSpan: colSpan,
        ...(vMerge ? { verticalMerge: vMerge } : {}),
        ...(shadeFill ? { shading: { type: ShadingType.CLEAR, fill: shadeFill } } : {}),
        borders: CELL_BORDERS,
    });
}

/**
 * Lay parsed cells (with colspan/rowspan) into a full grid, then emit docx
 * TableRows using columnSpan (horizontal) + verticalMerge RESTART/CONTINUE
 * (vertical) so merged cells render exactly like the PDF.
 */
function buildDocxTable(table, totalWidthDxa = 9360) {
    const grid = []; // grid[r][c] = { kind: 'anchor'|'vcont'|'hcovered', cell }
    table.rows.forEach((row, r) => {
        grid[r] = grid[r] || [];
        let c = 0;
        for (const cell of row) {
            while (grid[r][c]) c += 1;
            for (let dr = 0; dr < cell.rowspan; dr += 1) {
                grid[r + dr] = grid[r + dr] || [];
                for (let dc = 0; dc < cell.colspan; dc += 1) {
                    grid[r + dr][c + dc] = (dr === 0 && dc === 0)
                        ? { kind: 'anchor', cell }
                        : (dc === 0 ? { kind: 'vcont', cell } : { kind: 'hcovered' });
                }
            }
            c += cell.colspan;
        }
    });

    const totalCols = grid.reduce((m, row) => Math.max(m, row.length), 0);
    const totalRowFlags = table.rows.map(isTotalRow);

    const tableRows = grid.map((row, rIdx) => {
        const rowIsTotal = !!totalRowFlags[rIdx];
        const cells = [];
        let c = 0;
        while (c < totalCols) {
            const g = row[c];
            if (!g) { cells.push(textCell('', {})); c += 1; continue; }
            if (g.kind === 'anchor') {
                cells.push(textCell(g.cell.text, {
                    colSpan: g.cell.colspan,
                    vMerge: g.cell.rowspan > 1 ? VerticalMerge.RESTART : null,
                    header: g.cell.header,
                    total: rowIsTotal,
                }));
                c += g.cell.colspan;
            } else if (g.kind === 'vcont') {
                cells.push(textCell('', {
                    colSpan: g.cell.colspan,
                    vMerge: VerticalMerge.CONTINUE,
                    header: g.cell.header,
                    total: rowIsTotal,
                }));
                c += g.cell.colspan;
            } else {
                c += 1; // covered horizontally by an anchor's columnSpan
            }
        }
        return new TableRow({ children: cells });
    });

    // Fixed column widths so wide tables (many columns) don't collapse to
    // char-per-line wrapping. First column wider (labels), rest share evenly.
    const first = Math.min(2400, Math.max(1200, Math.round(totalWidthDxa * 0.12)));
    const rest = Math.max(300, Math.floor((totalWidthDxa - first) / Math.max(1, totalCols - 1)));
    const columnWidths = Array.from({ length: totalCols }, (_, i) => (i === 0 ? first : rest));

    return new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: TABLE_BORDERS,
        columnWidths,
        layout: TableLayoutType.FIXED,
    });
}

/** Build the document children for one section chunk. */
async function buildSectionChildren(chunk, isFirst, totalWidthDxa = 9360) {
    const { headings, tables, images = [] } = parseSectionHtml(chunk.html);
    const out = [];
    const title = `${chunk.featureNumber || chunk.sectionNumber} ${chunk.featureTitle || chunk.sectionTitle}`.trim();

    out.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        ...(isFirst ? {} : { pageBreakBefore: true }),
        children: [new Bookmark({ id: bookmarkIdFor(chunk.sectionId), children: [new TextRun({ text: title, bold: true })] })],
    }));

    for (const h of headings) {
        if (h === title || h === (chunk.featureTitle || chunk.sectionTitle)) continue;
        out.push(new Paragraph({ children: [new TextRun({ text: h, italics: true, color: '555555' })] }));
    }

    if (tables.length === 0 && images.length === 0) {
        out.push(new Paragraph({ children: [new TextRun({ text: 'No data available for this section.', italics: true, color: '888888' })] }));
        return out;
    }
    for (const table of tables) {
        out.push(buildDocxTable(table, totalWidthDxa));
        out.push(new Paragraph({ children: [] })); // spacer
    }
    // Embed images (e.g. OFT result photographs) with their captions (#241).
    for (const fig of images) {
        const src = typeof fig === 'string' ? fig : fig.src;
        const caption = typeof fig === 'string' ? '' : (fig.caption || '');
        const img = await fetchImageBuffer(src);
        if (!img) continue;
        out.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new ImageRun({
                data: img.buffer,
                transformation: { width: 320, height: 220 },
            })],
        }));
        if (caption) {
            out.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: caption, italics: true, size: 16, color: '555555' })],
            }));
        }
    }
    return out;
}

/** Reporting period label — mirrors reportTemplateService._formatReportPeriod. */
function formatReportPeriodWord(filters = {}) {
    if (filters.year) return `Year: ${filters.year}`;
    if (filters.startDate && filters.endDate) {
        const fmt = d => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        return `${fmt(filters.startDate)} to ${fmt(filters.endDate)}`;
    }
    return 'All Time';
}

/** Cover + clickable Table of Contents. */
function buildFrontMatter(kvkInfo, numbering, renderedSectionIds, filters = {}) {
    const isAggregated = kvkInfo?.kvkId === null || kvkInfo?.kvkId === undefined;
    const reportType = isAggregated ? (kvkInfo?.reportType || 'All KVKs') : 'KVK';

    const children = [
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: 'ATARI AMS REPORT', bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: 'Indian Council of Agricultural Research', size: 18 })] }),
        new Paragraph({ children: [new TextRun({ text: 'Agricultural Technology Application Research Institute (ATARI)', bold: true, size: 22 })] }),
    ];

    const field = (label, value) => new Paragraph({
        children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: String(value ?? '') }),
        ],
    });

    children.push(field('Report Type', `${reportType} Report`));
    children.push(field('Reporting Period', formatReportPeriodWord(filters)));
    if (!isAggregated) {
        children.push(field('KVK', kvkInfo?.kvkName || ''));
    }
    if (kvkInfo?.state) children.push(field('State', kvkInfo.state));
    if (kvkInfo?.zone) children.push(field('Zone', kvkInfo.zone));
    if (kvkInfo?.organization) children.push(field('Organization', kvkInfo.organization));

    if (isAggregated) {
        const list = kvkInfo?.kvkList || [];
        const count = kvkInfo?.kvkCount || list.length;
        children.push(new Paragraph({ children: [new TextRun({ text: `KVKs Included (${count})`, bold: true })] }));
        for (const name of list) {
            children.push(new Paragraph({ children: [new TextRun({ text: name })], indent: { left: 360 } }));
        }
    }

    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Table of Contents', bold: true })] }));

    const tocLine = (number, label, sectionId, { bold = false, indent = 0 } = {}) => {
        const text = `${number ? number + '  ' : ''}${label}`;
        const child = (sectionId && renderedSectionIds.has(String(sectionId)))
            ? new InternalHyperlink({ anchor: bookmarkIdFor(sectionId), children: [new TextRun({ text, bold, color: '1F6E43', underline: {} })] })
            : new TextRun({ text, bold });
        return new Paragraph({ children: [child], indent: { left: indent * 360 } });
    };

    for (const chapter of numbering.chapters) {
        children.push(tocLine(`${chapter.number}.`, chapter.title, null, { bold: true }));
        if (chapter.type === 'grouped') {
            for (const group of (chapter.groups || [])) {
                const first = group.features[0] && group.features[0].sectionId;
                children.push(tocLine(group.number, group.label, first, { bold: true, indent: 1 }));
                for (const f of (group.features || [])) {
                    if (!f.label || !f.number) continue;
                    children.push(tocLine(f.number, f.label, f.sectionId, { indent: 2 }));
                }
            }
        } else {
            for (const s of (chapter.sections || [])) {
                children.push(tocLine(s.number, s.title, s.sectionId, { indent: 1 }));
            }
        }
    }
    children.push(new Paragraph({ children: [new PageBreak()] }));
    return children;
}

/** Split custom-template HTML into its top-level section-page blocks. */
function splitSectionPagesWord(html) {
    const parts = [];
    const re = /<div[^>]*class="[^"]*section-page[^"]*"[^>]*>[\s\S]*?(?=<div[^>]*class="[^"]*section-page[^"]*"|$)/gi;
    let m;
    while ((m = re.exec(html))) parts.push(m[0]);
    return parts.length ? parts : [html];
}

class ReportWordService {
    /**
     * Generate a standalone (module-wise) Word document from the SAME HTML the
     * PDF uses, so the Word layout matches the PDF exactly.
     * @returns {Promise<Buffer>}
     */
    async generateStandaloneWordFromHtml(title, html, { generatedBy = 'System' } = {}) {
        // Landscape — these page reports are wide (many columns). Usable width in
        // A4 landscape ≈ 14400 dxa after ~1in margins; size columns to fill it so
        // cells don't collapse to char-per-line wrapping.
        const LANDSCAPE_WIDTH_DXA = 14400;
        const parts = splitSectionPagesWord(html);
        const body = [];
        for (let i = 0; i < parts.length; i += 1) {
            const { headings } = parseSectionHtml(parts[i]);
            const sectionTitle = headings[0] || title || '';
            body.push(...await buildSectionChildren(
                { html: parts[i], sectionNumber: '', sectionTitle, sectionId: `s${i}` },
                i === 0,
                LANDSCAPE_WIDTH_DXA,
            ));
        }

        const doc = new Document({
            creator: generatedBy,
            title: title || 'Report',
            sections: [{
                properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
                children: body,
            }],
        });

        return Packer.toBuffer(doc);
    }

    /**
     * CFLD Word from the SAME HTML the PDF uses, interleaving headings with their
     * tables in document order so each State/KVK label appears immediately before
     * its tables (the generic export lumps all headings at the top).
     * @returns {Promise<Buffer>}
     */
    async generateCfldWordFromHtml(title, html, { generatedBy = 'System' } = {}) {
        const LANDSCAPE_WIDTH_DXA = 14400;
        const blocks = parseOrderedBlocks(html);
        const body = [];

        // Group labels (section title / State: … / KVK: …) render as bold SHADED
        // paragraphs sitting right above their table — like the CFLD extension
        // activity layout. Deliberately NOT Word heading styles, so they don't
        // pile up in the navigation/outline pane as a "summary list" of KVKs.
        for (const block of blocks) {
            if (block.type === 'table') {
                body.push(buildDocxTable(block.table, LANDSCAPE_WIDTH_DXA));
                body.push(new Paragraph({ children: [] }));
                continue;
            }
            if (block.level === 1) {
                body.push(new Paragraph({
                    spacing: { before: 80, after: 120 },
                    children: [new TextRun({ text: block.text, bold: true, size: 26, color: '1F6E43' })],
                }));
            } else if (block.level === 2) {
                // State: … / KVK: … group label — shaded block, attached to its table.
                body.push(new Paragraph({
                    spacing: { before: 160, after: 0 },
                    shading: { type: ShadingType.CLEAR, fill: 'DCE6F1' },
                    keepNext: true,
                    children: [new TextRun({ text: block.text, bold: true, size: 20 })],
                }));
            } else {
                body.push(new Paragraph({
                    spacing: { before: 60, after: 20 },
                    keepNext: true,
                    children: [new TextRun({ text: block.text, bold: true })],
                }));
            }
        }

        const doc = new Document({
            creator: generatedBy,
            title: title || 'Report',
            sections: [{
                properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
                children: body.length ? body : [new Paragraph({ children: [new TextRun({ text: 'No data available.', italics: true })] })],
            }],
        });

        return Packer.toBuffer(doc);
    }

    /**
     * Generate the structured all-reports Word document (matches the PDF).
     * @returns {Promise<Buffer>}
     */
    async generateReportWord(kvkInfo, sectionsData, _filters = {}, generatedBy = 'System') {
        const reportContext = {
            isAggregatedReport: kvkInfo?.kvkId === null || kvkInfo?.kvkId === undefined,
            isAggregatedView: !!kvkInfo?.isAggregatedView,
            isStandalone: false,
        };
        const { numbering, chunks } = await reportTemplateService.generateSectionChunks(
            sectionsData,
            reportContext,
        );

        const renderedSectionIds = new Set(chunks.map(c => String(c.sectionId)));
        const body = [
            ...buildFrontMatter(kvkInfo, numbering, renderedSectionIds, _filters),
        ];
        for (let i = 0; i < chunks.length; i += 1) {
            body.push(...await buildSectionChildren(chunks[i], i === 0));
        }

        const doc = new Document({
            creator: generatedBy,
            title: 'KVK Comprehensive Report',
            sections: [{ children: body }],
        });

        return Packer.toBuffer(doc);
    }
}

module.exports = new ReportWordService();
