#!/usr/bin/env node
/**
 * Seed all master data tables: staff categories, pay levels, training masters,
 * extension activity types, events, funding sources, products, CRA, CFLD crops, enterprises, publications, OFT/FLD masters, etc.
 * Run: node scripts/seed-masters.js   or   npm run seed:masters
 */
const fs = require('fs');
const path = require('path');
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

const PAY_SCALES = [
  '15600-39100',
  '9300-34800',
  '5200-20200',
];

// Training Masters — official Training Type → Training Area mapping (KVK)
const TRAINING_TYPES = [
  'Extension Personnel',
  'Rural Youth',
  'Farmers and Farm Women',
];

const TRAINING_AREAS_BY_TYPE = {
  'Extension Personnel': ['Extension Personnel'],
  'Rural Youth': ['Rural Youth'],
  'Farmers and Farm Women': [
    'Agro forestry',
    'Capacity Building and Group Dynamics',
    'Production of Inputs at Site',
    'Fisheries',
    'Plant Protection',
    'Agril. Engineering',
    'Home Science/Women Empowerment',
    'Livestock Production and Management',
    'Soil Health and Fertility Management',
    'Horticulture (Medicinal And Aromatic Plants)',
    'Horticulture (Spices)',
    'Horticulture (Tuber Crops)',
    'Horticulture (Plantation Crops)',
    'Horticulture (Ornamental Plants)',
    'Horticulture (Fruits)',
    'Horticulture (Vegetable Crops)',
    'Crop Production',
  ],
};

const TRAINING_CLIENTELE = [
  'Farmers', 'Rural Youth', 'Farm Women', 'Extension Personnel',
  'Scientist', 'Students', 'Entrepreneurs', 'SHG Members', 'FPO Members',
  'Agri-Entrepreneurs', 'Others'
];

// Extension Activity Masters (KVK extension activities + other extension)
const EXTENSION_ACTIVITY_TYPES = [
  'Exposure Visit',
  'Others',
  'Mahila Mandals Conveners Meetings',
  'Self Help Group Conveners Meetings',
  'Farm Science Club Conveners Meet',
  'Soil Test Campaigns',
  'Agri Mobile Clinic',
  'Animal Health Camp',
  'Soil Health Camp',
  'Ex-Trainees Sammelan',
  'Diagnostic Visits',
  'Farmers Visit To Kvk',
  'Scientific Visit To Farmers Field',
  'Advisory Services',
  'Lectures Delivered As Resource Persons',
  'Group Discussion',
  'Workshop',
  'Farmers Seminar',
  'Method Demonstrations',
  'Film Show',
  'Participation In Exhibition',
  'Exhibition Organized',
  'Kisan Ghosthi',
  'Field Day',
  'Kisan Mela Participated',
  'Kisan Mela Organized',
];

const OTHER_EXTENSION_ACTIVITY_TYPES = [
  'Any Other',
  'Electronic Media',
  'Extension Literature',
  'Popular Articles Published',
  'TV Talks',
  'Radio Talks',
  'Newspaper Coverage',
];

// Important Days
const IMPORTANT_DAYS = [
  'World Soil Day', 'World Water Day', 'World Environment Day',
  'National Farmers Day', 'Kisan Diwas', 'World Food Day',
  'National Science Day', 'Technology Day', 'Earth Day',
  'Biodiversity Day', 'Forest Day', 'Wetlands Day'
];

/** Events master (`Event` model — e.g. KVK celebrations / national programmes) */
const EVENTS_MASTER = [
  'Viksit Krishi Sankalp Abhiyan (VKSA)',
  'Socio Economic Development & Awareness',
  'Rastriy Ekta Diwas Sardar Patel Jayanti',
  'Janjatiya Gaurav Diwas',
  'World Dairy Day',
  'World No Tobacco Day',
  'Earth Day',
  'Poshan Maha',
  'Yoga Day',
  'Poshan Mela',
  'PM Live Telecast',
  'Kisan Diwas',
  'World Soil Day',
  'National Constitution Day',
  'National Education Day',
  'World Science Day',
  'National Unity Day',
  'Vigilance Awareness Week',
  'World Food Day',
  'Mahila Kisan Diwas',
  'Gandhi Jayanti',
  'Vanijya Mahotsava',
  'Tree Plantation / Van Mahotsava',
  'Nutrition Week',
  'Parthenium Awareness Week',
  'Sadbhavna Pledge',
  'Independence Day',
  'Har Med pe Ek Ped',
  'World Environment Day',
  'World Milk Day',
  'World Bee Day',
  'World Health Day',
  'World Water Day',
  'International Women Day',
  'Republic Day',
];

// Funding Sources
const FUNDING_SOURCES = [
  'ICAR', 'State Government', 'Central Government', 'KVK Funds',
  'External Funding', 'Donation', 'Self-Financed', 'NGO',
  'International Organization', 'Private Sector', 'Corporate CSR'
];

// CFLD budget item master (used by kvk_budget_utilization_item mappings)
const CFLD_BUDGET_ITEM_MASTER = [
  'Critical Input',
  'TA/DA',
  'Extension Activities',
  'Publication',
];

/**
 * Product category → types (production supply master).
 * `seed-product.json` uses: crop = category name, subcategory = type, category = product name.
 */
