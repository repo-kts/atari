#!/usr/bin/env node
/**
 * Seed all master data tables: staff categories, pay levels, training masters,
 * extension activity types, funding sources, products, CRA systems, etc.
 * Run: node scripts/seed-masters.js   or   npm run seed:masters
 */
require('dotenv').config();
const prisma = require('../config/prisma');

// Staff Masters
const STAFF_CATEGORIES = [
  'General', 'OBC', 'SC', 'ST'
];

const PAY_LEVELS = [
  'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6',
  'Level 7', 'Level 8', 'Level 9', 'Level 10', 'Level 11', 'Level 12',
  'Level 13', 'Level 14', 'Level 15', 'Level 16', 'Level 17', 'Level 18'
];

// Training Masters
const TRAINING_TYPES = [
  'On-Campus Training', 'Off-Campus Training', 'Field Day', 'Exhibition',
  'Demonstration', 'Workshop', 'Seminar', 'Conference', 'Exposure Visit',
  'Kisan Mela', 'Farmers Fair', 'Technology Week'
];

const TRAINING_AREAS = [
  'Crop Production', 'Horticulture', 'Animal Husbandry', 'Fisheries',
  'Agricultural Engineering', 'Home Science', 'Natural Resource Management',
  'Agricultural Extension', 'Agribusiness', 'Organic Farming', 'Integrated Farming System'
];

const TRAINING_CLIENTELE = [
  'Farmers', 'Rural Youth', 'Farm Women', 'Extension Personnel',
  'Scientist', 'Students', 'Entrepreneurs', 'SHG Members', 'FPO Members',
  'Agri-Entrepreneurs', 'Others'
];

const THEMATIC_AREAS = [
  'Sustainable Agriculture', 'Climate Resilient Agriculture', 'Organic Farming',
  'Integrated Pest Management', 'Water Management', 'Soil Health Management',
  'Livestock Management', 'Fisheries Development', 'Agri-Entrepreneurship',
  'Value Addition', 'Post-Harvest Management', 'Marketing', 'Digital Agriculture'
];

// Extension Activity Masters
const EXTENSION_ACTIVITY_TYPES = [
  'Field Visit', 'Farmers Meeting', 'Group Discussion', 'Demonstration',
  'Exhibition', 'Field Day', 'Kisan Mela', 'Technology Transfer',
  'Advisory Service', 'Mass Media', 'Print Media', 'Electronic Media',
  'Social Media', 'Mobile Advisory', 'Call Center', 'Video Conference'
];

const OTHER_EXTENSION_ACTIVITY_TYPES = [
  'Radio Program', 'TV Program', 'Newsletter', 'Pamphlet Distribution',
  'Wall Painting', 'Hoarding', 'Poster', 'Leaflet', 'Booklet',
  'Success Story', 'Case Study', 'Documentary', 'Social Media Campaign'
];

// Important Days
const IMPORTANT_DAYS = [
  'World Soil Day', 'World Water Day', 'World Environment Day',
  'National Farmers Day', 'Kisan Diwas', 'World Food Day',
  'National Science Day', 'Technology Day', 'Earth Day',
  'Biodiversity Day', 'Forest Day', 'Wetlands Day'
];

// Funding Sources
const FUNDING_SOURCES = [
  'ICAR', 'State Government', 'Central Government', 'KVK Funds',
  'External Funding', 'Donation', 'Self-Financed', 'NGO',
  'International Organization', 'Private Sector', 'Corporate CSR'
];

// Product Categories and Types
const PRODUCT_CATEGORIES = [
  {
    categoryName: 'Seeds',
    types: ['Cereal Seeds', 'Pulse Seeds', 'Oilseed Seeds', 'Vegetable Seeds', 'Fruit Seeds']
  },
  {
    categoryName: 'Biofertilizers',
    types: ['Rhizobium', 'Azotobacter', 'Azospirillum', 'PSB', 'VAM']
  },
  {
    categoryName: 'Biopesticides',
    types: ['Trichoderma', 'Pseudomonas', 'Beauveria', 'Metarhizium', 'Neem Based']
  },
  {
    categoryName: 'Vermicompost',
    types: ['Standard Vermicompost', 'Enriched Vermicompost', 'Vermiwash']
  },
  {
    categoryName: 'Planting Material',
    types: ['Saplings', 'Seedlings', 'Grafts', 'Cuttings', 'Tissue Culture Plants']
  },
  {
    categoryName: 'Livestock Products',
    types: ['Milk', 'Eggs', 'Honey', 'Meat', 'Wool']
  },
  {
    categoryName: 'Processed Products',
    types: ['Pickles', 'Jam', 'Jelly', 'Squash', 'Juice', 'Powder', 'Flour']
  }
];

