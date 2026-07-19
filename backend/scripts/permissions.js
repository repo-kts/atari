#!/usr/bin/env node
/**
 * Seed modules, permission actions (VIEW/ADD/EDIT/DELETE), and assign permissions to roles.
 * Run: node scripts/permissions.js   or   npm run seed:permissions
 */
require('dotenv').config();
const prisma = require('../config/prisma.js');

const PERMISSION_ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'];

const MODULES = [
  { menuName: 'All Masters', subMenuName: 'Zone Master', moduleCode: 'all_masters_zone_master' },
  { menuName: 'All Masters', subMenuName: 'States Master', moduleCode: 'all_masters_states_master' },
  { menuName: 'All Masters', subMenuName: 'Organization Master', moduleCode: 'all_masters_organization_master' },
  { menuName: 'All Masters', subMenuName: 'Districts Master', moduleCode: 'all_masters_districts_master' },
  { menuName: 'All Masters', subMenuName: 'University Master', moduleCode: 'all_masters_university_master' },
  { menuName: 'All Masters', subMenuName: 'KVK Master', moduleCode: 'all_masters_kvks' },
  { menuName: 'All Masters', subMenuName: 'OFT Master', moduleCode: 'all_masters_oft_master' },
  { menuName: 'All Masters', subMenuName: 'FLD Master', moduleCode: 'all_masters_fld_master' },
  { menuName: 'All Masters', subMenuName: 'CFLD Master', moduleCode: 'all_masters_cfld_master' },
  { menuName: 'All Masters', subMenuName: 'Training Master', moduleCode: 'all_masters_training_master' },
  { menuName: 'All Masters', subMenuName: 'Extension Activity Master', moduleCode: 'all_masters_extension_activity_master' },
  { menuName: 'All Masters', subMenuName: 'Other Extension Activity Master', moduleCode: 'all_masters_other_extension_activity_master' },
  { menuName: 'All Masters', subMenuName: 'Events Master', moduleCode: 'all_masters_events_master' },
  { menuName: 'All Masters', subMenuName: 'Products Master', moduleCode: 'all_masters_products_master' },
  { menuName: 'All Masters', subMenuName: 'Agri-Drone Master', moduleCode: 'all_masters_agri_drone_master' },
  { menuName: 'All Masters', subMenuName: 'Climate Master', moduleCode: 'all_masters_climate_master' },
  { menuName: 'All Masters', subMenuName: 'ARYA Master', moduleCode: 'all_masters_arya_master' },
  { menuName: 'All Masters', subMenuName: 'TSP/SCSP Master', moduleCode: 'all_masters_tsp_scsp_master' },
  { menuName: 'All Masters', subMenuName: 'Natural Farming Master', moduleCode: 'all_masters_natural_farming_master' },
  { menuName: 'All Masters', subMenuName: 'Publication Master', moduleCode: 'all_masters_publication_master' },
  { menuName: 'Role Management', subMenuName: 'Roles', moduleCode: 'role_management_roles' },
  { menuName: 'User Management', subMenuName: 'Users', moduleCode: 'user_management_users' },
  { menuName: 'About KVKs', subMenuName: 'View KVKs', moduleCode: 'about_kvks_view_kvks' },
  { menuName: 'About KVKs', subMenuName: 'Bank Account Details', moduleCode: 'about_kvks_bank_account_details' },
  { menuName: 'About KVKs', subMenuName: 'Employee Details', moduleCode: 'about_kvks_employee_details' },
  { menuName: 'About KVKs', subMenuName: 'Staff Details', moduleCode: 'about_kvks_staff_details' },
  { menuName: 'About KVKs', subMenuName: 'Infrastructure Details', moduleCode: 'about_kvks_infrastructure_details' },
  { menuName: 'About KVKs', subMenuName: 'Land Details', moduleCode: 'about_kvks_land_details' },
  { menuName: 'About KVKs', subMenuName: 'View Vehicles', moduleCode: 'about_kvks_view_vehicles' },
  { menuName: 'About KVKs', subMenuName: 'Vehicle Details', moduleCode: 'about_kvks_vehicle_details' },
  { menuName: 'About KVKs', subMenuName: 'View Equipments', moduleCode: 'about_kvks_view_equipments' },
  { menuName: 'About KVKs', subMenuName: 'Equipment Details', moduleCode: 'about_kvks_equipment_details' },
  { menuName: 'Achievements', subMenuName: 'Technical Achievement Summary', moduleCode: 'achievements_technical_achievement_summary' },
  { menuName: 'Achievements', subMenuName: 'OFT', moduleCode: 'achievements_oft' },
  { menuName: 'Achievements', subMenuName: 'FLD', moduleCode: 'achievements_fld' },
  { menuName: 'Achievements', subMenuName: 'Extension & Training activities under FLD', moduleCode: 'achievements_fld_extension_training' },
  { menuName: 'Achievements', subMenuName: 'Technical Feedback on FLD', moduleCode: 'achievements_fld_technical_feedback' },
  { menuName: 'Achievements', subMenuName: 'Trainings', moduleCode: 'achievements_trainings' },
  { menuName: 'Achievements', subMenuName: 'Extension Activities', moduleCode: 'achievements_extension_activities' },
  { menuName: 'Achievements', subMenuName: 'Other Extension Activities', moduleCode: 'achievements_other_extension_activities' },
  { menuName: 'Achievements', subMenuName: 'Technology Week Celebration', moduleCode: 'achievements_technology_week_celebration' },
  { menuName: 'Achievements', subMenuName: 'Celebration days', moduleCode: 'achievements_celebration_days' },
  { menuName: 'Achievements', subMenuName: 'Production and supply of Technological products', moduleCode: 'achievements_production_supply_tech_products' },
  { menuName: 'Achievements', subMenuName: 'Soil, Water and Plant analysis', moduleCode: 'achievements_soil_water_testing' },
  { menuName: 'Achievements', subMenuName: 'World Soil Day', moduleCode: 'achievements_world_soil_day' },
  { menuName: 'Achievements', subMenuName: 'Projects', moduleCode: 'achievements_projects' },
  { menuName: 'Achievements', subMenuName: 'Publications', moduleCode: 'achievements_publications' },
  { menuName: 'Achievements', subMenuName: 'Awards (KVK)', moduleCode: 'achievements_award_recognition' },
  { menuName: 'Achievements', subMenuName: 'Scientist Award', moduleCode: 'achievements_award_scientist' },
  { menuName: 'Achievements', subMenuName: 'Farmer Award', moduleCode: 'achievements_award_farmer' },
  { menuName: 'Achievements', subMenuName: 'Human Resource Development', moduleCode: 'achievements_hrd' },
  { menuName: 'Performance Indicators', subMenuName: 'Impact of KVK activities', moduleCode: 'performance_indicators_impact' },
  { menuName: 'Performance Indicators', subMenuName: 'Entrepreneurship', moduleCode: 'performance_indicators_entrepreneurship' },
  { menuName: 'Performance Indicators', subMenuName: 'Success Stories', moduleCode: 'performance_indicators_success_stories' },
  { menuName: 'Performance Indicators', subMenuName: 'District Level Data', moduleCode: 'performance_indicators_district_level_data' },
  { menuName: 'Performance Indicators', subMenuName: 'Operational Area Details', moduleCode: 'performance_indicators_operational_area' },
  { menuName: 'Performance Indicators', subMenuName: 'Village Adoption Programme', moduleCode: 'performance_indicators_village_adoption' },
  { menuName: 'Performance Indicators', subMenuName: 'Priority Thrust Area', moduleCode: 'performance_indicators_priority_thrust_area' },
  { menuName: 'Performance Indicators', subMenuName: 'Demonstration Units', moduleCode: 'performance_indicators_demonstration_units' },
  { menuName: 'Performance Indicators', subMenuName: 'Instructional Farm (crops)', moduleCode: 'performance_indicators_instructional_farm_crops' },
  { menuName: 'Performance Indicators', subMenuName: 'Production Units', moduleCode: 'performance_indicators_production_units' },
  { menuName: 'Performance Indicators', subMenuName: 'Instructional Farm (livestock)', moduleCode: 'performance_indicators_instructional_farm_livestock' },
  { menuName: 'Performance Indicators', subMenuName: 'Hostel Facilities', moduleCode: 'performance_indicators_hostel_facilities' },
  { menuName: 'Performance Indicators', subMenuName: 'Staff Quarters', moduleCode: 'performance_indicators_staff_quarters' },
  { menuName: 'Performance Indicators', subMenuName: 'Rain Water Harvesting', moduleCode: 'performance_indicators_rainwater_harvesting' },
  { menuName: 'Performance Indicators', subMenuName: 'Budget Details', moduleCode: 'performance_indicators_budget_details' },
  { menuName: 'Performance Indicators', subMenuName: 'Project-wise Budget', moduleCode: 'performance_indicators_project_budget' },
  { menuName: 'Performance Indicators', subMenuName: 'Revolving Fund Status', moduleCode: 'performance_indicators_revolving_fund' },
  { menuName: 'Performance Indicators', subMenuName: 'Revenue generation', moduleCode: 'performance_indicators_revenue_generation' },
  { menuName: 'Performance Indicators', subMenuName: 'Resource Generation', moduleCode: 'performance_indicators_resource_generation' },
  { menuName: 'Performance Indicators', subMenuName: 'Functional Linkage', moduleCode: 'performance_indicators_linkages' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Prevalent Diseases in Crops', moduleCode: 'misc_prevalent_diseases_crops' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Prevalent Diseases in Livestock', moduleCode: 'misc_prevalent_diseases_livestock' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Poshan Maah', moduleCode: 'misc_poshan_maah' },
  { menuName: 'Miscellaneous Information', subMenuName: 'PPV & FRA Sensitization Training Programme', moduleCode: 'misc_ppv_fra_training' },
  { menuName: 'Miscellaneous Information', subMenuName: 'RAWE/FET Programme', moduleCode: 'misc_rawe_fet' },
  { menuName: 'Miscellaneous Information', subMenuName: 'List of VIP Visitors', moduleCode: 'misc_vip_visitors' },
  { menuName: 'Digital Information', subMenuName: 'Details of Mobile App', moduleCode: 'digital_mobile_app' },
  { menuName: 'Digital Information', subMenuName: 'Details of Web Portal', moduleCode: 'digital_web_portal' },
  { menuName: 'Digital Information', subMenuName: 'Details of Kisan Sarthi', moduleCode: 'digital_kisan_sarthi' },
  { menuName: 'Digital Information', subMenuName: 'Kisan Mobile Advisory Services/KMAS', moduleCode: 'digital_kisan_advisory' },
  { menuName: 'Digital Information', subMenuName: 'Details of Messages Send Through Other Channels', moduleCode: 'digital_messages_other_channels' },
  { menuName: 'Swachh Bharat Abhiyaan', subMenuName: 'Observation of Swachhta hi Sewa SBA', moduleCode: 'swachh_observation_sewa' },
  { menuName: 'Swachh Bharat Abhiyaan', subMenuName: 'Observation of Swachta Pakhwada', moduleCode: 'swachh_pakhwada' },
  { menuName: 'Swachh Bharat Abhiyaan', subMenuName: 'Details of Quarterly Budget Expenditure on Swachh Activities', moduleCode: 'swachh_budget_expenditure' },
  { menuName: 'Meetings', subMenuName: 'Details of Scientific Advisory Committee(SAC) Meetings', moduleCode: 'meetings_sac' },
  { menuName: 'Meetings', subMenuName: 'Details of Other Meeting Related to ATARI', moduleCode: 'meetings_other_atari' },
  { menuName: 'All Masters', subMenuName: 'Season Master', moduleCode: 'all_masters_season_master' },
  { menuName: 'All Masters', subMenuName: 'Unit Master', moduleCode: 'all_masters_unit_master' },
  { menuName: 'All Masters', subMenuName: 'Sanctioned Post Master', moduleCode: 'all_masters_sanctioned_post_master' },
  { menuName: 'All Masters', subMenuName: 'Staff Category Master', moduleCode: 'all_masters_staff_category_master' },
  { menuName: 'All Masters', subMenuName: 'Job Type Master', moduleCode: 'all_masters_job_type_master' },
  { menuName: 'All Masters', subMenuName: 'Bank Account Type Master', moduleCode: 'all_masters_bank_account_type_master' },
  { menuName: 'All Masters', subMenuName: 'Pay Level Master', moduleCode: 'all_masters_pay_level_master' },
  { menuName: 'All Masters', subMenuName: 'Pay Scale Master', moduleCode: 'all_masters_pay_scale_master' },
  { menuName: 'All Masters', subMenuName: 'Funding Source Master', moduleCode: 'all_masters_asset_funding_source_master' },
  { menuName: 'All Masters', subMenuName: 'Equipment Type Master', moduleCode: 'all_masters_equipment_type_master' },
  { menuName: 'All Masters', subMenuName: 'Equipment Master', moduleCode: 'all_masters_equipment_master' },
  { menuName: 'All Masters', subMenuName: 'Discipline Master', moduleCode: 'all_masters_discipline_master' },
  { menuName: 'All Masters', subMenuName: 'Crop Type Master', moduleCode: 'all_masters_crop_type_master' },
  { menuName: 'All Masters', subMenuName: 'Infrastructure Master', moduleCode: 'all_masters_infrastructure_master' },
  { menuName: 'All Masters', subMenuName: 'CFLD Budget Item Master', moduleCode: 'all_masters_budget_item_master' },
  { menuName: 'All Masters', subMenuName: 'Soil Water Analysis Master', moduleCode: 'all_masters_soil_water_analysis_master' },
  { menuName: 'All Masters', subMenuName: 'NARI Activity Master', moduleCode: 'all_masters_nari_activity_master' },
  { menuName: 'All Masters', subMenuName: 'NARI Nutrition Garden Type Master', moduleCode: 'all_masters_nari_garden_type_master' },
  { menuName: 'All Masters', subMenuName: 'NICRA Master', moduleCode: 'all_masters_nicra_master' },
  { menuName: 'All Masters', subMenuName: 'Impact Specific Area Master', moduleCode: 'all_masters_impact_area_master' },
  { menuName: 'All Masters', subMenuName: 'Enterprise Type Master', moduleCode: 'all_masters_enterprise_type_master' },
  { menuName: 'All Masters', subMenuName: 'Account Type Master', moduleCode: 'all_masters_account_type_master' },
  { menuName: 'All Masters', subMenuName: 'Programme Type Master', moduleCode: 'all_masters_programme_type_master' },
  { menuName: 'All Masters', subMenuName: 'PPV & FRA Training Type Master', moduleCode: 'all_masters_ppv_fra_training_type_master' },
  { menuName: 'All Masters', subMenuName: 'Dignitary Type Master', moduleCode: 'all_masters_dignitary_type_master' },
  { menuName: 'All Masters', subMenuName: 'Financial Performance Project Master', moduleCode: 'all_masters_financial_project_master' },
  { menuName: 'All Masters', subMenuName: 'Vehicle Present Status Master', moduleCode: 'all_masters_vehicle_present_status_master' },
  { menuName: 'All Masters', subMenuName: 'Equipment Present Status Master', moduleCode: 'all_masters_equipment_present_status_master' },
  { menuName: 'Form Management', subMenuName: 'Success Stories', moduleCode: 'form_management_success_stories' },
  { menuName: 'Module Images', subMenuName: '—', moduleCode: 'module_images' },
  { menuName: 'Targets', subMenuName: '—', moduleCode: 'targets' },
  { menuName: 'Log History', subMenuName: '—', moduleCode: 'log_history' },
  { menuName: 'Notifications', subMenuName: '—', moduleCode: 'notifications' },
  { menuName: 'Reports', subMenuName: '—', moduleCode: 'reports' },
  { menuName: 'Form Summary', subMenuName: '—', moduleCode: 'form_summary_status' },
  { menuName: 'User Scope', subMenuName: 'User Actions', moduleCode: 'USER_SCOPE' },
];

// The 20 granular Performance Indicator pages (replaces the old 5 umbrella
// codes — each page now gets its own permission row, matching how every
// other Form Management section already works).
const PI_MODULE_CODES = [
  'performance_indicators_impact', 'performance_indicators_entrepreneurship', 'performance_indicators_success_stories',
  'performance_indicators_district_level_data', 'performance_indicators_operational_area', 'performance_indicators_village_adoption', 'performance_indicators_priority_thrust_area',
  'performance_indicators_demonstration_units', 'performance_indicators_instructional_farm_crops', 'performance_indicators_production_units', 'performance_indicators_instructional_farm_livestock', 'performance_indicators_hostel_facilities', 'performance_indicators_staff_quarters', 'performance_indicators_rainwater_harvesting',
  'performance_indicators_budget_details', 'performance_indicators_project_budget', 'performance_indicators_revolving_fund', 'performance_indicators_revenue_generation', 'performance_indicators_resource_generation',
  'performance_indicators_linkages',
];

// Shared modules for _user roles (ceiling pattern). kvk_user gets these; other _user roles get these + 'reports'.
const BASE_USER_MODULES = [
  'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details',
  'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_land_details',
  'about_kvks_view_vehicles', 'about_kvks_vehicle_details',
  'about_kvks_view_equipments', 'about_kvks_equipment_details',
  'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld',
  'achievements_fld_extension_training', 'achievements_fld_technical_feedback',
  'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities',
  'achievements_technology_week_celebration', 'achievements_celebration_days',
  'achievements_production_supply_tech_products', 'achievements_soil_water_testing', 'achievements_world_soil_day',
  'achievements_projects', 'achievements_publications', 'achievements_award_recognition', 'achievements_award_scientist', 'achievements_award_farmer',
  'achievements_hrd', ...PI_MODULE_CODES,
  'misc_prevalent_diseases_crops', 'misc_prevalent_diseases_livestock',
  'misc_poshan_maah', 'misc_ppv_fra_training', 'misc_rawe_fet', 'misc_vip_visitors',
  'digital_mobile_app', 'digital_web_portal', 'digital_kisan_sarthi', 'digital_kisan_advisory',
  'digital_messages_other_channels', 'swachh_observation_sewa', 'swachh_pakhwada',
  'swachh_budget_expenditure', 'meetings_sac', 'meetings_other_atari', 'all_masters_nicra_master', 'all_masters_natural_farming_master', 'module_images', 'notifications', 'form_summary_status',
];

const USER_ACTIONS = PERMISSION_ACTIONS;

const ROLE_PERMISSIONS = {
  super_admin: { permissions: 'ALL' },
  // zone/state/district/org admin: PI access today is VIEW-only in practice
  // (performanceXRoutes.js gate GET behind `allRoles` but POST/PUT/DELETE
  // behind kvk-only + super_admin — never behind this permissions config).
  // Split into a full-CRUD block for what they actually manage, plus a
  // VIEW-only block for PI so requirePermission matches real current access.
  zone_admin: {
    permissions: [
      {
        modules: ['all_masters_zone_master', 'all_masters_states_master', 'all_masters_districts_master', 'all_masters_organization_master', 'all_masters_university_master', 'all_masters_kvks', 'all_masters_nicra_master', 'all_masters_impact_area_master', 'all_masters_enterprise_type_master', 'all_masters_account_type_master', 'all_masters_programme_type_master', 'all_masters_ppv_fra_training_type_master', 'all_masters_dignitary_type_master', 'user_management_users', 'role_management_roles', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_land_details', 'about_kvks_view_vehicles', 'about_kvks_vehicle_details', 'about_kvks_view_equipments', 'about_kvks_equipment_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
        actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
      },
      { modules: [...PI_MODULE_CODES], actions: ['VIEW'] },
    ],
  },
  state_admin: {
    permissions: [
      {
        modules: ['all_masters_states_master', 'all_masters_districts_master', 'all_masters_organization_master', 'all_masters_university_master', 'all_masters_kvks', 'all_masters_nicra_master', 'all_masters_impact_area_master', 'all_masters_enterprise_type_master', 'all_masters_account_type_master', 'all_masters_programme_type_master', 'all_masters_ppv_fra_training_type_master', 'all_masters_dignitary_type_master', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
        actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
      },
      { modules: [...PI_MODULE_CODES], actions: ['VIEW'] },
    ],
  },
  district_admin: {
    permissions: [
      {
        modules: ['all_masters_districts_master', 'all_masters_kvks', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_employee_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
        actions: ['VIEW', 'ADD', 'EDIT'],
      },
      { modules: [...PI_MODULE_CODES], actions: ['VIEW'] },
    ],
  },
  org_admin: {
    permissions: [
      {
        modules: ['all_masters_organization_master', 'all_masters_kvks', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_employee_details', 'achievements_technical_achievement_summary', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
        actions: ['VIEW', 'ADD', 'EDIT'],
      },
      { modules: [...PI_MODULE_CODES], actions: ['VIEW'] },
    ],
  },
  host_admin: {
    permissions: {
      modules: ['all_masters_university_master', 'all_masters_kvks', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_employee_details', 'achievements_technical_achievement_summary', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
  kvk_admin: {
    permissions: {
      modules: [
        'all_masters_zone_master', 'all_masters_states_master', 'all_masters_organization_master', 'all_masters_districts_master', 'all_masters_university_master', 'all_masters_kvks',
        'all_masters_oft_master', 'all_masters_fld_master', 'all_masters_cfld_master', 'all_masters_training_master', 'all_masters_extension_activity_master',
        'all_masters_other_extension_activity_master', 'all_masters_events_master', 'all_masters_products_master', 'all_masters_climate_master', 'all_masters_arya_master',
        'all_masters_tsp_scsp_master', 'all_masters_natural_farming_master',
        'all_masters_publication_master', 'all_masters_season_master', 'all_masters_unit_master', 'all_masters_sanctioned_post_master', 'all_masters_staff_category_master',
        'all_masters_pay_level_master', 'all_masters_pay_scale_master', 'all_masters_asset_funding_source_master', 'all_masters_equipment_type_master', 'all_masters_equipment_master', 'all_masters_discipline_master', 'all_masters_crop_type_master', 'all_masters_infrastructure_master', 'all_masters_budget_item_master',
        'all_masters_soil_water_analysis_master', 'all_masters_nari_activity_master', 'all_masters_nari_garden_type_master', 'all_masters_nicra_master',
        'all_masters_impact_area_master', 'all_masters_enterprise_type_master', 'all_masters_account_type_master', 'all_masters_programme_type_master',
        'all_masters_ppv_fra_training_type_master', 'all_masters_dignitary_type_master', 'all_masters_financial_project_master',
        'user_management_users', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_land_details', 'about_kvks_view_vehicles', 'about_kvks_vehicle_details', 'about_kvks_view_equipments', 'about_kvks_equipment_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_fld_extension_training', 'achievements_fld_technical_feedback', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'achievements_technology_week_celebration', 'achievements_celebration_days', 'achievements_production_supply_tech_products', 'achievements_soil_water_testing', 'achievements_world_soil_day', 'achievements_projects', 'achievements_publications', 'achievements_award_recognition', 'achievements_award_scientist', 'achievements_award_farmer', 'achievements_hrd', ...PI_MODULE_CODES, 'misc_prevalent_diseases_crops', 'misc_prevalent_diseases_livestock', 'misc_poshan_maah', 'misc_ppv_fra_training', 'misc_rawe_fet', 'misc_vip_visitors', 'digital_mobile_app', 'digital_web_portal', 'digital_kisan_sarthi', 'digital_kisan_advisory', 'digital_messages_other_channels', 'swachh_observation_sewa', 'swachh_pakhwada', 'swachh_budget_expenditure', 'meetings_sac', 'meetings_other_atari', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'
      ],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  // _user roles: role permissions define the CEILING (maximum possible access).
  // Actual access is the intersection of role permissions ∩ user-level permissions
  // (either USER_SCOPE legacy rows or per-module rows set via the editor).
  // All 4 actions are included so admins can grant any combination when creating
  // users. Admin-tier masters are deliberately excluded — *_user roles see only
  // the work-surface modules (About KVKs / Achievements / Performance / etc.)
  // plus the user-tier masters (NICRA, natural farming).
  kvk_user: {
    permissions: {
      modules: [...BASE_USER_MODULES],
      actions: USER_ACTIONS,
    },
  },
  state_user: {
    permissions: {
      modules: [...BASE_USER_MODULES, 'reports'],
      actions: USER_ACTIONS,
    },
  },
  district_user: {
    permissions: {
      modules: [...BASE_USER_MODULES, 'reports'],
      actions: USER_ACTIONS,
    },
  },
  org_user: {
    permissions: {
      modules: [...BASE_USER_MODULES, 'reports'],
      actions: USER_ACTIONS,
    },
  },
};

async function run() {
  console.log('🌱 Permissions (modules + role assignments)\n');

  // Step 1: Create modules
  console.log('   Creating modules...');
  let createdModules = 0, createdPermissions = 0, reorderedModules = 0;
  for (const [sortOrder, { menuName, subMenuName, moduleCode }] of MODULES.entries()) {
    let module = await prisma.module.findUnique({ where: { moduleCode } });
    if (!module) {
      module = await prisma.module.create({ data: { menuName, subMenuName, moduleCode, sortOrder } });
      createdModules++;
    } else if (module.sortOrder !== sortOrder || module.menuName !== menuName || module.subMenuName !== subMenuName) {
      // Keep display order AND label text in sync with this file even for
      // modules created (possibly much) earlier — sortOrder reflects catalog
      // position, not insertion time, so a re-run always realigns both with
      // MODULES above (e.g. renaming a subMenuName here now actually takes
      // effect on re-seed instead of only affecting brand-new rows).
      module = await prisma.module.update({ where: { moduleId: module.moduleId }, data: { sortOrder, menuName, subMenuName } });
      reorderedModules++;
    }
    // Create permissions for this module
    for (const action of PERMISSION_ACTIONS) {
      const existing = await prisma.permission.findFirst({ where: { moduleId: module.moduleId, action } });
      if (!existing) {
        await prisma.permission.create({ data: { moduleId: module.moduleId, action } });
        createdPermissions++;
      }
    }
  }
  console.log(`   ✅ ${createdModules} new modules, ${reorderedModules} reordered, ${createdPermissions} new permissions\n`);

  // Step 2: Assign permissions to roles
  console.log('   Assigning permissions to roles...');

  // Pre-fetch all modules for efficiency
  const allModules = await prisma.module.findMany({ select: { moduleId: true, moduleCode: true } });
  const moduleCodeToIdMap = new Map(allModules.map(m => [m.moduleCode, m.moduleId]));

  for (const [roleName, config] of Object.entries(ROLE_PERMISSIONS)) {
    console.log(`   Processing role: ${roleName}...`);
    const role = await prisma.role.findFirst({ where: { roleName } });
    if (!role) {
      console.log(`   ⚠️  Role ${roleName} not found, skipping`);
      continue;
    }

    let permissionIds = [];
    if (config.permissions === 'ALL') {
      const all = await prisma.permission.findMany({ select: { permissionId: true } });
      permissionIds = all.map((p) => p.permissionId);
    } else {
      // `permissions` is either a single { modules, actions } block (legacy
      // shorthand — every listed module gets the same action set) or an array
      // of such blocks, letting a role get e.g. VIEW-only on one set of
      // modules and full CRUD on another (mirrors what the old per-route
      // requireRole([...]) hardcoded lists actually enforced — GET open to
      // more roles than POST/PUT/DELETE).
      const blocks = Array.isArray(config.permissions) ? config.permissions : [config.permissions];
      const permissionIdSet = new Set();

      for (const block of blocks) {
        const moduleIds = block.modules
          .map(code => moduleCodeToIdMap.get(code))
          .filter(id => id !== undefined);

        if (moduleIds.length === 0) continue;

        const perms = await prisma.permission.findMany({
          where: {
            moduleId: { in: moduleIds },
            action: { in: block.actions },
          },
          select: { permissionId: true },
        });
        perms.forEach((p) => permissionIdSet.add(p.permissionId));
      }

      permissionIds = [...permissionIdSet];
    }

    if (permissionIds.length === 0) {
      console.log(`   ⚠️  No permissions found for ${roleName}, skipping`);
      continue;
    }

    try {
      // Use a transaction with timeout
      await prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({ where: { roleId: role.roleId } });
        if (permissionIds.length > 0) {
          // Batch create in chunks to avoid issues with large arrays
          const chunkSize = 1000;
          for (let i = 0; i < permissionIds.length; i += chunkSize) {
            const chunk = permissionIds.slice(i, i + chunkSize);
            await tx.rolePermission.createMany({
              data: chunk.map((permissionId) => ({ roleId: role.roleId, permissionId })),
              skipDuplicates: true,
            });
          }
        }
      }, {
        timeout: 30000, // 30 second timeout
      });
      console.log(`   ✅ ${roleName}: ${permissionIds.length} permissions`);
    } catch (error) {
      console.error(`   ❌ Error assigning permissions to ${roleName}:`, error.message);
      // Continue with other roles even if one fails
    }
  }
  console.log('');

  // Flush the permission cache so currently-signed-in users pick up the
  // new role assignments on their next request (otherwise they'd wait for
  // PERMISSION_CACHE_TTL_SECONDS, default 1h).
  try {
    const permissionResolverService = require('../services/auth/permissionResolverService.js');
    const roles = await prisma.role.findMany({ select: { roleId: true, roleName: true } });
    for (const r of roles) {
      await permissionResolverService.invalidateRolePermissions(r.roleId);
      await permissionResolverService.invalidateUsersByRole(r.roleId);
    }
    console.log('   ✅ Permission cache invalidated for all roles');
  } catch (e) {
    console.warn('   ⚠️  Could not invalidate permission cache:', e.message);
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
} else {
  module.exports = { run };
}
