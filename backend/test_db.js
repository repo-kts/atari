const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const kvkCount = await prisma.kvk.count();
        console.log('KVK count:', kvkCount);

        const staffCount = await prisma.kvkStaff.count();
        console.log('Staff count:', staffCount);

        const activityTypeCount = await prisma.otherExtensionActivityType.count();
        console.log('Activity type count:', activityTypeCount);

        const firstStaff = await prisma.kvkStaff.findFirst();
        console.log('First staff ID:', firstStaff ? firstStaff.kvkStaffId : 'None');

        const firstType = await prisma.otherExtensionActivityType.findFirst();
        console.log('First Activity Type ID:', firstType ? firstType.activityTypeId || firstType.activity_type_id : 'None');

        const firstKvk = await prisma.kvk.findFirst();
        console.log('First KVK ID:', firstKvk ? firstKvk.kvk_id : 'None');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
