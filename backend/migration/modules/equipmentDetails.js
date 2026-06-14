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
        equipmentId: { master: 'equipmentMaster' },
        equipmentStatusId: { master: 'equipmentStatus' },
        assetFundingSourceId: { master: 'assetFundingSource' },
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
        const equipmentName = decodeEntities(
            cleanText(
                row.equipment?.equipment_name ||
                row['equipment.equipment_name'] ||
                '',
            ),
        );
        let equipmentId = null;
        if (equipmentName) {
            const parent = await prisma.kvkEquipment.findFirst({
                where: { kvkId, equipmentName: { equals: equipmentName, mode: 'insensitive' } },
                select: { equipmentId: true },
            });
            if (parent) equipmentId = parent.equipmentId;
            else err('equipmentId', `Parent equipment "${equipmentName}" not found — migrate Equipment first`);
        } else {
            err('equipmentId', 'Missing equipment.equipment_name — cannot link to parent');
        }

        // ── Reporting year ────────────────────────────────────────────────
        const reportingYear = parseDate(row.reporting_year);
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

        // ── Source of fund → AssetFundingSourceMaster (optional) ──────────
        let assetFundingSourceId = null;
        const rawFunding = decodeEntities(cleanText(row.source_of_fund || ''));
        if (rawFunding) {
            const fs = await r.resolve('assetFundingSourceMaster', 'name', 'assetFundingSourceId', rawFunding);
            if (fs.matched) assetFundingSourceId = fs.id;
            else warn('assetFundingSourceId', `Funding source "${rawFunding}" not found — stored as null`);
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
