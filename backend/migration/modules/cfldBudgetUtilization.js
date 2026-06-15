const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, stripHtml } = require('../util.js');
const prisma = require('../../config/prisma.js');

function extractEditUrl(action) {
    if (!action) return null;
    const m =
        action.match(/href="([^"]*cfld-budget[^"]*\/edit[^"]*)"/i) ||
        action.match(/href="([^"]*cfld-budget[^"]*\/\d+[^"]*)"/i) ||
        action.match(/href="([^"]*edit[^"]*)"/i);
    return m ? m[1] : null;
}

function cfldBudgetEditUrl(id, action) {
    const fromAction = extractEditUrl(action);
    if (fromAction) {
        return fromAction.startsWith('http') ? fromAction : `https://atariams.org${fromAction}`;
    }
    const token = Buffer.from(String(id)).toString('base64');
    return `https://atariams.org/edit-cfld-budget/${token}`;
}

async function enrichCfldBudgetRows(rows, headers) {
    const fetchHeaders = {
        ...headers,
        accept: 'text/html,application/xhtml+xml',
        referer: 'https://atariams.org/project/cfld-budget-utilization',
    };
    const concurrency = 5;
    const enriched = new Array(rows.length);

    for (let i = 0; i < rows.length; i += concurrency) {
        const chunk = rows.slice(i, i + concurrency);
        await Promise.all(
            chunk.map(async (row, ci) => {
                const gi = i + ci;
                const id = row?.id;
                if (!id) { enriched[gi] = row; return; }

                try {
                    const url = cfldBudgetEditUrl(id, row.action);
                    const res = await fetch(url, { headers: fetchHeaders });
                    const html = await res.text();
                    if (res.ok && (html.includes('fund_allocated') || html.includes('area_ha') || html.includes('area_allotted') || html.includes('budget_received'))) {
                        enriched[gi] = { ...row, _editHtml: html };
                    } else {
                        enriched[gi] = { ...row, _editHtml: null, _enrichFailed: true };
                    }
                } catch {
                    enriched[gi] = { ...row, _editHtml: null, _enrichFailed: true };
                }
            }),
        );
    }
    return enriched;
}

function parseInputValue(html, name) {
    if (!html) return '';
    const m1 = html.match(new RegExp(`<input[^>]*name="${name}"[^>]*value="([^"]*)"`, 'i'));
    if (m1) return m1[1].trim();
    const m2 = html.match(new RegExp(`<input[^>]*value="([^"]*)"[^>]*name="${name}"`, 'i'));
    return m2 ? m2[1].trim() : '';
}

function parseSelectedOption(html, name) {
    if (!html) return null;
    const sel = html.match(new RegExp(`name="${name}"[^>]*>([\\s\\S]*?)<\\/select>`, 'i'));
    if (!sel) return null;
    const opt = sel[1].match(/<option[^>]*value="([^"]*)"[^>]*selected[^>]*>([\s\S]*?)<\/option>/i);
    if (!opt) return null;
    return { id: opt[1].trim(), name: stripHtml(opt[2]).trim() };
}

/**
 * Parse budget item rows from edit page HTML.
 * Tries 3 common Laravel form patterns, stops at first that yields results.
 *
 * Pattern 1: items[N][budget_item_id] hidden + items[N][budget_received/utilized]
 * Pattern 2: budget_received[N] / budget_utilized[N]  where N = budget_item_id
 * Pattern 3: budget_item_id[] / budget_received[] / budget_utilized[]  (positional arrays)
 */
