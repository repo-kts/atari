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
} = require('docx');
const reportTemplateService = require('./reportTemplateService.js');
const { parseSectionHtml } = require('../../utils/htmlReportTableParser.js');
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
const CELL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const CELL_BORDERS = { top: CELL_BORDER, bottom: CELL_BORDER, left: CELL_BORDER, right: CELL_BORDER };

function bookmarkIdFor(sectionId) {
    return `sec_${String(sectionId).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

function textCell(text, { colSpan = 1, vMerge = null, header = false } = {}) {
    const run = new TextRun({ text: String(text ?? ''), bold: header, size: 16 });
    return new TableCell({
        children: [new Paragraph({
            children: [run],
            alignment: header ? AlignmentType.CENTER : AlignmentType.LEFT,
        })],
        columnSpan: colSpan,
        ...(vMerge ? { verticalMerge: vMerge } : {}),
        ...(header ? { shading: { type: ShadingType.CLEAR, fill: HEADER_SHADE } } : {}),
        borders: CELL_BORDERS,
    });
}

/**
 * Lay parsed cells (with colspan/rowspan) into a full grid, then emit docx
 * TableRows using columnSpan (horizontal) + verticalMerge RESTART/CONTINUE
 * (vertical) so merged cells render exactly like the PDF.
 */
function buildDocxTable(table) {
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

    const tableRows = grid.map((row) => {
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
                }));
                c += g.cell.colspan;
            } else if (g.kind === 'vcont') {
                cells.push(textCell('', {
                    colSpan: g.cell.colspan,
                    vMerge: VerticalMerge.CONTINUE,
                    header: g.cell.header,
                }));
                c += g.cell.colspan;
            } else {
                c += 1; // covered horizontally by an anchor's columnSpan
            }
        }
        return new TableRow({ children: cells });
    });

    return new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
    });
}

/** Build the document children for one section chunk. */
async function buildSectionChildren(chunk, isFirst) {
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
        out.push(buildDocxTable(table));
        out.push(new Paragraph({ children: [] })); // spacer
    }
    // Embed images (e.g. OFT result photographs) (#241).
    for (const src of images) {
        const img = await fetchImageBuffer(src);
        if (!img) continue;
        out.push(new Paragraph({
            children: [new ImageRun({
                data: img.buffer,
                transformation: { width: 320, height: 220 },
            })],
        }));
    }
    return out;
}

/** Cover + clickable Table of Contents. */
function buildFrontMatter(kvkInfo, numbering, renderedSectionIds) {
    const children = [
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: 'KVK Comprehensive Report', bold: true })] }),
    ];
    if (kvkInfo?.kvkName) {
        children.push(new Paragraph({ children: [new TextRun({ text: kvkInfo.kvkName, bold: true, size: 24 })] }));
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

class ReportWordService {
    /**
     * Generate the structured all-reports Word document (matches the PDF).
     * @returns {Promise<Buffer>}
     */
    async generateReportWord(kvkInfo, sectionsData, _filters = {}, generatedBy = 'System') {
        const reportContext = {
            isAggregatedReport: kvkInfo?.kvkId === null || kvkInfo?.kvkId === undefined,
            isStandalone: false,
        };
        const { numbering, chunks } = await reportTemplateService.generateSectionChunks(
            sectionsData,
            reportContext,
        );

        const renderedSectionIds = new Set(chunks.map(c => String(c.sectionId)));
        const body = [
            ...buildFrontMatter(kvkInfo, numbering, renderedSectionIds),
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
