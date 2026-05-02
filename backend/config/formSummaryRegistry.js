/**
 * Form Summary Registry
 *
 * Single source of truth mapping every Form-Management form to its underlying
 * Prisma model. Drives /api/forms/summary — counting entries per KVK per form.
 *
 * Shape:
 *   key:         stable unique id, used as the map key in API responses
 *   title:       human label shown to users
 *   category:    top-level grouping (matches Form Management sidebar sub-section)
 *   subcategory: optional sub-grouping (e.g. 'NICRA Others')
 *   moduleCode:  permission gate; row hidden for users lacking VIEW on this code
 *   model:       Prisma delegate name (prisma[model])
 *   path:        browser route for the form — lets the summary tile link to it
 *   where:       optional extra filter merged into groupBy (e.g. transferStatus)
 *
 * All listed models have `kvkId Int` — verified via grep of prisma/.
 * To add a new form: append one entry. Nothing else needs to change.
 */

const REGISTRY = [
  // ── About KVK ────────────────────────────────────────────────────────────
  { key: 'about_kvk.bank_accounts', title: 'Bank Account Details', category: 'About KVK', moduleCode: 'about_kvks_bank_account_details', model: 'kvkBankAccount', path: '/forms/about-kvk/bank-account' },
  { key: 'about_kvk.employees', title: 'Employee Details', category: 'About KVK', moduleCode: 'about_kvks_employee_details', model: 'kvkStaff', where: { transferStatus: 'ACTIVE' }, path: '/forms/about-kvk/employee-details' },
  { key: 'about_kvk.staff_transferred', title: 'Staff Transferred', category: 'About KVK', moduleCode: 'about_kvks_staff_details', model: 'kvkStaff', where: { NOT: { transferStatus: 'ACTIVE' } }, path: '/forms/about-kvk/staff-transferred' },
  { key: 'about_kvk.infrastructure', title: 'Infrastructure Details', category: 'About KVK', moduleCode: 'about_kvks_infrastructure_details', model: 'kvkInfrastructure', path: '/forms/about-kvk/infrastructure' },
  { key: 'about_kvk.vehicles', title: 'Vehicle Details', category: 'About KVK', moduleCode: 'about_kvks_vehicle_details', model: 'kvkVehicle', path: '/forms/about-kvk/vehicles' },
  { key: 'about_kvk.equipments', title: 'Equipment Details', category: 'About KVK', moduleCode: 'about_kvks_equipment_details', model: 'kvkEquipment', path: '/forms/about-kvk/equipments' },

  // ── Achievements ─────────────────────────────────────────────────────────
  { key: 'achievements.oft', title: 'On Farm Trials (OFT)', category: 'Achievements', moduleCode: 'achievements_oft', model: 'kvkoft', path: '/forms/achievements/oft' },
  { key: 'achievements.fld', title: 'Front Line Demonstrations (FLD)', category: 'Achievements', moduleCode: 'achievements_fld', model: 'kvkFldIntroduction', path: '/forms/achievements/fld' },
  { key: 'achievements.fld_extension_training', title: 'Extension & Training under FLD', category: 'Achievements', moduleCode: 'achievements_fld_extension_training', model: 'fldExtension', path: '/forms/achievements/fld/extension-training' },
  { key: 'achievements.fld_technical_feedback', title: 'Technical Feedback on FLD', category: 'Achievements', moduleCode: 'achievements_fld_technical_feedback', model: 'fldTechnicalFeedback', path: '/forms/achievements/fld/technical-feedback' },
  { key: 'achievements.trainings', title: 'Trainings', category: 'Achievements', moduleCode: 'achievements_trainings', model: 'trainingAchievement', path: '/forms/achievements/trainings' },
  { key: 'achievements.extension_activities', title: 'Extension Activities', category: 'Achievements', moduleCode: 'achievements_extension_activities', model: 'kvkExtensionActivity', path: '/forms/achievements/extension-activities' },
  { key: 'achievements.other_extension_activities', title: 'Other Extension Activities', category: 'Achievements', moduleCode: 'achievements_other_extension_activities', model: 'kvkOtherExtensionActivity', path: '/forms/achievements/other-extension' },
  { key: 'achievements.technology_week', title: 'Technology Week Celebration', category: 'Achievements', moduleCode: 'achievements_technology_week_celebration', model: 'kvkTechnologyWeekCelebration', path: '/forms/achievements/technology-week' },
  { key: 'achievements.celebration_days', title: 'Celebration Days', category: 'Achievements', moduleCode: 'achievements_celebration_days', model: 'kvkImportantDayCelebration', path: '/forms/achievements/celebration-days' },
  { key: 'achievements.production_supply', title: 'Production & Supply of Technological Products', category: 'Achievements', moduleCode: 'achievements_production_supply_tech_products', model: 'kvkProductionSupply', path: '/forms/achievements/production-supply' },
  { key: 'achievements.publications', title: 'Publication Details', category: 'Achievements', moduleCode: 'achievements_publications', model: 'kvkPublicationDetails', path: '/forms/achievements/publication-details' },
  { key: 'achievements.soil_equipment', title: 'Soil & Water Equipment', category: 'Achievements', subcategory: 'Soil & Water Testing', moduleCode: 'achievements_soil_water_testing', model: 'kkvSoilWaterEquipment', path: '/forms/achievements/soil-equipment' },
  { key: 'achievements.soil_analysis', title: 'Soil, Water and Plant Analysis', category: 'Achievements', subcategory: 'Soil & Water Testing', moduleCode: 'achievements_soil_water_testing', model: 'kkvSoilWaterAnalysis', path: '/forms/achievements/soil-analysis' },
  { key: 'achievements.world_soil_day', title: 'World Soil Day', category: 'Achievements', subcategory: 'Soil & Water Testing', moduleCode: 'achievements_soil_water_testing', model: 'kkvWorldSoilCelebration', path: '/forms/achievements/world-soil-day' },
  { key: 'achievements.awards_kvk', title: 'Awards (KVK)', category: 'Achievements', subcategory: 'Awards', moduleCode: 'achievements_award_recognition', model: 'kvkAward', path: '/forms/achievements/awards/kvk' },
  { key: 'achievements.awards_scientist', title: 'Awards (Scientist)', category: 'Achievements', subcategory: 'Awards', moduleCode: 'achievements_award_recognition', model: 'scientistAward', path: '/forms/achievements/awards/scientist' },
  { key: 'achievements.awards_farmer', title: 'Awards (Farmer)', category: 'Achievements', subcategory: 'Awards', moduleCode: 'achievements_award_recognition', model: 'farmerAward', path: '/forms/achievements/awards/farmer' },
  { key: 'achievements.hrd', title: 'Human Resource Development', category: 'Achievements', moduleCode: 'achievements_hrd', model: 'hrdProgram', path: '/forms/achievements/hrd' },

  // ── Projects (under Achievements) ────────────────────────────────────────
  { key: 'projects.cfld_technical', title: 'Technical Parameter', category: 'Projects', subcategory: 'CFLD', moduleCode: 'achievements_projects', model: 'cfldTechnicalParameter', path: '/forms/achievements/projects/cfld/technical-parameter' },
  { key: 'projects.cfld_extension', title: 'Extension Activity', category: 'Projects', subcategory: 'CFLD', moduleCode: 'achievements_projects', model: 'extensionActivityOrganized', path: '/forms/achievements/projects/cfld/extension-activity' },
  { key: 'projects.cfld_budget', title: 'Budget Utilization', category: 'Projects', subcategory: 'CFLD', moduleCode: 'achievements_projects', model: 'kvkBudgetUtilization', path: '/forms/achievements/projects/cfld/budget-utilization' },

  { key: 'projects.cra_details', title: 'CRA Details', category: 'Projects', subcategory: 'CRA', moduleCode: 'achievements_projects', model: 'craDetails', path: '/forms/achievements/projects/cra/details' },
  { key: 'projects.cra_extension', title: 'CRA Extension Activity', category: 'Projects', subcategory: 'CRA', moduleCode: 'achievements_projects', model: 'craExtensionActivity', path: '/forms/achievements/projects/cra/extension-activity' },

  { key: 'projects.fpo_details', title: 'FPO Details', category: 'Projects', subcategory: 'FPO', moduleCode: 'achievements_projects', model: 'fpoCbboDetails', path: '/forms/achievements/projects/fpo/details' },
  { key: 'projects.fpo_management', title: 'FPO Management', category: 'Projects', subcategory: 'FPO', moduleCode: 'achievements_projects', model: 'fpoManagement', path: '/forms/achievements/projects/fpo/management' },

  { key: 'projects.drmr_details', title: 'DRMR Details', category: 'Projects', subcategory: 'DRMR', moduleCode: 'achievements_projects', model: 'drmrDetails', path: '/forms/achievements/projects/drmr/details' },
  { key: 'projects.drmr_activity', title: 'DRMR Activity', category: 'Projects', subcategory: 'DRMR', moduleCode: 'achievements_projects', model: 'drmrActivity', path: '/forms/achievements/projects/drmr/activity' },

  { key: 'projects.nari_nutri_garden', title: 'Nutrition Garden', category: 'Projects', subcategory: 'NARI', moduleCode: 'achievements_projects', model: 'nariNutritionalGarden', path: '/forms/achievements/projects/nari/nutri-smart' },
  { key: 'projects.nari_bio_fortified', title: 'Bio-fortified Crops', category: 'Projects', subcategory: 'NARI', moduleCode: 'achievements_projects', model: 'nariBioFortifiedCrop', path: '/forms/achievements/projects/nari/bio-fortified' },
  { key: 'projects.nari_value_addition', title: 'Value Addition', category: 'Projects', subcategory: 'NARI', moduleCode: 'achievements_projects', model: 'nariValueAddition', path: '/forms/achievements/projects/nari/value-addition' },
  { key: 'projects.nari_training', title: 'Training Programmes', category: 'Projects', subcategory: 'NARI', moduleCode: 'achievements_projects', model: 'nariTrainingProgramme', path: '/forms/achievements/projects/nari/training-programm' },
  { key: 'projects.nari_extension', title: 'Extension Activities', category: 'Projects', subcategory: 'NARI', moduleCode: 'achievements_projects', model: 'nariExtensionActivity', path: '/forms/achievements/projects/nari/extension-activities' },

  { key: 'projects.arya_current', title: 'ARYA Current Year', category: 'Projects', subcategory: 'ARYA', moduleCode: 'achievements_projects', model: 'aryaCurrentYear', path: '/forms/achievements/projects/arya' },
  { key: 'projects.arya_previous', title: 'ARYA Previous Year', category: 'Projects', subcategory: 'ARYA', moduleCode: 'achievements_projects', model: 'aryaPrevYear', path: '/forms/achievements/projects/arya-evaluation' },

  { key: 'projects.csisa', title: 'CSISA', category: 'Projects', subcategory: 'CSISA', moduleCode: 'achievements_projects', model: 'csisa', path: '/forms/achievements/projects/csisa' },
  { key: 'projects.tsp_scsp', title: 'TSP/SCSP Activities', category: 'Projects', subcategory: 'TSP/SCSP', moduleCode: 'achievements_projects', model: 'tspScsp', path: '/forms/achievements/projects/sub-plan-activity' },

  { key: 'projects.nicra_basic', title: 'NICRA Basic Information', category: 'Projects', subcategory: 'NICRA', moduleCode: 'achievements_projects', model: 'nicraBasicInfo', path: '/forms/achievements/projects/nicra/basic-information' },
  { key: 'projects.nicra_details', title: 'NICRA Details', category: 'Projects', subcategory: 'NICRA', moduleCode: 'achievements_projects', model: 'nicraDetails', path: '/forms/achievements/projects/nicra/details' },
  { key: 'projects.nicra_training', title: 'NICRA Training', category: 'Projects', subcategory: 'NICRA', moduleCode: 'achievements_projects', model: 'nicraTraining', path: '/forms/achievements/projects/nicra/training' },
  { key: 'projects.nicra_extension', title: 'NICRA Extension Activity', category: 'Projects', subcategory: 'NICRA', moduleCode: 'achievements_projects', model: 'nicraExtensionActivity', path: '/forms/achievements/projects/nicra/extension-activity' },
  { key: 'projects.nicra_intervention', title: 'Intervention', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraIntervention', path: '/forms/achievements/projects/nicra/others/intervention' },
  { key: 'projects.nicra_revenue', title: 'Revenue Generated', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraRevenueGenerated', path: '/forms/achievements/projects/nicra/others/revenue-generated' },
  { key: 'projects.nicra_farm_implement', title: 'Custom Hiring of Farm-Implement', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraFarmImplement', path: '/forms/achievements/projects/nicra/others/custom-hiring' },
  { key: 'projects.nicra_vcrmc', title: 'Village VCRMC', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraVcrmc', path: '/forms/achievements/projects/nicra/others/vcrmc' },
  { key: 'projects.nicra_soil_health', title: 'Soil Health Card', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraSoilHealthCard', path: '/forms/achievements/projects/nicra/others/soil-health-card' },
  { key: 'projects.nicra_convergence', title: 'Convergence Programme', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraConvergenceProgramme', path: '/forms/achievements/projects/nicra/others/convergence-programme' },
  { key: 'projects.nicra_dignitaries', title: 'Dignitaries Visited', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraDignitariesVisited', path: '/forms/achievements/projects/nicra/others/dignitaries-visited' },
  { key: 'projects.nicra_pi_copi', title: 'PI & Co-PI List', category: 'Projects', subcategory: 'NICRA Others', moduleCode: 'achievements_projects', model: 'nicraPiCopi', path: '/forms/achievements/projects/nicra/others/pi-copi-list' },

  { key: 'projects.nf_geographical', title: 'Geographical Information', category: 'Projects', subcategory: 'Natural Farming', moduleCode: 'achievements_projects', model: 'geographicalInfo', path: '/forms/achievements/projects/natural-farming/geographical-information' },
  { key: 'projects.nf_physical', title: 'Physical Information', category: 'Projects', subcategory: 'Natural Farming', moduleCode: 'achievements_projects', model: 'physicalInfo', path: '/forms/achievements/projects/natural-farming/physical-information' },
  { key: 'projects.nf_demonstration', title: 'Demonstration Information', category: 'Projects', subcategory: 'Natural Farming', moduleCode: 'achievements_projects', model: 'demonstrationInfo', path: '/forms/achievements/projects/natural-farming/demonstration-information' },
  { key: 'projects.nf_farmers', title: 'Farmers Practicing', category: 'Projects', subcategory: 'Natural Farming', moduleCode: 'achievements_projects', model: 'farmersPracticingNaturalFarming', path: '/forms/achievements/projects/natural-farming/farmers-practicing' },
  { key: 'projects.nf_beneficiaries', title: 'Beneficiaries', category: 'Projects', subcategory: 'Natural Farming', moduleCode: 'achievements_projects', model: 'beneficiariesDetails', path: '/forms/achievements/projects/natural-farming/beneficiaries' },
  { key: 'projects.nf_soil_data', title: 'Soil Data', category: 'Projects', subcategory: 'Natural Farming', moduleCode: 'achievements_projects', model: 'soilDataInformation', path: '/forms/achievements/projects/natural-farming/soil-data' },
  { key: 'projects.nf_budget', title: 'Budget Expenditure', category: 'Projects', subcategory: 'Natural Farming', moduleCode: 'achievements_projects', model: 'financialInformation', path: '/forms/achievements/projects/natural-farming/budget-expenditure' },

  { key: 'projects.agri_drone', title: 'Agri-Drone Introduction', category: 'Projects', subcategory: 'Agri-Drone', moduleCode: 'achievements_projects', model: 'kvkAgriDrone', path: '/forms/achievements/projects/agri-drone' },
  { key: 'projects.agri_drone_demo', title: 'Agri-Drone Demonstration', category: 'Projects', subcategory: 'Agri-Drone', moduleCode: 'achievements_projects', model: 'kvkAgriDroneDemonstration', path: '/forms/achievements/projects/demonstration-details' },

  { key: 'projects.seed_hub', title: 'Seed Hub Program', category: 'Projects', subcategory: 'Seed Hub', moduleCode: 'achievements_projects', model: 'kvkSeedHubProgram', path: '/forms/achievements/projects/seed-hub-program' },
  { key: 'projects.other_programme', title: 'Other Programmes', category: 'Projects', subcategory: 'Other', moduleCode: 'achievements_projects', model: 'kvkOtherProgramme', path: '/forms/achievements/other-program' },

  // ── Performance Indicators ───────────────────────────────────────────────
  { key: 'performance.impact_kvk', title: 'Impact of KVK Activities', category: 'Performance Indicators', subcategory: 'Impact', moduleCode: 'performance_indicators_impact', model: 'kvkImpactActivity', path: '/forms/performance/impact/kvk-activities' },
  { key: 'performance.impact_entrepreneurship', title: 'Entrepreneurship', category: 'Performance Indicators', subcategory: 'Impact', moduleCode: 'performance_indicators_impact', model: 'entrepreneurship', path: '/forms/performance/impact/entrepreneurship' },
  { key: 'performance.impact_success_stories', title: 'Success Stories', category: 'Performance Indicators', subcategory: 'Impact', moduleCode: 'performance_indicators_impact', model: 'successStory', path: '/forms/performance/impact/success-stories' },

  { key: 'performance.district_level', title: 'District Level Data', category: 'Performance Indicators', subcategory: 'District & Village', moduleCode: 'performance_indicators_district_village', model: 'districtLevelData', path: '/forms/performance/district-village/district-level' },
  { key: 'performance.operational_area', title: 'Operational Area', category: 'Performance Indicators', subcategory: 'District & Village', moduleCode: 'performance_indicators_district_village', model: 'operationalArea', path: '/forms/performance/district-village/operational-area' },
  { key: 'performance.village_adoption', title: 'Village Adoption', category: 'Performance Indicators', subcategory: 'District & Village', moduleCode: 'performance_indicators_district_village', model: 'villageAdoption', path: '/forms/performance/district-village/village-adoption' },
  { key: 'performance.priority_thrust', title: 'Priority Thrust Area', category: 'Performance Indicators', subcategory: 'District & Village', moduleCode: 'performance_indicators_district_village', model: 'priorityThrustArea', path: '/forms/performance/district-village/priority-thrust' },

  { key: 'performance.demonstration_units', title: 'Demonstration Units', category: 'Performance Indicators', subcategory: 'Infrastructure', moduleCode: 'performance_indicators_infrastructure', model: 'demonstrationUnit', path: '/forms/performance/infrastructure/demonstration-units' },
  { key: 'performance.instructional_crops', title: 'Instructional Farm (Crops)', category: 'Performance Indicators', subcategory: 'Infrastructure', moduleCode: 'performance_indicators_infrastructure', model: 'instructionalFarmCrop', path: '/forms/performance/infrastructure/instructional-farm-crops' },
  { key: 'performance.production_units', title: 'Production Units', category: 'Performance Indicators', subcategory: 'Infrastructure', moduleCode: 'performance_indicators_infrastructure', model: 'productionUnit', path: '/forms/performance/infrastructure/production-units' },
  { key: 'performance.instructional_livestock', title: 'Instructional Farm (Livestock)', category: 'Performance Indicators', subcategory: 'Infrastructure', moduleCode: 'performance_indicators_infrastructure', model: 'instructionalFarmLivestock', path: '/forms/performance/infrastructure/instructional-farm-livestock' },
  { key: 'performance.hostel', title: 'Hostel Facilities', category: 'Performance Indicators', subcategory: 'Infrastructure', moduleCode: 'performance_indicators_infrastructure', model: 'hostelUtilization', path: '/forms/performance/infrastructure/hostel' },
  { key: 'performance.staff_quarters', title: 'Staff Quarters', category: 'Performance Indicators', subcategory: 'Infrastructure', moduleCode: 'performance_indicators_infrastructure', model: 'staffQuartersUtilization', path: '/forms/performance/infrastructure/staff-quarters' },
  { key: 'performance.rainwater', title: 'Rain Water Harvesting', category: 'Performance Indicators', subcategory: 'Infrastructure', moduleCode: 'performance_indicators_infrastructure', model: 'rainwaterHarvesting', path: '/forms/performance/infrastructure/rainwater-harvesting' },

  { key: 'performance.budget_details', title: 'Budget Details', category: 'Performance Indicators', subcategory: 'Financial', moduleCode: 'performance_indicators_financial', model: 'budgetDetail', path: '/forms/performance/financial/budget-details' },
  { key: 'performance.project_budget', title: 'Project-wise Budget', category: 'Performance Indicators', subcategory: 'Financial', moduleCode: 'performance_indicators_financial', model: 'projectBudget', path: '/forms/performance/financial/project-budget' },
  { key: 'performance.revolving_fund', title: 'Revolving Fund', category: 'Performance Indicators', subcategory: 'Financial', moduleCode: 'performance_indicators_financial', model: 'revolvingFund', path: '/forms/performance/financial/revolving-fund' },
  { key: 'performance.revenue_generation', title: 'Revenue Generation', category: 'Performance Indicators', subcategory: 'Financial', moduleCode: 'performance_indicators_financial', model: 'revenueGeneration', path: '/forms/performance/financial/revenue-generation' },
  { key: 'performance.resource_generation', title: 'Resource Generation', category: 'Performance Indicators', subcategory: 'Financial', moduleCode: 'performance_indicators_financial', model: 'resourceGeneration', path: '/forms/performance/financial/resource-generation' },

  { key: 'performance.functional_linkage', title: 'Functional Linkage', category: 'Performance Indicators', subcategory: 'Linkages', moduleCode: 'performance_indicators_linkages', model: 'functionalLinkage', path: '/forms/performance/linkages/functional-linkage' },

  // ── Miscellaneous ────────────────────────────────────────────────────────
  { key: 'misc.diseases_crops', title: 'Prevalent Diseases (Crops)', category: 'Miscellaneous', moduleCode: 'misc_prevalent_diseases_crops', model: 'prevalentDiseasesInCrop', path: '/forms/miscellaneous/diseases/crops' },
  { key: 'misc.diseases_livestock', title: 'Prevalent Diseases (Livestock)', category: 'Miscellaneous', moduleCode: 'misc_prevalent_diseases_livestock', model: 'prevalentDiseasesOnLivestock', path: '/forms/miscellaneous/diseases/livestock' },
  { key: 'misc.nyk_training', title: 'Nehru Yuva Kendra', category: 'Miscellaneous', moduleCode: 'misc_nyk_training', model: 'nykTraining', path: '/forms/miscellaneous/nehru-yuva-kendra' },
  { key: 'misc.ppv_fra_training', title: 'PPV & FRA Training', category: 'Miscellaneous', moduleCode: 'misc_ppv_fra_training', model: 'ppvFraTraining', path: '/forms/miscellaneous/ppv-fra/training' },
  { key: 'misc.ppv_fra_plants', title: 'PPV & FRA Plant Varieties', category: 'Miscellaneous', moduleCode: 'misc_ppv_fra_training', model: 'ppvFraPlantVarieties', path: '/forms/miscellaneous/ppv-fra/plant-varieties' },
  { key: 'misc.rawe_fet', title: 'RAWE/FET Programme', category: 'Miscellaneous', moduleCode: 'misc_rawe_fet', model: 'raweFetFitProgramme', path: '/forms/miscellaneous/rawe-fet' },
  { key: 'misc.vip_visitors', title: 'VIP Visitors', category: 'Miscellaneous', moduleCode: 'misc_vip_visitors', model: 'vipVisitor', path: '/forms/miscellaneous/vip-visitors' },

  // ── Digital Information ──────────────────────────────────────────────────
  { key: 'digital.mobile_app', title: 'Mobile App', category: 'Digital Information', moduleCode: 'digital_mobile_app', model: 'mobileApp', path: '/forms/digital-information/mobile-app' },
  { key: 'digital.web_portal', title: 'Web Portal', category: 'Digital Information', moduleCode: 'digital_web_portal', model: 'webPortal', path: '/forms/digital-information/web-portal' },
  { key: 'digital.kisan_sarathi', title: 'Kisan Sarathi', category: 'Digital Information', moduleCode: 'digital_kisan_sarthi', model: 'kisanSarathi', path: '/forms/digital-information/kisan-sarathi' },
  { key: 'digital.kisan_advisory', title: 'Kisan Mobile Advisory', category: 'Digital Information', moduleCode: 'digital_kisan_advisory', model: 'kmas', path: '/forms/digital-information/kisan-mobile-advisory' },
  { key: 'digital.other_channels', title: 'Other Channels', category: 'Digital Information', moduleCode: 'digital_messages_other_channels', model: 'msgDetails', path: '/forms/digital-information/other-channels' },

  // ── Swachhta Bharat Abhiyaan ─────────────────────────────────────────────
  { key: 'swachh.sewa', title: 'Swachhta hi Sewa', category: 'Swachhta Bharat Abhiyaan', moduleCode: 'swachh_observation_sewa', model: 'swachhtaHiSewa', path: '/forms/swachhta-bharat-abhiyaan/sewa' },
  { key: 'swachh.pakhwada', title: 'Swachhta Pakhwada', category: 'Swachhta Bharat Abhiyaan', moduleCode: 'swachh_pakhwada', model: 'swachhtaPakhwada', path: '/forms/swachhta-bharat-abhiyaan/pakhwada' },
  { key: 'swachh.budget', title: 'Budget Expenditure', category: 'Swachhta Bharat Abhiyaan', moduleCode: 'swachh_budget_expenditure', model: 'swachhQuarterlyExpenditure', path: '/forms/swachhta-bharat-abhiyaan/budget' },

  // ── Meetings ─────────────────────────────────────────────────────────────
  { key: 'meetings.sac', title: 'SAC Meetings', category: 'Meetings', moduleCode: 'meetings_sac', model: 'sacMeeting', path: '/forms/meetings/sac' },
  { key: 'meetings.other', title: 'Other Meetings', category: 'Meetings', moduleCode: 'meetings_other_atari', model: 'atariMeeting', path: '/forms/meetings/other' },
];

// Order used for stable category rendering on the frontend.
const CATEGORY_ORDER = [
  'About KVK',
  'Achievements',
  'Projects',
  'Performance Indicators',
  'Miscellaneous',
  'Digital Information',
  'Swachhta Bharat Abhiyaan',
  'Meetings',
];

module.exports = { REGISTRY, CATEGORY_ORDER };
