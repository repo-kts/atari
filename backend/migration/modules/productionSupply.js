const prisma = require('../../config/prisma.js');
const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');

/**
 * Module spec: KVK Production & Supply of Technological Products (Achievements).
 * Source: atariams.org `production-and-supply`. Writes kvk_production_supply.
 *
 * Every field lives on the DataTables list row (nested kvk/category/type/product
 * objects) — no per-row edit-page fetch.
 *
 * Product hierarchy: category.name → ProductCategory, type.name → ProductType,
 * product.name → Product. Each is resolved by name and parked in its *_other
 * column when unmatched (all three FKs are nullable). `variety` is the new
 * `speciesName`. The old `*_t` totals are derived on the old site and recomputed
 * in our UI — dropped here.
 *
 * Unit: kvk_production_supply no longer stores a unit — it derives from the
 * linked Product's master unit. Old rows never carry one, and many Products lack
 * a unit link. The grid exposes an editable `unitId` picker (prefilled from the
 * Product's current link); on seed it's back-filled onto the Product master
 * (only when the Product has no unit yet — existing links are never overwritten)
 * so the app's production-supply form shows that unit read-only off the Product.
 */

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

function floatOrNull(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = parseFloat(String(v).trim());
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

/** The resolved Product's currently-linked unit, if any. */
async function unitInfoForProduct(productId) {
    if (!productId) return { unitId: null, unitName: '' };
    const product = await prisma.product.findUnique({
        where: { productId },
        select: { unitId: true },
    });
    if (!product?.unitId) return { unitId: null, unitName: '' };
    const unit = await prisma.unit.findUnique({
        where: { unitId: product.unitId },
        select: { unitName: true },
    });
    return { unitId: product.unitId, unitName: unit?.unitName || '' };
}

module.exports = {
    key: 'production-supply',
    label: 'Production & Supply of Technological Products',
    model: 'kvkProductionSupply',
    idField: 'productionSupplyId',
    naturalKey: ['kvkId', 'reportingYear', 'productId', 'speciesName', 'quantity', 'value'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        productCategoryId: { master: 'productCategory', otherField: 'productCategoryOther' },
        productTypeId: { master: 'productType', otherField: 'productTypeOther' },
        productId: { master: 'product', otherField: 'productOther' },
        // Editable unit picker. Not a kvk_production_supply column — seedRecord
        // turns it into the `unit` string AND back-fills the Product's unitId.
        unitId: { master: 'unit' },
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
        const reportingYear = row.reporting_year != null
            ? (() => { const iso = parseDate(String(row.reporting_year)); return iso ? new Date(iso) : null; })()
            : null;

        // 3. Product hierarchy — resolve each by name, park unmatched in *_other.
        let productCategoryId = null, productCategoryOther = null;
        const catName = decodeEntities(cleanText(asObject(row.category)?.name || row['category.name'] || ''));
        if (catName) {
            const c = await r.resolve('productCategory', 'productCategoryName', 'productCategoryId', catName);
            if (c.matched) productCategoryId = c.id;
            else { productCategoryOther = catName; warn('productCategoryId', `Category "${catName}" not in master — parked in Other`); }
        }

        let productTypeId = null, productTypeOther = null;
        const typeName = decodeEntities(cleanText(asObject(row.type)?.name || row['type.name'] || ''));
        if (typeName) {
            const t = await r.resolve('productType', 'productCategoryType', 'productTypeId', typeName);
            if (t.matched) productTypeId = t.id;
            else { productTypeOther = typeName; warn('productTypeId', `Type "${typeName}" not in master — parked in Other`); }
        }

        let productId = null, productOther = null;
        const prodName = decodeEntities(cleanText(asObject(row.product)?.name || row['product.name'] || ''));
        if (prodName) {
            const p = await r.resolve('product', 'productName', 'productId', prodName);
            if (p.matched) productId = p.id;
            else { productOther = prodName; warn('productId', `Product "${prodName}" not in master — parked in Other`); }
        }

        // 4. Species / breed / variety (optional string) ← old `variety`.
        const speciesName = decodeEntities(cleanText(row.variety || ''));

        // 5. Unit — not stored on the record; derives from the Product master.
        // Prefill the editable unitId picker from the Product's current link (if
        // any); the operator sets it in the grid for products that still lack a
        // unit, and seedRecord back-fills the Product master.
        const { unitId } = await unitInfoForProduct(productId);
        if (!unitId) warn('unitId', 'Product has no unit in master — pick one to back-fill it');

        // 6. Quantity / value (both REQUIRED numbers). Non-numeric quantity is
        // parked in quantityText (matches the string/boolean datatype path).
        let quantity = floatOrNull(row.quantity);
        let quantityText = null;
        if (quantity === null && row.quantity != null && String(row.quantity).trim() !== '') {
            quantityText = String(row.quantity).trim();
            quantity = 0;
            warn('quantity', `Non-numeric quantity "${quantityText}" — parked in quantityText`);
        }
        if (quantity === null) quantity = 0;
        const value = floatOrNull(row.value) ?? 0;

        const data = {
            kvkId,
            reportingYear,
            productCategoryId,
            productCategoryOther,
            productTypeId,
            productTypeOther,
            productId,
            productOther,
            speciesName,
            // Virtual — editable in the grid, consumed/stripped by seedRecord.
            // Not a kvk_production_supply column; only back-fills Product.unitId.
            unitId,
            quantity,
            quantityText,
            value,
            // Farmer demographics — *_t totals dropped (UI recomputes).
            farmersGeneralM: intOrZero(row.general_m),
            farmersGeneralF: intOrZero(row.general_f),
            farmersObcM: intOrZero(row.obc_m),
            farmersObcF: intOrZero(row.obc_f),
            farmersScM: intOrZero(row.sc_m),
            farmersScF: intOrZero(row.sc_f),
            farmersStM: intOrZero(row.st_m),
            farmersStF: intOrZero(row.st_f),
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        // `unitId` is a virtual grid field, not a kvk_production_supply column.
        // Unit isn't stored on the record — it's only back-filled onto the Product.
        const { unitId, ...record } = data;

        // Always insert — the old site holds genuine duplicate rows that are
        // distinct records. No dedupe.
        await prisma.kvkProductionSupply.create({ data: record });

        // Back-fill the Product master's unit when it's missing one. Never
        // overwrite an existing link — curated units win.
        if (record.productId && unitId) {
            const product = await prisma.product.findUnique({
                where: { productId: record.productId },
                select: { unitId: true },
            });
            if (product && product.unitId == null) {
                await prisma.product.update({
                    where: { productId: record.productId },
                    data: { unitId: Number(unitId) },
                });
            }
        }

        return 'created';
    },
};