function parseBudgetItems(html) {
    if (!html) return [];
    const items = [];
    const seen = new Set();

    // Pattern 1: items[N][field] with explicit budget_item_id hidden input
    const byIdx = {};
    for (const [, idx, val] of html.matchAll(/items\[(\d+)\]\[budget_item_id\][^>]*value="(\d+)"/gi)) {
        byIdx[idx] = { budgetItemId: parseInt(val, 10) };
    }
    for (const [idx, obj] of Object.entries(byIdx)) {
        const r = html.match(new RegExp(`items\\[${idx}\\]\\[budget_received\\][^>]*value="([^"]*)"`, 'i'));
        const u = html.match(new RegExp(`items\\[${idx}\\]\\[budget_utiliz[^"\\]]*\\][^>]*value="([^"]*)"`, 'i'));
        obj.budgetReceived = parseFloat(r?.[1] || '0') || 0;
        obj.budgetUtilized = parseFloat(u?.[1] || '0') || 0;
        if (!seen.has(obj.budgetItemId)) { seen.add(obj.budgetItemId); items.push(obj); }
    }
    if (items.length) return items;

    // Pattern 2: budget_received[N] where N is the budget_item_id directly
    const recvMap = {};
    const utilMap = {};
    for (const [, id, val] of html.matchAll(/budget_received\[(\d+)\][^>]*value="([^"]*)"/gi)) {
        recvMap[id] = parseFloat(val) || 0;
    }
    for (const [, id, val] of html.matchAll(/budget_utiliz[a-z]*\[(\d+)\][^>]*value="([^"]*)"/gi)) {
        utilMap[id] = parseFloat(val) || 0;
    }
    for (const id of new Set([...Object.keys(recvMap), ...Object.keys(utilMap)])) {
        const n = parseInt(id, 10);
        if (!seen.has(n)) {
            seen.add(n);
            items.push({ budgetItemId: n, budgetReceived: recvMap[id] ?? 0, budgetUtilized: utilMap[id] ?? 0 });
        }
    }
    if (items.length) return items;

    // Pattern 3: positional arrays budget_item_id[] / budget_received[] / budget_utilized[]
    const ids   = [...html.matchAll(/<input[^>]*name="budget_item_id\[\]"[^>]*value="(\d+)"/gi)].map(x => parseInt(x[1], 10));
    const recvs = [...html.matchAll(/<input[^>]*name="budget_received\[\]"[^>]*value="([^"]*)"/gi)].map(x => parseFloat(x[1]) || 0);
    const utils = [...html.matchAll(/<input[^>]*name="budget_utiliz[^"]*\[\]"[^>]*value="([^"]*)"/gi)].map(x => parseFloat(x[1]) || 0);
    ids.forEach((id, i) => {
        if (!seen.has(id)) {
            seen.add(id);
            items.push({ budgetItemId: id, budgetReceived: recvs[i] ?? 0, budgetUtilized: utils[i] ?? 0 });
        }
    });

    return items;
}

function floatOrZero(v) {
    const n = parseFloat(String(v ?? '').trim());
    return Number.isFinite(n) ? n : 0;
}

/**
 * Parse budget items from the `fund_detail` field on a DataTables list row.
 * The field is an HTML-entity-encoded JSON array:
 *   [{"item":"Critical input","budget_received":"1100000","budget_utilization":"1098578","balance":1422}, ...]
 * Returns [{itemName, budgetReceived, budgetUtilized}] for find-or-create seeding.
 */
function parseFundDetail(raw) {
    if (!raw) return [];
    try {
        const decoded = String(raw)
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#039;/gi, "'")
            .replace(/\\/g, '');
        const arr = JSON.parse(decoded);
        if (!Array.isArray(arr)) return [];
        return arr
            .filter(e => e && e.item)
            .map(e => ({
                itemName: String(e.item).trim(),
                budgetReceived: floatOrZero(e.budget_received),
                budgetUtilized: floatOrZero(e.budget_utilization),
            }));
    } catch {
        return [];
    }
}

