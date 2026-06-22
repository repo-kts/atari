const { normalize } = require('../masterResolver.js');
const prisma = require('../../config/prisma.js');
const {
    parseYearMonth,
    parseDate,
    decodeEntities,
    cleanText,
    stripHtml,
} = require('../util.js');

const SEASON_MAP = { 1: 'Kharif', 2: 'Rabi', 3: 'Summer' };

const STATUS_MAP = {
    ongoing: 'ONGOING',
    transferred: 'TRANSFERRED',
    transfered: 'TRANSFERRED',
    transferred_to_next_year: 'TRANSFERRED',
    completed: 'COMPLETED',
};

function normalizeCfldStatus(raw) {
    if (!raw) return 'ONGOING';
    const key = raw.toLowerCase().replace(/[\s-]+/g, '_');
    return STATUS_MAP[key] || 'ONGOING';
}

function getRawStatusText(row) {
    const progressHtml = row.progress_status || '';
    if (progressHtml.toLowerCase().includes('transfer')) return 'transferred';
    if (progressHtml.toLowerCase().includes('complete')) return 'completed';
    if (row.status) return row.status;
    if (progressHtml) return stripHtml(progressHtml);
    return '';
}

/** Extract the edit page URL from the action HTML. */
function extractEditUrl(action) {
    if (!action) return null;
    // matches href="…cfld…edit…" or href="…cfld/{id}/edit" patterns
    const m =
        action.match(/href="([^"]*cfld[^"]*\/edit[^"]*)"/i) ||
        action.match(/href="([^"]*cfld[^"\/]*\/\d+[^"]*)"/i) ||
        action.match(/href="([^"]*edit[^"]*)"/i);
    return m ? m[1] : null;
}

function cfldEditUrl(id, action) {
    const fromAction = extractEditUrl(action);
    if (fromAction) {
        return fromAction.startsWith('http')
            ? fromAction
            : `https://atariams.org${fromAction}`;
    }
    // Fallback: same base64 token convention as OFT/FLD
    const token = Buffer.from(String(id)).toString('base64');
    return `https://atariams.org/edit-cfld/${token}`;
}

