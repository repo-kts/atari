const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Publications (Achievements).
 * Source: atariams.org `publication-data`. Writes kvk_publication_details.
 *
 * Every field lives on the DataTables list row (nested kvk/publication_item
 * objects) — no per-row edit-page fetch.
 *
 * Publication type: publication_item.item_name → Publication master
 * (publicationName). It's a nullable FK with NO *_other column in the schema,
 * so an unmatched type is left null and reported. The matched name also drives
 * which detail fields the new form shows (journal/naas vs publisher/venue/isbn),
 * but the old site stores all of them flat — we migrate whatever is present and
 * let the form's conditional display decide what to surface.
 *
 * Old "-" placeholders (naas_rating, isbn_number, …) are treated as empty.
 */

/** cleanText + treat the old "-" placeholder as empty. */
function clean(v) {
    const s = cleanText(v);
    return s === '-' ? null : s;
}

function floatOrNull(v) {
    const s = clean(v);
    if (s == null) return null;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
}

function asObject(value) {
    if (value == null) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return null; }
    }
    return null;
}

module.exports = {
    key: 'publication',
    label: 'Publications',
    model: 'kvkPublicationDetails',
    idField: 'publicationDetailsId',
    naturalKey: ['kvkId', 'reportingYear', 'publicationId', 'title', 'authorName'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        publicationId: { master: 'publication' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, msg) => issues.push({ field, message: msg, severity: 'warn' });

        // 1. KVK match — same guard as the other achievement modules.
        const kvkObj = asObject(row.kvk);
        const oldKvkName = decodeEntities(cleanText(kvkObj?.kvk_name || row['kvk.kvk_name'])) || '';
        if (!oldKvkName) {
            warn('kvkId', 'KVK name not in row — using selected target KVK');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const kvkId = ctx.kvkId;

        // 2. Reporting year ← old fiscal int (e.g. 2024) → Jan 1 of that year (UTC),
        // which falls inside the calendar-year report filter. Nullable.
        const reportingYear = (() => {
            const iso = parseDate(String(row.year ?? ''));
            return iso ? new Date(iso) : null;
        })();

        // 3. Publication type — resolve by name. Nullable FK, no *_other column,
        // so an unmatched type is left null and reported.
        let publicationId = null;
        const itemName = decodeEntities(cleanText(asObject(row.publication_item)?.item_name || row['publication_item.item_name'] || ''));
        if (itemName) {
            const p = await r.resolve('publication', 'publicationName', 'publicationId', itemName);
            if (p.matched) publicationId = p.id;
            else warn('publicationId', `Publication type "${itemName}" not in master — left blank`);
        } else {
            warn('publicationId', 'No publication type on old row');
        }

        // 4. Title + author (both REQUIRED, NOT NULL). Default to '' and warn.
        const title = decodeEntities(clean(row.title)) || '';
        if (!title) warn('title', 'No title on old row');
        const authorName = decodeEntities(clean(row.author_name)) || '';
        if (!authorName) warn('authorName', 'No author name on old row');

        // 5. Detail fields — all flat on the old row; migrate whatever is present.
        const journalName = decodeEntities(clean(row.journal_name));
        const naasRating = floatOrNull(row.naas_rating);
        const publisherName = decodeEntities(clean(row.source_name));
        const venue = decodeEntities(clean(row.venue));
        const isbnNumber = clean(row.isbn_number);

        const data = {
            kvkId,
            reportingYear,
            publicationId,
            title,
            authorName,
            journalName,
            naasRating,
            publisherName,
            venue,
            isbnNumber,
        };

        return { data, issues };
    },
};
