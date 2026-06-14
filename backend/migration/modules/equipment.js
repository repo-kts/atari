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
            err('kvkId', 'Missing KVK name');
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
        let equipmentMasterId = null;
        const rawEquipName = decodeEntities(
            cleanText(
                row.equipment_master?.name ||
                row['equipment_master.name'] ||
                row.equipment_master_name ||
                row.equipment_master,
            ),
        );
        if (rawEquipName && equipmentTypeId) {
            const found = await prisma.equipmentMaster.findFirst({
                where: {
                    equipmentTypeId,
                    name: { equals: rawEquipName, mode: 'insensitive' },
                },
            });
            if (found) {
                equipmentMasterId = found.equipmentMasterId;
            } else {
                warn('equipmentMasterId', `EquipmentMaster "${rawEquipName}" not found for this type — stored as null`);
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

        // ── Asset funding source (parent-level, optional) ─────────────────
        let assetFundingSourceId = null;
        let assetFundingSourceOther = null;
        const rawFunding = decodeEntities(cleanText(
            row.funding_source?.name ||
            row['funding_source.name'] ||
            row.asset_funding_source ||
            row.funding_source,
        ));
        if (rawFunding) {
            const fs = await r.resolve('assetFundingSourceMaster', 'name', 'assetFundingSourceId', rawFunding);
            if (fs.matched) assetFundingSourceId = fs.id;
            else { assetFundingSourceOther = rawFunding; warn('assetFundingSourceId', `Funding source "${rawFunding}" not found — stored in other`); }
        }

        // ── Per-year detail ───────────────────────────────────────────────
        const reportingYear = parseDate(row.reporting_year);
        if (!reportingYear) warn('_detail.reportingYear', `Bad/missing reporting_year "${row.reporting_year}"`);

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

        // Detail-level funding source (may differ from parent; reuse same resolution)
        let detailFundingSourceId = assetFundingSourceId;
        const rawDetailFunding = decodeEntities(cleanText(row.detail_funding_source || ''));
        if (rawDetailFunding) {
            const fs = await r.resolve('assetFundingSourceMaster', 'name', 'assetFundingSourceId', rawDetailFunding);
            detailFundingSourceId = fs.matched ? fs.id : null;
        }

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
                assetFundingSourceOther: assetFundingSourceOther || null,
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
