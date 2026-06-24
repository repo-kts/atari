/**
 * "NICRA Others — Dignitaries Visited" — `NicraDignitariesVisited`.
 * Detailed, one-row-per-record payload grouped by KVK so admins see each KVK's
 * rows separately (no KVK column) while a single KVK user sees one group.
 * Mirrors the Other Extension/content detailed payload shape.
 */

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function sortStr(a, b) {
    return String(a || '').localeCompare(String(b || ''), undefined, { sensitivity: 'base' });
}

function normalizeDetailRow(r) {
    const kvkName = (r.kvkName && String(r.kvkName).trim())
        || (r.kvk && r.kvk.kvkName && String(r.kvk.kvkName).trim())
        || 'Unknown KVK';
    const type = String(
        r.type
        ?? (r.dignitaryType && r.dignitaryType.name)
        ?? r.dignitaryTypeName
        ?? '',
    ).trim() || 'Not specified';
    const name = String(r.name ?? '').trim();
    const remark = String(r.remark ?? '').trim();
    return {
        kvkName,
        dateOfVisit: r.dateOfVisit ? String(r.dateOfVisit).slice(0, 10) : '',
        type,
        name,
        remark,
    };
}

function buildDetailedPayloadFromRecords(records) {
    const norm = Array.isArray(records) ? records.map(normalizeDetailRow) : [];

    const byKvk = new Map();
    for (const r of norm) {
        if (!byKvk.has(r.kvkName)) byKvk.set(r.kvkName, []);
        byKvk.get(r.kvkName).push(r);
    }

    const groups = [...byKvk.keys()].sort(sortStr).map((kvkName) => {
        const list = byKvk.get(kvkName);
        const rows = list.map((r, i) => ({
            sno: i + 1,
            dateOfVisit: r.dateOfVisit,
            type: r.type,
            name: r.name,
            remark: r.remark,
        }));
        // No numeric count field — subtotal is the number of dignitary visits.
        const subtotal = rows.length;
        return { kvkName, rows, subtotal };
    });

    const grandTotal = groups.reduce((s, g) => s + safeInt(g.subtotal), 0);
    const isMultiKvk = groups.length > 1;

    return { groups, grandTotal, isMultiKvk, totalRecords: norm.length };
}

function resolveNicraDignitariesDetailedPayload(data) {
    const records = Array.isArray(data) ? data : (data ? [data] : []);
    return buildDetailedPayloadFromRecords(records);
}

module.exports = {
    buildDetailedPayloadFromRecords,
    resolveNicraDignitariesDetailedPayload,
    normalizeDetailRow,
};