// CRA Cropping Systems (sample crops per season)
const CRA_CROPPING_SYSTEMS = {
  'Rabi': ['Wheat', 'Mustard', 'Gram', 'Pea', 'Potato', 'Onion', 'Garlic'],
  'Kharif': ['Rice', 'Maize', 'Soybean', 'Groundnut', 'Cotton', 'Sugarcane', 'Turmeric'],
  'Summer': ['Vegetables', 'Pulses', 'Oilseeds', 'Fodder Crops']
};

// CRA Farming Systems
const CRA_FARMING_SYSTEMS = {
  'Rabi': ['Wheat-Mustard', 'Wheat-Potato', 'Wheat-Vegetables', 'Mustard-Potato'],
  'Kharif': ['Rice-Pulse', 'Rice-Fish', 'Rice-Duck', 'Maize-Pulse', 'Cotton-Pulse'],
  'Summer': ['Vegetable-Vegetable', 'Pulse-Pulse', 'Fodder-Fodder']
};

// ARYA Enterprises
const ARYA_ENTERPRISES = [
  'Poultry', 'Dairy', 'Goat Rearing', 'Pig Rearing', 'Fisheries',
  'Mushroom Cultivation', 'Beekeeping', 'Vermicompost', 'Nursery',
  'Food Processing', 'Value Addition', 'Agri-Entrepreneurship'
];

const COURSE_COORDINATORS = [
  'Dr. A.K. Singh', 'Dr. B.K. Sharma', 'Dr. C.K. Verma', 'Dr. D.K. Patel',
  'Dr. E.K. Kumar', 'Dr. F.K. Yadav', 'Dr. G.K. Singh', 'Dr. H.K. Das'
];

// NARI Masters
const NARI_NUTRITION_GARDEN_TYPES = [
  'Backyard/Kitchen Garden', 'Community level', 'Terrace Garden', 'Vertical Garden'
];

const NARI_CROP_CATEGORIES = [
  'Fruits', 'Vegetables', 'Pulses', 'Oilseeds', 'Cereals', 'Other'
];

const FINANCIAL_PROJECTS = [
  'CFLD Oilseed', 'CFLD Pulses', 'Model Village Oilseed', 'Model Village Pulses',
  'NICRA', 'ARYA', 'FPO', 'Natural Farming', 'DRMR', 'NARI', 'IIPR', 'TSP', 'SCSP', 'SAP', 'Others'
];

const FUNDING_AGENCIES = [
  'ICAR', 'State Govt. Ministry of A&FW', 'Central Govt.', 'Others'
];

