const ExcelJS = require('exceljs');
const reportTemplateService = require('./reportTemplateService.js');
const { parseSectionHtml } = require('../../utils/htmlReportTableParser.js');
const { fetchImageBuffer } = require('../../utils/fetchImageBuffer.js');

/**
 * Report Excel Service
 *
 * Builds the all-reports Excel export so it mirrors the PDF: one worksheet (tab)
 * per rendered sub-section, grouped by chapter (an Index sheet links to each, and
 * tabs are colour-coded per chapter). It reuses the SAME section HTML the PDF
 * produces (via reportTemplateService.generateSectionChunks) and converts each
 * section's tables to worksheet rows with one generic converter — so the Excel
 * layout always tracks the PDF without per-section duplication.
 */

const HEADER_FILL = 'FFE8E8E8';
const CHAPTER_TAB_COLORS = [
    'FF1F6E43', 'FF2E7D32', 'FF00695C', 'FF5D4037',
    'FF455A64', 'FF6A1B9A', 'FFAD1457', 'FFEF6C00',
];
const MAX_TAB = 31;
const MAX_COL_WIDTH = 60;

const thinBorder = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
};

/** Excel-safe, unique, ≤31-char worksheet name. */
function sanitizeTabName(name, used) {
    let base = String(name || 'Sheet')
        // Excel forbids \ / ? * [ ] : in sheet names; apostrophes break the
        // internal hyperlink reference (#'Sheet'!A1), so drop them too.
        .replace(/['\\/?*[\]:]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_TAB) || 'Sheet';
    let candidate = base;
    let i = 1;
    while (used.has(candidate.toLowerCase())) {
        const suffix = ` (${++i})`;
        candidate = `${base.slice(0, MAX_TAB - suffix.length)}${suffix}`;
    }
    used.add(candidate.toLowerCase());
    return candidate;
}

function isNumericText(text) {
    if (text === '' || text == null) return false;
    // Allow plain integers/decimals (no thousands separators, currency, units).
    return /^-?\d+(\.\d+)?$/.test(String(text).trim());
}

function setCellValue(cell, text) {
    if (isNumericText(text)) {
        cell.value = Number(text);
    } else if (text === '—' || text === '-') {
        cell.value = text;
    } else {
        cell.value = text;
    }
}

/**
 * Write one parsed table into the worksheet starting at `startRow`, reproducing
 * colspan/rowspan as merged cells. Returns the next free row index.
 */
function writeTable(ws, table, startRow, widthTracker) {
    const occupied = new Set(); // "row,col" cells covered by a previous rowspan
    let rowIdx = startRow;

    for (const row of table.rows) {
        let col = 1;
        for (const cell of row) {
            while (occupied.has(`${rowIdx},${col}`)) col += 1;

            const top = ws.getCell(rowIdx, col);
            setCellValue(top, cell.text);
            top.alignment = { vertical: 'middle', horizontal: cell.header ? 'center' : 'left', wrapText: true };
            top.border = thinBorder;
            if (cell.header) {
                top.font = { bold: true };
                top.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
            }

            const lastRow = rowIdx + cell.rowspan - 1;
            const lastCol = col + cell.colspan - 1;
            if (cell.rowspan > 1 || cell.colspan > 1) {
                ws.mergeCells(rowIdx, col, lastRow, lastCol);
            }
            for (let r = rowIdx; r <= lastRow; r += 1) {
                for (let c = col; c <= lastCol; c += 1) {
                    occupied.add(`${r},${c}`);
                    // Borders on merged-away cells so the grid looks complete.
                    if (r !== rowIdx || c !== col) ws.getCell(r, c).border = thinBorder;
                }
            }

            // Track width by the widest single column the cell starts in.
            const estimate = Math.min(MAX_COL_WIDTH, Math.max(8, String(cell.text).length + 2));
            widthTracker[col] = Math.max(widthTracker[col] || 0, cell.header ? Math.min(estimate, 24) : estimate);

            col = lastCol + 1;
        }
        rowIdx += 1;
    }
    return rowIdx;
}

/** Write a section's headings + all its tables (+ images) into a worksheet. */
async function writeSection(ws, chunk) {
    const { headings, tables, images = [] } = parseSectionHtml(chunk.html);
    const widthTracker = {};
    let rowIdx = 1;

    // Title line (number + title), then any descriptive sub-headings.
    const title = `${chunk.featureNumber || chunk.sectionNumber} ${chunk.featureTitle || chunk.sectionTitle}`.trim();
    const titleCell = ws.getCell(rowIdx, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 13, color: { argb: 'FF1F6E43' } };
    rowIdx += 1;
    for (const h of headings) {
        // Skip the heading that merely repeats the title we already printed.
        if (h === title || h === (chunk.featureTitle || chunk.sectionTitle)) continue;
        ws.getCell(rowIdx, 1).value = h;
        ws.getCell(rowIdx, 1).font = { italic: true, color: { argb: 'FF555555' } };
        rowIdx += 1;
    }
    rowIdx += 1; // spacer

    if (tables.length === 0 && images.length === 0) {
        ws.getCell(rowIdx, 1).value = 'No data available for this section.';
        ws.getCell(rowIdx, 1).font = { italic: true, color: { argb: 'FF888888' } };
        ws.getColumn(1).width = 40;
        return;
    }

    for (const table of tables) {
        rowIdx = writeTable(ws, table, rowIdx, widthTracker);
        rowIdx += 1; // blank row between tables
    }

    for (const [colStr, width] of Object.entries(widthTracker)) {
        ws.getColumn(Number(colStr)).width = width;
    }

    // Embed images (e.g. OFT result photographs) with captions below the tables (#241).
    for (const fig of images) {
        const src = typeof fig === 'string' ? fig : fig.src;
        const caption = typeof fig === 'string' ? '' : (fig.caption || '');
        const img = await fetchImageBuffer(src);
        if (!img) continue;
        const imageId = ws.workbook.addImage({ buffer: img.buffer, extension: img.extension });
        ws.addImage(imageId, {
            tl: { col: 0, row: rowIdx },
            ext: { width: 320, height: 220 },
        });
        rowIdx += 14; // leave vertical space for the image
        if (caption) {
            const capCell = ws.getCell(rowIdx, 1);
            capCell.value = caption;
            capCell.font = { italic: true, color: { argb: 'FF555555' } };
            rowIdx += 1;
        }
    }

    ws.views = [{ state: 'frozen', ySplit: 0 }];
}

/** Build the Index sheet: chapters → groups → features, each linking to a tab. */
function writeIndexSheet(ws, kvkInfo, numbering, sheetBySectionId) {
    ws.getColumn(1).width = 12;
    ws.getColumn(2).width = 70;
    let r = 1;
    ws.getCell(r, 1).value = 'KVK Comprehensive Report';
    ws.getCell(r, 1).font = { bold: true, size: 16, color: { argb: 'FF1F6E43' } };
    r += 1;
    if (kvkInfo?.kvkName) {
        ws.getCell(r, 1).value = kvkInfo.kvkName;
        ws.getCell(r, 1).font = { bold: true, size: 12 };
        r += 1;
    }
    r += 1;
    ws.getCell(r, 1).value = 'Table of Contents';
    ws.getCell(r, 1).font = { bold: true, size: 13 };
    r += 2;

    const linkRow = (number, label, sectionId, opts = {}) => {
        const numCell = ws.getCell(r, 1);
        const labelCell = ws.getCell(r, 2);
        numCell.value = number ? String(number) : '';
        const tab = sectionId ? sheetBySectionId[String(sectionId)] : null;
        if (tab) {
            labelCell.value = { text: label, hyperlink: `#'${tab}'!A1` };
            labelCell.font = { color: { argb: 'FF1F6E43' }, underline: true, bold: !!opts.bold };
        } else {
            labelCell.value = label;
            labelCell.font = { bold: !!opts.bold, color: opts.muted ? { argb: 'FF999999' } : undefined };
        }
        if (opts.indent) labelCell.alignment = { indent: opts.indent };
        if (opts.bold) numCell.font = { bold: true };
        r += 1;
    };

    for (const chapter of numbering.chapters) {
        linkRow(`${chapter.number}.`, chapter.title, null, { bold: true });
        if (chapter.type === 'grouped') {
            for (const group of (chapter.groups || [])) {
                const first = group.features[0] && group.features[0].sectionId;
                linkRow(group.number, group.label, first, { bold: true, indent: 1 });
                for (const feature of (group.features || [])) {
                    if (!feature.label || !feature.number) continue;
                    linkRow(feature.number, feature.label, feature.sectionId, {
                        indent: 2,
                        muted: !sheetBySectionId[String(feature.sectionId)],
                    });
                }
            }
        } else {
            for (const s of (chapter.sections || [])) {
                linkRow(s.number, s.title, s.sectionId, { indent: 1 });
            }
        }
    }
}

class ReportExcelService {
    /**
     * Generate the structured all-reports Excel workbook.
     * @returns {Promise<Buffer>}
     */
    async generateReportExcel(kvkInfo, sectionsData, _filters = {}, generatedBy = 'System') {
        const reportContext = {
            isAggregatedReport: kvkInfo?.kvkId === null || kvkInfo?.kvkId === undefined,
            isStandalone: false,
        };
        const { numbering, chunks } = await reportTemplateService.generateSectionChunks(
            sectionsData,
            reportContext,
        );

        const workbook = new ExcelJS.Workbook();
        workbook.creator = generatedBy;
        workbook.created = new Date(0); // deterministic; avoids Date.now in service layer

        const indexSheet = workbook.addWorksheet('Index', { properties: { tabColor: { argb: 'FF263238' } } });

        // Map each chapter to a stable tab colour for visual grouping.
        const chapterColor = new Map();
        const usedTabNames = new Set(['index']);
        const sheetBySectionId = {};

        for (const chunk of chunks) {
            if (!chapterColor.has(chunk.chapter)) {
                chapterColor.set(chunk.chapter, CHAPTER_TAB_COLORS[chapterColor.size % CHAPTER_TAB_COLORS.length]);
            }
            const tabBase = `${chunk.featureNumber || chunk.sectionNumber} ${chunk.featureTitle || chunk.sectionTitle}`;
            const tabName = sanitizeTabName(tabBase, usedTabNames);
            sheetBySectionId[String(chunk.sectionId)] = tabName;

            const ws = workbook.addWorksheet(tabName, {
                properties: { tabColor: { argb: chapterColor.get(chunk.chapter) } },
                pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
            });
            await writeSection(ws, chunk);
        }

        writeIndexSheet(indexSheet, kvkInfo, numbering, sheetBySectionId);

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}

module.exports = new ReportExcelService();