const PRODUCT_CATEGORIES = [
  {
    categoryName: 'Fodder Crop Sampling',
    types: ['Fodder Crop Sampling', 'Others Please Specify'],
  },
  {
    categoryName: 'Forest Species',
    types: ['Forest Species'],
  },
  {
    categoryName: 'Seed Production at Seed Village',
    types: [],
  },
  {
    categoryName: 'Production of Livestock and Fisheries Material',
    types: [
      'Ducks',
      'Fisheries',
      'Rabbitry',
      'Piggery',
      'Poultry',
      'Small Ruminants',
      'Dairy Animals',
    ],
  },
  {
    categoryName: 'Production of Bio Product',
    types: [
      'Biocontrol Agent',
      'Bio Fertilizers',
      'Biofungicide',
      'Vermicompost',
      'Worms Earthworm Silk Worms Etc',
      'Bioagents Trichocard etc',
      'Biopesticide Nimast Brahmastr Jeevamrit',
      'Biofood',
    ],
  },
  {
    categoryName: 'Production of Planting Material',
    types: [
      'Spices',
      'Tuber Elephant Yams',
      'Plantation',
      'Medicinal And Aromatic',
      'Ornamental Plants',
      'Fruits Planting Material',
      'Commercial Seedlings',
      'Vegetable Seedlings',
    ],
  },
  {
    categoryName: 'Production of Seed',
    types: [
      'Others',
      'Fibre Crops',
      'Ornamental or Flowers',
      'Commercial Crop',
      'Green Manure',
      'Medicinal',
      'Forest Crop',
      'Fruits',
      'Spices',
      'Fodder',
      'Vegetables',
      'Pulses',
      'Oil Seed',
      'Cereals',
    ],
  },
];

// CRA Cropping System master (season → crop names)
const CRA_CROPPING_SYSTEMS = {
  Rabi: ['Cabbage', 'Maize'],
  Kharif: ['Vermicomposting', 'Horticulture'],
};

// CRA Farming System master (season → system names)
const CRA_FARMING_SYSTEMS = {
  Summer: [
    'Proso Millet',
    'Maize',
    'Til',
    'Pearl millet',
    'Black gram',
    'Green Gram',
  ],
  Rabi: [
    'Chickpea',
    'Vegetable Pea',
    'Onion',
    'Coriander',
    'Cabbage',
    'Mushroom',
    'Maize',
    'Lathyrus',
    'Potato',
    'Lentil',
    'Mustard',
    'Wheat',
  ],
  Kharif: [
    'Green Gram',
    'Pigoen Pea',
    'Sorghum',
    'Soyabean',
    'Perl Millet',
    'Finger millet',
    'Maize',
    'Paddy',
    'Dairy',
    'Fishery',
    'Fish Seed Production',
    'Duckery',
    'Broiler & Dual-Purpose Poultry',
    'Goatery',
  ],
};

/**
 * CFLD crop master (`fld_crop_master`). Type names map to `crop_type`: Pulses, Oilseed (seed-data).
 */
