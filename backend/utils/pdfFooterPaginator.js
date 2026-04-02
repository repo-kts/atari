const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { reportConfig } = require('../config/reportConfig');

/**
 * Injects a CSS-based footer into an HTML string.
 * Intended for HTML->PDF pipelines that render CSS @page counters.
 * Safe to call multiple times; ensures a single footer injection.
 * @param {string} html
 * @param {object} [opts]
 * @returns {string}
 */
function injectCssFooter(html, opts = {}) {
    const cfg = {
        textTemplate: (opts.textTemplate || reportConfig?.pdfFooter?.textTemplate || 'Page {current} of {total}'),
        bottomMarginMm: opts.bottomMarginMm || 18,
        fontSizePx: opts.fontSizePx || 10,
        colorHex: opts.colorHex || '#666',
        align: opts.align || (reportConfig?.pdfFooter?.align || 'center'),
    };

    // If HTML already has our marker class, skip injection
    if (html.includes('class="pdf-footer"') || html.includes("class='pdf-footer'")) {
        return html;
    }

    const alignCss = cfg.align === 'left' ? 'left' : (cfg.align === 'right' ? 'right' : 'center');
    const safeFooter = `
<style>
  @page {
    size: A4;
    margin: 20mm 12mm ${Math.max(12, cfg.bottomMarginMm)}mm 12mm;
  }
  .pdf-footer {
    position: fixed;
    bottom: 8mm;
    left: 0;
    right: 0;
    text-align: ${alignCss};
    color: ${cfg.colorHex};
    font-size: ${cfg.fontSizePx}px;
  }
  .pdf-footer .page-number:after {
    content: "${(cfg.textTemplate || '').replace('{current}', '" counter(page) "').replace('{total}', '" counter(pages) "')}";
  }
</style>
<div class="pdf-footer"><span class="page-number"></span></div>`;

    // Insert just before </head> if possible, else prepend
    if (html.includes('</head>')) {
        return html.replace('</head>', `${safeFooter}\n</head>`);
    }
    return `${safeFooter}\n${html}`;
}

/**
 * Adds a text footer "Page X of Y" to every page of an existing PDF buffer.
 * This is a universal fallback when we do not control HTML->PDF rendering.
 * @param {Buffer} pdfBuffer
 * @param {object} [opts]
 * @returns {Promise<Buffer>}
 */
async function addPdfFooterPagination(pdfBuffer, opts = {}) {
    const enabled = (opts.enabled !== undefined ? opts.enabled : reportConfig?.pdfFooter?.enabled) ?? true;
    if (!enabled) return pdfBuffer;

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    if (pages.length === 0) {
        return pdfBuffer;
    }

    const fontName = opts.fontName || reportConfig?.pdfFooter?.fontName || 'Helvetica';
    const font = await pdfDoc.embedFont(StandardFonts[fontName] || StandardFonts.Helvetica);

    const size = opts.fontSize || reportConfig?.pdfFooter?.fontSize || 9;
    const colorCfg = opts.color || reportConfig?.pdfFooter?.color || { r: 90, g: 90, b: 90 };
    const color = rgb(
        (colorCfg.r ?? 90) / 255,
        (colorCfg.g ?? 90) / 255,
        (colorCfg.b ?? 90) / 255
    );
    const bottomMarginPt = opts.bottomMarginPt || reportConfig?.pdfFooter?.bottomMarginPt || 24;
    const align = opts.align || reportConfig?.pdfFooter?.align || 'center';
    const template = opts.textTemplate || reportConfig?.pdfFooter?.textTemplate || 'Page {current} of {total}';

    const total = pages.length;
    for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width } = page.getSize();
        const current = i + 1;
        const text = template.replace('{current}', String(current)).replace('{total}', String(total));

        const textWidth = font.widthOfTextAtSize(text, size);
        const y = bottomMarginPt;
        let x = (width - textWidth) / 2;
        if (align === 'left') x = 36; // ~0.5 inch
        if (align === 'right') x = width - textWidth - 36;

        page.drawText(text, { x, y, size, font, color });
    }

    return Buffer.from(await pdfDoc.save());
}

module.exports = {
    injectCssFooter,
    addPdfFooterPagination,
};

