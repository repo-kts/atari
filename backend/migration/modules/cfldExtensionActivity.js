const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText, stripHtml } = require('../util.js');
const prisma = require('../../config/prisma.js');

function extractEditUrl(action) {
    if (!action) return null;
    const m =
        action.match(/href="([^"]*cfld-extension[^"]*\/edit[^"]*)"/i) ||
        action.match(/href="([^"]*cfld-extension[^"]*\/\d+[^"]*)"/i) ||
        action.match(/href="([^"]*edit[^"]*)"/i);
    return m ? m[1] : null;
}

function cfldExtEditUrl(id, action) {
    const fromAction = extractEditUrl(action);
    if (fromAction) {
        return fromAction.startsWith('http') ? fromAction : `https://atariams.org${fromAction}`;
    }
    const token = Buffer.from(String(id)).toString('base64');
    return `https://atariams.org/edit-cfld-extension/${token}`;
}

async function enrichCfldExtRows(rows, headers) {
    const fetchHeaders = {
        ...headers,
        accept: 'text/html,application/xhtml+xml',
        referer: 'https://atariams.org/project/cfld-extension-activity',
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
                    const url = cfldExtEditUrl(id, row.action);
                    const res = await fetch(url, { headers: fetchHeaders });
                    const html = await res.text();
                    if (res.ok && (html.includes('general_m') || html.includes('general_f') || html.includes('place'))) {
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

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

module.exports = {
    key: 'cfldExtensionActivity',
    label: 'CFLD Extension Activities',
    model: 'extensionActivityOrganized',
    idField: 'organizedId',
    naturalKey: ['kvkId', 'extensionActivityId', 'activityDate', 'placeOfActivity'],
    enrichCfldExtRows,

    foreignKeys: {
        kvkId: { master: 'kvk' },
        seasonId: { master: 'season', otherField: 'seasonOther' },
        extensionActivityId: { master: 'extensionActivity' },
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

        const html = row._editHtml || null;
        if (!html) {
            if (row._enrichFailed) warn('*', 'Edit page fetch failed — demographics default to 0');
            else warn('*', 'No edit page — demographics default to 0');
        }

        // ── Season ────────────────────────────────────────────────────────
        let seasonId = null;
        let seasonOther = null;
        const rawSeasonName =
            decodeEntities(cleanText(row.season?.season_name || row['season.season_name'])) || '';
        if (rawSeasonName) {
            const s = await r.resolve('season', 'seasonName', 'seasonId', rawSeasonName);
            if (s.matched) {
                seasonId = s.id;
            } else if (html) {
                const sel =
                    parseSelectedOption(html, 'season_id') ||
                    parseSelectedOption(html, 'season');
                if (sel?.name) {
                    const s2 = await r.resolve('season', 'seasonName', 'seasonId', sel.name);
                    if (s2.matched) seasonId = s2.id;
                    else seasonOther = sel.name;
                } else {
                    seasonOther = rawSeasonName;
                }
            } else {
                seasonOther = rawSeasonName;
            }
        }

        // ── Extension activity type (organised field) ─────────────────────
        // Old-site `organised` column contains the activity name text.
        // Find by name (case-insensitive); create if missing so all old data lands.
        let extensionActivityId = null;
        let resolvedName = decodeEntities(cleanText(String(row.organised || '')));

        // Try HTML select first (has exact name used in DB)
        if (html) {
            const sel =
                parseSelectedOption(html, 'extension_activity_id') ||
                parseSelectedOption(html, 'organised');
            if (sel?.id) {
                const n = parseInt(sel.id, 10);
                if (Number.isFinite(n) && n > 0) {
                    const found = await prisma.extensionActivity.findUnique({
                        where: { extensionActivityId: n },
                    });
                    if (found) { extensionActivityId = found.extensionActivityId; resolvedName = found.extensionName; }
                }
            }
            if (!extensionActivityId && sel?.name) resolvedName = sel.name || resolvedName;
        }

        // Find-or-create by name
        if (!extensionActivityId && resolvedName) {
            const found = await prisma.extensionActivity.findFirst({
                where: { extensionName: { equals: resolvedName, mode: 'insensitive' } },
            });
            if (found) {
                extensionActivityId = found.extensionActivityId;
            } else {
                const created = await prisma.extensionActivity.create({
                    data: { extensionName: resolvedName },
                });
                extensionActivityId = created.extensionActivityId;
                warn('extensionActivityId', `Created ExtensionActivity "${resolvedName}"`);
            }
        }

        if (!extensionActivityId)
            err('extensionActivityId', 'Missing extension activity name — cannot resolve or create');

        // ── Activity date ─────────────────────────────────────────────────
        let activityDate = null;
        const rawDate = row.date || row.activity_date;
        if (rawDate) activityDate = parseDate(String(rawDate));
        if (!activityDate && html) {
            const v =
                parseInputValue(html, 'date') ||
                parseInputValue(html, 'activity_date');
            if (v) activityDate = parseDate(v);
        }
        if (!activityDate) err('activityDate', 'Missing activity date (required)');

        // ── Place ─────────────────────────────────────────────────────────
        let placeOfActivity = decodeEntities(cleanText(String(row.place || '')));
        if (!placeOfActivity && html) {
            placeOfActivity = decodeEntities(
                cleanText(
                    parseInputValue(html, 'place') ||
                    parseInputValue(html, 'place_of_activity'),
                ),
            );
        }
        if (!placeOfActivity) warn('placeOfActivity', 'Missing place — stored as empty string');

        // ── Demographics ──────────────────────────────────────────────────
        let generalM = 0, generalF = 0, obcM = 0, obcF = 0;
        let scM = 0, scF = 0, stM = 0, stF = 0;
        if (html) {
            generalM = intOrZero(parseInputValue(html, 'general_m'));
            generalF = intOrZero(parseInputValue(html, 'general_f'));
            obcM    = intOrZero(parseInputValue(html, 'obc_m'));
            obcF    = intOrZero(parseInputValue(html, 'obc_f'));
            scM     = intOrZero(parseInputValue(html, 'sc_m'));
            scF     = intOrZero(parseInputValue(html, 'sc_f'));
            stM     = intOrZero(parseInputValue(html, 'st_m'));
            stF     = intOrZero(parseInputValue(html, 'st_f'));
        } else {
            const listTotal = intOrZero(row.sub_total);
            if (listTotal > 0) {
                generalM = listTotal;
                warn('generalM', `No edit page — placed sub_total (${listTotal}) into generalM`);
            }
        }

        return {
            data: {
                kvkId: mappedKvkId,
                seasonId: seasonId || null,
                seasonOther: seasonOther || null,
                extensionActivityId,
                activityDate,
                placeOfActivity: placeOfActivity || '',
                generalM,
                generalF,
                obcM,
                obcF,
                scM,
                scF,
                stM,
                stF,
            },
            issues,
        };
    },
};
