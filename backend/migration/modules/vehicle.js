const { cleanText } = require('../util.js');

/**
 * Module spec: KVK Vehicles — PARENT table only (kvk_vehicle).
 * Source: atariams.org `vehicle-data`. Matches the "Create View Vehicles" form:
 * vehicle name, registration no, purchase year, total cost.
 *
 * The per-year detail (kvk_vehicle_detail: reportingYear, totalRun, status,
 * funding) is a SEPARATE step handled later — not written here.
 */
module.exports = {
    key: 'vehicle',
    label: 'Vehicles',
    model: 'kvkVehicle',
    naturalKey: ['kvkId', 'vehicleName'],

    foreignKeys: {
        kvkId: { master: 'kvk' },
    },

    async transform(row, ctx) {
        const issues = [];
        const req = (field, value) => {
            if (value === undefined || value === null || String(value).trim() === '') {
                issues.push({ field, message: `Missing required "${field}"`, severity: 'error' });
            }
            return value;
        };
        const warn = (field, message) => issues.push({ field, message, severity: 'warn' });

        const purchaseYear = parseInt(row.purchase_year, 10) || null;
        if (!purchaseYear) req('yearOfPurchase', null);
        const registrationNo = cleanText(row.registration_no);
        if (!registrationNo) warn('registrationNo', 'No registration number on old record — set to empty string');

        const data = {
            kvkId: ctx.kvkId,
            vehicleName: req('vehicleName', cleanText(row.vehicle_name)),
            registrationNo: registrationNo || '',
            yearOfPurchase: purchaseYear,
            totalCost: Number(row.vehicle_amount) || 0,
        };

        return { data, issues };
    },
};
