const { normalize } = require('../masterResolver.js');
const { parseDate, decodeEntities, cleanText } = require('../util.js');
const prisma = require('../../config/prisma.js');

module.exports = {
    key: 'equipment-details',
    label: 'Equipment Details',
    model: 'kvkEquipmentDetail',
    idField: 'equipmentDetailId',
    naturalKey: ['equipmentId', 'reportingYear'],

    foreignKeys: {
        equipmentId: { master: 'kvkEquipment' },
        equipmentStatusId: { master: 'equipmentStatus' },
        // assetFundingSourceId is inherited from the parent equipment, not picked.
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (f, m) => issues.push({ field: f, message: m, severity: 'warn' });
        const err = (f, m) => issues.push({ field: f, message: m, severity: 'error' });

        // ── KVK (from nested equipment.kvks.kvk_name) ─────────────────────
        const oldKvkName = decodeEntities(
            cleanText(
                row.equipment?.kvks?.kvk_name ||
                row['equipment.kvks.kvk_name'] ||
                row.equipment?.kvk?.kvk_name ||
                '',
            ),
        );
        if (!oldKvkName) {
            err('kvkId', 'Missing KVK name');
        } else if (normalize(oldKvkName) !== normalize(ctx.targetKvkName || '')) {
            return {
                data: null,
                issues: [{ field: 'kvkId', message: `Row KVK "${oldKvkName}" ≠ selected "${ctx.targetKvkName}" — skipped`, severity: 'warn' }],
            };
        }
        const kvkId = ctx.kvkId;

        // ── Resolve parent KvkEquipment (must be migrated first) ──────────
        // kvk_equipment_detail.equipment_id is a FK to KvkEquipment (the per-KVK
        // parent record), NOT to EquipmentMaster. So resolve the parent record's
        // autoincrement id for THIS kvk by the old equipment name, mirroring how
        // vehicle-details resolves its parent vehicle. The Equipment module stores
        // the old raw name as companyBrandModel (and a curated name as
        // equipmentName), so try both. Run the Equipment module first.
        const equipmentName = decodeEntities(
            cleanText(
                row.equipment?.equipment_name ||
                row['equipment.equipment_name'] ||
                '',
            ),
        );
        let equipmentId = null;
        if (equipmentName) {
            equipmentId = await r.findId(
                'kvkEquipment',
                { kvkId, companyBrandModel: equipmentName },
                'equipmentId',
            );
            if (!equipmentId) {
                equipmentId = await r.findId(
                    'kvkEquipment',
                    { kvkId, equipmentName },
                    'equipmentId',
                );
            }
            if (!equipmentId) {
                err('equipmentId', `Parent equipment "${equipmentName}" not found for this KVK — migrate Equipment first`);
            }
        } else {
            err('equipmentId', 'Missing equipment.equipment_name — cannot resolve parent equipment');
        }

        // ── Reporting year ────────────────────────────────────────────────
        // Old site shows fiscal years as "YYYY-YYYY" — parseDate returns null for those;
        // extract the first year so it matches how equipment.js stored the detail record.
        let reportingYear = parseDate(row.reporting_year);
        if (!reportingYear) {
            const m = String(row.reporting_year ?? '').trim().match(/^(\d{4})-\d{4}$/);
            if (m) {
                reportingYear = parseDate(m[1]);
                warn('reportingYear', `Fiscal year "${row.reporting_year}" → Jan 1 of ${m[1]}`);
            }
        }
        if (!reportingYear) err('reportingYear', `Bad/missing reporting_year "${row.reporting_year}"`);

        // ── Present status → EquipmentPresentStatusMaster (find-or-create) ─
        let equipmentStatusId = null;
        const rawStatus = decodeEntities(cleanText(row.present_status || ''));
        if (rawStatus) {
            let statusMaster = await prisma.equipmentPresentStatusMaster.findFirst({
                where: { statusLabel: { equals: rawStatus, mode: 'insensitive' } },
            });
            if (!statusMaster) {
                statusMaster = await prisma.equipmentPresentStatusMaster.create({
                    data: { statusCode: rawStatus, statusLabel: rawStatus },
                });
                warn('equipmentStatusId', `Created equipment status "${rawStatus}"`);
            }
            equipmentStatusId = statusMaster.equipmentStatusId;
        } else {
            err('equipmentStatusId', 'equipmentStatusId required — no present_status on row');
        }

        // ── Source of fund → inherited from the PARENT equipment ───────────
        // The detail's funding source is not captured separately; it always
        // mirrors the parent KvkEquipment's assetFundingSourceId. Pull it from the
        // parent record we resolved above (the old row's own source_of_fund is
        // ignored on purpose).
        let assetFundingSourceId = null;
        if (equipmentId) {
            const parent = await prisma.kvkEquipment.findUnique({
                where: { equipmentId },
                select: { assetFundingSourceId: true },
            });
            assetFundingSourceId = parent?.assetFundingSourceId ?? null;
        }

        return {
            data: {
                kvkId,
                equipmentId,
                reportingYear,
                equipmentStatusId,
                assetFundingSourceId,
            },
            issues,
        };
    },
};
