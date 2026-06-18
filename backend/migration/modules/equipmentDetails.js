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
        // The OLD site has only two equipment masters: type + equipment. Those old
        // equipment names were loaded into our (temporary) equipment_model_master,
        // each pointing at a curated EquipmentMaster. So resolve the raw detail name
        // → equipment_model row → its equipmentMasterId, and use THAT as equipmentId.
        // Fallback: the name may already equal an EquipmentMaster name directly.
        let equipmentId = null;
        if (equipmentName) {
            const model = await r.resolve('equipmentModelMaster', 'name', 'equipmentModelId', equipmentName);
            if (model.matched) {
                const modelRow = await prisma.equipmentModelMaster.findUnique({
                    where: { equipmentModelId: model.id },
                    select: { equipmentMasterId: true },
                });
                equipmentId = modelRow?.equipmentMasterId ?? null;
            }
            if (!equipmentId) {
                const em = await r.resolve('equipmentMaster', 'name', 'equipmentMasterId', equipmentName);
                if (em.matched) equipmentId = em.id;
            }
            if (!equipmentId) {
                err('equipmentId', `Equipment "${equipmentName}" not found in equipment_model/equipment master`);
            }
        } else {
            err('equipmentId', 'Missing equipment.equipment_name — cannot resolve equipment');
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

        // ── Source of fund → AssetFundingSourceMaster (find-or-create) ──────
        // Old site stores "no source" as 0 — map that (and empty) to the "-" master.
        let assetFundingSourceId = null;
        let rawFunding = decodeEntities(cleanText(row.source_of_fund || ''));
        if (!rawFunding || rawFunding === '0') rawFunding = '-';
        if (rawFunding) {
            const fs = await r.findOrCreate('assetFundingSourceMaster', 'name', 'assetFundingSourceId', rawFunding);
            if (fs.id) {
                assetFundingSourceId = fs.id;
                if (fs.created) warn('assetFundingSourceId', `Created funding source "${rawFunding}"`);
            }
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
