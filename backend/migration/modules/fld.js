const { normalizeFldStatus } = require('../../constants/fldStatus.js');
const { normalize } = require('../masterResolver.js');
const prisma = require('../../config/prisma.js');
const {
    parseYearMonth,
    decodeEntities,
    cleanText,
    stripHtml,
} = require('../util.js');

const SEASON_MAP = {
    1: 'Kharif',
    2: 'Rabi',
    3: 'Summer',
};

function getRawStatusText(row) {
    let rawStatusText = row.status || '';
    const progressHtml = row.progress_status || '';
    if (progressHtml.toLowerCase().includes('transfer')) {
        rawStatusText = 'transferred_to_next_year';
    } else if (!rawStatusText && progressHtml) {
        rawStatusText = stripHtml(progressHtml);
    }
    return rawStatusText;
}

function fldEditPath(oldId) {
    const token = Buffer.from(String(oldId)).toString('base64');
    return `https://atariams.org/edit-fld/${token}`;
}

function fldResultEditPath(oldId) {
    const token = Buffer.from(String(oldId)).toString('base64');
    return `https://atariams.org/edit-fld-result/${token}`;
}

function parseSelectedOption(html, name) {
    const selectRegex = new RegExp(`name="${name}"[^>]*>([\\s\\S]*?)<\\/select>`, 'i');
    const selectMatch = selectRegex.exec(html);
    if (!selectMatch) return null;
    const selectHtml = selectMatch[1];
    
    const optionRegex = /<option[^>]*value="([^"]*)"[^>]*selected[^>]*>([\s\S]*?)<\/option>/i;
    const optionMatch = optionRegex.exec(selectHtml);
    if (optionMatch) {
        return {
            id: optionMatch[1].trim(),
            name: stripHtml(optionMatch[2]).trim()
        };
    }
    return null;
}

function parseInputValue(html, name) {
    const inputRegex = new RegExp(`<input[^>]*name="${name}"[^>]*value="([^"]*)"`, 'i');
    const match = inputRegex.exec(html);
    if (match) return match[1].trim();
    
    const reverseRegex = new RegExp(`<input[^>]*value="([^"]*)"[^>]*name="${name}"`, 'i');
    const reverseMatch = reverseRegex.exec(html);
    if (reverseMatch) return reverseMatch[1].trim();
    
    return '';
}

async function fetchStaffMap(headers) {
    // Fetch all staff from the old site and return a Map: oldStaffId → staffName.
    try {
        const url = 'https://atariams.org/staff-data?draw=1&start=0&length=9999&search=';
        const res = await fetch(url, {
            headers: {
                ...headers,
                accept: 'application/json, text/javascript, */*; q=0.01',
                'x-requested-with': 'XMLHttpRequest',
                referer: 'https://atariams.org/view-staff',
            },
        });
        if (!res.ok) {
            console.error(`[fetchStaffMap] HTTP ${res.status}`);
            return new Map();
        }
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch {
            console.error('[fetchStaffMap] non-JSON response:', text.slice(0, 200));
            return new Map();
        }
        const staffRows = Array.isArray(json.data) ? json.data : [];
        console.log(`[fetchStaffMap] fetched ${staffRows.length} staff rows`);
        const map = new Map();
        for (const s of staffRows) {
            const id = s.id ?? s.staff_id;
            const name = s.staff_name;
            if (id && name) map.set(Number(id), String(name).trim());
        }
        return map;
    } catch (e) {
        console.error('[fetchStaffMap] error:', e.message);
        return new Map();
    }
}

