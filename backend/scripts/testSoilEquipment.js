const repo = require('../repositories/forms/soilEquipmentRepository.js');

async function test() {
    try {
        // Test create
        console.log('Testing create...');
        const fakeUser = { kvkId: 1, roleName: 'kvk_admin' };
        const result = await repo.create({
            year: '2023-24',
            analysis: 'Soil Analysis',
            equipmentName: 'Test Equipment',
            quantity: 5,
        }, fakeUser);
        console.log('Create OK:', JSON.stringify(result));

        // Test findAll
        console.log('Testing findAll...');
        const all = await repo.findAll(fakeUser);
        console.log('FindAll OK, count:', all.length);
        if (all.length > 0) console.log('First record:', JSON.stringify(all[0]));

        // Cleanup
        if (result.id) {
            await repo.delete(result.id);
            console.log('Deleted test record', result.id);
        }
        console.log('\n✅ ALL TESTS PASSED');
    } catch (e) {
        console.error('\n❌ ERROR:', e.message);
        console.error(e.stack);
    }
    const { PrismaClient } = require('@prisma/client');
    // just disconnect
    process.exit(0);
}
test();