module.exports = {
    key: 'cfldBudgetUtilization',
    label: 'CFLD Budget Utilization',
    model: 'kvkBudgetUtilization',
    idField: 'budgetId',
    naturalKey: ['kvkId', 'year', 'cropId', 'seasonId'],
    enrichCfldBudgetRows,

    foreignKeys: {
        kvkId: { master: 'kvk' },
        cropId: { master: 'fldCrop', otherField: null },
        seasonId: { master: 'season', otherField: 'seasonOther' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // ── KVK ───────────────────────────────────────────────────────────
        const oldKvkName =
            decodeEntities(cleanText(row.kvk?.kvk_name || row['kvk.kvk_name'])) || '';
        if (!oldKvkName) {
            err('kvkId', 'Missing KVK name');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const mappedKvkId = ctx.kvkId;

        // ── Crop (cropId → FldCrop) ───────────────────────────────────────
        let cropId = null;
        const rawCropName =
            decodeEntities(cleanText(row.crop?.name || row['crop.name'] || row.crop?.crop_name)) || '';
        if (rawCropName) {
            const c = await r.resolve('fldCrop', 'cropName', 'cropId', rawCropName);
            if (c.matched) cropId = c.id;
            else warn('cropId', `Crop "${rawCropName}" not found — stored as null`);
        }

        // ── Season ────────────────────────────────────────────────────────
        let seasonId = null;
        let seasonOther = null;
        const rawSeasonName =
            decodeEntities(cleanText(row.season?.season_name || row['season.season_name'])) || '';
        if (rawSeasonName) {
            const s = await r.resolve('season', 'seasonName', 'seasonId', rawSeasonName);
            if (s.matched) seasonId = s.id;
            else seasonOther = rawSeasonName;
        }

        // ── Year (required Int) — direct from row.reporting_year ──────────
        let year = 0;
        if (row.reporting_year) year = parseInt(String(row.reporting_year), 10) || 0;
        if (!year && row.year) year = parseInt(String(row.year), 10) || 0;
        if (!year) err('year', 'Could not determine year — required');

        // ── Reporting year date ───────────────────────────────────────────
        let reportingYearDate = null;
        if (year > 1990 && year < 2100) {
            reportingYearDate = new Date(Date.UTC(year, 3, 1)).toISOString();
        }

        // ── Fund allocation — direct from list row ────────────────────────
        const overallFundAllocation = floatOrZero(row.fund_allocated);

        // ── Area — direct from list row (old site typo: area_alloted) ─────
        const areaAllotted = floatOrZero(row.area_alloted ?? row.area_allotted);
        const areaAchieved = floatOrZero(row.area_achieved);

        // ── Budget line items — from fund_detail JSON on list row ─────────
        // fund_detail is a JSON array (HTML-entity-encoded) embedded in the
        // DataTables response: [{item, budget_received, budget_utilization}, ...]
        const _budgetItems = parseFundDetail(row.fund_detail);
        if (!_budgetItems.length) {
            warn('_budgetItems', 'No budget items parsed from fund_detail — check raw row');
        }

        return {
            data: {
                kvkId: mappedKvkId,
                year,
                reportingYearDate,
                seasonId: seasonId || null,
                seasonOther: seasonOther || null,
                cropId: cropId || null,
                overallFundAllocation,
                areaAllotted,
                areaAchieved,
                _budgetItems,
            },
            issues,
        };
    },

    async seedRecord(prisma, data) {
        const budgetItems = data._budgetItems || [];
        const mainData = { ...data };
        delete mainData._budgetItems;

        // Always insert a new main record — distinct source rows can share kvk +
        // year + crop + season but are separate records. Matching/updating would
        // collapse them.
        const created = await prisma.kvkBudgetUtilization.create({ data: mainData });
        const budgetId = created.budgetId;

        // Upsert each budget line item (find-or-create BudgetItem by name)
        for (const item of budgetItems) {
            if (!item.itemName) continue;
            let master = await prisma.budgetItem.findFirst({
                where: { itemName: { equals: item.itemName, mode: 'insensitive' } },
            });
            if (!master) {
                master = await prisma.budgetItem.create({ data: { itemName: item.itemName } });
            }
            const budgetItemId = master.budgetItemId;
            await prisma.kvkBudgetUtilizationItem.upsert({
                where: { budgetId_budgetItemId: { budgetId, budgetItemId } },
                create: {
                    budgetId,
                    budgetItemId,
                    budgetReceived: item.budgetReceived ?? 0,
                    budgetUtilized: item.budgetUtilized ?? 0,
                },
                update: {
                    budgetReceived: item.budgetReceived ?? 0,
                    budgetUtilized: item.budgetUtilized ?? 0,
                },
            });
        }

        return 'created';
    },
};
