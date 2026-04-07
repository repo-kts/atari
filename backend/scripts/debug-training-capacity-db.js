/**
 * Inspect DB masters + training achievements for debugging section 2.4 report grouping.
 *
 * Usage (from backend/):
 *   node scripts/debug-training-capacity-db.js
 *   KVK_ID=123 node scripts/debug-training-capacity-db.js
 *
 * Compare:
 * - training_type.training_type_name (superadmin TrainingType — drives report sections A,B,…)
 * - clientele_master.name      → who was trained (not used for section grouping)
 * - training_achievement.campus_type → ON_CAMPUS / OFF_CAMPUS (actual venue)
 */

require('dotenv').config();
const prisma = require('../config/prisma.js');

async function main() {
    const kvkId = process.env.KVK_ID ? parseInt(process.env.KVK_ID, 10) : null;

    const [trainingTypes, clientelles, recentAch] = await Promise.all([
        prisma.trainingType.findMany({
            orderBy: { trainingTypeName: 'asc' },
            select: { trainingTypeId: true, trainingTypeName: true },
        }),
        prisma.clienteleMaster.findMany({
            orderBy: { name: 'asc' },
            select: { clienteleId: true, name: true },
        }),
        prisma.trainingAchievement.findMany({
            where: kvkId ? { kvkId } : undefined,
            take: 30,
            orderBy: { trainingAchievementId: 'desc' },
            select: {
                trainingAchievementId: true,
                kvkId: true,
                clienteleId: true,
                trainingTypeId: true,
                trainingAreaId: true,
                thematicAreaId: true,
                campusType: true,
                startDate: true,
                clientele: { select: { name: true } },
                trainingType: { select: { trainingTypeName: true } },
                trainingArea: { select: { trainingAreaName: true } },
                trainingThematicArea: { select: { trainingThematicAreaName: true } },
            },
        }),
    ]);

    console.log('\n=== training_type (superadmin — report falls back to this name if clientele missing) ===');
    console.log(JSON.stringify(trainingTypes, null, 2));

    console.log('\n=== clientele_master (report prefers this for section A, B, … titles) ===');
    console.log(JSON.stringify(clientelles, null, 2));

    console.log(`\n=== training_achievement sample (latest 30${kvkId ? `, kvkId=${kvkId}` : ', all KVKs'}) ===`);
    for (const r of recentAch) {
        console.log({
            id: r.trainingAchievementId,
            kvkId: r.kvkId,
            clienteleId: r.clienteleId,
            clienteleName: r.clientele?.name ?? null,
            trainingTypeId: r.trainingTypeId,
            trainingTypeName: r.trainingType?.trainingTypeName ?? null,
            trainingAreaId: r.trainingAreaId,
            trainingAreaName: r.trainingArea?.trainingAreaName ?? null,
            thematicAreaId: r.thematicAreaId,
            trainingThematicAreaName: r.trainingThematicArea?.trainingThematicAreaName ?? null,
            campusType: r.campusType,
            startDate: r.startDate,
        });
    }

    console.log('\nDone.\n');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
