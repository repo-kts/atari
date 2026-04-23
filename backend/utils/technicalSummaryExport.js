/**
 * Technical Achievement Summary exports (PDF + Excel + Word).
 *
 * Shape of the payload (sent from the frontend's buildExportTables helper):
 *   {
 *     tables: [{ title: string, headers: string[], rows: (string|number)[][] }, ...],
 *     reportingYear: number,
 *     kvkLabel: string,
 *   }
 *
 * PDF is rendered via Puppeteer (exportHelper.generatePDF) — Chromium handles
 * modern CSS (including oklch) natively, unlike the client-side html2pdf.js
 * which we previously used. Excel + Word match the prior xlsx / docx output
 * layout so consumers don't see a format regression.
 */

const ExcelJS = require('exceljs');
const {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  PageOrientation,
} = require('docx');

const { generatePDF } = require('./exportHelper');

const REPORT_TITLE = 'Technical Achievement Summary';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildTablesHtml(tables) {
  return tables
    .map((table) => {
      const headers = table.headers || [];
      const rows = Array.isArray(table.rows) ? table.rows : [];
      const tbody = rows
        .map(
          (line) =>
            `<tr>${line
              .map((value) => `<td>${escapeHtml(String(value ?? ''))}</td>`)
              .join('')}</tr>`,
        )
        .join('');
      return `
        <table class="tas-table">
          <thead>
            <tr><th class="table-title" colspan="${headers.length}">${escapeHtml(table.title)}</th></tr>
            <tr>${headers.map((header) => `<th>${escapeHtml(String(header))}</th>`).join('')}</tr>
          </thead>
          <tbody>${tbody}</tbody>
        </table>
      `;
    })
    .join('');
}

/**
 * Produce the full HTML document fed to Puppeteer. CSS mirrors the layout the
 * page previously injected into its own DOM for html2pdf — so the resulting
 * PDF looks (pixel-close) identical.
 */
