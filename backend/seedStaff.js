const prisma = require('./config/prisma.js');

async function run() {
    const gayaKvk = await prisma.kvk.findFirst({ where: { kvkName: { contains: 'Gaya', mode: 'insensitive' } } });
    const kvkId = gayaKvk ? gayaKvk.kvkId : 1;

    const discipline = await prisma.discipline.findFirst();
    const dId = discipline ? discipline.disciplineId : 1;

    const post = await prisma.sanctionedPost.findFirst();
    const spId = post ? post.sanctionedPostId : 1;

    const staffNames = [
        'Sri Akhilesh Kumar', 'Dr. Reeta Singh', 'Mr. Rajeev Kumar',
        'Dr. Prakash Chandra Gupta', 'Dr. Pushpam Patel', 'Smt. Sangeetha Kumari',
        'Sri Chandan Kumar', 'Sri Kanhaiya Kumar Rai', 'Sri Bachan Sah', 'Sri Mukesh Kumar'
    ];

    for (const name of staffNames) {
        const existing = await prisma.kvkStaff.findFirst({ where: { staffName: name } });
        if (!existing) {
            await prisma.kvkStaff.create({
                data: {
                    kvkId: kvkId,
                    staffName: name,
                    mobile: '0000000000',
                    dateOfBirth: new Date('1980-01-01'),
                    sanctionedPostId: spId,
                    positionOrder: 1,
                    disciplineId: dId,
                    dateOfJoining: new Date('2020-01-01'),
                    category: 'GENERAL',
                    transferStatus: 'ACTIVE'
                }
            });
            console.log(`Created dummy staff: ${name}`);
        } else {
            console.log(`Staff ${name} already exists.`);
        }
    }
}

run().catch(console.error).finally(() => prisma.$disconnect());
