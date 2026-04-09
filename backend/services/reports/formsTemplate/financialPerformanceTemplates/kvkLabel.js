/**
 * Resolve KVK display name from report rows or raw list API rows (flat or nested kvk).
 */
function kvkNameOf(row) {
    if (!row) return '';
    const flat = row.kvkName != null && String(row.kvkName).trim() !== ''
        ? String(row.kvkName).trim()
        : '';
    if (flat) return flat;
    const nested = row.kvk?.kvkName != null && String(row.kvk.kvkName).trim() !== ''
        ? String(row.kvk.kvkName).trim()
        : '';
    return nested;
}

module.exports = {
    kvkNameOf,
};
