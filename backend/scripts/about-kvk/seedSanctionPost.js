const prisma = require('../../config/prisma.js');

const sanctionPosts = [
    { sanctionedPostId: 1, postName: "Senior Scientist & Head" },
    { sanctionedPostId: 2, postName: "SMS (Subject Matter Specialist)" },
    { sanctionedPostId: 3, postName: "Programme Assistant (Lab Technician)" },
    { sanctionedPostId: 4, postName: "Programme Assistant (Computer)" },
    { sanctionedPostId: 5, postName: "Farm Manager" },
    { sanctionedPostId: 6, postName: "Assistant" },
    { sanctionedPostId: 7, postName: "Stenographer" },
    { sanctionedPostId: 8, postName: "Driver" },
    { sanctionedPostId: 9, postName: "Supporting staff" }
];

async function main() {
    console.log('Starting seeding sanctioned posts...');

    for (const post of sanctionPosts) {
        await prisma.sanctionedPost.upsert({
            where: { sanctionedPostId: post.sanctionedPostId },
            update: {
                postName: post.postName
            },
            create: {
                sanctionedPostId: post.sanctionedPostId,
                postName: post.postName
            }
        });
    }

    console.log('Successfully seeded sanctioned posts');
}

main()
    .catch((e) => {
        console.error('Error seeding sanctioned posts:', e);
        process.exit(1);
    })
    .finally(async () => {
        // await prisma.$disconnect();
        // In this project config/prisma.js, the prisma instance is a singleton
        // and uses a connection pool. Usually we don't disconnect in scripts 
        // if we want the process to exit cleanly with allowExitOnIdle: true.
        process.exit(0);
    });