async function seedStaffMasters() {
  console.log('🌱 Staff masters...');

  for (const categoryName of STAFF_CATEGORIES) {
    await prisma.staffCategoryMaster.upsert({
      where: { categoryName },
      update: {},
      create: { categoryName },
    });
  }

  for (const levelName of PAY_LEVELS) {
    await prisma.payLevelMaster.upsert({
      where: { levelName },
      update: {},
      create: { levelName },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedTrainingMasters() {
  console.log('🌱 Training masters...');

  for (const trainingTypeName of TRAINING_TYPES) {
    await prisma.trainingType.upsert({
      where: { trainingTypeName },
      update: {},
      create: { trainingTypeName },
    });
  }

  for (const name of TRAINING_CLIENTELE) {
    await prisma.clienteleMaster.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const firstType = await prisma.trainingType.findFirst({ orderBy: { trainingTypeId: 'asc' } });
  if (firstType) {
    for (const trainingAreaName of TRAINING_AREAS) {
      const existing = await prisma.trainingArea.findFirst({
        where: { trainingAreaName, trainingTypeId: firstType.trainingTypeId },
      });
      if (!existing) {
        await prisma.trainingArea.create({
          data: { trainingAreaName, trainingTypeId: firstType.trainingTypeId },
        });
      }
    }
    const areas = await prisma.trainingArea.findMany({
      where: { trainingTypeId: firstType.trainingTypeId },
      orderBy: { trainingAreaId: 'asc' },
    });
    if (areas.length > 0) {
      for (let i = 0; i < THEMATIC_AREAS.length; i++) {
        const trainingThematicAreaName = THEMATIC_AREAS[i];
        const area = areas[i % areas.length];
        const exists = await prisma.trainingThematicArea.findFirst({
          where: { trainingThematicAreaName, trainingAreaId: area.trainingAreaId },
        });
        if (!exists) {
          await prisma.trainingThematicArea.create({
            data: { trainingThematicAreaName, trainingAreaId: area.trainingAreaId },
          });
        }
      }
    }
  }

  for (const name of COURSE_COORDINATORS) {
    await prisma.courseCoordinatorMaster.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedExtensionMasters() {
  console.log('🌱 Extension activity masters...');

  for (const activityName of EXTENSION_ACTIVITY_TYPES) {
    await prisma.fldActivity.upsert({
      where: { activityName },
      update: {},
      create: { activityName },
    });
  }

  // Seed ExtensionActivity master (used by KvkExtensionActivity)
  for (const extensionName of EXTENSION_ACTIVITY_TYPES) {
    const existing = await prisma.extensionActivity.findFirst({
      where: { extensionName },
    });
    if (!existing) {
      await prisma.extensionActivity.create({
        data: { extensionName },
      });
    }
  }

  for (const activityName of OTHER_EXTENSION_ACTIVITY_TYPES) {
    await prisma.otherExtensionActivityType.upsert({
      where: { activityName },
      update: {},
      create: { activityName },
    });
  }

  // Seed OtherExtensionActivity master (used by KvkOtherExtensionActivity)
  for (const otherExtensionName of OTHER_EXTENSION_ACTIVITY_TYPES) {
    const existing = await prisma.otherExtensionActivity.findFirst({
      where: { otherExtensionName },
    });
    if (!existing) {
      await prisma.otherExtensionActivity.create({
        data: { otherExtensionName },
      });
    }
  }

  for (const dayName of IMPORTANT_DAYS) {
    await prisma.importantDay.upsert({
      where: { dayName },
      update: {},
      create: { dayName },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedFundingSources() {
  console.log('🌱 Funding sources...');

  for (const name of FUNDING_SOURCES) {
    await prisma.fundingSourceMaster.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedProducts() {
  console.log('🌱 Products (categories, types, products)...');

  for (const category of PRODUCT_CATEGORIES) {
    const productCategory = await prisma.productCategory.upsert({
      where: { productCategoryName: category.categoryName },
      update: {},
      create: { productCategoryName: category.categoryName },
    });

    for (const typeName of category.types) {
      let productType = await prisma.productType.findFirst({
        where: {
          productCategoryType: typeName,
          productCategoryId: productCategory.productCategoryId,
        },
      });

      if (!productType) {
        productType = await prisma.productType.create({
          data: {
            productCategoryType: typeName,
            productCategoryId: productCategory.productCategoryId,
          },
        });
      }

      // Create a sample product for each type (only if doesn't exist)
      const productName = `${typeName} - Sample Product`;
      const existingProduct = await prisma.product.findFirst({
        where: {
          productName,
          productCategoryId: productCategory.productCategoryId,
          productTypeId: productType.productTypeId,
        },
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            productName,
            productCategoryId: productCategory.productCategoryId,
            productTypeId: productType.productTypeId,
          },
        });
      }
    }
  }

  console.log('   ✅ Done\n');
}

async function seedCRASystems() {
  console.log('🌱 CRA cropping and farming systems...');

  const seasons = await prisma.season.findMany();
  const seasonMap = {};
  for (const season of seasons) {
    seasonMap[season.seasonName] = season.seasonId;
  }

  // Seed cropping systems
  for (const [seasonName, crops] of Object.entries(CRA_CROPPING_SYSTEMS)) {
    const seasonId = seasonMap[seasonName];
    if (!seasonId) continue;

    for (const cropName of crops) {
      const existing = await prisma.craCropingSystem.findFirst({
        where: { cropName, seasonId },
      });

      if (!existing) {
        await prisma.craCropingSystem.create({
          data: { cropName, seasonId },
        });
      }
    }
  }

  // Seed farming systems
  for (const [seasonName, systems] of Object.entries(CRA_FARMING_SYSTEMS)) {
    const seasonId = seasonMap[seasonName];
    if (!seasonId) continue;

    for (const farmingSystemName of systems) {
      const existing = await prisma.craFarmingSystem.findFirst({
        where: { farmingSystemName, seasonId },
      });

      if (!existing) {
        await prisma.craFarmingSystem.create({
          data: { farmingSystemName, seasonId },
        });
      }
    }
  }

  console.log('   ✅ Done\n');
}

async function seedARYAEnterprises() {
  console.log('🌱 ARYA enterprises...');

  for (const enterpriseName of ARYA_ENTERPRISES) {
    await prisma.aryaEnterprise.upsert({
      where: { enterpriseName },
      update: {},
      create: { enterpriseName },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedUniversities() {
  console.log('🌱 Universities...');

  // Get existing orgs to attach universities
  const orgs = await prisma.orgMaster.findMany({ take: 5 });

  if (orgs.length === 0) {
    console.log('   ⚠️  No organizations found. Run seed:data first.\n');
    return;
  }

  const universities = [
    'Bihar Agricultural University', 'Rajendra Agricultural University',
    'Birsa Agricultural University', 'Orissa University of Agriculture and Technology',
    'Bidhan Chandra Krishi Viswavidyalaya', 'Uttar Banga Krishi Viswavidyalaya'
  ];

  for (let i = 0; i < universities.length; i++) {
    const org = orgs[i % orgs.length];
    await prisma.universityMaster.upsert({
      where: {
        universityId: i + 1,
      },
      update: {
        universityName: universities[i],
        orgId: org.orgId,
        hostOrg: universities[i],
        hostMobile: null,
        hostLandline: null,
        hostFax: null,
        hostEmail: null,
        hostAddress: null,
      },
      create: {
        universityName: universities[i],
        orgId: org.orgId,
        hostOrg: universities[i],
        hostMobile: null,
        hostLandline: null,
        hostFax: null,
        hostEmail: null,
        hostAddress: null,
      },
    });
  }

  console.log('   ✅ Done\n');
}

// Attachment Types
const ATTACHMENT_TYPES = [
  'RAWE', 'FET', 'FIT', 'Orientation', 'Study Tour'
];

async function seedAttachmentTypes() {
  console.log('🌱 Attachment types...');
  for (const name of ATTACHMENT_TYPES) {
    await prisma.attachmentType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedNariMasters() {
  console.log('🌱 NARI masters...');
  
  for (const name of NARI_NUTRITION_GARDEN_TYPES) {
    await prisma.nutritionGardenType.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  for (const name of NARI_CROP_CATEGORIES) {
    await prisma.cropCategory.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  
  console.log('   ✅ Done\n');
}

async function seedFundingAgencies() {
  console.log('🌱 Funding agencies...');
  for (const agencyName of FUNDING_AGENCIES) {
    await prisma.fundingAgency.upsert({
      where: { agencyName },
      update: {},
      create: { agencyName }
    });
  }
  console.log('   ✅ Done\n');
}

async function seedFinancialProjects() {
  console.log('🌱 Financial projects...');
  
  // Get all agencies to link defaults
  const agencies = await prisma.fundingAgency.findMany();
  const icar = agencies.find(a => a.agencyName === 'ICAR');
  const state = agencies.find(a => a.agencyName === 'State Govt. Ministry of A&FW');

  for (const projectName of FINANCIAL_PROJECTS) {
    let fundingAgencyId = null;
    
    // Default mappings
    if (icar && (
      projectName.startsWith('CFLD') || 
      ['NICRA', 'ARYA', 'FPO', 'Natural Farming', 'DRMR', 'NARI', 'IIPR', 'SAP'].includes(projectName)
    )) {
      fundingAgencyId = icar.fundingAgencyId;
    } else if (state && ['TSP', 'SCSP'].includes(projectName)) {
      fundingAgencyId = state.fundingAgencyId;
    } else if (projectName === 'Others') {
       const othersAgency = agencies.find(a => a.agencyName === 'Others');
       if (othersAgency) fundingAgencyId = othersAgency.fundingAgencyId;
    }

    await prisma.financialProject.upsert({
      where: { projectName },
      update: { fundingAgencyId },
      create: { projectName, fundingAgencyId }
    });
  }
  console.log('   ✅ Done\n');
}

async function run() {
  console.log('🌱 Seed all masters\n');
  await seedStaffMasters();
  await seedTrainingMasters();
  await seedExtensionMasters();
  await seedFundingSources();
  await seedProducts();
  await seedCRASystems();
  await seedARYAEnterprises();
  await seedUniversities();
  await seedAttachmentTypes();
  await seedNariMasters();
  await seedFundingAgencies();
  await seedFinancialProjects();
  console.log('✅ All masters seeded successfully!');
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ Error:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
} else {
  module.exports = { run };
}