const CFLD_CROP_MASTER = [
  { seasonName: 'Summer', typeName: 'Oilseed', cropName: 'Sesame' },
  { seasonName: 'Summer', typeName: 'Pulses', cropName: 'Other' },
  { seasonName: 'Summer', typeName: 'Pulses', cropName: 'Rajmash' },
  { seasonName: 'Summer', typeName: 'Pulses', cropName: 'Greengram' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Other' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Bengal gram' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Lathyrus' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Rajmash' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Fieldpea' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Chickpea' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Other' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Mothbean' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Rajmash' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Cowpea' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Horsegram' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Greengram' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Blackgram' },
  { seasonName: 'Summer', typeName: 'Pulses', cropName: 'Green Gram' },
  { seasonName: 'Kharif', typeName: 'Oilseed', cropName: 'Niger' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Grasspea Lathyrus' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Field Pea' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Lentil' },
  { seasonName: 'Rabi', typeName: 'Pulses', cropName: 'Chickpea Gram' },
  { seasonName: 'Rabi', typeName: 'Oilseed', cropName: 'Linseed' },
  { seasonName: 'Rabi', typeName: 'Oilseed', cropName: 'Sunflower' },
  { seasonName: 'Rabi', typeName: 'Oilseed', cropName: 'Rapeseed' },
  { seasonName: 'Rabi', typeName: 'Oilseed', cropName: 'Mustard' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Urad' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Moong' },
  { seasonName: 'Kharif', typeName: 'Pulses', cropName: 'Pigeonpea' },
  { seasonName: 'Kharif', typeName: 'Oilseed', cropName: 'Sesame' },
  { seasonName: 'Kharif', typeName: 'Oilseed', cropName: 'Soybean' },
  { seasonName: 'Kharif', typeName: 'Oilseed', cropName: 'Groundnut' },
];

/** Enterprise master — seeds `arya_enterprise` and `enterprise_type_master` */
const ENTERPRISE_MASTER = [
  'Others',
  'Seed Production',
  'Nursery Management',
  'Processing and Value Addition(Product Name)',
  'Bee keeping',
  'Fish Farming',
  'Duck Farming',
  'Quail Farming',
  'Poultry Farming',
  'Mushroom Production',
  'Lac Farming',
  'Food Processing',
  'Goat Farming',
  'Banana Fibre Extraction',
  'Pig Farming',
];

/** Impact Specific Area master (`impact_specific_area_master`) — All Masters / Performance Indicators */
const IMPACT_SPECIFIC_AREAS = [
  'Technology',
  'Training',
  'Entrepreneurship Generated',
];

/** Programme Type master (`programme_type_master`) — Performance Indicator Linkages / Special Programmes */
const PROGRAMME_TYPE_MASTER = [
  'Infrastructure Development',
  'Other Activities',
];

/** Account Type master (`account_type_master`) — Performance Indicators / District Level line items */
const ACCOUNT_TYPE_MASTER = [
  'Major Farming System/Enterprise',
  'Agro Climatic Zone',
  'Agro Ecological Situation',
  'Soil Type',
  'Productivity of major 2-3 crops under cereal, pulses, oilseed, vegetables, fruits and others',
  'Mean yearly temperature, rainfall, humidity of the district',
  'Production of major livestock products like milk, egg, meat etc',
];

/** Publication master (`publication` table) */
const PUBLICATION_MASTER = [
  'Research Paper Published',
  'Abstracts Published in Seminar or Conference or Symposia',
  'Books Published',
  'Book Chapter Published',
  'Popular Articles Published',
  'Success Story Published',
  'Extension Bulletins Published',
  'Extension Folders or Leaflet or Pamphlets',
  'Technical Reports',
  'News Letter',
  'Electronic Publication CD or DVD',
  'E Publication',
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

/**
 * OFT Subject Master + thematic areas (official KVK OFT mapping).
 * Order: Crop Production → Livestock → Enterprises → Women Empowerment → Horticulture.
 */
const OFT_SUBJECTS_AND_THEMATIC_AREAS = [
  {
    subjectName: 'Technologies Assessed under Various Crops by KVKs (Crop Production)',
    thematicAreas: [
      'Others Thematic Area Upload By ATARI',
      'Farm Mechanization',
      'Cropping Systems',
      'Storage Technique',
      'Drudgery Reduction',
      'Post Harvest Technology / Value Addition',
      'Seed / Plant Production',
      'Integrated Farming System',
      'Farm Machineries',
      'Resource Conservation Technology',
      'Weed Management',
      'Small Scale Income Generation Enterprises',
      'Integrated Disease Management',
      'Integrated Crop Management',
      'Integrated Pest Management',
      'Varietal Evaluation',
      'Integrated Nutrient Management',
    ],
  },
  {
    subjectName: 'Technologies Assessed under Livestock and Fisheries by KVKs',
    thematicAreas: [
      'Others',
      'Fisheries Management',
      'Nutrient Management',
      'Diseases and Health Management',
      'Horticulture Crop',
      'Processing and Value Addition of livestock products',
      'Production And Management',
      'Feed And Fodder Management',
      'Breeding Management/Evaluation of Breed',
      'Disease Management',
    ],
  },
  {
    subjectName: 'Technologies Assessed under various Enterprises by KVKs',
    thematicAreas: [
      'Others',
      'Value Addition',
      'Resource Conservation Technology',
      'Mechanization',
      'Agroforestry Management',
      'Organic Farming',
      'Household Food Security',
      'Storage Techniques',
      'Small-Scale Income Generation',
      'Energy Conservation',
      'Processing and Value Addition',
      'Health And Nutrition',
      'Entrepreneurship Development',
      'Drudgery Reduction',
    ],
  },
  {
    subjectName: 'Technologies Assessed under various Enterprises for Women Empowerment',
    thematicAreas: [
      'Others',
      'Value Addition',
      'Health and Nutrition',
      'Entrepreneurship Development',
      'Drudgery Reduction',
    ],
  },
  {
    subjectName: 'Technologies Assessed under various Crops (Horticulture crops.)',
    thematicAreas: [
      'Others if any specify',
      'Post-harvest Technology / Value addition',
      'Resource Conservation Technology',
      'Weed Management',
      'Small Scale Income Generation Enterprises',
      'Integrated Disease Management',
      'Integrated Crop Management',
      'Integrated Pest Management',
      'Varietal Evaluation',
      'Integrated Nutrient Management',
    ],
  },
];

/** Subcategory sets reused for farm-machinery categories (matches official FLD list). */
const FLD_FARM_MACHINERY_SUBCATEGORIES = [
  'Others',
  'Millets',
  'Flowers',
  'Oilseed',
  'Fruits',
  'Vegetables',
  'Pulses',
  'Cereals',
];

const FLD_OTHER_CROPS_SUBCATEGORIES = [
  'Coconut',
  'Plantation Crops',
  'Fodder Crops',
  'Fibre Crops',
  'Commercial Crops',
  'Medicinal And Aromatic Plants',
  'Spices And Condiments',
  'Fruit Crops',
  'Flower Crops',
  'Tuber Crops',
];

/**
 * FLD sector → thematic areas, categories, subcategories (official KVK FLD mapping).
 * Sector order matches S.No. 1–7. Crop Production row 1 source had placeholder "aa" → "Others".
 */
const FLD_SECTOR_DATA = [
  {
    sectorName: 'Crop Hybrid Varieties',
    thematicAreas: ['Crop Production'],
    categories: [
      {
        categoryName: 'Other Crops of Crop Hybrid Varieties',
        subcategories: FLD_OTHER_CROPS_SUBCATEGORIES,
      },
      { categoryName: 'Pulses of Crop Hybrid Varieties', subcategories: ['Pulses Other Than Cfld'] },
      { categoryName: 'Oilseeds of Crop Hybrid Varieties', subcategories: ['Oilseeds Other Than Cfld'] },
      {
        categoryName: 'Cereals of Crop Hybrid Varieties',
        subcategories: ['Millets', 'Cereals'],
      },
    ],
  },
  {
    sectorName: 'Farm Implements and Machinery',
    thematicAreas: ['Farm Implements And Machinery'],
    categories: [
      { categoryName: 'Others', subcategories: ['Others'] },
      {
        categoryName: 'Total mechanization tools and machineries',
        subcategories: FLD_FARM_MACHINERY_SUBCATEGORIES,
      },
      {
        categoryName: 'Postharvest processing tools and machineries',
        subcategories: FLD_FARM_MACHINERY_SUBCATEGORIES,
      },
      {
        categoryName: 'Harvesting tools and machineries',
        subcategories: FLD_FARM_MACHINERY_SUBCATEGORIES,
      },
      {
        categoryName: 'Plant protection tools and machineries',
        subcategories: FLD_FARM_MACHINERY_SUBCATEGORIES,
      },
      {
        categoryName: 'Irrigation management tools and machineries',
        subcategories: FLD_FARM_MACHINERY_SUBCATEGORIES,
      },
      {
        categoryName: 'Intercultural operation tools and machineries',
        subcategories: FLD_FARM_MACHINERY_SUBCATEGORIES,
      },
      {
        categoryName: 'Sowing and planting tools and machineries',
        subcategories: FLD_FARM_MACHINERY_SUBCATEGORIES,
      },
    ],
  },
  {
    sectorName: 'Women Empowerment',
    thematicAreas: ['Women Empowerment'],
    categories: [
      { categoryName: 'Women Empowerment', subcategories: ['Children', 'Women'] },
    ],
  },
  {
    sectorName: 'Other Enterprises',
    thematicAreas: [
      'Storage techniques',
      'Small Scale Income Generation Enterprises',
      'Entrepreneurship Development',
    ],
    categories: [{ categoryName: 'Other Enterprises', subcategories: ['Enterprises'] }],
  },
  {
    sectorName: 'Livestock & Fisheries',
    thematicAreas: [
      'Breeding management/Evaluation of Breeds',
      'Production and Management',
      'Nutrition Management',
      'Fisheries management',
      'Feed and Fodder management',
      'Disease & Health Management',
    ],
    categories: [
      { categoryName: 'Fisheries', subcategories: ['Fishery'] },
      {
        categoryName: 'Livestock',
        subcategories: ['Pigs', 'Poultry', 'Sheep And Goats', 'Dairy And Cattle'],
      },
    ],
  },
  {
    sectorName: 'Horticultural Crops',
    thematicAreas: [
      'Others',
      'Post-Harvest Management',
      'Integrated Pest Management',
      'Integrated Nutrient Management',
      'Integrated Disease Management',
      'Integrated Crop Management',
    ],
    categories: [
      { categoryName: 'Horticultural Crops', subcategories: ['Fruits', 'Vegetable Crops'] },
    ],
  },
  {
    sectorName: 'Crop Production',
    thematicAreas: [
      'Others',
      'Farm Mechanization',
      'Weed Management',
      'Varietal Evaluation',
      'Resource Conservation Technology',
      'Integrated Pest Management',
      'Integrated Nutrient Management',
      'Integrated Disease Management',
      'Integrated Crop Management',
    ],
    categories: [
      {
        categoryName: 'Other Crops of Crop Production',
        subcategories: FLD_OTHER_CROPS_SUBCATEGORIES,
      },
      { categoryName: 'Pulses of Crop Production', subcategories: ['Pulses Other Than Cfld'] },
      { categoryName: 'Oilseeds of Crop Production', subcategories: ['Oilseeds Other Than Cfld'] },
      {
        categoryName: 'Cereals of Crop Production',
        subcategories: ['Millets', 'Cereals'],
      },
    ],
  },
];

const FUNDING_AGENCIES = [
  'ICAR', 'State Govt. Ministry of A&FW', 'Central Govt.', 'Others'
];

const DIGNITARY_TYPES = [
  'Minister',
  'MP',
  'MLA',
  'DM',
  'VC',
  'Zila Sabhadipati',
  'Other Head of Organization',
  'Foreigners',
];

const PPV_FRA_TRAINING_TYPES = [
  'Training',
  'Awareness',
];

const TSP_SCSP_TYPE_MASTER = [
  'TSP',
  'SCSP',
];

const TSP_SCSP_ACTIVITY_MASTER = [
  'Trainings',
  'OFT',
  'FLD',
  'Mobile agro- advisory to farmers',
  'Other activities',
];

const NICRA_CATEGORY_SUBCATEGORY_MASTER = {
  NRM: [
    'Performances of demonstration of in-situ moisture conservation technologies',
    'Performances of water harvesting and recycling for supplemental irrigation',
    'Performance of ZTD in various crops',
    'Performance of artificial ground water recharge technologies demonstrated',
    'Performance of different water saving irrigation methods',
    'Rainwater harvesting structures developed',
  ],
  'Crop production': [
    'Performance of different drought tolerant varieties',
    'Performance of different short duration rice varieties',
    'Performance of different flood tolerant varieties',
    'Performance of advancement of planting dates in different crops',
    'Performances of water saving technologies for rice cultivation',
    'Integration of cropping system with other farming',
    'Performance of Community nurseries',
    'Performance of different location specific intercropping systems',
    'Performance of different crop diversification in NICRA villages',
    'Performance of other demonstration',
  ],
  'Livestock & Fisheries': [
    'Performance of different fodder demonstration in community lands',
    'Performance of improved fodder',
    'Performance of various vaccination camps organized',
    'For Goat/ sheep/ pig',
    'For poultry',
    'Performance of fish in the ponds/ water bodies',
    'Performance of livestock demonstration in NICRA adopted villages (Buffalo/ Cow)',
    'Performance of livestock demonstration in NICRA adopted villages (Goat/ sheep/ Pig)',
    'Performance of livestock demonstration in NICRA adopted villages (poultry)',
    'Performance of improved shelters for poultry and dairy animals',
  ],
};

const NICRA_SEED_BANK_FODDER_BANK_MASTER = [
  'Seed bank',
  'Fodder bank',
];

const NICRA_PI_TYPE_MASTER = [
  'PI',
  'CO PI',
];

const NATURAL_FARMING_ACTIVITY_MASTER = [
  'Training',
  'Awareness',
  'Other activities',
];

const NATURAL_FARMING_SOIL_PARAMETER_MASTER = [
  'Soil Parameter for Demo plot at KVK Farm',
  'Soil Parameter for Non-Demo plot at KVK Farm',
  'Soil Parameter for Demo plot at Farmers Field',
  'Soil Parameter for Non-Demo plot at Farmers Field',
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

  for (const scaleName of PAY_SCALES) {
    await prisma.payScaleMaster.upsert({
      where: { scaleName },
      update: {},
      create: { scaleName },
    });
  }

  console.log('   ✅ Done\n');
}

/**
 * JSON `category` matches TrainingArea.trainingAreaName; maps to parent TrainingType.
 */
function resolveTrainingTypeNameForAreaCategory(categoryName) {
  if (categoryName === 'Extension Personnel') return 'Extension Personnel';
  if (categoryName === 'Rural Youth') return 'Rural Youth';
  return 'Farmers and Farm Women';
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

  const typeByName = new Map(
    (await prisma.trainingType.findMany()).map((t) => [t.trainingTypeName, t])
  );

  for (const [typeName, areaNames] of Object.entries(TRAINING_AREAS_BY_TYPE)) {
    const trainingType = typeByName.get(typeName);
    if (!trainingType) continue;

    for (const trainingAreaName of areaNames) {
      const existing = await prisma.trainingArea.findFirst({
        where: { trainingAreaName, trainingTypeId: trainingType.trainingTypeId },
      });
      if (!existing) {
        await prisma.trainingArea.create({
          data: { trainingAreaName, trainingTypeId: trainingType.trainingTypeId },
        });
      }
    }
  }

  const thematicPath = path.join(__dirname, '../constants/seed-training-thematic-area.json');
  const thematicRows = JSON.parse(fs.readFileSync(thematicPath, 'utf8'));

  const areas = await prisma.trainingArea.findMany({
    include: { trainingType: true },
  });
  const areaByTypeAndName = new Map(
    areas.map((a) => [`${a.trainingTypeId}\t${a.trainingAreaName}`, a])
  );

  let thematicCreated = 0;
  let thematicSkipped = 0;

  for (const row of thematicRows) {
    const category = (row.category || '').trim();
    const sub = (row.subcategory || '').trim();
    if (!category || !sub) {
      thematicSkipped += 1;
      continue;
    }

    const typeName = resolveTrainingTypeNameForAreaCategory(category);
    const trainingType = typeByName.get(typeName);
    if (!trainingType) {
      thematicSkipped += 1;
      continue;
    }

    const area = areaByTypeAndName.get(`${trainingType.trainingTypeId}\t${category}`);
    if (!area) {
      console.warn(`   ⚠️  training thematic: no TrainingArea "${category}" for type "${typeName}" — skipped`);
      thematicSkipped += 1;
      continue;
    }

    const exists = await prisma.trainingThematicArea.findFirst({
      where: {
        trainingThematicAreaName: sub,
        trainingAreaId: area.trainingAreaId,
      },
    });
    if (exists) {
      thematicSkipped += 1;
      continue;
    }

    await prisma.trainingThematicArea.create({
      data: {
        trainingThematicAreaName: sub,
        trainingAreaId: area.trainingAreaId,
      },
    });
    thematicCreated += 1;
  }

  console.log(
    `   ✅ Training thematic areas: ${thematicCreated} created, ${thematicSkipped} skipped\n`
  );

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

async function seedEventsMasters() {
  console.log('🌱 Events master...');

  for (const eventName of EVENTS_MASTER) {
    const existing = await prisma.event.findFirst({
      where: { eventName },
    });
    if (!existing) {
      await prisma.event.create({
        data: { eventName },
      });
    }
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

async function seedCfldBudgetItemMasters() {
  console.log('🌱 CFLD budget item master...');

  // Cleanup legacy row that should not appear in CFLD budget items.
  // If referenced by utilization rows, keep data intact and warn.
  try {
    await prisma.budgetItem.deleteMany({
      where: { itemName: 'Equipment' },
    });
  } catch (error) {
    console.warn('   ⚠️  Could not remove legacy "Equipment" budget item:', error?.message || error);
  }

  for (const itemName of CFLD_BUDGET_ITEM_MASTER) {
    await prisma.budgetItem.upsert({
      where: { itemName },
      update: {},
      create: { itemName },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedProducts() {
  console.log('🌱 Products (categories, types, seed-product.json)...');

  for (const category of PRODUCT_CATEGORIES) {
    const productCategory = await prisma.productCategory.upsert({
      where: { productCategoryName: category.categoryName },
      update: {},
      create: { productCategoryName: category.categoryName },
    });

    for (const typeName of category.types) {
      const existingType = await prisma.productType.findFirst({
        where: {
          productCategoryType: typeName,
          productCategoryId: productCategory.productCategoryId,
        },
      });

      if (!existingType) {
        await prisma.productType.create({
          data: {
            productCategoryType: typeName,
            productCategoryId: productCategory.productCategoryId,
          },
        });
      }
    }
  }

  const productJsonPath = path.join(__dirname, '../constants/seed-product.json');
  if (!fs.existsSync(productJsonPath)) {
    console.log('   ⚠️  seed-product.json not found; categories/types only\n');
    console.log('   ✅ Done\n');
    return;
  }

  const productRows = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));
  const allCategories = await prisma.productCategory.findMany();
  const categoryByName = new Map(
    allCategories.map((c) => [c.productCategoryName, c])
  );

  const allTypes = await prisma.productType.findMany();
  const typeByCategoryAndName = new Map(
    allTypes.map((t) => [`${t.productCategoryId}\t${t.productCategoryType}`, t])
  );

  const existingProducts = await prisma.product.findMany({
    select: {
      productName: true,
      productCategoryId: true,
      productTypeId: true,
    },
  });
  const productKey = (name, categoryId, typeId) =>
    `${categoryId}\t${typeId}\t${name}`;
  const existingProductKeys = new Set(
    existingProducts.map((p) =>
      productKey(p.productName, p.productCategoryId, p.productTypeId)
    )
  );

  let productsCreated = 0;
  let productsSkipped = 0;

  for (const row of productRows) {
    const productCategoryName = (row.crop || '').trim();
    const productTypeName = (row.subcategory || '').trim();
    const productName = (row.category || '').trim();
    if (!productCategoryName || !productTypeName || !productName) {
      productsSkipped += 1;
      continue;
    }

    const productCategory = categoryByName.get(productCategoryName);
    if (!productCategory) {
      console.warn(
        `   ⚠️  seed-product.json: unknown category (crop) "${productCategoryName}" — skipped`
      );
      productsSkipped += 1;
      continue;
    }

    const productType = typeByCategoryAndName.get(
      `${productCategory.productCategoryId}\t${productTypeName}`
    );
    if (!productType) {
      console.warn(
        `   ⚠️  seed-product.json: unknown type "${productTypeName}" under "${productCategoryName}" — skipped`
      );
      productsSkipped += 1;
      continue;
    }

    const pk = productKey(
      productName,
      productCategory.productCategoryId,
      productType.productTypeId
    );
    if (existingProductKeys.has(pk)) {
      productsSkipped += 1;
      continue;
    }

    await prisma.product.create({
      data: {
        productName,
        productCategoryId: productCategory.productCategoryId,
        productTypeId: productType.productTypeId,
      },
    });
    existingProductKeys.add(pk);
    productsCreated += 1;
  }

  console.log(
    `   ✅ Product rows: ${productsCreated} created, ${productsSkipped} skipped\n`
  );
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

async function seedCfldCropMasters() {
  console.log('🌱 CFLD crop master (fld_crop_master)...');

  for (const seasonName of ['Rabi', 'Kharif', 'Summer']) {
    await prisma.season.upsert({
      where: { seasonName },
      update: {},
      create: { seasonName },
    });
  }

  for (const typeName of ['Pulses', 'Oilseed']) {
    await prisma.cropType.upsert({
      where: { typeName },
      update: {},
      create: { typeName },
    });
  }

  const seasons = await prisma.season.findMany();
  const seasonByName = new Map(seasons.map((s) => [s.seasonName, s]));
  const cropTypes = await prisma.cropType.findMany();
  const typeByName = new Map(cropTypes.map((t) => [t.typeName, t]));

  for (const row of CFLD_CROP_MASTER) {
    const season = seasonByName.get(row.seasonName);
    const cropType = typeByName.get(row.typeName);
    if (!season || !cropType) {
      console.warn(`   ⚠️  CFLD crop: missing season or type for ${JSON.stringify(row)}`);
      continue;
    }

    const existing = await prisma.fLDCropMaster.findFirst({
      where: {
        seasonId: season.seasonId,
        typeId: cropType.typeId,
        cropName: row.cropName,
      },
    });
    if (!existing) {
      await prisma.fLDCropMaster.create({
        data: {
          cropName: row.cropName,
          seasonId: season.seasonId,
          typeId: cropType.typeId,
        },
      });
    }
  }

  console.log('   ✅ Done\n');
}

async function seedARYAEnterprises() {
  console.log('🌱 ARYA enterprises (arya_enterprise)...');

  for (const enterpriseName of ENTERPRISE_MASTER) {
    await prisma.aryaEnterprise.upsert({
      where: { enterpriseName },
      update: {},
      create: { enterpriseName },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedEnterpriseTypeMasters() {
  console.log('🌱 Enterprise type master...');

  for (const enterpriseTypeName of ENTERPRISE_MASTER) {
    await prisma.enterpriseTypeMaster.upsert({
      where: { enterpriseTypeName },
      update: {},
      create: { enterpriseTypeName },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedImpactSpecificAreaMasters() {
  console.log('🌱 Impact specific area master...');

  for (const specificAreaName of IMPACT_SPECIFIC_AREAS) {
    const existing = await prisma.impactSpecificAreaMaster.findFirst({
      where: { specificAreaName },
    });
    if (!existing) {
      await prisma.impactSpecificAreaMaster.create({
        data: { specificAreaName },
      });
    }
  }

  console.log('   ✅ Done\n');
}

async function seedProgrammeTypeMasters() {
  console.log('🌱 Programme type master...');

  for (const programmeType of PROGRAMME_TYPE_MASTER) {
    await prisma.programmeTypeMaster.upsert({
      where: { programmeType },
      update: {},
      create: { programmeType },
    });
  }

  console.log('   ✅ Done\n');
}

async function seedAccountTypeMasters() {
  console.log('🌱 Account type master...');

  for (const accountType of ACCOUNT_TYPE_MASTER) {
    const existing = await prisma.accountTypeMaster.findFirst({
      where: { accountType },
    });
    if (!existing) {
      await prisma.accountTypeMaster.create({
        data: { accountType },
      });
    }
  }

  console.log('   ✅ Done\n');
}

async function seedPublicationMasters() {
  console.log('🌱 Publication master...');

  for (const publicationName of PUBLICATION_MASTER) {
    const existing = await prisma.publication.findFirst({
      where: { publicationName },
    });
    if (!existing) {
      await prisma.publication.create({
        data: { publicationName },
      });
    }
  }

  console.log('   ✅ Donew\n');
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

async function seedDignitaryTypeMasters() {
  console.log('🌱 Dignitary type masters...');
  for (const name of DIGNITARY_TYPES) {
    await prisma.dignitaryType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.nicraDignitaryTypeMaster.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedPpvFraTrainingTypeMasters() {
  console.log('🌱 PPV & FRA training type masters...');
  for (const typeName of PPV_FRA_TRAINING_TYPES) {
    await prisma.ppvFraTrainingTypeMaster.upsert({
      where: { typeName },
      update: {},
      create: { typeName },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedTspScspMasters() {
  console.log('🌱 TSP/SCSP type & activity masters...');
  for (const typeName of TSP_SCSP_TYPE_MASTER) {
    await prisma.tspScspTypeMaster.upsert({
      where: { typeName },
      update: {},
      create: { typeName },
    });
  }

  for (const activityName of TSP_SCSP_ACTIVITY_MASTER) {
    await prisma.tspScspActivities.upsert({
      where: { activityName },
      update: {},
      create: { activityName },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedNicraCategorySubCategoryMasters() {
  console.log('🌱 NICRA category & sub-category masters...');
  for (const [categoryName, subcategories] of Object.entries(NICRA_CATEGORY_SUBCATEGORY_MASTER)) {
    const category = await prisma.nicraCategory.upsert({
      where: { categoryName },
      update: {},
      create: { categoryName },
    });

    for (const subCategoryName of subcategories) {
      const existing = await prisma.nicraSubCategory.findFirst({
        where: { subCategoryName, nicraCategoryId: category.nicraCategoryId },
      });
      if (!existing) {
        await prisma.nicraSubCategory.create({
          data: {
            subCategoryName,
            nicraCategoryId: category.nicraCategoryId,
          },
        });
      }
    }
  }
  console.log('   ✅ Done\n');
}

async function seedNicraSeedBankFodderBankMasters() {
  console.log('🌱 NICRA seed bank/fodder bank masters...');
  for (const name of NICRA_SEED_BANK_FODDER_BANK_MASTER) {
    await prisma.nicraSeedBankFodderBankMaster.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedNicraPiTypeMasters() {
  console.log('🌱 NICRA PI/CO-PI type masters...');
  for (const name of NICRA_PI_TYPE_MASTER) {
    await prisma.nicraPiTypeMaster.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedNaturalFarmingActivityMasters() {
  console.log('🌱 Natural farming activity masters...');
  for (const activityName of NATURAL_FARMING_ACTIVITY_MASTER) {
    await prisma.naturalFarmingActivityMaster.upsert({
      where: { activityName },
      update: {},
      create: { activityName },
    });
  }
  console.log('   ✅ Done\n');
}

async function seedNaturalFarmingSoilParameterMasters() {
  console.log('🌱 Natural farming soil parameter masters...');
  for (const parameterName of NATURAL_FARMING_SOIL_PARAMETER_MASTER) {
    await prisma.naturalFarmingSoilParameterMaster.upsert({
      where: { parameterName },
      update: {},
      create: { parameterName },
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

async function seedOftMasters() {
  console.log('🌱 OFT subject & thematic area masters...');

  for (const { subjectName, thematicAreas } of OFT_SUBJECTS_AND_THEMATIC_AREAS) {
    let subject = await prisma.oftSubject.findFirst({
      where: { subjectName },
    });
    if (!subject) {
      subject = await prisma.oftSubject.create({
        data: { subjectName },
      });
    }

    for (const thematicAreaName of thematicAreas) {
      const existing = await prisma.oftThematicArea.findFirst({
        where: {
          thematicAreaName,
          oftSubjectId: subject.oftSubjectId,
        },
      });
      if (!existing) {
        await prisma.oftThematicArea.create({
          data: {
            thematicAreaName,
            oftSubjectId: subject.oftSubjectId,
          },
        });
      }
    }
  }

  console.log('   ✅ Done\n');
}

/**
 * Build category name → sector name map from FLD_SECTOR_DATA (for crops.json rows).
 */
function buildFldCategoryToSectorMap() {
  const map = {};
  for (const sector of FLD_SECTOR_DATA) {
    for (const { categoryName } of sector.categories) {
      map[categoryName] = sector.sectorName;
    }
  }
  return map;
}

async function seedFldMasters() {
  console.log('🌱 FLD sector, thematic area, category, subcategory & crop masters...');

  for (const { sectorName, thematicAreas, categories } of FLD_SECTOR_DATA) {
    const sector = await prisma.sector.upsert({
      where: { sectorName },
      update: {},
      create: { sectorName },
    });

    for (const thematicAreaName of thematicAreas) {
      const existingTa = await prisma.fldThematicArea.findFirst({
        where: { sectorId: sector.sectorId, thematicAreaName },
      });
      if (!existingTa) {
        await prisma.fldThematicArea.create({
          data: { thematicAreaName, sectorId: sector.sectorId },
        });
      }
    }

    for (const { categoryName, subcategories } of categories) {
      let category = await prisma.fldCategory.findFirst({
        where: { sectorId: sector.sectorId, categoryName },
      });
      if (!category) {
        category = await prisma.fldCategory.create({
          data: { categoryName, sectorId: sector.sectorId },
        });
      }

      for (const subCategoryName of subcategories) {
        const existingSub = await prisma.fldSubcategory.findFirst({
          where: { categoryId: category.categoryId, subCategoryName },
        });
        if (!existingSub) {
          await prisma.fldSubcategory.create({
            data: {
              subCategoryName,
              categoryId: category.categoryId,
              sectorId: sector.sectorId,
            },
          });
        }
      }
    }
  }

  const categoryToSector = buildFldCategoryToSectorMap();
  const cropsPath = path.join(__dirname, '../constants/seed-crops.json');
  const cropsRows = JSON.parse(fs.readFileSync(cropsPath, 'utf8'));

  const sectors = await prisma.sector.findMany();
  const sectorByName = new Map(sectors.map((s) => [s.sectorName, s]));

  const allCategories = await prisma.fldCategory.findMany();
  const categoryBySectorAndName = new Map(
    allCategories.map((c) => [`${c.sectorId}\t${c.categoryName}`, c])
  );

  const allSubs = await prisma.fldSubcategory.findMany();
  const subByCategoryAndName = new Map(
    allSubs.map((sc) => [`${sc.categoryId}\t${sc.subCategoryName}`, sc])
  );

  const existingCrops = await prisma.fldCrop.findMany({
    select: { categoryId: true, subCategoryId: true, cropName: true },
  });
  const cropKey = (categoryId, subCategoryId, name) =>
    `${categoryId}\t${subCategoryId}\t${name}`;
  const existingCropKeys = new Set(existingCrops.map((r) => cropKey(r.categoryId, r.subCategoryId, r.cropName)));

  let cropsCreated = 0;
  let cropsSkipped = 0;

  for (const row of cropsRows) {
    const categoryName = row.category;
    const subCategoryName = row.subcategory;
    const cropName = row.crop;
    if (!categoryName || !subCategoryName || cropName == null || cropName === '') {
      cropsSkipped += 1;
      continue;
    }

    const sectorName = categoryToSector[categoryName];
    if (!sectorName) {
      console.warn(`   ⚠️  crops.json: unknown category "${categoryName}" — skipped`);
      cropsSkipped += 1;
      continue;
    }

    const sector = sectorByName.get(sectorName);
    if (!sector) {
      cropsSkipped += 1;
      continue;
    }

    const category = categoryBySectorAndName.get(`${sector.sectorId}\t${categoryName}`);
    const subCategory = category
      ? subByCategoryAndName.get(`${category.categoryId}\t${subCategoryName}`)
      : null;

    if (!category || !subCategory) {
      console.warn(
        `   ⚠️  crops.json: missing category/subcategory "${categoryName}" / "${subCategoryName}" — skipped`
      );
      cropsSkipped += 1;
      continue;
    }

    const ck = cropKey(category.categoryId, subCategory.subCategoryId, cropName);
    if (existingCropKeys.has(ck)) {
      cropsSkipped += 1;
      continue;
    }

    await prisma.fldCrop.create({
      data: {
        cropName,
        categoryId: category.categoryId,
        subCategoryId: subCategory.subCategoryId,
      },
    });
    existingCropKeys.add(ck);
    cropsCreated += 1;
  }

  console.log(`   ✅ FLD crops: ${cropsCreated} created, ${cropsSkipped} skipped (already present or invalid)\n`);
}

async function run() {
  console.log('🌱 Seed all masters\n');
  await seedStaffMasters();
  await seedTrainingMasters();
  await seedExtensionMasters();
  await seedEventsMasters();
  await seedFundingSources();
  await seedCfldBudgetItemMasters();
  await seedProducts();
  await seedCRASystems();
  await seedCfldCropMasters();
  await seedARYAEnterprises();
  await seedEnterpriseTypeMasters();
  await seedImpactSpecificAreaMasters();
  await seedProgrammeTypeMasters();
  await seedAccountTypeMasters();
  await seedPublicationMasters();
  await seedUniversities();
  await seedAttachmentTypes();
  await seedNariMasters();
  await seedFundingAgencies();
  await seedDignitaryTypeMasters();
  await seedPpvFraTrainingTypeMasters();
  await seedTspScspMasters();
  await seedNicraCategorySubCategoryMasters();
  await seedNicraSeedBankFodderBankMasters();
  await seedNicraPiTypeMasters();
  await seedNaturalFarmingActivityMasters();
  await seedNaturalFarmingSoilParameterMasters();
  await seedFinancialProjects();
  await seedOftMasters();
  await seedFldMasters();
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