async function enrichFldRows(rows, headers) {
    const fetchHeaders = {
        ...headers,
        accept: 'text/html,application/xhtml+xml',
        referer: 'https://atariams.org/view-fld',
    };

    // Pre-fetch staff map so numeric staff_id on list rows can be resolved without edit HTML
    const staffMap = await fetchStaffMap(headers);

    const concurrency = 20;
    const enriched = new Array(rows.length);
    
    for (let i = 0; i < rows.length; i += concurrency) {
        const chunk = rows.slice(i, i + concurrency);
        const promises = chunk.map(async (row, index) => {
            const globalIndex = i + index;
            const id = row?.id;
            if (!id) {
                enriched[globalIndex] = row;
                return;
            }
            
            const resolvedStaffName = row.staff_id ? (staffMap.get(Number(row.staff_id)) || null) : null;
            let enrichedRow = {
                ...row,
                _editHtml: null,
                _resultHtml: null,
                _staffName: resolvedStaffName,
            };
            
            // 1. Fetch edit-fld page
            try {
                const res = await fetch(fldEditPath(id), { headers: fetchHeaders });
                const html = await res.text();
                if (res.ok && (html.includes('sector_id') || html.includes('start_date') || html.includes('technology_demonstrated'))) {
                    enrichedRow._editHtml = html;
                } else {
                    enrichedRow._enrichFailed = true;
                }
            } catch {
                enrichedRow._enrichFailed = true;
            }

            // 2. Fetch edit-fld-result page if status is COMPLETED
            const status = normalizeFldStatus(getRawStatusText(row));
            if (status === 'COMPLETED') {
                try {
                    const resResult = await fetch(fldResultEditPath(id), { headers: fetchHeaders });
                    const htmlResult = await resResult.text();
                    if (resResult.ok && htmlResult.includes('demo_yield')) {
                        enrichedRow._resultHtml = htmlResult;
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
            
            enriched[globalIndex] = enrichedRow;
        });
        
        await Promise.all(promises);
    }
    
    return enriched;
}

function intOrZero(value) {
    const n = parseInt(String(value ?? '').trim(), 10);
    return Number.isFinite(n) ? n : 0;
}

function floatOrZero(value) {
    const n = parseFloat(String(value ?? '').trim());
    return Number.isFinite(n) ? n : 0;
}

/**
 * Module spec: KVK FLD achievements.
 */
module.exports = {
    key: 'fld',
    label: 'FLD (Frontline Demonstrations)',
    model: 'kvkFldIntroduction',
    idField: 'kvkFldId',
    naturalKey: ['kvkId', 'fldName', 'startDate'],
    enrichFldRows,

    foreignKeys: {
        kvkId: { master: 'kvk' },
        kvkStaffId: { master: 'kvkStaff' },
        seasonId: { master: 'season' },
        sectorId: { master: 'sector', otherField: 'sectorOther' },
        thematicAreaId: { master: 'fldThematicArea', otherField: 'thematicAreaOther' },
        categoryId: { master: 'fldCategory', otherField: 'categoryOther' },
        subCategoryId: { master: 'fldSubcategory', otherField: 'subCategoryOther' },
        cropId: { master: 'fldCrop', otherField: 'cropOther' },
        unitId: { master: 'unit' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, message) => issues.push({ field, message, severity: 'warn' });
        const err = (field, message) => issues.push({ field, message, severity: 'error' });

        // KVK Name resolution
        const oldKvkName = decodeEntities(cleanText(row.kvks?.kvk_name)) || '';
        const targetKvkName = ctx.targetKvkName || '';
        let mappedKvkId = ctx.kvkId;

        if (!oldKvkName) {
            err('kvkId', 'Missing KVK name on old row (kvks.kvk_name)');
        } else if (normalize(oldKvkName) !== normalize(targetKvkName)) {
            return {
                data: null,
                issues: [{
                    field: 'kvkId',
                    message:
                        `Row KVK "${oldKvkName}" (old id ${row.kvk_id}) ≠ selected ` +
                        `"${targetKvkName}" (#${ctx.kvkId}) — skipped`,
                    severity: 'warn',
                }],
            };
        } else {
            const oldKvkId = Number(row.kvk_id);
            if (oldKvkId && oldKvkId !== mappedKvkId) {
                warn(
                    'kvkId',
                    `Old kvk_id ${oldKvkId} → our #${mappedKvkId} via name match "${oldKvkName}"`,
                );
            }
        }

        // 1. Staff Resolution
        let staffLabel = null;
        if (row._editHtml) {
            const selectNames = [...row._editHtml.matchAll(/<select[^>]*name="([^"]+)"/gi)].map(m => m[1]);
            if (selectNames.length) console.log('[FLD] edit HTML select names:', selectNames.join(', '));
            const parsedStaff =
                parseSelectedOption(row._editHtml, 'staff_id') ||
                parseSelectedOption(row._editHtml, 'staff') ||
                parseSelectedOption(row._editHtml, 'kvk_staff_id') ||
                parseSelectedOption(row._editHtml, 'employee_id');
            if (parsedStaff) staffLabel = parsedStaff.name;
        }
        if (!staffLabel) staffLabel = decodeEntities(row.staff);
        // Fallback: resolved during enrichment from the old site's staff-data endpoint
        if (!staffLabel && row._staffName) staffLabel = row._staffName;

        let kvkStaffId = null;
        if (staffLabel) {
            kvkStaffId = await r.findId(
                'kvkStaff',
                { kvkId: mappedKvkId, staffName: staffLabel },
                'kvkStaffId',
            );
            if (!kvkStaffId) {
                const staffRows = await prisma.kvkStaff.findMany({
                    where: { kvkId: mappedKvkId },
                    select: { kvkStaffId: true, staffName: true },
                });
                const target = normalize(staffLabel);
                const hit = staffRows.find(s => normalize(s.staffName) === target);
                kvkStaffId = hit ? hit.kvkStaffId : null;
            }
        }
        if (!kvkStaffId) {
            err('kvkStaffId', staffLabel
                ? `Staff "${staffLabel}" not found — migrate Employees first or pick manually`
                : 'No staff on old row — pick one manually in the FK picker');
        }

        // 2. Season Resolution
        let seasonId = null;
        let seasonLabel = null;
        if (row._editHtml) {
            const parsedSeason = parseSelectedOption(row._editHtml, 'season_id');
            if (parsedSeason) seasonLabel = parsedSeason.name;
        }
        if (!seasonLabel && row.season_id) {
            seasonLabel = SEASON_MAP[row.season_id];
        }
        if (seasonLabel) {
            const s = await r.resolve('season', 'seasonName', 'seasonId', seasonLabel);
            if (s.matched) seasonId = s.id;
        }
        if (!seasonId) {
            const fallback = await r.resolve('season', 'seasonName', 'seasonId', 'Kharif');
            seasonId = fallback.id;
            if (seasonId) warn('seasonId', 'No season on old row — defaulted to Kharif');
            else err('seasonId', 'No season on old row and Kharif master missing');
        }

        // 3. Sector Resolution
        let sectorId = null;
        let sectorOther = null;
        let sectorLabel = null;
        if (row._editHtml) {
            const parsedSector = parseSelectedOption(row._editHtml, 'sector_id') || parseSelectedOption(row._editHtml, 'sector');
            if (parsedSector) sectorLabel = parsedSector.name;
        }
        if (sectorLabel) {
            const s = await r.resolve('sector', 'sectorName', 'sectorId', sectorLabel);
            if (s.matched) {
                sectorId = s.id;
            } else {
                const otherSec = await prisma.sector.findFirst({
                    where: { sectorName: { contains: 'Other' } }
                });
                if (otherSec) {
                    sectorId = otherSec.sectorId;
                    sectorOther = sectorLabel;
                    warn('sectorId', `Sector "${sectorLabel}" not in master — parked in Other`);
                } else {
                    err('sectorId', `Sector "${sectorLabel}" not found and 'Other' fallback sector missing`);
                }
            }
        }
        if (!sectorId) {
            err('sectorId', 'Missing Sector');
        }

        // 4. Thematic Area Resolution
        let thematicAreaId = null;
        let thematicAreaOther = null;
        let thematicAreaLabel = null;
        if (row._editHtml) {
            const parsedTA = parseSelectedOption(row._editHtml, 'thematic_area_id') || parseSelectedOption(row._editHtml, 'thematic_area');
            if (parsedTA) thematicAreaLabel = parsedTA.name;
        }
        if (!thematicAreaLabel) {
            // List API embeds thematic_area as a JSON object or string with .name
            let taObj = row.thematic_area;
            if (typeof taObj === 'string') { try { taObj = JSON.parse(taObj); } catch { taObj = null; } }
            if (taObj?.name) thematicAreaLabel = decodeEntities(cleanText(taObj.name));
        }
        if (thematicAreaLabel) {
            const ta = await r.resolve('fldThematicArea', 'thematicAreaName', 'thematicAreaId', thematicAreaLabel);
            if (ta.matched) {
                thematicAreaId = ta.id;
            } else {
                const created = await r.findOrCreate('fldThematicArea', 'thematicAreaName', 'thematicAreaId', thematicAreaLabel);
                thematicAreaId = created.id;
                warn('thematicAreaId', `Created thematic area "${thematicAreaLabel}"`);
            }
        }

        // 5. Category Resolution
        let categoryId = null;
        let categoryOther = null;
        let categoryLabel = null;
        if (row._editHtml) {
            const parsedCat = parseSelectedOption(row._editHtml, 'category_id') || parseSelectedOption(row._editHtml, 'category');
            if (parsedCat) categoryLabel = parsedCat.name;
        }
        if (!categoryLabel && row.cropcategory?.title) {
            categoryLabel = decodeEntities(row.cropcategory.title);
        }
        if (categoryLabel) {
            const cat = await r.resolve('fldCategory', 'categoryName', 'categoryId', categoryLabel);
            if (cat.matched) {
                categoryId = cat.id;
            } else {
                const created = await r.findOrCreate('fldCategory', 'categoryName', 'categoryId', categoryLabel);
                categoryId = created.id;
                warn('categoryId', `Created category "${categoryLabel}"`);
            }
        }

        // 6. Subcategory Resolution
        let subCategoryId = null;
        let subCategoryOther = null;
        let subCategoryLabel = null;
        if (row._editHtml) {
            const parsedSub = parseSelectedOption(row._editHtml, 'subcategory_id') || parseSelectedOption(row._editHtml, 'subcategory');
            if (parsedSub) subCategoryLabel = parsedSub.name;
        }
        if (!subCategoryLabel) {
            // List API embeds subcategory as a JSON object or string with .name/.title
            let subObj = row.subcategory || row.sub_category;
            if (typeof subObj === 'string') { try { subObj = JSON.parse(subObj); } catch { subObj = null; } }
            if (subObj?.name) subCategoryLabel = decodeEntities(cleanText(subObj.name));
            else if (subObj?.title) subCategoryLabel = decodeEntities(cleanText(subObj.title));
        }
        if (subCategoryLabel) {
            const sub = await r.resolve('fldSubcategory', 'subCategoryName', 'subCategoryId', subCategoryLabel);
            if (sub.matched) {
                subCategoryId = sub.id;
            } else {
                const dataToCreate = { subCategoryName: subCategoryLabel };
                if (categoryId) dataToCreate.categoryId = categoryId;
                const created = await r.findOrCreate('fldSubcategory', 'subCategoryName', 'subCategoryId', subCategoryLabel, {
                    create: () => dataToCreate
                });
                subCategoryId = created.id;
                warn('subCategoryId', `Created subcategory "${subCategoryLabel}"`);
            }
        }
        if (!subCategoryId && row.crop?.subcategory_id) {
            // Fallback: try old-site subcategory_id directly (works if our seed IDs align)
            const byId = await r.resolveById('fldSubcategory', 'subCategoryName', 'subCategoryId', row.crop.subcategory_id);
            if (byId.matched) {
                subCategoryId = byId.id;
                warn('subCategoryId', `Resolved subcategory by old-site id ${row.crop.subcategory_id}`);
            }
        }

        // 7. Crop Resolution
        let cropId = null;
        let cropOther = null;
        let cropLabel = null;
        if (row._editHtml) {
            const parsedCrop = parseSelectedOption(row._editHtml, 'crop_id') || parseSelectedOption(row._editHtml, 'crop');
            if (parsedCrop) cropLabel = parsedCrop.name;
        }
        if (!cropLabel && row.crop?.crop_name) {
            cropLabel = decodeEntities(row.crop.crop_name);
        }
        if (cropLabel) {
            const c = await r.resolve('fldCrop', 'cropName', 'cropId', cropLabel);
            if (c.matched) {
                cropId = c.id;
            } else {
                const dataToCreate = { cropName: cropLabel };
                if (subCategoryId) dataToCreate.subCategoryId = subCategoryId;
                const created = await r.findOrCreate('fldCrop', 'cropName', 'cropId', cropLabel, {
                    create: () => dataToCreate
                });
                cropId = created.id;
                warn('cropId', `Created crop "${cropLabel}"`);
            }
        }

        // 8. Start and Expected Completion Dates
        let startDate = null;
        let expectedCompletionDate = null;
        if (row._editHtml) {
            const rawStart = parseInputValue(row._editHtml, 'start_date');
            const rawEnd = parseInputValue(row._editHtml, 'end_date') || parseInputValue(row._editHtml, 'expected_completion_date');
            if (rawStart) { const d = new Date(rawStart); if (!isNaN(d.getTime())) startDate = d; }
            if (rawEnd) { const d = new Date(rawEnd); if (!isNaN(d.getTime())) expectedCompletionDate = d; }
        }
        if (!startDate && row.start_date) {
            const d = new Date(row.start_date);
            if (!isNaN(d.getTime())) startDate = d;
        }
        if (!expectedCompletionDate && row.end_date) {
            const d = new Date(row.end_date);
            if (!isNaN(d.getTime())) expectedCompletionDate = d;
        }
        if (!startDate) {
            warn('startDate', 'Missing Start Date — will be null in DB (fill manually)');
        }

        const status = normalizeFldStatus(getRawStatusText(row));

        // 9. Demonstration Counts & Quantity/Unit
        let noOfDemonstration = 0;
        let quantity = 0;
        let unit = null;
        let unitId = null;
        let quantityText = null;

        if (row._editHtml) {
            noOfDemonstration = intOrZero(parseInputValue(row._editHtml, 'no_of_demonstration'));
            const rawQty = parseInputValue(row._editHtml, 'area') || parseInputValue(row._editHtml, 'quantity');
            const parsedQty = parseFloat(rawQty);
            if (Number.isFinite(parsedQty)) {
                quantity = parsedQty;
            } else {
                quantityText = rawQty;
                quantity = 0;
            }
            unit = parseInputValue(row._editHtml, 'unit') || null;
        } else {
            noOfDemonstration = intOrZero(row.no_of_demonstration);
            quantity = parseFloat(row.area || row.quantity) || 0;
            unit = cleanText(row.unit) || null;
        }

        // Resolve unit string → unit master FK (find-or-create)
        if (unit) {
            const um = await r.findOrCreate('unit', 'unitName', 'unitId', unit);
            if (um.id) {
                unitId = um.id;
                if (um.created) warn('unitId', `Created new unit "${unit}" (#${um.id})`);
            }
        } else {
            // No unit on the old row — default so the FK stays valid, and flag it
            // so the operator can correct it. Women Empowerment activities aren't
            // area-based, so they default to N/A; everything else defaults to Ha.
            const isWomenEmpowerment = /women\s*empowerment/i.test(sectorLabel || '');
            const defaultUnitName = isWomenEmpowerment ? 'N/A' : 'Ha';
            const defUnit = await r.findOrCreate('unit', 'unitName', 'unitId', defaultUnitName);
            if (defUnit.id) {
                unitId = defUnit.id;
                warn('unitId', `No unit on old row — defaulted to ${defaultUnitName} (#${defUnit.id}). Please change the unit if it should be other than ${defaultUnitName}.`);
            } else {
                warn('unitId', 'No unit on old row — unitId left blank');
            }
        }

        // 10. Farmer Demographics
        let generalM = 0, generalF = 0, obcM = 0, obcF = 0, scM = 0, scF = 0, stM = 0, stF = 0;
        if (row._editHtml) {
            generalM = intOrZero(parseInputValue(row._editHtml, 'general_m'));
            generalF = intOrZero(parseInputValue(row._editHtml, 'general_f'));
            obcM = intOrZero(parseInputValue(row._editHtml, 'obc_m'));
            obcF = intOrZero(parseInputValue(row._editHtml, 'obc_f'));
            scM = intOrZero(parseInputValue(row._editHtml, 'sc_m'));
            scF = intOrZero(parseInputValue(row._editHtml, 'sc_f'));
            stM = intOrZero(parseInputValue(row._editHtml, 'st_m'));
            stF = intOrZero(parseInputValue(row._editHtml, 'st_f'));
        }

        // 11. Technology Name
        let fldName = decodeEntities(cleanText(row.technology_demonstrated)) || '';
        if (row._editHtml) {
            fldName = decodeEntities(cleanText(parseInputValue(row._editHtml, 'technology_demonstrated') || parseInputValue(row._editHtml, 'fld_name'))) || fldName;
        }
        if (!fldName) {
            err('fldName', 'Missing FLD Name / Technology Demonstrated');
        }

        // 12. FLD Results (Yield & Economics)
        let fldResult = null;
        if (status === 'COMPLETED') {
            let demoYield = 0, checkYield = 0, increasePercent = 0;
            let demoGrossCost = 0, demoGrossReturn = 0, demoNetReturn = 0, demoBcr = 0;
            let checkGrossCost = 0, checkGrossReturn = 0, checkNetReturn = 0, checkBcr = 0;
            
            if (row._resultHtml) {
                demoYield = floatOrZero(parseInputValue(row._resultHtml, 'demo_yield'));
                checkYield = floatOrZero(parseInputValue(row._resultHtml, 'check_yield'));
                increasePercent = floatOrZero(parseInputValue(row._resultHtml, 'increase_percent'));
                demoGrossCost = floatOrZero(parseInputValue(row._resultHtml, 'demo_gross_cost'));
                demoGrossReturn = floatOrZero(parseInputValue(row._resultHtml, 'demo_gross_return'));
                demoNetReturn = floatOrZero(parseInputValue(row._resultHtml, 'demo_net_return'));
                demoBcr = floatOrZero(parseInputValue(row._resultHtml, 'demo_bcr'));
                checkGrossCost = floatOrZero(parseInputValue(row._resultHtml, 'check_gross_cost'));
                checkGrossReturn = floatOrZero(parseInputValue(row._resultHtml, 'check_gross_return'));
                checkNetReturn = floatOrZero(parseInputValue(row._resultHtml, 'check_net_return'));
                checkBcr = floatOrZero(parseInputValue(row._resultHtml, 'check_bcr'));
            }
            
            fldResult = {
                demoYield,
                checkYield,
                increasePercent,
                demoGrossCost,
                demoGrossReturn,
                demoNetReturn,
                demoBcr,
                checkGrossCost,
                checkGrossReturn,
                checkNetReturn,
                checkBcr
            };
        }

        const data = {
            kvkId: mappedKvkId,
            kvkStaffId,
            seasonId,
            sectorId,
            sectorOther,
            thematicAreaId,
            thematicAreaOther,
            categoryId,
            categoryOther,
            subCategoryId,
            subCategoryOther,
            cropId,
            cropOther,
            fldName,
            noOfDemonstration,
            quantity,
            quantityText,
            unitId,
            startDate: startDate || null,
            expectedCompletionDate,
            generalM,
            generalF,
            obcM,
            obcF,
            scM,
            scF,
            stM,
            stF,
            ongoingCompleted: status,
            fldResult,
        };

        return { data, issues };
    },

    async seedRecord(prisma, data, { kvkId }) {
        const fldResult = data.fldResult;
        const fldData = { ...data };
        delete fldData.fldResult;

        // Always insert a new FLD record — distinct source rows can share kvk +
        // name + start date but are separate records. Matching/updating would
        // collapse them.
        const created = await prisma.kvkFldIntroduction.create({
            data: fldData,
        });
        if (fldResult) {
            await prisma.kvkFldResult.create({
                data: {
                    kvkFldId: created.kvkFldId,
                    ...fldResult,
                }
            });
        }
        return 'created';
    }
};
