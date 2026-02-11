const prisma = require('../../config/prisma.js');

const infraMasters = [
    { infraMasterId: 1, name: "Admin Building" },
    { infraMasterId: 2, name: "Farmers Hostel" },
    { infraMasterId: 3, name: "Staff Quarters" },
    { infraMasterId: 4, name: "Piggery unit" },
    { infraMasterId: 5, name: "Fencing" },
    { infraMasterId: 6, name: "Rain Water harvesting structure" },
    { infraMasterId: 7, name: "Threshing floor" },
    { infraMasterId: 8, name: "Farm godown" },
    { infraMasterId: 9, name: "Dairy unit" },
    { infraMasterId: 10, name: "Poultry unit" },
    { infraMasterId: 11, name: "Goatery unit" },
    { infraMasterId: 12, name: "Mushroom Lab" },
    { infraMasterId: 13, name: "Shade house" },
    { infraMasterId: 14, name: "Soil test Lab" },
    { infraMasterId: 15, name: "Others" }
];

async function main() {
    console.log('Starting seeding infrastructure masters...');

    for (const item of infraMasters) {
        await prisma.kvkInfrastructureMaster.upsert({
            where: { infraMasterId: item.infraMasterId },
            update: {
                name: item.name
            },
            create: {
                infraMasterId: item.infraMasterId,
                name: item.name
            }
        });
    }

    console.log('Successfully seeded infrastructure masters');
}

main()
    .catch((e) => {
        console.error('Error seeding infrastructure masters:', e);
        process.exit(1);
    })
    .finally(async () => {
        process.exit(0);
    });
