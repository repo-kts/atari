const prisma = require('../config/prisma.js');

/**
 * Resolves free-text master labels coming from the old site (e.g. account_type
 * "Kvk", discipline "Soil Science") to master-table primary keys in OUR db.
 *
 * Strategy: load every row of a master table once, build a normalized
 * name -> id index, then exact-match on the normalized string. No fuzzy match
 * by default — a miss is reported so the human decides (and the value is parked
 * in the corresponding *Other field). Caches per (model,nameField,idField) for
 * the lifetime of one transform request.
 */
function normalize(s) {
    return String(s ?? '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[._\-/]+/g, ' ')
        .trim();
}

class MasterResolver {
    constructor() {
        this.cache = new Map(); // key: `${model}.${nameField}.${idField}` -> {byName, rows}
    }

    async _index(model, nameField, idField) {
        const key = `${model}.${nameField}.${idField}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const rows = await prisma[model].findMany({
            select: { [idField]: true, [nameField]: true },
        });
        const byName = new Map();
        for (const r of rows) {
            byName.set(normalize(r[nameField]), r[idField]);
        }
        const byId = new Set(rows.map(r => r[idField]));
        const index = { byName, byId, rows };
        this.cache.set(key, index);
        return index;
    }

    /**
     * @returns {Promise<{id:number|null, matched:boolean, value:string}>}
     */
    async resolve(model, nameField, idField, rawValue) {
        const value = String(rawValue ?? '').trim();
        if (!value) return { id: null, matched: false, value };
        const { byName } = await this._index(model, nameField, idField);
        const id = byName.get(normalize(value));
        return { id: id ?? null, matched: id != null, value };
    }

    /**
     * Resolve by the OLD numeric id directly — valid when the old master and
     * ours were seeded identically so ids line up (e.g. sanctioned posts,
     * disciplines). Verifies the id actually exists in our table.
     */
    async resolveById(model, nameField, idField, rawId) {
        const id = Number(rawId);
        if (!Number.isInteger(id)) return { id: null, matched: false };
        const { byId } = await this._index(model, nameField, idField);
        return { id: byId.has(id) ? id : null, matched: byId.has(id) };
    }

    /**
     * Generic single-id lookup against any model (NOT cached) — used to resolve
     * a parent row's id by business key, e.g. vehicleId from kvkId + vehicleName.
     * @returns {Promise<number|null>}
     */
    async findId(model, where, idField) {
        const row = await prisma[model].findFirst({ where, select: { [idField]: true } });
        return row ? row[idField] : null;
    }

    /**
     * Find by name, or CREATE the master row if absent and return its id.
     * Uses upsert on the unique name field, so repeated transforms never
     * duplicate. @returns {Promise<{id:number, created:boolean}>}
     */
    async findOrCreate(model, nameField, idField, rawValue, opts = {}) {
        const value = String(rawValue ?? '').trim();
        if (!value) return { id: null, created: false };
        const hit = await this.resolve(model, nameField, idField, value);
        if (hit.matched) return { id: hit.id, created: false };
        // opts.uniqueField: the field to upsert on (defaults to nameField); must
        // be a unique column. opts.create: builder for the create payload, for
        // models whose create needs more than one column (e.g. status master).
        const uniqueField = opts.uniqueField || nameField;
        const createData = opts.create ? opts.create(value) : { [nameField]: value };
        const row = await prisma[model].upsert({
            where: { [uniqueField]: createData[uniqueField] },
            create: createData,
            update: {},
            select: { [idField]: true },
        });
        this.cache.delete(`${model}.${nameField}.${idField}`); // bust stale index
        return { id: row[idField], created: true };
    }
}

module.exports = { MasterResolver, normalize };
