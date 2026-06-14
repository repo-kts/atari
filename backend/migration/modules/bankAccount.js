/**
 * Module spec: KVK Bank Accounts.
 * Source: atariams.org `bank-account-details` DataTables endpoint.
 *
 * A spec is the ONLY thing you write per module. The engine handles fetch,
 * iteration, validation aggregation and seeding. To tune mapping, edit this
 * file and re-run Transform in the UI — no engine change.
 */
module.exports = {
    key: 'bank-account',
    label: 'Bank Accounts',
    model: 'kvkBankAccount',
    // Used for idempotent upsert (find-or-update). Re-running never duplicates.
    naturalKey: ['kvkId', 'accountNumber'],

    // FK columns the UI renders as clickable, editable master pickers. `master`
    // keys into masterCatalog.js; `otherField` is the free-text fallback column.
    foreignKeys: {
        kvkId: { master: 'kvk' },
        bankAccountTypeMasterId: {
            master: 'bankAccountTypeMaster',
            otherField: 'accountTypeOther',
        },
    },

    /**
     * Map ONE old row -> our schema shape.
     * @param {object} row  one element of the old api `data[]`
     * @param {object} ctx  { kvkId, resolver }
     * @returns {Promise<{ data: object, issues: Array<{field,message,severity}> }>}
     */
    async transform(row, ctx) {
        const issues = [];
        const req = (field, value) => {
            if (value === undefined || value === null || String(value).trim() === '') {
                issues.push({ field, message: `Missing required "${field}"`, severity: 'error' });
            }
            return value;
        };

        // account_type "Kvk"/"Saving"/… -> BankAccountTypeMaster.name; miss -> Other.
        const typeMatch = await ctx.resolver.resolve(
            'bankAccountTypeMaster',
            'name',
            'bankAccountTypeId',
            row.account_type,
        );
        if (row.account_type && !typeMatch.matched) {
            issues.push({
                field: 'bankAccountTypeMasterId',
                message: `Account type "${row.account_type}" not in master — parked in accountTypeOther`,
                severity: 'warn',
            });
        }

        const data = {
            kvkId: ctx.kvkId, // human-selected target KVK is authoritative
            accountName: req('accountName', row.account_name),
            bankName: req('bankName', row.bank_name),
            location: row.location ?? '',
            accountNumber: String(req('accountNumber', row.account_number) ?? ''),
            bankAccountTypeMasterId: typeMatch.id,
            accountTypeOther: typeMatch.matched ? null : row.account_type || null,
        };

        return { data, issues };
    },
};
