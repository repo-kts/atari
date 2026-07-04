const { normalizeOftStatus } = require('../../constants/oftStatus.js');
const { normalize } = require('../masterResolver.js');
const prisma = require('../../config/prisma.js');
const {
    parseYearMonth,
    decodeEntities,
    cleanText,
    stripHtml,
} = require('../util.js');

/** Old-site discipline dropdown index -> name (same as employee migration). */
const DISCIPLINE_MAP = {
    1: 'Agronomy',
    2: 'Soil Science',
    3: 'Horticulture',
    4: 'Plant breeding',
    5: 'Plant Protection',
    6: 'Entomology',
    7: 'Plant Pathology',
    8: 'Home Science',
    9: 'Agricultural Engineering',
    10: 'Agricultural Extension',
    11: 'Animal Science',
    12: 'Fisheries',
    13: 'Other',
};

const SEASON_MAP = {
    1: 'Kharif',
    2: 'Rabi',
    3: 'Summer',
};

function getRawStatusText(row) {
    let rawStatusText = row.status || '';
    const progressHtml = row.progress_status || '';
    if (progressHtml.toLowerCase().includes('transfer')) {
        rawStatusText = 'transferred';
    } else if (!rawStatusText && progressHtml) {
        rawStatusText = stripHtml(progressHtml);
    }
    return rawStatusText;
}

function oftEditPath(oldId) {
    const token = Buffer.from(String(oldId)).toString('base64');
    return `https://atariams.org/edit-oft/${token}`;
}

/** Parse technology rows from the edit-oft HTML form. */
function parseTechnologiesFromHtml(html) {
    const treatments = [
        ...html.matchAll(/name="technology_treatments\[\]"[^>]*value="([^"]*)"/g),
    ].map(m => m[1].trim());
    const descBlocks = [
        ...html.matchAll(/name="description\[\]"[^>]*>([\s\S]*?)<\/textarea>/g),
    ].map(m => m[1].trim());

    const out = [];
    for (let i = 0; i < treatments.length; i++) {
        const optionName = treatments[i];
        const details = descBlocks[i] || '';
        if (!optionName) continue;
        if (!details.trim()) continue;
        out.push({
            optionKey: `fixed_${optionName.toLowerCase().replace(/\s+/g, '_')}`,
            optionName,
            details,
        });
    }
    return out;
}

function parsePerformanceIndicatorsFromHtml(html) {
    const m = html.match(/name="performance_indicators"[^>]*>([\s\S]*?)<\/textarea>/);
    return m ? m[1].trim() : '';
}

function parseTitleFromHtml(html) {
    const m = html.match(/name="title_fram_trail"[^>]*value="([^"]*)"/);
    return m ? decodeEntities(m[1].trim()) : '';
}

/**
 * problem_diagnosed is truncated in the oft-data list JSON (old site appends
 * "...."). Pull the full value from the edit-oft form <input>. The old form
 * renders this field with `value` BEFORE `name` (unlike title_fram_trail), so
 * match both attribute orders within the same tag.
 */
function parseProblemDiagnosedFromHtml(html) {
    if (!html) return '';
    let m = html.match(/name="problem_diagnosed"[^>]*value="([^"]*)"/);
    if (m) return decodeEntities(m[1].trim());
    m = html.match(/value="([^"]*)"[^>]*name="problem_diagnosed"/);
    return m ? decodeEntities(m[1].trim()) : '';
}

function oftResultEditPath(oldId) {
    const token = Buffer.from(String(oldId)).toString('base64');
    return `https://atariams.org/edit-oft-result/${token}`;
}

function parseFinalRecommendationFromHtml(html) {
    if (!html) return '';
    const m = html.match(/name="final_recommendation"[^>]*>([\s\S]*?)<\/textarea>/);
    return m ? m[1].trim() : '';
}

function parseConstraintsFromHtml(html) {
    if (!html) return '';
    const m = html.match(/name="constraints_identified"[^>]*>([\s\S]*?)<\/textarea>/);
    return m ? m[1].trim() : '';
}

function parseFarmersParticipationFromHtml(html) {
    if (!html) return '';
    const m = html.match(/name="farmers_participation"[^>]*>([\s\S]*?)<\/textarea>/);
    return m ? m[1].trim() : '';
}

