const { parseDate, cleanText } = require('../util.js');

/**
 * Module spec: KVK Vehicle Details (per-year). Source: atariams.org
 * `view-vehicle-details`. Writes kvk_vehicle_detail only.
 *
 * Each detail links to a PARENT vehicle (kvk_vehicle) that must already be
 * migrated — vehicleId is resolved from our DB by kvkId + vehicle_name. Run the
 * Vehicles module first.
 */
module.exports = {
    key: 'vehicle-details',
    label: 'Vehicle Details',
    model: 'kvkVehicleDetail',
    naturalKey: ['vehicleId', 'reportingYear'],

    foreignKeys: {
        vehicleId: { master: 'vehicle' },
        vehicleStatusId: { master: 'vehicleStatus' },
        assetFundingSourceId: { master: 'assetFundingSource' },
    },

    async transform(row, ctx) {
        const issues = [];
        const r = ctx.resolver;
        const warn = (field, message) => issues.push({ field, message, severity: 'warn' });
        const err = (field, message) => issues.push({ field, message, severity: 'error' });

        // DataTables returns the `vehicle` column as a JSON string — parse it first.
        let vehicleObj = row.vehicle || {};
        if (typeof vehicleObj === 'string') {
            try { vehicleObj = JSON.parse(vehicleObj); } catch { vehicleObj = {}; }
        }
        const vehicleName = cleanText(vehicleObj.vehicle_name);
        const registrationNo = cleanText(vehicleObj.registration_no);

        let vehicleId = null;
        if (vehicleName) {
            vehicleId = await r.findId('kvkVehicle', { kvkId: ctx.kvkId, vehicleName }, 'vehicleId');
        }
        if (!vehicleId && registrationNo) {
            vehicleId = await r.findId('kvkVehicle', { kvkId: ctx.kvkId, registrationNo }, 'vehicleId');
        }
        if (!vehicleId) {
            err('vehicleId', `Parent vehicle "${vehicleName || registrationNo || '?'}" not found — migrate Vehicles first`);
        }

        // present_status -> status master; find-or-create (status master has a
        // unique statusCode + a statusLabel, so create sets both to the value).
        let vehicleStatusId = null;
        const status = cleanText(row.present_status);
        if (status) {
            const m = await r.findOrCreate(
                'vehiclePresentStatusMaster',
                'statusLabel',
                'vehicleStatusId',
                status,
                { uniqueField: 'statusCode', create: v => ({ statusCode: v, statusLabel: v }) },
            );
            vehicleStatusId = m.id;
            if (m.created) warn('vehicleStatusId', `Created new vehicle status "${status}" (#${m.id})`);
        } else {
            err('vehicleStatusId', 'vehicleStatusId required — no present_status on old row');
        }

        // funding_source -> asset funding master; find-or-create (optional field).
        let assetFundingSourceId = null;
        const funding = cleanText(row.funding_source);
        if (funding) {
            const m = await r.findOrCreate('assetFundingSourceMaster', 'name', 'assetFundingSourceId', funding);
            assetFundingSourceId = m.id;
            if (m.created) warn('assetFundingSourceId', `Created new funding source "${funding}" (#${m.id})`);
        }

        const reportingYear = parseDate(row.reporting_year);
        if (!reportingYear) err('reportingYear', `Bad reporting_year "${row.reporting_year}"`);

        const data = {
            kvkId: ctx.kvkId,
            vehicleId,
            reportingYear,
            totalRun: row.total_run != null ? String(row.total_run) : '',
            repairingCost: row.reparing_cost != null ? Number(row.reparing_cost) : null,
            assetFundingSourceId,
            vehicleStatusId,
        };

        return { data, issues };
    },
};
