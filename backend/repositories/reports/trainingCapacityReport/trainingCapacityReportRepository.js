/**
 * Section 2.4 training capacity report. Set DEBUG_TRAINING_CAPACITY_REPORT=1 when starting
 * the backend to log training type vs campus per row and each section A,B,… (sections by training type).
 */
const prisma = require('../../../config/prisma.js');
const { buildReportingYearFilter } = require('../agriDroneReport/agriDroneIntroductionReportRepository.js');
const { yearLabelFromFilters } = require('../reportYearLabel.js');

const DEBUG = process.env.DEBUG_TRAINING_CAPACITY_REPORT === '1' || process.env.DEBUG_TRAINING_CAPACITY_REPORT === 'true';
const EXTENSION_FUNCTIONARIES_TRAINING_TYPE = 'Extension Functionaries/ Personnel';

function debugLog(...args) {
    if (DEBUG) {
        console.log('[trainingCapacityReport]', new Date().toISOString(), ...args);
    }
}

function canonicalTrainingTypeName(value) {
    const raw = String(value || '').trim();
    const normalized = raw
        .toLowerCase()
        .replace(/\s*\/\s*/g, '/')
        .replace(/\s+/g, ' ');

    if (
        normalized === 'extension personnel'
        || normalized === 'extension functionaries/personnel'
    ) {
        return EXTENSION_FUNCTIONARIES_TRAINING_TYPE;
    }
    return raw || 'Not specified';
}