function parseResultTextFromHtml(html) {
    if (!html) return '';
    const m = html.match(/name="result_description"[^>]*>([\s\S]*?)<\/textarea>/);
    return m ? m[1].trim() : '';
}

function parseRemarkFromHtml(html) {
    if (!html) return '';
    const m = html.match(/name="remark"[^>]*>([\s\S]*?)<\/textarea>/);
    return m ? m[1].trim() : '';
}

function parsePhotographFromHtml(html) {
    if (!html) return '';
    const m = html.match(/name="photograph"[^>]*value="([^"]*)"/);
    return m ? m[1].trim() : '';
}

function parseDatasheetFromHtml(html) {
    if (!html) return '';
    const m = html.match(/name="supplementary_datasheet"[^>]*value="([^"]*)"/);
    return m ? m[1].trim() : '';
}

function parseResultTablesFromHtml(html) {
    if (!html) return [];
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables = [];
    let match;
    while ((match = tableRegex.exec(html)) !== null) {
        const tableHtml = match[1];
        const headerRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/i;
        const headerRowMatch = headerRowRegex.exec(tableHtml);
        if (!headerRowMatch) continue;
        
        const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
        const headers = [];
        let thMatch;
        while ((thMatch = thRegex.exec(headerRowMatch[1])) !== null) {
            headers.push(stripHtml(thMatch[1]).trim());
        }
        
        if (headers.length === 0) continue;
        
        const tbodyRegex = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i;
        const tbodyMatch = tbodyRegex.exec(tableHtml);
        const rowsHtml = tbodyMatch ? tbodyMatch[1] : tableHtml;
        
        const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const rows = [];
        let trMatch;
        let isFirstRow = true;
        while ((trMatch = trRegex.exec(rowsHtml)) !== null) {
            if (isFirstRow && !tbodyMatch) {
                isFirstRow = false;
                continue;
            }
            const rowHtml = trMatch[1];
            const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
            const cells = [];
            let tdMatch;
            while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
                const cellHtml = tdMatch[1];
                const inputValMatch = /value="([^"]*)"/i.exec(cellHtml);
                const textareaValMatch = /<textarea[^>]*>([\s\S]*?)<\/textarea>/i.exec(cellHtml);
                let value = '';
                if (inputValMatch) {
                    value = inputValMatch[1];
                } else if (textareaValMatch) {
                    value = textareaValMatch[1];
                } else {
                    value = stripHtml(cellHtml).trim();
                }
                cells.push(value.trim());
            }
            if (cells.length > 0) {
                rows.push(cells);
            }
        }
        
        if (headers.length > 0 && rows.length > 0) {
            tables.push({ headers, rows });
        }
    }
    return tables;
}

/**
 * After a list fetch, pull technology + performance fields from each record's
 * edit page (not present in oft-data JSON).
 */