function buildPdfHtml({ tables, reportingYear, kvkLabel }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(REPORT_TITLE)}</title>
    <style>
      @page { size: A4 landscape; margin: 10mm; }
      html, body { margin: 0; padding: 0; color: #111; background: #fff; }
      .tas-report { font-family: Arial, sans-serif; padding: 18px; color: #111; }
      .tas-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
      .tas-meta { font-size: 12px; margin-bottom: 2px; }
      .tas-table { width: 100%; border-collapse: collapse; margin-top: 12px; page-break-inside: auto; }
      .tas-table tr { page-break-inside: avoid; }
      .tas-table th, .tas-table td {
        border: 1px solid #000;
        font-size: 9px;
        padding: 3px 4px;
        text-align: center;
      }
      .tas-table .table-title { background: #f2f2f2; font-size: 11px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="tas-report">
      <div class="tas-title">${escapeHtml(REPORT_TITLE)}</div>
      <div class="tas-meta">Reporting Year: ${escapeHtml(String(reportingYear))}</div>
      <div class="tas-meta">KVK: ${escapeHtml(kvkLabel)}</div>
      ${buildTablesHtml(tables)}
    </div>
  </body>
</html>`;
}

async function generateTechnicalSummaryPdfBuffer(payload) {
  const html = buildPdfHtml(payload);
  return generatePDF(html);
}

/**
 * Multi-section single-sheet Excel. Each table gets a merged title row, a
 * header row, then its data rows, followed by a spacer row. Column widths
 * are sized to the widest table so every section aligns visually.
 */
async function generateTechnicalSummaryExcelBuffer({ tables, reportingYear, kvkLabel }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Technical Summary');

  const maxColumns = Math.max(
    1,
    ...tables.map((t) => (t.headers || []).length),
  );

  let rowIdx = 1;
  const writeMergedRow = (value, { bold = false, fontSize = 11, fill = null, align = 'center' } = {}) => {
    sheet.mergeCells(rowIdx, 1, rowIdx, maxColumns);
    const cell = sheet.getCell(rowIdx, 1);
    cell.value = value;
    cell.font = { name: 'Arial', size: fontSize, bold };
    cell.alignment = { horizontal: align, vertical: 'middle', wrapText: true };
    if (fill) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    }
    rowIdx += 1;
  };

  writeMergedRow(REPORT_TITLE, { bold: true, fontSize: 16, align: 'center' });
  writeMergedRow(`Reporting Year: ${reportingYear}`, { fontSize: 11, align: 'left' });
  writeMergedRow(`KVK: ${kvkLabel}`, { fontSize: 11, align: 'left' });
  rowIdx += 1;

  const applyBorders = (row, width) => {
    for (let c = 1; c <= width; c += 1) {
      row.getCell(c).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  };

  for (const table of tables) {
    const headers = table.headers || [];
    const dataRows = Array.isArray(table.rows) ? table.rows : [];
    const width = Math.max(1, headers.length);

    // Section title (merged across table width)
    sheet.mergeCells(rowIdx, 1, rowIdx, width);
    const titleCell = sheet.getCell(rowIdx, 1);
    titleCell.value = table.title;
    titleCell.font = { name: 'Arial', size: 11, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    applyBorders(sheet.getRow(rowIdx), width);
    rowIdx += 1;

    // Header row
    const headerRow = sheet.getRow(rowIdx);
    headers.forEach((h, i) => {
      headerRow.getCell(i + 1).value = h;
    });
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    applyBorders(headerRow, width);
    rowIdx += 1;

    // Data rows
    for (const line of dataRows) {
      const dataRow = sheet.getRow(rowIdx);
      for (let c = 0; c < width; c += 1) {
        dataRow.getCell(c + 1).value = line[c] ?? '';
      }
      dataRow.eachCell({ includeEmpty: false }, (cell) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      applyBorders(dataRow, width);
      rowIdx += 1;
    }

    rowIdx += 1; // spacer between sections
  }

  for (let c = 1; c <= maxColumns; c += 1) {
    sheet.getColumn(c).width = 14;
  }

  return workbook.xlsx.writeBuffer();
}

// Data cell — minimal styling with an explicit width so the table doesn't
// auto-collapse to 100-twip columns. `width` is in twips.
function wordCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({ text: String(text ?? '') })],
  });
}

function wordHeaderCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: 'F2F2F2' },
    children: [
      new Paragraph({
        children: [new (require('docx').TextRun)({ text: String(text ?? ''), bold: true })],
      }),
    ],
  });
}

async function generateTechnicalSummaryWordBuffer({ tables, reportingYear, kvkLabel }) {
  const children = [];

  children.push(
    new Paragraph({
      text: REPORT_TITLE,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  );
  children.push(new Paragraph({ text: `Reporting Year: ${reportingYear}` }));
  children.push(new Paragraph({ text: `KVK: ${kvkLabel}` }));
  children.push(new Paragraph({ text: '' }));

  // Landscape A4 usable width (twips) after ~1-inch margins both sides.
  // Used to give docx an explicit columnWidths array — otherwise it
  // defaults to 100 twips per column (~1.8mm) and Word renders every
  // column as a single character wide.
  const LANDSCAPE_USABLE_TWIPS = 13950;

  for (const table of tables) {
    const headers = table.headers || [];
    const dataRows = Array.isArray(table.rows) ? table.rows : [];
    const width = Math.max(1, headers.length);

    // Section title lives OUTSIDE the table as a HEADING_2 paragraph.
    children.push(
      new Paragraph({
        text: table.title,
        heading: HeadingLevel.HEADING_2,
      }),
    );

    const colTwips = Math.floor(LANDSCAPE_USABLE_TWIPS / width);
    const columnWidths = Array.from({ length: width }, () => colTwips);

    const rows = [
      new TableRow({
        tableHeader: true,
        children: headers.map((h) => wordHeaderCell(h, colTwips)),
      }),
      ...dataRows.map(
        (line) =>
          new TableRow({
            children: Array.from({ length: width }, (_, i) => wordCell(line[i] ?? '', colTwips)),
          }),
      ),
    ];

    children.push(
      new Table({
        columnWidths,
        width: { size: LANDSCAPE_USABLE_TWIPS, type: WidthType.DXA },
        rows,
      }),
    );
    children.push(new Paragraph({ text: '' }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { size: { orientation: PageOrientation.LANDSCAPE } },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = {
  generateTechnicalSummaryPdfBuffer,
  generateTechnicalSummaryExcelBuffer,
  generateTechnicalSummaryWordBuffer,
};
