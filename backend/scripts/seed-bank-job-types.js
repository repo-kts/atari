/**
 * Seeds the Bank Account Type master with sensible defaults and backfills
 * existing records' master FK from their legacy enum value, so the form
 * dropdowns show the correct selection on edit (instead of an unlinked enum).
 * Job Type master values are NOT seeded — add those via the master CRUD.
 * Idempotent — safe to re-run.
 *
 * IMPORTANT: run BEFORE `npm run db:push` drops the account_type / job_type
 * columns (this reads them through the current Prisma client).
 *
 *   node scripts/seed-bank-job-types.js
 */
const prisma = require('../config/prisma.js');

const BANK_TYPES = [
    { name: 'Saving', isOther: false },
    { name: 'Current', isOther: false },
    { name: 'Revolving Fund', isOther: false },
    { name: 'KVK', isOther: false },
    { name: 'Other', isOther: true },
];

// legacy enum value -> master name
const BANK_ENUM_MAP = { KVK: 'KVK', REVOLVING_FUND: 'Revolving Fund', OTHER: 'Other' };
const JOB_ENUM_MAP = { PERMANENT: 'Permanent', TEMPORARY: 'Temporary' };

async function main() {
    // 1. Seed bank account types (upsert by unique name). Job types not seeded.
    for (const t of BANK_TYPES) {
        await prisma.bankAccountTypeMaster.upsert({
            where: { name: t.name }, update: { isOther: t.isOther }, create: t,
        });
    }
    console.log('Seeded bank account types.');

    // 2. Backfill bank accounts: set bankAccountTypeMasterId from the legacy enum.
    try {
        const bankMasters = await prisma.bankAccountTypeMaster.findMany();
        const bankByName = new Map(bankMasters.map((m) => [m.name, m.bankAccountTypeId]));
        const banks = await prisma.kvkBankAccount.findMany({
            where: { bankAccountTypeMasterId: null, accountType: { not: null } },
            select: { bankAccountId: true, accountType: true },
        });
        let bankFixed = 0;
        for (const b of banks) {
            const id = bankByName.get(BANK_ENUM_MAP[b.accountType]);
            if (id) {
                await prisma.kvkBankAccount.update({ where: { bankAccountId: b.bankAccountId }, data: { bankAccountTypeMasterId: id } });
                bankFixed += 1;
            }
        }
        console.log(`Backfilled ${bankFixed} bank account(s) from legacy account_type enum.`);
    } catch (e) {
        console.log('Skipped bank backfill (run before db:push):', e.message.split('\n')[0]);
    }

    // 3. Backfill staff: set jobTypeMasterId from the legacy enum, matching any
    //    job-type master rows you have added (Permanent/Temporary). Records with
    //    no matching master are left unlinked for you to set in the form.
    try {
        const jobMasters = await prisma.jobTypeMaster.findMany();
        const jobByName = new Map(jobMasters.map((m) => [m.name, m.jobTypeId]));
        const staff = await prisma.kvkStaff.findMany({
            where: { jobTypeMasterId: null, jobType: { not: null } },
            select: { kvkStaffId: true, jobType: true },
        });
        let jobFixed = 0;
        for (const s of staff) {
            const id = jobByName.get(JOB_ENUM_MAP[s.jobType]);
            if (id) {
                await prisma.kvkStaff.update({ where: { kvkStaffId: s.kvkStaffId }, data: { jobTypeMasterId: id } });
                jobFixed += 1;
            }
        }
        console.log(`Backfilled ${jobFixed} staff record(s) from legacy job_type enum.`);
    } catch (e) {
        console.log('Skipped staff backfill (run before db:push):', e.message.split('\n')[0]);
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