async function enrichOftRows(rows, headers) {
    const fetchHeaders = {
        ...headers,
        accept: 'text/html,application/xhtml+xml',
        referer: 'https://atariams.org/view-oft',
    };
    
    const concurrency = 10;
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
            
            let enrichedRow = { ...row, _technologies: [], _resultHtml: null };
            
            // 1. Fetch edit-oft page
            try {
                const res = await fetch(oftEditPath(id), { headers: fetchHeaders, signal: AbortSignal.timeout(8000) });
                const html = await res.text();
                if (res.ok && (html.includes('title_fram_trail') || html.includes('technology_treatments'))) {
                    const fullTitle = parseTitleFromHtml(html);
                    enrichedRow.title_fram_trail = fullTitle || row.title_fram_trail;
                    enrichedRow.problem_diagnosed =
                        parseProblemDiagnosedFromHtml(html) || row.problem_diagnosed;
                    enrichedRow._technologies = parseTechnologiesFromHtml(html);
                    enrichedRow.performance_indicators =
                        parsePerformanceIndicatorsFromHtml(html) || row.performance_indicators;
                    if (!html.includes('technology_treatments')) {
                        enrichedRow._enrichFailed = true;
                    }
                } else {
                    enrichedRow._enrichFailed = true;
                }
            } catch {
                enrichedRow._enrichFailed = true;
            }

            // 2. Fetch edit-oft-result page whenever a result may exist on the old
            // site. ONGOING OFTs can already have saved result tables (proposed/
            // actual values) — gating this on COMPLETED left those cells empty on
            // migration. The `final_recommendation` content check below still skips
            // OFTs with no result page, so fetching for any active status is safe.
            const status = normalizeOftStatus(getRawStatusText(row));
            if (status === 'COMPLETED' || status === 'ONGOING') {
                try {
                    const resResult = await fetch(oftResultEditPath(id), { headers: fetchHeaders, signal: AbortSignal.timeout(8000) });
                    const htmlResult = await resResult.text();
                    if (resResult.ok && htmlResult.includes('final_recommendation')) {
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

function extractPerformanceIndicators(text) {
    if (!text) return '';
    const htmlStartIdx = text.search(/<\/?(div|form|label|input|textarea)/i);
    if (htmlStartIdx !== -1) {
        return text.substring(0, htmlStartIdx).trim();
    }
    return text.trim();
}

function parsePhotographName(raw) {
    if (!raw) return null;
    const cleaned = decodeEntities(raw);
    try {
        const arr = JSON.parse(cleaned);
        if (Array.isArray(arr) && arr.length > 0) {
            return arr[0] || null;
        }
    } catch (e) {
        return cleaned || null;
    }
    return cleaned || null;
}

function parseDatasheetName(raw) {
    if (!raw) return null;
    return decodeEntities(raw) || null;
}

/**
 * Module spec: KVK OFT achievements. Source: atariams.org `oft-data` (+ edit
 * page enrichment for technology options).
 */
module.exports = {
    key: 'oft',
    label: 'OFT (On-Farm Trials)',
    model: 'kvkoft',
    idField: 'kvkOftId',
    naturalKey: ['kvkId', 'title', 'oftStartDate'],
    enrichOftRows,

    foreignKeys: {
        kvkId: { master: 'kvk' },
        staffId: { master: 'kvkStaff' },
        seasonId: { master: 'season' },
        oftSubjectId: { master: 'oftSubject', otherField: 'oftSubjectOther' },
        oftThematicAreaId: { master: 'oftThematicArea', otherField: 'oftThematicAreaOther' },
        disciplineId: { master: 'discipline', otherField: 'disciplineOther' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, message) => issues.push({ field, message, severity: 'warn' });
        const err = (field, message) => issues.push({ field, message, severity: 'error' });

        // KVK: match by NAME (old ids rarely align with our kvkId). The dropdown
        // picks which KVK we are migrating; each row must carry the same name on
        // the old site (kvks.kvk_name). We always write our kvkId, never old id.
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

        const reportingYear = intOrZero(row.reporting_year);
        const oftStartDate = parseYearMonth(row.oft_start_date);
        const oftEndDate = parseYearMonth(row.oft_end_date);

        if (!oftStartDate) {
            err('oftStartDate', `Missing or invalid oft_start_date "${row.oft_start_date}"`);
        } else if (reportingYear) {
            const startYear = new Date(oftStartDate).getUTCFullYear();
            if (startYear !== reportingYear) {
                warn(
                    'oftStartDate',
                    `reporting_year ${reportingYear} but oft_start_date is ${row.oft_start_date} (year ${startYear})`,
                );
            }
        }

        // Staff: match by display name in OUR db (normalized) — never copy old staff_id.
        const staffLabel = decodeEntities(row.staff);
        let staffId = null;
        if (staffLabel) {
            staffId = await r.findId(
                'kvkStaff',
                { kvkId: mappedKvkId, staffName: staffLabel },
                'kvkStaffId',
            );
            if (!staffId) {
                const staffRows = await prisma.kvkStaff.findMany({
                    where: { kvkId: mappedKvkId },
                    select: { kvkStaffId: true, staffName: true },
                });
                const target = normalize(staffLabel);
                const hit = staffRows.find(s => normalize(s.staffName) === target);
                staffId = hit ? hit.kvkStaffId : null;
            }
        }
        if (!staffId && staffLabel) {
            err('staffId', `Staff "${staffLabel}" (old staff_id ${row.staff_id}) not found — migrate Employees first or pick manually`);
        } else if (staffLabel && row.staff_id) {
            warn('staffId', `Mapped old staff_id ${row.staff_id} → "${staffLabel}" (#${staffId}) by name, not by id`);
        }

        // OFT subject: old id first, then nested subject_name label.
        let oftSubjectId = null;
        let oftSubjectOther = null;
        const bySubId = await r.resolveById('oftSubject', 'subjectName', 'oftSubjectId', row.oft_subject_id);
        if (bySubId.matched) {
            oftSubjectId = bySubId.id;
        } else {
            const subName = decodeEntities(row.subject_name?.oft_subject);
            const byNm = await r.resolve('oftSubject', 'subjectName', 'oftSubjectId', subName);
            if (byNm.matched) oftSubjectId = byNm.id;
            else if (subName) {
                oftSubjectOther = subName;
                warn('oftSubjectId', `Subject "${subName}" not in master — parked in Other`);
            }
        }
        if (!oftSubjectId && !oftSubjectOther) {
            err('oftSubjectId', 'Missing OFT subject');
        }

        // Thematic area: old global id (aligns with our seeded master order).
        let oftThematicAreaId = null;
        let oftThematicAreaOther = null;

        if (row.thematic_area === 59 || row.thematic_area === '59') {
            const subject = await prisma.oftSubject.findFirst({
                where: { subjectName: { contains: 'Horticulture' } }
            });
            if (subject) {
                let thematicArea = await prisma.oftThematicArea.findFirst({
                    where: {
                        thematicAreaName: 'Horticulture',
                        oftSubjectId: subject.oftSubjectId
                    }
                });
                if (!thematicArea) {
                    thematicArea = await prisma.oftThematicArea.create({
                        data: {
                            thematicAreaName: 'Horticulture',
                            oftSubjectId: subject.oftSubjectId
                        }
                    });
                }
                oftThematicAreaId = thematicArea.oftThematicAreaId;
            }
        }

        if (!oftThematicAreaId) {
            const byThId = await r.resolveById(
                'oftThematicArea',
                'thematicAreaName',
                'oftThematicAreaId',
                row.thematic_area,
            );
            if (byThId.matched) {
                oftThematicAreaId = byThId.id;
            } else if (row.thematic_area && String(row.thematic_area) !== '0') {
                oftThematicAreaOther = String(row.thematic_area);
                warn('oftThematicAreaId', `Thematic area old id "${row.thematic_area}" not in master — pick manually`);
            }
        }

        // Discipline: old numeric dropdown (0 = unset) or string name.
        let disciplineId = null;
        let disciplineOther = null;
        let disciplineName = null;
        const discStr = String(row.discipline || '').trim();
        const discNum = parseInt(discStr, 10);
        if (Number.isInteger(discNum) && String(discNum) === discStr) {
            if (discNum > 0) {
                disciplineName = DISCIPLINE_MAP[discNum] || null;
            }
        } else if (discStr && discStr !== '0') {
            disciplineName = discStr;
        }

        if (disciplineName) {
            const m = await r.findOrCreate('discipline', 'disciplineName', 'disciplineId', disciplineName);
            disciplineId = m.id;
        }
        if (!disciplineId && discStr && discStr !== '0') {
            disciplineOther = discStr;
            warn('disciplineId', `Discipline "${discStr}" not found or created`);
        }

        // Season (often null on old rows)
        let seasonId = null;
        if (row.season_id) {
            const seasonName = SEASON_MAP[row.season_id];
            if (seasonName) {
                const s = await r.resolve('season', 'seasonName', 'seasonId', seasonName);
                if (s.matched) seasonId = s.id;
            }
        }
        if (!seasonId) {
            const fallback = await r.resolve('season', 'seasonName', 'seasonId', 'Kharif');
            seasonId = fallback.id;
            if (seasonId) warn('seasonId', 'No season on old row — defaulted to Kharif');
            else err('seasonId', 'No season on old row and Kharif master missing');
        }

        const status = normalizeOftStatus(getRawStatusText(row));

        let performanceIndicators = decodeEntities(extractPerformanceIndicators(row.performance_indicators));
        if (!performanceIndicators) {
            performanceIndicators = decodeEntities(extractPerformanceIndicators(row.production_system)) || '';
            if (!row.performance_indicators) {
                warn('performanceIndicators', 'No performance_indicators on old row — used production_system or empty string');
            }
        }

        const technologies = Array.isArray(row._technologies) ? row._technologies : [];
        if (row._enrichFailed) {
            warn('technologies', 'Could not fetch edit page — technology options missing');
        }
        if (technologies.length === 0) {
            if (status === 'TRANSFERRED_TO_NEXT_YEAR') {
                warn('technologies', 'Transferred OFT has no technologies yet — seeded with empty array');
            } else {
                err('technologies', 'At least one technology option with details is required');
            }
        }

        const numberOfLocation = intOrZero(row.no_of_location);

        let resultReport = null;
        const hasResultData = row.final_recommendation || row.constraints_identified || row.farmers_participation || row.result_description || row.photograph || row.supplementary_datasheet || row._resultHtml;
        if (hasResultData) {
            let tables = [];
            if (row._resultHtml) {
                const parsedTables = parseResultTablesFromHtml(row._resultHtml);
                tables = parsedTables.map((t, tIdx) => {
                    const columnsList = t.headers.map((header, colIdx) => {
                        let columnKey = header.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
                        if (colIdx === 0) columnKey = 'tech_option';
                        return {
                            columnKey,
                            columnLabel: header,
                            isMandatory: colIdx === 0,
                            sortOrder: colIdx + 1
                        };
                    });
                    const rowsList = t.rows.map((cells, rowIdx) => {
                        const rowCells = {};
                        columnsList.forEach((col, colIdx) => {
                            rowCells[col.columnKey] = cells[colIdx] || '';
                        });
                        const optionName = cells[0] || '';
                        const matchedTech = (technologies || []).find(tech => 
                            tech.optionName.toLowerCase().trim() === optionName.toLowerCase().trim()
                        );
                        const optionKey = matchedTech ? matchedTech.optionKey : `opt_${rowIdx + 1}`;
                        return {
                            optionKey,
                            rowLabel: optionName,
                            sortOrder: rowIdx + 1,
                            cells: rowCells
                        };
                    });
                    return {
                        tableTitle: `Table ${tIdx + 1}`,
                        sortOrder: tIdx + 1,
                        columns: columnsList,
                        rows: rowsList
                    };
                });
            }

            resultReport = {
                finalRecommendation: decodeEntities(cleanText(row.final_recommendation || parseFinalRecommendationFromHtml(row._resultHtml))) || '',
                constraintsFeedback: decodeEntities(cleanText(row.constraints_identified || parseConstraintsFromHtml(row._resultHtml))) || '',
                farmersParticipationProcess: decodeEntities(cleanText(row.farmers_participation || parseFarmersParticipationFromHtml(row._resultHtml))) || '',
                resultText: decodeEntities(cleanText(row.result_description || parseResultTextFromHtml(row._resultHtml))) || '',
                remark: decodeEntities(cleanText(row.remark || parseRemarkFromHtml(row._resultHtml))) || '',
                photographName: parsePhotographName(row.photograph || parsePhotographFromHtml(row._resultHtml)),
                tables
            };
        }

        const data = {
            kvkId: mappedKvkId,
            staffId,
            seasonId,
            oftSubjectId,
            oftSubjectOther,
            oftThematicAreaId,
            oftThematicAreaOther,
            disciplineId,
            disciplineOther,
            sourceOfFundingId: null,
            sourceOfFundingOther: null,
            unit: 'ha',
            title: decodeEntities(cleanText(row.title_fram_trail)) || '',
            problemDiagnosed: decodeEntities(cleanText(row.problem_diagnosed)) || '',
            sourceOfTechnology: cleanText(row.source_of_technology) || '',
            productionSystem: cleanText(row.production_system) || '',
            performanceIndicators,
            quantity: floatOrZero(row.area),
            numberOfLocation,
            numberOfTrialReplication: intOrZero(row.no_of_trial),
            oftStartDate,
            oftEndDate,
            expectedCompletionDate: oftEndDate,
            criticalInput: cleanText(row.critical_input) || '',
            costOfOft: floatOrZero(row.cost_of_oft),
            farmersGeneralM: intOrZero(row.general_m),
            farmersGeneralF: intOrZero(row.general_f),
            farmersObcM: intOrZero(row.obc_m),
            farmersObcF: intOrZero(row.obc_f),
            farmersScM: intOrZero(row.sc_m),
            farmersScF: intOrZero(row.sc_f),
            farmersStM: intOrZero(row.st_m),
            farmersStF: intOrZero(row.st_f),
            status,
            technologies,
            resultReport,
        };

        if (!data.title) err('title', 'Missing title_fram_trail');

        return { data, issues };
    },

    async seedRecord(prisma, data, { kvkId }) {
        const { technologies, resultReport, ...oftData } = data;
        void kvkId;

        const techCreate = (technologies || []).map((t, index) => ({
            optionKey: t.optionKey || `opt_${index + 1}`,
            optionName: t.optionName,
            details: t.details || null,
        }));

        // Always insert a new OFT — distinct source rows can share kvk + title +
        // start date but are separate records. Matching/updating would collapse them.
        const createPayload = {
            ...oftData,
            technologies: { create: techCreate },
        };
        const createdOft = await prisma.kvkoft.create({
            data: createPayload,
        });

        if (resultReport) {
            const createdReport = await prisma.oftResultReport.create({
                data: {
                    kvkOftId: createdOft.kvkOftId,
                    finalRecommendation: resultReport.finalRecommendation,
                    constraintsFeedback: resultReport.constraintsFeedback,
                    farmersParticipationProcess: resultReport.farmersParticipationProcess,
                    resultText: resultReport.resultText,
                    remark: resultReport.remark || '',
                    photographName: resultReport.photographName || null,
                }
            });
            if (resultReport.tables) {
                await saveResultReportTables(prisma, createdReport.oftResultReportId, resultReport.tables);
            }
        }
        return 'created';
    },
};

async function saveResultReportTables(prisma, oftResultReportId, tables) {
    // Delete existing tables. Cascade deletes will clean up columns, rows, and cells.
    await prisma.oftResultTable.deleteMany({
        where: { oftResultReportId }
    });

    for (let tableIndex = 0; tableIndex < tables.length; tableIndex += 1) {
        const table = tables[tableIndex];
        const createdTable = await prisma.oftResultTable.create({
            data: {
                oftResultReportId,
                tableTitle: table.tableTitle || `Table ${tableIndex + 1}`,
                sortOrder: table.sortOrder || (tableIndex + 1),
            },
        });

        const columns = Array.isArray(table.columns) ? table.columns : [];
        const rows = Array.isArray(table.rows) ? table.rows : [];

        // 1. Batch Columns Creation
        const columnsToCreate = columns.map((col, colIndex) => ({
            oftResultTableId: createdTable.oftResultTableId,
            columnKey: col.columnKey || `col_${colIndex + 1}`,
            columnLabel: col.columnLabel || col.columnKey || `col_${colIndex + 1}`,
            isMandatory: Boolean(col.isMandatory),
            sortOrder: col.sortOrder || (colIndex + 1),
        }));
        
        if (columnsToCreate.length > 0) {
            await prisma.oftResultTableColumn.createMany({ data: columnsToCreate });
        }
        
        const createdColumns = await prisma.oftResultTableColumn.findMany({
            where: { oftResultTableId: createdTable.oftResultTableId }
        });
        
        const createdColumnsByKey = {};
        createdColumns.forEach(col => {
            createdColumnsByKey[col.columnKey] = col;
        });

        // 2. Batch Rows Creation
        const rowsToCreate = rows.map((row, rowIndex) => ({
            oftResultTableId: createdTable.oftResultTableId,
            optionKey: row.optionKey || null,
            rowLabel: row.rowLabel || `Row ${rowIndex + 1}`,
            sortOrder: row.sortOrder || (rowIndex + 1),
        }));
        
        if (rowsToCreate.length > 0) {
            await prisma.oftResultTableRow.createMany({ data: rowsToCreate });
        }
        
        const createdRows = await prisma.oftResultTableRow.findMany({
            where: { oftResultTableId: createdTable.oftResultTableId }
        });

        // 3. Batch Cells Creation for the entire table
        const cellInserts = [];
        rows.forEach((row, rowIndex) => {
            const createdRow = createdRows.find(
                cr => cr.sortOrder === (row.sortOrder || (rowIndex + 1))
            );
            if (!createdRow) return;
            
            const cells = row.cells && typeof row.cells === 'object' ? row.cells : {};
            Object.entries(cells).forEach(([columnKey, value]) => {
                const column = createdColumnsByKey[columnKey];
                if (column) {
                    cellInserts.push({
                        oftResultTableRowId: createdRow.oftResultTableRowId,
                        oftResultTableColumnId: column.oftResultTableColumnId,
                        value: value != null ? String(value) : '',
                    });
                }
            });
        });

        if (cellInserts.length > 0) {
            await prisma.oftResultTableCell.createMany({
                data: cellInserts,
            });
        }
    }
}
