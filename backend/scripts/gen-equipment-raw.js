#!/usr/bin/env node
/**
 * Generate backend/constants/equipmentRaw.js from the source CSV.
 *
 * Source: backend/scripts/equipment-raw-all.csv — 3 columns, header skipped:
 *   Equipment Type, Equipment, Original Equipment
 * which map to: [equipmentType, equipmentName, companyBrandModel].
 *
 *   - equipmentType      → equipment_type_master.name
 *   - equipmentName      → equipment_master.name (curated, under its type)
 *   - companyBrandModel  → equipment_model_master.name (old-site raw name;
 *                          the migration-only reverse-lookup key)
 *
 * Run from backend/: node scripts/gen-equipment-raw.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'equipment-raw-all.csv');
const OUT = path.join(__dirname, '..', 'constants', 'equipmentRaw.js');

/** Parse one CSV line into fields (RFC-4180: quotes, "" escapes, embedded commas). */
function parseLine(line) {
    const out = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
        const c = line[i];
        if (inQuotes) {
            if (c === '"') {
                if (line[i + 1] === '"') { field += '"'; i += 1; }
                else inQuotes = false;
            } else field += c;
        } else if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            out.push(field); field = '';
        } else field += c;
    }
    out.push(field);
    return out;
}

function clean(s) {
    return String(s ?? '').replace(/\s+/g, ' ').trim();
}

function esc(s) {
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function main() {
    const raw = fs.readFileSync(SRC, 'utf8').replace(/\r\n?/g, '\n');
    const lines = raw.split('\n').filter((l) => l.trim() !== '');
    lines.shift(); // drop header row

    const tuples = [];
    let skipped = 0;
    for (const line of lines) {
        const cols = parseLine(line);
        const type = clean(cols[0]);
        const name = clean(cols[1]);
        const model = clean(cols[2]);
        // Type + curated equipment name are required to anchor the hierarchy.
        if (!type || !name) { skipped += 1; continue; }
        tuples.push([type, name, model]);
    }

    const body = tuples
        .map(([t, n, m]) => `    ['${esc(t)}', '${esc(n)}', '${esc(m)}'],`)
        .join('\n');

    const file = `/**
 * GENERATED — do not edit by hand. Run \`node scripts/gen-equipment-raw.js\`.
 * Source: backend/scripts/equipment-raw-all.csv
 *
 * [equipmentType, equipmentName, companyBrandModel]
 *   equipmentType     → equipment_type_master.name
 *   equipmentName     → equipment_master.name (curated, under its type)
 *   companyBrandModel → equipment_model_master.name (old-site raw name;
 *                       migration-only reverse-lookup key)
 */
const RAW = [
${body}
];

module.exports = { RAW };
`;

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, file);
    console.log(`Wrote ${tuples.length} rows to ${path.relative(process.cwd(), OUT)} (${skipped} skipped).`);
}

main();
