const prisma = require('../../config/prisma.js');

const disciplines = [
    { disciplineId: 1, disciplineName: "Agronomy" },
    { disciplineId: 2, disciplineName: "Soil Science" },
    { disciplineId: 3, disciplineName: "Horticulture" },
    { disciplineId: 4, disciplineName: "Plant breeding" },
    { disciplineId: 5, disciplineName: "Plant Protection" },
    { disciplineId: 6, disciplineName: "Entomology" },
    { disciplineId: 7, disciplineName: "Plant Pathology" },
    { disciplineId: 8, disciplineName: "Home Science" },
    { disciplineId: 9, disciplineName: "Agricultural Engineering" },
    { disciplineId: 10, disciplineName: "Agricultural Extension" },
    { disciplineId: 11, disciplineName: "Animal Science" },
    { disciplineId: 12, disciplineName: "Fisheries" },
    { disciplineId: 13, disciplineName: "Other" }
];

async function main() {
    console.log('Starting seeding disciplines...');

    for (const item of disciplines) {
        await prisma.discipline.upsert({
            where: { disciplineId: item.disciplineId },
            update: {
                disciplineName: item.disciplineName
            },
            create: {
                disciplineId: item.disciplineId,
                disciplineName: item.disciplineName
            }
        });
    }

    console.log('Successfully seeded disciplines');
}

main()
    .catch((e) => {
        console.error('Error seeding disciplines:', e);
        process.exit(1);
    })
    .finally(async () => {
        process.exit(0);
    });
