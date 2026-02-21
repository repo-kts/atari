const prisma = require('../config/prisma');

async function check() {
    console.log('--- Starting Check ---');
    try {
        console.log('--- Checking KvkStaff table ---');
        try {
            const staff = await prisma.kvkStaff.findFirst();
            console.log('SUCCESS KvkStaff.findFirst');
            // console.log('Sample staff record:', JSON.stringify(staff, null, 2));
        } catch (e) {
            console.error('FAILED KvkStaff.findFirst:', e.message);
            if (e.meta) console.error('Meta:', JSON.stringify(e.meta, null, 2));
        }

        console.log('--- Checking ExtensionActivity table ---');
        try {
            const activity = await prisma.extensionActivity.findFirst();
            console.log('SUCCESS ExtensionActivity.findFirst');
            // console.log('Sample activity record:', JSON.stringify(activity, null, 2));
        } catch (e) {
            console.error('FAILED ExtensionActivity.findFirst:', e.message);
            if (e.meta) console.error('Meta:', JSON.stringify(e.meta, null, 2));
        }

        console.log('--- Checking KvkExtensionActivity table ---');
        try {
            const extAct = await prisma.kvkExtensionActivity.findFirst();
            console.log('SUCCESS KvkExtensionActivity.findFirst');
            // console.log('Sample KvkExtensionActivity record:', JSON.stringify(extAct, null, 2));
        } catch (e) {
            console.error('FAILED KvkExtensionActivity.findFirst:', e.message);
            if (e.meta) console.error('Meta:', JSON.stringify(e.meta, null, 2));
        }
    } catch (err) {
        console.error('Fatal error during check:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
