const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');
const prisma = require('../../config/prisma.js');

function floatOrZero(v) {
    const n = parseFloat(String(v ?? '').trim());
    return Number.isFinite(n) ? n : 0;
}

function intOrNull(v) {
    const n = parseInt(String(v ?? '').trim(), 10);
    return Number.isFinite(n) ? n : null;
}

module.exports = {
    key: 'equipment',
    label: 'Equipment',
    model: 'kvkEquipment',
    idField: 'equipmentId',
    // identifierCode is optional on old site — fall back to name+yearOfPurchase
    naturalKey: ['kvkId', 'identifierCode'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
        equipmentTypeId: { master: 'equipmentType' },
        equipmentMasterId: { master: 'equipmentMaster' },
        assetFundingSourceId: { master: 'assetFundingSource' },
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
            // List API may not embed kvk_name — use the selected ctx.kvkId silently.
            warn('kvkId', 'KVK name not in row — using selected target KVK');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const kvkId = ctx.kvkId;

        // ── Equipment type (EquipmentTypeMaster) ──────────────────────────
        let equipmentTypeId = null;
        let equipmentTypeOther = null;
        const rawTypeName = decodeEntities(
            cleanText(
                row.equipment_type?.name ||
                row['equipment_type.name'] ||
                row.equipment_type_name ||
                row.equipment_type,
            ),
        );
        if (rawTypeName) {
            const t = await r.resolve('equipmentTypeMaster', 'name', 'equipmentTypeId', rawTypeName);
            if (t.matched) equipmentTypeId = t.id;
            else { equipmentTypeOther = rawTypeName; warn('equipmentTypeId', `Type "${rawTypeName}" not found — stored in other`); }
        }

        // ── Equipment master (EquipmentMaster — unique per type+name) ─────
        // Old site list rows carry the equipment name directly as `equipment_name`
        // (no nested equipment_master object). Try nested paths first, fall back.
        let equipmentMasterId = null;
        // `row.equipment_master` may be a numeric ID (old site relation) — skip it if so.
        const equipMasterRaw = row.equipment_master;
        const equipMasterStr = (typeof equipMasterRaw === 'string' && !/^\d+$/.test(equipMasterRaw.trim()))
            ? equipMasterRaw
            : null;
        const rawEquipName = decodeEntities(
            cleanText(
                row.equipment_master?.name ||
                row['equipment_master.name'] ||
                row.equipment_master_name ||
                equipMasterStr ||
                row.equipment_name,
            ),
        );
        if (rawEquipName) {
            // Use MasterResolver: normalizes whitespace/case/punctuation before matching,
            // so hidden encoding differences (non-breaking spaces etc.) don't cause misses.
            const em = await r.resolve('equipmentMaster', 'name', 'equipmentMasterId', rawEquipName);
            if (em.matched) {
                equipmentMasterId = em.id;
                // Backfill equipmentTypeId from the master row when type wasn't in raw data
                if (!equipmentTypeId) {
                    const emRow = await prisma.equipmentMaster.findUnique({
                        where: { equipmentMasterId: em.id },
                        select: { equipmentTypeId: true },
                    });
                    if (emRow?.equipmentTypeId) equipmentTypeId = emRow.equipmentTypeId;
                }
            } else {
                warn('equipmentMasterId', `EquipmentMaster "${rawEquipName}" not found — stored as null`);
            }
        }

        // ── Scalar fields ─────────────────────────────────────────────────
        const equipmentName = decodeEntities(cleanText(row.equipment_name || rawEquipName || ''));
        const companyBrandModel = decodeEntities(cleanText(
            row.company_brand_model || row.company || row.brand || '',
        ));
        const identifierCode = decodeEntities(cleanText(
            row.identifier_code || row.identifier || row.code || '',
        ));
        const yearOfPurchase = intOrNull(row.year_of_purchase || row.purchase_year);
        if (!yearOfPurchase) err('yearOfPurchase', 'yearOfPurchase required — not found on row');
        const totalCost = floatOrZero(row.total_cost || row.cost || row.equipment_cost || row.equipment_amount);

        // ── Asset funding source (parent-level, optional) — lookup only ────
        let assetFundingSourceId = null;
        const rawFunding = decodeEntities(cleanText(
            row.funding_source?.name ||
            row['funding_source.name'] ||
            row.sources_of_fund ||      // actual old-site field name (plural)
            row.source_of_fund ||
            row.asset_funding_source ||
            row.funding_source,
        ));
        if (rawFunding) {
            const fs = await r.findOrCreate(
                'assetFundingSourceMaster', 'name', 'assetFundingSourceId', rawFunding,
            );
            if (fs.id) {
                assetFundingSourceId = fs.id;
                if (fs.created) warn('assetFundingSourceId', `Created funding source "${rawFunding}"`);
            }
        }

        // ── Per-year detail ───────────────────────────────────────────────
        // The list API usually omits reporting_year; fall back to Jan-1 of purchase year.
        let reportingYear = parseDate(row.reporting_year);
        if (!reportingYear && yearOfPurchase) {
            reportingYear = new Date(`${yearOfPurchase}-01-01T00:00:00.000Z`);
            warn('_detail.reportingYear', `reporting_year missing — using purchase year ${yearOfPurchase}`);
        } else if (!reportingYear) {
            warn('_detail.reportingYear', `Bad/missing reporting_year "${row.reporting_year}"`);
        }

        // Present status → EquipmentPresentStatusMaster (find-or-create)
        let equipmentStatusId = null;
        const rawStatus = decodeEntities(cleanText(row.present_status || row.equipment_status || ''));
        if (rawStatus) {
            let statusMaster = await prisma.equipmentPresentStatusMaster.findFirst({
                where: { statusLabel: { equals: rawStatus, mode: 'insensitive' } },
            });
            if (!statusMaster) {
                statusMaster = await prisma.equipmentPresentStatusMaster.create({
                    data: { statusCode: rawStatus, statusLabel: rawStatus },
                });
                warn('_detail.equipmentStatusId', `Created equipment status "${rawStatus}"`);
            }
            equipmentStatusId = statusMaster.equipmentStatusId;
        } else {
            err('_detail.equipmentStatusId', 'equipmentStatusId required — no present_status on row');
        }

        // Detail-level funding source defaults to parent; override only if explicit field present
        const detailFundingSourceId = assetFundingSourceId;

        return {
            data: {
                kvkId,
                equipmentTypeId,
                equipmentTypeOther: equipmentTypeOther || null,
                equipmentMasterId,
                equipmentName: equipmentName || null,
                companyBrandModel: companyBrandModel || null,
                identifierCode: identifierCode || null,
                yearOfPurchase,
                totalCost,
                assetFundingSourceId,
                // detail sub-record
                _detail: reportingYear ? {
                    reportingYear,
                    equipmentStatusId,
                    assetFundingSourceId: detailFundingSourceId,
                } : null,
            },
            issues,
        };
    },

    async seedRecord(prisma, data) {
        const detail = data._detail || null;
        const parentData = { ...data };
        delete parentData._detail;

        // Upsert parent KvkEquipment by kvkId + identifierCode (if present),
        // else kvkId + equipmentName + yearOfPurchase
        let existing;
        if (parentData.identifierCode) {
            existing = await prisma.kvkEquipment.findFirst({
                where: { kvkId: parentData.kvkId, identifierCode: parentData.identifierCode },
            });
        }
        if (!existing && parentData.equipmentName && parentData.yearOfPurchase) {
            existing = await prisma.kvkEquipment.findFirst({
                where: {
                    kvkId: parentData.kvkId,
                    equipmentName: parentData.equipmentName,
                    yearOfPurchase: parentData.yearOfPurchase,
                },
            });
        }

        let equipmentId;
        if (existing) {
            await prisma.kvkEquipment.update({
                where: { equipmentId: existing.equipmentId },
                data: parentData,
            });
            equipmentId = existing.equipmentId;
        } else {
            const created = await prisma.kvkEquipment.create({ data: parentData });
            equipmentId = created.equipmentId;
        }

        // Upsert KvkEquipmentDetail (unique per equipmentId + reportingYear)
        if (detail && detail.reportingYear && detail.equipmentStatusId) {
            await prisma.kvkEquipmentDetail.upsert({
                where: {
                    equipmentId_reportingYear: {
                        equipmentId,
                        reportingYear: detail.reportingYear,
                    },
                },
                create: {
                    kvkId: parentData.kvkId,
                    equipmentId,
                    reportingYear: detail.reportingYear,
                    equipmentStatusId: detail.equipmentStatusId,
                    assetFundingSourceId: detail.assetFundingSourceId ?? null,
                },
                update: {
                    equipmentStatusId: detail.equipmentStatusId,
                    assetFundingSourceId: detail.assetFundingSourceId ?? null,
                },
            });
        }

        return existing ? 'updated' : 'created';
    },
};