/** Extract numeric record id from the row or its action HTML. */
function extractNumericId(row) {
    if (row?.id && /^\d+$/.test(String(row.id))) return String(row.id);
    const action = row?.action || '';
    const m =
        action.match(/\/cfld\/(\d+)\//i) ||
        action.match(/\/(\d+)\/edit/i) ||
        action.match(/data-id=['"](\d+)['"]/i) ||
        action.match(/\?id=(\d+)/i);
    return m ? m[1] : null;
}

/**
 * Candidate sub-form URLs for each section. The old site uses one of these
 * route patterns; we try them all and accept the first that returns valid HTML
 * containing a known section-specific field name.
 */
function subformUrlCandidates(numericId, section) {
    const token = Buffer.from(String(numericId)).toString('base64');
    const base = 'https://atariams.org';

    const routes = {
        economic: [
            `${base}/edit-cfld-economic/${token}`,
            `${base}/project/cfldeconomicparameters/${numericId}/edit`,
            `${base}/project/cfldeconomic/${numericId}/edit`,
            `${base}/project/cfld-economic-parameters/${numericId}/edit`,
            `${base}/project/cfld/${numericId}/economic/edit`,
        ],
        socio: [
            `${base}/edit-cfld-socio/${token}`,
            `${base}/project/cfldsocioeconomicparameters/${numericId}/edit`,
            `${base}/project/cfldsocioeconomic/${numericId}/edit`,
            `${base}/project/cfld-socio-economic-parameters/${numericId}/edit`,
            `${base}/project/cfld/${numericId}/socioeconomic/edit`,
        ],
        perception: [
            `${base}/edit-cfld-perception/${token}`,
            `${base}/project/cfldfarmersperceptionparameters/${numericId}/edit`,
            `${base}/project/cfldfarmerspercption/${numericId}/edit`,
            `${base}/project/cfldperception/${numericId}/edit`,
            `${base}/project/cfld-farmers-perception-parameters/${numericId}/edit`,
            `${base}/project/cfld/${numericId}/perception/edit`,
        ],
    };
    return routes[section] || [];
}

/** Try each candidate URL; return first HTML that contains `checkStr`. */
async function tryFetchSubform(candidates, headers, checkStr) {
    for (const url of candidates) {
        try {
            const res = await fetch(url, { headers });
            if (!res.ok) continue;
            const html = await res.text();
            if (html.includes(checkStr)) return html;
        } catch { /* next */ }
    }
    return null;
}

/**
 * Scan main edit page HTML for sub-form links as a FASTER fallback before
 * brute-force URL construction. Returns { economic, socio, perception } hrefs.
 */
function parseSubformLinks(html) {
    const links = {};
    for (const [, href] of html.matchAll(/href="([^"]+)"/gi)) {
        const u = href.toLowerCase();
        if (!links.economic && (u.includes('economic') && !u.includes('socio'))) links.economic = href;
        if (!links.socio && u.includes('socio')) links.socio = href;
        if (!links.perception && (u.includes('perception') || u.includes('perceiv'))) links.perception = href;
    }
    return links;
}

function toAbsoluteUrl(href) {
    if (!href) return null;
    return href.startsWith('http') ? href : `https://atariams.org${href}`;
}

async function enrichCfldRows(rows, headers) {
    const fetchHeaders = {
        ...headers,
        accept: 'text/html,application/xhtml+xml',
        referer: 'https://atariams.org/project/cfld',
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

                let enrichedRow = {
                    ...row,
                    _editHtml: null,
                    _economicHtml: null,
                    _socioHtml: null,
                    _perceptionHtml: null,
                };

                // 1. Main edit page
                let mainHtml = null;
                try {
                    const url = cfldEditUrl(id, row.action);
                    const res = await fetch(url, { headers: fetchHeaders });
                    const html = await res.text();
                    if (res.ok && (html.includes('variety_name') || html.includes('existing_yield') || html.includes('yield_max'))) {
                        mainHtml = html;
                        enrichedRow._editHtml = html;
                    } else {
                        enrichedRow._enrichFailed = true;
                    }
                } catch {
                    enrichedRow._enrichFailed = true;
                }

                // 2. Sub-form pages
                // Strategy: parse links from main page first (fast); fall back to
                // trying all known URL patterns (slow but exhaustive).
                if (mainHtml) {
                    const numId = extractNumericId(row);
                    const subLinks = parseSubformLinks(mainHtml);

                    const fetchSubform = async (section, checkStr) => {
                        // a. Link extracted from main page HTML
                        const fromLink = subLinks[section];
                        if (fromLink) {
                            try {
                                const res = await fetch(toAbsoluteUrl(fromLink), { headers: fetchHeaders });
                                if (res.ok) {
                                    const html = await res.text();
                                    if (html.includes(checkStr)) return html;
                                }
                            } catch { /* fall through */ }
                        }
                        // b. Brute-force URL candidates
                        if (numId) {
                            return tryFetchSubform(
                                subformUrlCandidates(numId, section),
                                fetchHeaders,
                                checkStr,
                            );
                        }
                        return null;
                    };

                    const [econHtml, socioHtml, percHtml] = await Promise.all([
                        fetchSubform('economic', 'gross_cost'),
                        fetchSubform('socio', 'total_produce'),
                        fetchSubform('perception', 'suitability'),
                    ]);

                    if (econHtml) enrichedRow._economicHtml = econHtml;
                    if (socioHtml) enrichedRow._socioHtml = socioHtml;
                    if (percHtml) enrichedRow._perceptionHtml = percHtml;
                }

                enriched[gi] = enrichedRow;
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

function parseTextarea(html, name) {
    if (!html) return '';
    const m = html.match(new RegExp(`name="${name}"[^>]*>([\\s\\S]*?)<\\/textarea>`, 'i'));
    return m ? m[1].trim() : '';
}

function parseSelectedOption(html, name) {
    if (!html) return null;
    const sel = html.match(new RegExp(`name="${name}"[^>]*>([\\s\\S]*?)<\\/select>`, 'i'));
    if (!sel) return null;
    const opt = sel[1].match(/<option[^>]*value="([^"]*)"[^>]*selected[^>]*>([\s\S]*?)<\/option>/i);
    return opt ? { id: opt[1].trim(), name: stripHtml(opt[2]).trim() } : null;
}

function intOrZero(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}
function floatOrZero(v) {
    const n = parseFloat(String(v ?? '').trim());
    return Number.isFinite(n) ? n : 0;
}
function maybeFloat(v) {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : null;
}

module.exports = {
    key: 'cfldTechnicalParameter',
    label: 'CFLD Technical Parameters',
    model: 'cfldTechnicalParameter',
    idField: 'cfldTechId',
    // status included: old site has distinct ONGOING and COMPLETED records for the same
    // crop+tech+month — without status they collide and update instead of creating.
    naturalKey: ['kvkId', 'cropId', 'technologyDemonstrated', 'month', 'status'],
    enrichCfldRows,

    foreignKeys: {
        kvkId: { master: 'kvk' },
        cropId: { master: 'cfldCrop', otherField: 'cropOther' },
        typeId: { master: 'cropType', otherField: 'typeOther' },
        seasonId: { master: 'season', otherField: 'seasonOther' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // ── KVK match by name ──────────────────────────────────────────────
        const oldKvkName =
            decodeEntities(cleanText(row.kvk?.kvk_name || row['kvk.kvk_name'])) || '';
        const targetKvkName = ctx.targetKvkName || '';
        const mappedKvkId = ctx.kvkId;

        if (!oldKvkName) {
            err('kvkId', 'Missing KVK name on old row (kvk.kvk_name)');
        } else if (normalize(oldKvkName) !== normalize(targetKvkName)) {
            return {
                data: null,
                issues: [{
                    field: 'kvkId',
                    message: `Row KVK "${oldKvkName}" ≠ selected "${targetKvkName}" — skipped`,
                    severity: 'warn',
                }],
            };
        }

        const html = row._editHtml || null;
        if (!html) {
            if (row._enrichFailed) {
                warn('*', 'Edit page fetch failed — many fields will default to 0/empty');
            } else {
                warn('*', 'No edit page — using list-view fields only (incomplete)');
            }
        }

        // ── Status ────────────────────────────────────────────────────────
        const status = normalizeCfldStatus(getRawStatusText(row));

        // ── Reporting year ────────────────────────────────────────────────
        let reportingYear = null;
        const rawYear = row.reporting_year;
        if (rawYear) {
            const y = parseInt(String(rawYear).trim(), 10);
            if (Number.isFinite(y) && y > 1990 && y < 2100) {
                reportingYear = new Date(Date.UTC(y, 3, 1)).toISOString(); // April = Indian FY
            }
        }

        // ── Month (required) ──────────────────────────────────────────────
        // Primary: start_date from DataTables list already encodes YYYY-MM.
        // Secondary: month select dropdown (value 1-12 month name) + year from start_date.
        let month = null;

        if (row.start_date) {
            month = parseYearMonth(String(row.start_date)) || parseDate(String(row.start_date));
        }

        if (!month && html) {
            // Month select gives month number 1-12 (or month name); combine with year
            const monthSel = parseSelectedOption(html, 'month');
            let monthNum = 0;
            if (monthSel?.id) monthNum = parseInt(monthSel.id, 10);
            else if (monthSel?.name) {
                const MONTH_NAMES = ['january','february','march','april','may','june',
                    'july','august','september','october','november','december'];
                monthNum = MONTH_NAMES.indexOf(monthSel.name.toLowerCase()) + 1;
            }
            if (monthNum >= 1 && monthNum <= 12) {
                let year = 0;
                if (row.start_date) {
                    const m = String(row.start_date).match(/^(\d{4})/);
                    if (m) year = parseInt(m[1], 10);
                }
                if (!year && reportingYear) year = new Date(reportingYear).getUTCFullYear();
                if (year) month = new Date(Date.UTC(year, monthNum - 1, 1)).toISOString();
            }
        }

        if (!month && reportingYear) {
            month = reportingYear;
            warn('month', 'No start_date or month select — defaulted to reporting year start');
        }
        if (!month) err('month', 'Missing month (required)');

        // ── Season ────────────────────────────────────────────────────────
        let seasonId = null;
        let seasonOther = null;
        if (html) {
            const sel =
                parseSelectedOption(html, 'season_id') ||
                parseSelectedOption(html, 'season');
            if (sel?.name) {
                const s = await r.resolve('season', 'seasonName', 'seasonId', sel.name);
                if (s.matched) seasonId = s.id;
                else seasonOther = sel.name;
            }
        }
        if (!seasonId) {
            // List JSON carries season_id inline; crop.season_id is the fallback.
            const oldSeason = row.season_id ?? row.crop?.season_id;
            const nm = SEASON_MAP[oldSeason];
            if (nm) {
                const s = await r.resolve('season', 'seasonName', 'seasonId', nm);
                if (s.matched) seasonId = s.id;
            }
        }
        if (!seasonId) warn('seasonId', 'Season not found — will be null');

        // ── Crop type (typeId → CropType) ─────────────────────────────────
        // Resolution order:
        //  1. HTML select id passthrough (old ids 1=Pulses 2=Oilseed align with ours)
        //  2. HTML select label name match
        //  3. row.crop_type string (DataTables list sends this as plain text e.g. "oilseed")
        //  4. row.crop?.type_id numeric passthrough
        let typeId = null;
        let typeOther = null;

        if (html) {
            const sel =
                parseSelectedOption(html, 'crop_type_id') ||
                parseSelectedOption(html, 'type_id');
            if (sel?.id) {
                const byId = await r.resolveById('cropType', 'typeName', 'typeId', sel.id);
                if (byId.matched) typeId = byId.id;
            }
            if (!typeId && sel?.name) {
                const byName = await r.resolve('cropType', 'typeName', 'typeId', sel.name);
                if (byName.matched) typeId = byName.id;
                else typeOther = sel.name;
            }
        }
        // row.crop_type is the plain-text type name from the DataTables list JSON
        if (!typeId && row.crop_type) {
            const byName = await r.resolve('cropType', 'typeName', 'typeId', row.crop_type);
            if (byName.matched) typeId = byName.id;
        }
        if (!typeId && row.crop?.type_id) {
            const byId = await r.resolveById('cropType', 'typeName', 'typeId', row.crop.type_id);
            if (byId.matched) typeId = byId.id;
        }
        if (!typeId) err('typeId', `Crop type "${row.crop_type || ''}" not found (required)`);

        // ── Crop (cropId → FLDCropMaster.cfldId) ─────────────────────────
        let cropId = null;
        let cropOther = null;
        const cropName =
            decodeEntities(
                cleanText(row.crop?.name || row['crop.name'] || row.crop?.crop_name),
            ) || '';

        if (cropName) {
            const where = { cropName: { equals: cropName, mode: 'insensitive' } };
            if (typeId) where.typeId = typeId;
            if (seasonId) where.seasonId = seasonId;
            const found = await prisma.fLDCropMaster.findFirst({ where });
            if (found) {
                cropId = found.cfldId;
            } else if (typeId && seasonId) {
                const created = await prisma.fLDCropMaster.create({
                    data: { cropName, typeId, seasonId },
                });
                cropId = created.cfldId;
                warn('cropId', `Created FLDCropMaster "${cropName}" (typeId=${typeId}, seasonId=${seasonId})`);
            } else {
                cropOther = cropName;
                err('cropId', `Crop "${cropName}" not found; need typeId+seasonId to create`);
            }
        } else {
            err('cropId', 'Missing crop name');
        }

        // ── Technology demonstrated ───────────────────────────────────────
        let technologyDemonstrated =
            decodeEntities(cleanText(row.technology_demo)) || '';
        if (html) {
            const fromHtml = decodeEntities(
                cleanText(
                    parseInputValue(html, 'technology_demonstrated') ||
                    parseTextarea(html, 'technology_demonstrated'),
                ),
            );
            if (fromHtml) technologyDemonstrated = fromHtml;
        }
        if (!technologyDemonstrated) err('technologyDemonstrated', 'Missing technology demonstrated');

        // ── Variety name ─────────────────────────────────────────────────
        let varietyName = decodeEntities(cleanText(row.variety_name)) || '';
        if (html) {
            const v = decodeEntities(cleanText(parseInputValue(html, 'variety_name'))) || '';
            if (v) varietyName = v;
        }
        if (!varietyName) {
            varietyName = 'Not specified';
            warn('varietyName', 'Missing variety_name — defaulted to "Not specified"');
        }

        // ── Existing farmer practice ──────────────────────────────────────
        // Old site stores this as "existing_variety_name" (misleadingly named —
        // it's the existing farmer practice / variety in farmer's field).
        let existingFarmerPractice =
            decodeEntities(cleanText(row.existing_variety_name)) || '';
        if (html) {
            const v =
                decodeEntities(
                    cleanText(
                        parseInputValue(html, 'existing_variety_name') ||
                        parseTextarea(html, 'existing_variety_name') ||
                        parseTextarea(html, 'existing_farmer_practice') ||
                        parseInputValue(html, 'existing_farmer_practice'),
                    ),
                ) || '';
            if (v) existingFarmerPractice = v;
        }
        if (!existingFarmerPractice) warn('existingFarmerPractice', 'Missing — stored as empty string');

        // ── Area ─────────────────────────────────────────────────────────
        let areaInHa = floatOrZero(row.area);
        if (html) {
            const v = floatOrZero(
                parseInputValue(html, 'area_in_ha') || parseInputValue(html, 'area'),
            );
            if (v > 0) areaInHa = v;
        }

        // ── Yield fields ──────────────────────────────────────────────────
        // Old-site HTML field names (confirmed from edit form):
        //   existing_yield → farmerYield   (label: "Yield (q/ha) in farmer field Local")
        //   yield_max      → demoYieldMax
        //   yield_min      → demoYieldMin
        //   yield_avg      → demoYieldAvg
        //   yield_increase → percentIncrease
        //   yield_gap_d    → yieldGapDistrictMinimized
        //   yield_gap_s    → yieldGapStateMinimized
        //   yield_gap_p    → yieldGapPotentialMinimized
        // district_yield / state_yield / potential_yield keep their names.
        let districtYield = floatOrZero(row.district_yield);
        let stateYield = floatOrZero(row.state_yield);
        let potentialYield = floatOrZero(row.potential_yield);
        // List JSON carries these inline (same field names as the edit form);
        // seed from the row, let html override when an edit page is present.
        let farmerYield = floatOrZero(row.existing_yield);
        let demoYieldMax = floatOrZero(row.yield_max);
        let demoYieldMin = floatOrZero(row.yield_min);
        let demoYieldAvg = floatOrZero(row.yield_avg);
        let percentIncrease = floatOrZero(row.yield_increase);
        let yieldGapDistrictMinimized = floatOrZero(row.yield_gap_d);
        let yieldGapStateMinimized = floatOrZero(row.yield_gap_s);
        let yieldGapPotentialMinimized = floatOrZero(row.yield_gap_p);

        if (html) {
            farmerYield = floatOrZero(parseInputValue(html, 'existing_yield') || parseInputValue(html, 'farmer_yield'));
            demoYieldMax = floatOrZero(parseInputValue(html, 'yield_max') || parseInputValue(html, 'demo_yield_max'));
            demoYieldMin = floatOrZero(parseInputValue(html, 'yield_min') || parseInputValue(html, 'demo_yield_min'));
            demoYieldAvg = floatOrZero(parseInputValue(html, 'yield_avg') || parseInputValue(html, 'demo_yield_avg'));
            percentIncrease = floatOrZero(parseInputValue(html, 'yield_increase') || parseInputValue(html, 'percent_increase'));
            // district/state/potential yield: list-view values are authoritative.
            // Edit page often has differently-scaled or stale values — only use as
            // fallback when the DataTables list gave us 0.
            if (!districtYield) districtYield = floatOrZero(parseInputValue(html, 'district_yield'));
            if (!stateYield) stateYield = floatOrZero(parseInputValue(html, 'state_yield'));
            if (!potentialYield) potentialYield = floatOrZero(parseInputValue(html, 'potential_yield'));
            yieldGapDistrictMinimized = floatOrZero(parseInputValue(html, 'yield_gap_d') || parseInputValue(html, 'yield_gap_district_minimized'));
            yieldGapStateMinimized = floatOrZero(parseInputValue(html, 'yield_gap_s') || parseInputValue(html, 'yield_gap_state_minimized'));
            yieldGapPotentialMinimized = floatOrZero(parseInputValue(html, 'yield_gap_p') || parseInputValue(html, 'yield_gap_potential_minimized'));
        }

        // ── Farmer demographics ───────────────────────────────────────────
        // Inline list fields carry the caste/gender split directly (general_m …
        // st_f); seed from them, let an edit page override when present.
        let generalM = intOrZero(row.general_m), generalF = intOrZero(row.general_f);
        let obcM = intOrZero(row.obc_m), obcF = intOrZero(row.obc_f);
        let scM = intOrZero(row.sc_m), scF = intOrZero(row.sc_f);
        let stM = intOrZero(row.st_m), stF = intOrZero(row.st_f);
        if (html) {
            generalM = intOrZero(parseInputValue(html, 'general_m'));
            generalF = intOrZero(parseInputValue(html, 'general_f'));
            obcM = intOrZero(parseInputValue(html, 'obc_m'));
            obcF = intOrZero(parseInputValue(html, 'obc_f'));
            scM = intOrZero(parseInputValue(html, 'sc_m'));
            scF = intOrZero(parseInputValue(html, 'sc_f'));
            stM = intOrZero(parseInputValue(html, 'st_m'));
            stF = intOrZero(parseInputValue(html, 'st_f'));
        }

        // ── Photo paths ───────────────────────────────────────────────────
        let trainingPhotoPath = null;
        let qualityActionPhotoPath = null;
        if (html) {
            trainingPhotoPath =
                cleanText(parseInputValue(html, 'training_photo_path') || parseInputValue(html, 'training_photo')) || null;
            qualityActionPhotoPath =
                cleanText(parseInputValue(html, 'quality_action_photo_path') || parseInputValue(html, 'quality_action_photo')) || null;
        }

        // Helper: HTML textarea/input first, then raw DataTables row field.
        // Old-site list JSON sometimes embeds sub-form values directly on each row.
        const anyVal = (hHtml, ...names) => {
            if (hHtml) {
                for (const n of names) {
                    const v = parseTextarea(hHtml, n) || parseInputValue(hHtml, n);
                    if (v) return v;
                }
            }
            for (const n of names) {
                const v = row[n];
                if (v !== null && v !== undefined && String(v).trim() !== '') return String(v);
            }
            return '';
        };

        // ── Economic parameters ───────────────────────────────────────────
        // Sources tried in order: dedicated sub-form HTML → main edit HTML → raw row fields
        // Old-site field names: farmer_gross_cost, farmer_gross_return, farmer_net_return,
        // farmer_bc_ratio, demo_gross_return, demo_net_return, demo_bc_ratio, income
        let economicParameters = null;
        {
            const eHtml = row._economicHtml || html;
            const farmerCostF  = maybeFloat(anyVal(eHtml, 'farmer_gross_cost'));
            const demoReturnF  = maybeFloat(anyVal(eHtml, 'demo_gross_return'));
            if (farmerCostF || demoReturnF) {
                economicParameters = {
                    status,
                    existingPlotGrossCost:        farmerCostF,
                    existingPlotGrossReturn:      maybeFloat(anyVal(eHtml, 'farmer_gross_return')),
                    existingPlotNetReturn:        maybeFloat(anyVal(eHtml, 'farmer_net_return')),
                    existingPlotBcr:             maybeFloat(anyVal(eHtml, 'farmer_bc_ratio')),
                    demonstrationPlotGrossCost:   null,
                    demonstrationPlotGrossReturn: demoReturnF,
                    demonstrationPlotNetReturn:   maybeFloat(anyVal(eHtml, 'demo_net_return')),
                    demonstrationPlotBcr:         maybeFloat(anyVal(eHtml, 'demo_bc_ratio')),
                    additionalIncome:             maybeFloat(anyVal(eHtml, 'income')),
                };
            } else {
                warn('_economicParameters', 'No economic data found in sub-form HTML or list row fields');
            }
        }

        // ── Socio-economic parameters ─────────────────────────────────────
        // Old-site field names: total_produce, produce_sold, selling_rate,
        // produce_used, produce_distributed, purpose, employment_generated
        let socioEconomicParameters = null;
        {
            const sHtml = row._socioHtml || html;
            const totalProduceF = maybeFloat(anyVal(sHtml, 'total_produce'));
            if (totalProduceF) {
                socioEconomicParameters = {
                    status,
                    totalProduceObtainedKg:                totalProduceF,
                    produceSoldKgPerHousehold:              maybeFloat(anyVal(sHtml, 'produce_sold')),
                    sellingRateRsPerKg:                     maybeFloat(anyVal(sHtml, 'selling_rate')),
                    produceUsedForOwnSowingKg:              maybeFloat(anyVal(sHtml, 'produce_used')),
                    produceDistributedToOtherFarmersKg:     maybeFloat(anyVal(sHtml, 'produce_distributed')),
                    incomeUtilizationPurpose:               cleanText(anyVal(sHtml,  'purpose')),
                    employmentGeneratedMandaysPerHousehold: maybeFloat(anyVal(sHtml, 'employment_generated')),
                };
            } else {
                warn('_socioEconomicParameters', 'No socio-economic data found in sub-form HTML or list row fields');
            }
        }

        // ── Farmers perception parameters ─────────────────────────────────
        // Old-site field names: sustainability, linkings, affordability,
        // negative_effect, is_acceptable, suggestions, farmer_feedback
        let farmersPerceptionParameters = null;
        {
            const pHtml = row._perceptionHtml || html;
            const sustainability = anyVal(pHtml, 'sustainability');
            if (sustainability) {
                farmersPerceptionParameters = {
                    status,
                    suitabilityToFarmingSystem:             cleanText(sustainability),
                    likingPreference:                       cleanText(anyVal(pHtml, 'linkings')),
                    affordability:                          cleanText(anyVal(pHtml, 'affordability')),
                    anyNegativeEffect:                      cleanText(anyVal(pHtml, 'negative_effect')),
                    technologyAcceptableToAllGroupVillage:  cleanText(anyVal(pHtml, 'is_acceptable')),
                    suggestionsForChangeOrImprovementIfAny: cleanText(anyVal(pHtml, 'suggestions')),
                    farmerFeedback:                         cleanText(anyVal(pHtml, 'farmer_feedback')),
                };
            } else {
                warn('_farmersPerceptionParameters', 'No farmers perception data found in sub-form HTML or list row fields');
            }
        }

        const data = {
            kvkId: mappedKvkId,
            cropId,
            cropOther: cropOther || null,
            month,
            typeId,
            typeOther: typeOther || null,
            seasonId: seasonId || null,
            seasonOther: seasonOther || null,
            reportingYear: reportingYear || null,
            status,
            varietyName,
            areaInHa,
            technologyDemonstrated,
            existingFarmerPractice,
            farmerYield,
            demoYieldMax,
            demoYieldMin,
            demoYieldAvg,
            percentIncrease,
            districtYield,
            stateYield,
            potentialYield,
            yieldGapDistrictMinimized,
            yieldGapStateMinimized,
            yieldGapPotentialMinimized,
            generalM,
            generalF,
            obcM,
            obcF,
            scM,
            scF,
            stM,
            stF,
            trainingPhotoPath,
            qualityActionPhotoPath,
            _economicParameters: economicParameters,
            _socioEconomicParameters: socioEconomicParameters,
            _farmersPerceptionParameters: farmersPerceptionParameters,
        };

        return { data, issues };
    },

    async seedRecord(prisma, data) {
        const ep = data._economicParameters;
        const sep = data._socioEconomicParameters;
        const fpp = data._farmersPerceptionParameters;

        const mainData = { ...data };
        delete mainData._economicParameters;
        delete mainData._socioEconomicParameters;
        delete mainData._farmersPerceptionParameters;

        // Always insert a new technical-parameter record — distinct source rows can
        // share kvk + crop + technology + month + status but are separate records.
        // Matching/updating would collapse them.
        const created = await prisma.cfldTechnicalParameter.create({ data: mainData });
        const cfldTechId = created.cfldTechId;

        if (ep) {
            await prisma.cfldEconomicParameters.upsert({
                where: { cfldTechId },
                create: { cfldTechId, ...ep },
                update: ep,
            });
        }
        if (sep) {
            await prisma.cfldSocioEconomicParameters.upsert({
                where: { cfldTechId },
                create: { cfldTechId, ...sep },
                update: sep,
            });
        }
        if (fpp) {
            await prisma.cfldFarmersPerceptionParameters.upsert({
                where: { cfldTechId },
                create: { cfldTechId, ...fpp },
                update: fpp,
            });
        }

        return 'created';
    },
};