function safeInt(v) {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function emptyParticipantAgg() {
    return {
        courses: 0,
        generalM: 0,
        generalF: 0,
        obcM: 0,
        obcF: 0,
        scM: 0,
        scF: 0,
        stM: 0,
        stF: 0,
    };
}

function addRowToAgg(acc, r) {
    acc.courses += 1;
    acc.generalM += safeInt(r.generalM);
    acc.generalF += safeInt(r.generalF);
    acc.obcM += safeInt(r.obcM);
    acc.obcF += safeInt(r.obcF);
    acc.scM += safeInt(r.scM);
    acc.scF += safeInt(r.scF);
    acc.stM += safeInt(r.stM);
    acc.stF += safeInt(r.stF);
}

function withTotals(agg) {
    const genT = agg.generalM + agg.generalF;
    const obcT = agg.obcM + agg.obcF;
    const scT = agg.scM + agg.scF;
    const stT = agg.stM + agg.stF;
    const grandM = agg.generalM + agg.obcM + agg.scM + agg.stM;
    const grandF = agg.generalF + agg.obcF + agg.scF + agg.stF;
    const grandT = grandM + grandF;
    return {
        ...agg,
        genT,
        obcT,
        scT,
        stT,
        grandM,
        grandF,
        grandT,
    };
}

function emptyCampusSplitAgg() {
    return {
        onCampus: emptyParticipantAgg(),
        offCampus: emptyParticipantAgg(),
    };
}

function cloneAgg(agg) {
    return {
        courses: agg.courses || 0,
        generalM: agg.generalM || 0,
        generalF: agg.generalF || 0,
        obcM: agg.obcM || 0,
        obcF: agg.obcF || 0,
        scM: agg.scM || 0,
        scF: agg.scF || 0,
        stM: agg.stM || 0,
        stF: agg.stF || 0,
    };
}

function campusBucketFor(value) {
    return String(value || '').trim().toUpperCase() === 'OFF_CAMPUS' ? 'offCampus' : 'onCampus';
}

function monthNumber(dateLike) {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return '';
    return String(d.getMonth() + 1);
}

function durationDays(startDate, endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    return Math.max(0, Math.floor((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000)));
}

function isSponsoredTrainingRecord(r) {
    return /sponsored training/i.test(String(r.clienteleName || '').trim());
}

function sponsoredClientCode(trainingTypeName) {
    const value = canonicalTrainingTypeName(trainingTypeName).toLowerCase();
    if (value === 'rural youth') return 'RY';
    if (value === EXTENSION_FUNCTIONARIES_TRAINING_TYPE.toLowerCase()) return 'EF';
    return 'PF';
}

function inferYearLabel(records) {
    for (const r of records) {
        if (!r.startDate) continue;
        const d = new Date(r.startDate);
        if (Number.isNaN(d.getTime())) continue;
        return String(d.getFullYear());
    }
    return String(new Date().getFullYear());
}

function normalizePrismaRow(r) {
    const stateName = (r.kvk && r.kvk.state && r.kvk.state.stateName)
        ? r.kvk.state.stateName
        : 'Unknown';
    const rawTrainingTypeName = r.trainingTypeOther
        ? String(r.trainingTypeOther).trim()
        : ((r.trainingType && r.trainingType.trainingTypeName)
            ? String(r.trainingType.trainingTypeName).trim()
            : 'Not specified');
    const trainingTypeName = canonicalTrainingTypeName(rawTrainingTypeName);
    const trainingAreaName = r.trainingAreaOther
        ? String(r.trainingAreaOther).trim()
        : ((r.trainingArea && r.trainingArea.trainingAreaName)
            ? String(r.trainingArea.trainingAreaName).trim()
            : 'Not specified');
    const thematicAreaName = r.thematicAreaOther
        ? String(r.thematicAreaOther).trim()
        : ((r.trainingThematicArea && r.trainingThematicArea.trainingThematicAreaName)
            ? String(r.trainingThematicArea.trainingThematicAreaName).trim()
            : '—');
    const clienteleName = r.clienteleOther
        ? String(r.clienteleOther).trim()
        : ((r.clientele && r.clientele.name)
            ? String(r.clientele.name).trim()
            : null);
    const fundingSourceName = r.fundingSourceOther
        ? String(r.fundingSourceOther).trim()
        : ((r.fundingSource && r.fundingSource.name)
            ? String(r.fundingSource.name).trim()
            : null);

    const campusType = r.campusType != null ? String(r.campusType) : null;

    return {
        trainingAchievementId: r.trainingAchievementId,
        kvkId: r.kvkId,
        stateName,
        clienteleId: r.clienteleId,
        clienteleName,
        trainingTypeId: r.trainingTypeId,
        trainingTypeName,
        campusType,
        titleOfTraining: r.titleOfTraining ? String(r.titleOfTraining).trim() : '—',
        endDate: r.endDate,
        fundingAgencyName: r.fundingAgencyName ? String(r.fundingAgencyName).trim() : null,
        fundingSourceName,
        trainingAreaId: r.trainingAreaId,
        trainingAreaName,
        thematicAreaId: r.thematicAreaId,
        thematicAreaName,
        startDate: r.startDate,
        generalM: safeInt(r.generalM),
        generalF: safeInt(r.generalF),
        obcM: safeInt(r.obcM),
        obcF: safeInt(r.obcF),
        scM: safeInt(r.scM),
        scF: safeInt(r.scF),
        stM: safeInt(r.stM),
        stF: safeInt(r.stF),
    };
}

function sortStr(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

// Canonical display order for TRAINING AREAS in the training report (matches the
// ATARI reporting format — the training-area summary rows and the per-area detail
// blocks follow this order). Anything not listed falls to the end, alphabetically.
// Names must match the training-area master exactly.
const TRAINING_AREA_ORDER = [
    'Crop Production',
    'Horticulture (Vegetable Crops)',
    'Horticulture (Fruits)',
    'Horticulture (Ornamental Plants)',
    'Horticulture (Plantation Crops)',
    'Horticulture (Tuber Crops)',
    'Horticulture (Spices)',
    'Horticulture (Medicinal And Aromatic Plants)',
    'Soil Health and Fertility Management',
    'Livestock Production and Management',
    'Home Science/Women Empowerment',
    'Agril. Engineering',
    'Plant Protection',
    'Fisheries',
    'Production of Inputs at Site',
    'Capacity Building and Group Dynamics',
    'Rural Youth',
    'Extension Personnel',
    'Agro forestry',
];
const TRAINING_AREA_RANK = new Map(
    TRAINING_AREA_ORDER.map((name, i) => [name.toLowerCase(), i]),
);
function trainingAreaRank(name) {
    const r = TRAINING_AREA_RANK.get(String(name || '').trim().toLowerCase());
    return r === undefined ? Number.MAX_SAFE_INTEGER : r;
}
// Canonical training-area order, then alphabetical for any unlisted names.
function sortTrainingArea(a, b) {
    const ra = trainingAreaRank(a);
    const rb = trainingAreaRank(b);
    if (ra !== rb) return ra - rb;
    return sortStr(a, b);
}

// Fixed section order — training types A/B/C in ATARI reporting order.
const TRAINING_TYPE_ORDER = [
    'Farmers and Farm Women',
    'Rural Youth',
    EXTENSION_FUNCTIONARIES_TRAINING_TYPE,
];
const TRAINING_TYPE_RANK = new Map(
    TRAINING_TYPE_ORDER.map((name, i) => [name.toLowerCase(), i]),
);
function sortTrainingType(a, b) {
    const canonicalA = canonicalTrainingTypeName(a).toLowerCase();
    const canonicalB = canonicalTrainingTypeName(b).toLowerCase();
    const ra = TRAINING_TYPE_RANK.has(canonicalA)
        ? TRAINING_TYPE_RANK.get(canonicalA)
        : Number.MAX_SAFE_INTEGER;
    const rb = TRAINING_TYPE_RANK.has(canonicalB)
        ? TRAINING_TYPE_RANK.get(canonicalB)
        : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return sortStr(canonicalA, canonicalB);
}

const CLIENTELE_ORDER = [
    'Farmers and Farm Women',
    'Rural Youth',
    'Extension Personnel',
    'Vocational Training',
    'Sponsored Training',
    'Skill Development Training',
    'Other Training',
];
const CLIENTELE_RANK = new Map(
    CLIENTELE_ORDER.map((name, i) => [name.toLowerCase(), i]),
);
function clienteleGroupName(r) {
    const raw = String(r.clienteleName || '').trim();
    if (!raw) return 'Other Training';
    const lower = raw.toLowerCase();
    if (lower === 'farmers' || lower === 'farm women' || lower === 'farmers and farm women') {
        return 'Farmers and Farm Women';
    }
    if (lower === 'rural youth') return 'Rural Youth';
    if (lower === 'extension personnel') return 'Extension Personnel';
    if (lower === 'vocational training') return 'Vocational Training';
    if (lower === 'sponsored training') return 'Sponsored Training';
    if (lower === 'skill development training') return 'Skill Development Training';
    if (lower === 'other training') return 'Other Training';
    return raw;
}

function sortClientele(a, b) {
    const ra = CLIENTELE_RANK.has(String(a || '').trim().toLowerCase())
        ? CLIENTELE_RANK.get(String(a || '').trim().toLowerCase())
        : Number.MAX_SAFE_INTEGER;
    const rb = CLIENTELE_RANK.has(String(b || '').trim().toLowerCase())
        ? CLIENTELE_RANK.get(String(b || '').trim().toLowerCase())
        : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return sortStr(a, b);
}

function thematicSortEntries(thematicMap) {
    return [...thematicMap.keys()].sort((a, b) => {
        const ida = thematicMap.get(a).thematicAreaId;
        const idb = thematicMap.get(b).thematicAreaId;
        if (ida == null && idb == null) return sortStr(thematicMap.get(a).thematicAreaName, thematicMap.get(b).thematicAreaName);
        if (ida == null) return 1;
        if (idb == null) return -1;
        return idb - ida;
    });
}

function buildAreaOrderAndMap(rows) {
    const areaMap = new Map();
    for (const r of rows) {
        const ak = r.trainingAreaId != null ? `aid:${r.trainingAreaId}` : 'aid:none';
        if (!areaMap.has(ak)) {
            areaMap.set(ak, {
                key: ak,
                trainingAreaName: r.trainingAreaName || 'Not specified',
                agg: emptyParticipantAgg(),
            });
        }
        addRowToAgg(areaMap.get(ak).agg, r);
    }
    const areaOrder = [...areaMap.keys()]
        .filter((ak) => ak !== 'aid:none' && areaMap.get(ak).trainingAreaName !== 'Not specified')
        .sort((a, b) =>
            sortTrainingArea(areaMap.get(a).trainingAreaName, areaMap.get(b).trainingAreaName),
        );
    return { areaMap, areaOrder };
}

function rowsForAreaKey(rows, areaKey) {
    return rows.filter((r) => {
        const k = r.trainingAreaId != null ? `aid:${r.trainingAreaId}` : 'aid:none';
        return k === areaKey;
    });
}

function buildConsolidatedKvkSections(sectionKeys, bySection, titleForKey) {
    return sectionKeys.map((sectionKey) => {
        const typeRows = bySection.get(sectionKey) || [];
        const sectionTitle = titleForKey(sectionKey);
        const { areaMap, areaOrder } = buildAreaOrderAndMap(typeRows);
        const rows = [];

        for (const ak of areaOrder) {
            const areaName = areaMap.get(ak).trainingAreaName;
            rows.push({ kind: 'area', trainingAreaName: areaName });

            const areaRows = rowsForAreaKey(typeRows, ak);
            const thematicMap = new Map();
            for (const r of areaRows) {
                const tk = r.thematicAreaId != null ? `thid:${r.thematicAreaId}` : `thn:${r.thematicAreaName || '—'}`;
                if (!thematicMap.has(tk)) {
                    thematicMap.set(tk, {
                        thematicAreaId: r.thematicAreaId != null ? Number(r.thematicAreaId) : null,
                        thematicAreaName: r.thematicAreaName || '—',
                        agg: emptyParticipantAgg(),
                    });
                }
                addRowToAgg(thematicMap.get(tk).agg, r);
            }

            thematicSortEntries(thematicMap).forEach((tk) => {
                const entry = thematicMap.get(tk);
                rows.push({
                    kind: 'thematic',
                    trainingAreaName: areaName,
                    thematicAreaName: entry.thematicAreaName,
                    ...withTotals(entry.agg),
                });
            });

            rows.push({
                kind: 'subtotal',
                trainingAreaName: areaName,
                label: 'Sub Total',
                ...withTotals(areaMap.get(ak).agg),
            });
        }

        return { trainingTypeName: sectionTitle, rows };
    });
}

function buildCampusSplitKvkSections(sectionKeys, bySection, titleForKey) {
    return sectionKeys.map((sectionKey) => {
        const typeRows = bySection.get(sectionKey) || [];
        const sectionTitle = titleForKey(sectionKey);
        const { areaMap, areaOrder } = buildAreaOrderAndMap(typeRows);
        const rows = [];

        for (const ak of areaOrder) {
            const areaName = areaMap.get(ak).trainingAreaName;
            rows.push({ kind: 'area', trainingAreaName: areaName });
            const areaRows = rowsForAreaKey(typeRows, ak);
            const thematicMap = new Map();
            for (const r of areaRows) {
                const tk = r.thematicAreaId != null ? `thid:${r.thematicAreaId}` : `thn:${r.thematicAreaName || '—'}`;
                if (!thematicMap.has(tk)) {
                    thematicMap.set(tk, {
                        thematicAreaId: r.thematicAreaId != null ? Number(r.thematicAreaId) : null,
                        thematicAreaName: r.thematicAreaName || '—',
                        split: emptyCampusSplitAgg(),
                    });
                }
                addRowToAgg(thematicMap.get(tk).split[campusBucketFor(r.campusType)], r);
            }

            thematicSortEntries(thematicMap).forEach((tk) => {
                const entry = thematicMap.get(tk);
                rows.push({
                    kind: 'thematic',
                    trainingAreaName: areaName,
                    thematicAreaName: entry.thematicAreaName,
                    onCampus: withTotals(entry.split.onCampus),
                    offCampus: withTotals(entry.split.offCampus),
                });
            });

            const subtotal = emptyCampusSplitAgg();
            areaRows.forEach((r) => addRowToAgg(subtotal[campusBucketFor(r.campusType)], r));
            rows.push({
                kind: 'subtotal',
                trainingAreaName: areaName,
                label: 'Sub Total',
                onCampus: withTotals(subtotal.onCampus),
                offCampus: withTotals(subtotal.offCampus),
            });
        }

        return { trainingTypeName: sectionTitle, rows };
    });
}

function buildSponsoredProgrammeRows(records) {
    return records
        .filter(isSponsoredTrainingRecord)
        .map((r, index) => ({
            srNo: index + 1,
            trainingTitle: r.titleOfTraining || '—',
            thematicAreaName: r.thematicAreaName || '—',
            month: monthNumber(r.startDate),
            durationDays: durationDays(r.startDate, r.endDate),
            clientCode: sponsoredClientCode(r.trainingTypeName),
            courses: 1,
            sponsoringAgency: r.fundingAgencyName || r.fundingSourceName || '—',
            ...withTotals(cloneAgg(r)),
        }));
}

function buildSuperadminClienteleSections(records) {
    const byClientele = new Map();
    for (const r of records) {
        const key = clienteleGroupName(r);
        if (!byClientele.has(key)) byClientele.set(key, []);
        byClientele.get(key).push(r);
    }

    const order = [...byClientele.keys()].sort(sortClientele);
    return order.map((clienteleName) => {
        const rows = byClientele.get(clienteleName) || [];
        const { areaMap, areaOrder } = buildAreaOrderAndMap(rows);
        const detailRows = [];

        for (const ak of areaOrder) {
            const areaName = areaMap.get(ak).trainingAreaName;
            detailRows.push({ kind: 'area', trainingAreaName: areaName });
            const areaRows = rowsForAreaKey(rows, ak);
            const thematicMap = new Map();
            for (const r of areaRows) {
                const tk = r.thematicAreaId != null ? `thid:${r.thematicAreaId}` : `thn:${r.thematicAreaName || '—'}`;
                if (!thematicMap.has(tk)) {
                    thematicMap.set(tk, {
                        thematicAreaId: r.thematicAreaId != null ? Number(r.thematicAreaId) : null,
                        thematicAreaName: r.thematicAreaName || '—',
                        agg: emptyParticipantAgg(),
                    });
                }
                addRowToAgg(thematicMap.get(tk).agg, r);
            }
            thematicSortEntries(thematicMap).forEach((tk) => {
                const entry = thematicMap.get(tk);
                detailRows.push({
                    kind: 'thematic',
                    trainingAreaName: areaName,
                    thematicAreaName: entry.thematicAreaName,
                    ...withTotals(entry.agg),
                });
            });
            detailRows.push({
                kind: 'subtotal',
                trainingAreaName: areaName,
                label: 'Sub Total',
                ...withTotals(areaMap.get(ak).agg),
            });
        }

        return {
            clienteleName,
            rows: detailRows,
        };
    });
}

/** Primary section key: **training type** (`trainingTypeId` → superadmin `TrainingType`). Campus is never used for A/B. */
function primarySectionKey(r) {
    const canonicalName = canonicalTrainingTypeName(r.trainingTypeName);
    if (canonicalName === EXTENSION_FUNCTIONARIES_TRAINING_TYPE) {
        return `canonical:${canonicalName.toLowerCase()}`;
    }
    if (r.trainingTypeId != null) return `tid:${r.trainingTypeId}`;
    return 'tid:none';
}

function sectionTitleFromRows(rows) {
    const f = rows[0];
    if (f && f.trainingTypeName) return canonicalTrainingTypeName(f.trainingTypeName);
    return 'Not specified';
}

/**
 * Build hierarchical payload. Sections A, B, … group by **training type** — not clientele or campus.
 * Use `campusType` on each record for on/off campus only.
 * Per section: state-wise → training-area summary → thematic-area detail per training area.
 */
function buildPayloadFromRecords(records, filters = {}) {
    const norm = Array.isArray(records)
        ? records.map((r) => {
            const looksNormalized = typeof r.stateName === 'string'
                && r.trainingAchievementId != null
                && r.trainingTypeName != null;
            return looksNormalized
                ? {
                    ...r,
                    trainingTypeName: canonicalTrainingTypeName(r.trainingTypeName),
                }
                : normalizePrismaRow(r);
        })
        : [];
    // Year label from the selected filter, not the data (#231/#223).
    const yearLabel = yearLabelFromFilters(filters);

    if (norm.length === 0) {
        debugLog('buildPayloadFromRecords: no rows after normalize');
        return { yearLabel, sections: [] };
    }

    debugLog('buildPayloadFromRecords: row sample (up to 15) — sections keyed by trainingTypeId / trainingTypeName; campusType for venue only');
    norm.slice(0, 15).forEach((r) => {
        debugLog({
            trainingAchievementId: r.trainingAchievementId,
            kvkId: r.kvkId,
            trainingTypeId: r.trainingTypeId,
            trainingTypeName: r.trainingTypeName,
            campusType: r.campusType ?? '(null)',
            primarySectionKey: primarySectionKey(r),
            sectionTitleWouldBe: sectionTitleFromRows([r]),
        });
    });

    const bySection = new Map();
    for (const r of norm) {
        const key = primarySectionKey(r);
        if (!bySection.has(key)) bySection.set(key, []);
        bySection.get(key).push(r);
    }

    // Always render the three canonical training-type sections in a fixed order —
    // Farmers and Farm Women → Rural Youth → Extension Functionaries/ Personnel — even when a
    // section has no data (it renders as an empty table). Seed a placeholder key
    // (with no rows) for any canonical training type missing from the data. Alias
    // normalization above prevents the obsolete "Extension Personnel" heading
    // from being inserted beside the retained extension-functionaries section.
    const presentTitles = new Set(
        [...bySection.keys()].map((k) => sectionTitleFromRows(bySection.get(k) || []).trim().toLowerCase()),
    );
    TRAINING_TYPE_ORDER.forEach((title) => {
        if (!presentTitles.has(title.trim().toLowerCase())) {
            bySection.set(`title:${title}`, []);
        }
    });

    // Title for a section key — falls back to the seeded placeholder title when
    // the bucket has no rows.
    const titleForKey = (key) => {
        const rows = bySection.get(key) || [];
        if (rows.length > 0) return sectionTitleFromRows(rows);
        return typeof key === 'string' && key.startsWith('title:')
            ? key.slice('title:'.length)
            : 'Not specified';
    };

    const sectionKeys = [...bySection.keys()].sort((ka, kb) => {
        return sortTrainingType(titleForKey(ka), titleForKey(kb));
    });

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const sections = [];

    sectionKeys.forEach((sectionKey, idx) => {
        const typeRows = bySection.get(sectionKey) || [];
        const sectionTitle = titleForKey(sectionKey);
        const letter = letters[idx] || String(idx + 1);

        const stateMap = new Map();
        for (const r of typeRows) {
            const st = r.stateName || 'Unknown';
            if (!stateMap.has(st)) stateMap.set(st, emptyParticipantAgg());
            addRowToAgg(stateMap.get(st), r);
        }
        const stateOrder = [...stateMap.keys()].sort(sortStr);
        const stateRows = stateOrder.map((stateName) => ({
            stateName,
            ...withTotals(stateMap.get(stateName)),
        }));
        let stateGrand = emptyParticipantAgg();
        for (const r of typeRows) addRowToAgg(stateGrand, r);
        stateGrand = withTotals(stateGrand);

        const { areaMap, areaOrder } = buildAreaOrderAndMap(typeRows);
        const trainingAreaSummary = areaOrder.map((ak) => {
            const entry = areaMap.get(ak);
            return {
                trainingAreaName: entry.trainingAreaName,
                ...withTotals(entry.agg),
            };
        });
        let areaSummaryGrand = emptyParticipantAgg();
        for (const ak of areaOrder) {
            const a = areaMap.get(ak).agg;
            areaSummaryGrand.courses += a.courses;
            areaSummaryGrand.generalM += a.generalM;
            areaSummaryGrand.generalF += a.generalF;
            areaSummaryGrand.obcM += a.obcM;
            areaSummaryGrand.obcF += a.obcF;
            areaSummaryGrand.scM += a.scM;
            areaSummaryGrand.scF += a.scF;
            areaSummaryGrand.stM += a.stM;
            areaSummaryGrand.stF += a.stF;
        }
        areaSummaryGrand = withTotals(areaSummaryGrand);

        const thematicDetailBlocks = [];
        for (const ak of areaOrder) {
            const areaName = areaMap.get(ak).trainingAreaName;
            const rowsForArea = rowsForAreaKey(typeRows, ak);
            const thematicMap = new Map();
            for (const r of rowsForArea) {
                const tk = r.thematicAreaId != null ? `thid:${r.thematicAreaId}` : 'thid:none';
                if (!thematicMap.has(tk)) {
                    thematicMap.set(tk, {
                        thematicAreaId: r.thematicAreaId != null ? Number(r.thematicAreaId) : null,
                        thematicAreaName: r.thematicAreaName || '—',
                        agg: emptyParticipantAgg(),
                    });
                }
                addRowToAgg(thematicMap.get(tk).agg, r);
            }
            // Thematic sub-topics follow the master's authored order. The seed file
            // lists them in reverse, so higher ids display earlier; null ids go last.
            const detailRows = thematicSortEntries(thematicMap).map((tk) => {
                const e = thematicMap.get(tk);
                return {
                    thematicAreaName: e.thematicAreaName,
                    ...withTotals(e.agg),
                };
            });
            let detailGrand = emptyParticipantAgg();
            for (const r of rowsForArea) addRowToAgg(detailGrand, r);
            detailGrand = withTotals(detailGrand);

            thematicDetailBlocks.push({
                trainingAreaName: areaName,
                rows: detailRows,
                grandTotal: detailGrand,
            });
        }

        debugLog(`section ${letter}: key=${sectionKey} groupedBy=trainingTypeId sectionTitle="${sectionTitle}" rowCount=${typeRows.length}`);

        sections.push({
            letter,
            sectionTitle,
            trainingTypeName: sectionTitle,
            stateRows,
            stateGrandTotal: stateGrand,
            trainingAreaSummary,
            trainingAreaSummaryGrand: areaSummaryGrand,
            thematicDetailBlocks,
        });
    });

    // Global state-wise summary — aggregated across ALL training types. Rendered
    // once at the top of the report, before the per-training-type sections.
    const globalStateMap = new Map();
    for (const r of norm) {
        const st = r.stateName || 'Unknown';
        if (!globalStateMap.has(st)) globalStateMap.set(st, emptyParticipantAgg());
        addRowToAgg(globalStateMap.get(st), r);
    }
    const stateSummaryRows = [...globalStateMap.keys()]
        .sort(sortStr)
        .map((st) => ({ stateName: st, ...withTotals(globalStateMap.get(st)) }));
    let stateSummaryGrand = emptyParticipantAgg();
    for (const r of norm) addRowToAgg(stateSummaryGrand, r);
    stateSummaryGrand = withTotals(stateSummaryGrand);
    const stateSummary = { rows: stateSummaryRows, grandTotal: stateSummaryGrand };
    const kvkConsolidatedSections = buildConsolidatedKvkSections(sectionKeys, bySection, titleForKey);
    const kvkCampusSections = buildCampusSplitKvkSections(sectionKeys, bySection, titleForKey);
    const sponsoredProgrammeRows = buildSponsoredProgrammeRows(norm);
    const superadminClienteleSections = buildSuperadminClienteleSections(norm);

    debugLog('buildPayloadFromRecords: done', { yearLabel, sectionCount: sections.length });

    return {
        yearLabel,
        stateSummary,
        sections,
        kvkConsolidatedSections,
        kvkCampusSections,
        sponsoredProgrammeRows,
        superadminClienteleSections,
    };
}

async function fetchTrainingAchievements(kvkId, filters = {}) {
    const where = {};
    if (kvkId) where.kvkId = kvkId;
    const ry = buildReportingYearFilter(filters);
    if (ry) where.startDate = ry;

    const rows = await prisma.trainingAchievement.findMany({
        where,
        include: {
            kvk: {
                select: {
                    kvkName: true,
                    state: { select: { stateName: true } },
                },
            },
            clientele: { select: { name: true } },
            fundingSource: { select: { name: true } },
            trainingType: { select: { trainingTypeName: true } },
            trainingArea: { select: { trainingAreaName: true } },
            trainingThematicArea: { select: { trainingThematicAreaName: true } },
        },
        orderBy: [{ startDate: 'asc' }, { trainingAchievementId: 'asc' }],
    });

    return rows.map(normalizePrismaRow);
}

async function getTrainingCapacityReportData(kvkId, filters = {}) {
    debugLog('getTrainingCapacityReportData start', { kvkId, filters, DEBUG });
    const records = await fetchTrainingAchievements(kvkId, filters);
    debugLog(`fetched ${records.length} training_achievement row(s)`);
    const payload = buildPayloadFromRecords(records, filters);
    return { payload, records };
}

function resolveTrainingCapacityPayload(data) {
    if (!data) {
        return { yearLabel: '', sections: [] };
    }
    if (data.payload) return data.payload;
    if (data.data && data.data.payload) return data.data.payload;
    return data;
}

module.exports = {
    getTrainingCapacityReportData,
    buildPayloadFromRecords,
    fetchTrainingAchievements,
    resolveTrainingCapacityPayload,
};
