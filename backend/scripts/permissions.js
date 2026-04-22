#!/usr/bin/env node
/**
 * Seed modules, permission actions (VIEW/ADD/EDIT/DELETE), and assign permissions to roles.
 * Run: node scripts/permissions.js   or   npm run seed:permissions
 */
require('dotenv').config();
const prisma = require('../config/prisma');

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
  { menuName: 'About KVKs', subMenuName: 'Vehicle Details', moduleCode: 'about_kvks_vehicle_details' },
  { menuName: 'About KVKs', subMenuName: 'Equipment Details', moduleCode: 'about_kvks_equipment_details' },
  { menuName: 'About KVKs', subMenuName: 'Farm Implement Details', moduleCode: 'about_kvks_farm_implement_details' },
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
  { menuName: 'Achievements', subMenuName: 'Soil and Water Testing', moduleCode: 'achievements_soil_water_testing' },
  { menuName: 'Achievements', subMenuName: 'Projects', moduleCode: 'achievements_projects' },
  { menuName: 'Achievements', subMenuName: 'Publications', moduleCode: 'achievements_publications' },
  { menuName: 'Achievements', subMenuName: 'Award and Recognition', moduleCode: 'achievements_award_recognition' },
  { menuName: 'Achievements', subMenuName: 'Human Resource Development', moduleCode: 'achievements_hrd' },
  { menuName: 'Performance Indicators', subMenuName: 'Impact', moduleCode: 'performance_indicators_impact' },
  { menuName: 'Performance Indicators', subMenuName: 'District and Village Performance', moduleCode: 'performance_indicators_district_village' },
  { menuName: 'Performance Indicators', subMenuName: 'Infrastructure Performance', moduleCode: 'performance_indicators_infrastructure' },
  { menuName: 'Performance Indicators', subMenuName: 'Financial Performance', moduleCode: 'performance_indicators_financial' },
  { menuName: 'Performance Indicators', subMenuName: 'Linkages', moduleCode: 'performance_indicators_linkages' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Prevalent Diseases in Crops', moduleCode: 'misc_prevalent_diseases_crops' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Prevalent Diseases in Livestock', moduleCode: 'misc_prevalent_diseases_livestock' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Nehru Yuva Kendra (NYK) Training', moduleCode: 'misc_nyk_training' },
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
  { menuName: 'All Masters', subMenuName: 'Sanctioned Post Master', moduleCode: 'all_masters_sanctioned_post_master' },
  { menuName: 'All Masters', subMenuName: 'Staff Category Master', moduleCode: 'all_masters_staff_category_master' },
  { menuName: 'All Masters', subMenuName: 'Pay Level Master', moduleCode: 'all_masters_pay_level_master' },
  { menuName: 'All Masters', subMenuName: 'Pay Scale Master', moduleCode: 'all_masters_pay_scale_master' },
  { menuName: 'All Masters', subMenuName: 'Discipline Master', moduleCode: 'all_masters_discipline_master' },
  { menuName: 'All Masters', subMenuName: 'Crop Type Master', moduleCode: 'all_masters_crop_type_master' },
  { menuName: 'All Masters', subMenuName: 'Infrastructure Master', moduleCode: 'all_masters_infrastructure_master' },
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
  { menuName: 'All Masters', subMenuName: 'Funding Agency Master', moduleCode: 'all_masters_funding_agency_master' },
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

// Shared modules for _user roles (ceiling pattern). kvk_user gets these; other _user roles get these + 'reports'.
const BASE_USER_MODULES = [
  'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details',
  'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_vehicle_details',
  'about_kvks_equipment_details', 'about_kvks_farm_implement_details',
  'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld',
  'achievements_fld_extension_training', 'achievements_fld_technical_feedback',
  'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities',
  'achievements_technology_week_celebration', 'achievements_celebration_days',
  'achievements_production_supply_tech_products', 'achievements_soil_water_testing',
  'achievements_projects', 'achievements_publications', 'achievements_award_recognition',
  'achievements_hrd', 'performance_indicators_impact', 'performance_indicators_district_village', 'performance_indicators_infrastructure',
  'performance_indicators_financial', 'performance_indicators_linkages',
  'misc_prevalent_diseases_crops', 'misc_prevalent_diseases_livestock', 'misc_nyk_training',
  'misc_ppv_fra_training', 'misc_rawe_fet', 'misc_vip_visitors',
  'digital_mobile_app', 'digital_web_portal', 'digital_kisan_sarthi', 'digital_kisan_advisory',
  'digital_messages_other_channels', 'swachh_observation_sewa', 'swachh_pakhwada',
  'swachh_budget_expenditure', 'meetings_sac', 'meetings_other_atari', 'all_masters_nicra_master', 'all_masters_natural_farming_master', 'module_images', 'notifications', 'form_summary_status',
];

const USER_ACTIONS = PERMISSION_ACTIONS;

const ROLE_PERMISSIONS = {
  super_admin: { permissions: 'ALL' },
  zone_admin: {
    permissions: {
      modules: ['all_masters_zone_master', 'all_masters_states_master', 'all_masters_districts_master', 'all_masters_organization_master', 'all_masters_university_master', 'all_masters_kvks', 'all_masters_nicra_master', 'all_masters_impact_area_master', 'all_masters_enterprise_type_master', 'all_masters_account_type_master', 'all_masters_programme_type_master', 'all_masters_ppv_fra_training_type_master', 'all_masters_dignitary_type_master', 'user_management_users', 'role_management_roles', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_vehicle_details', 'about_kvks_equipment_details', 'about_kvks_farm_implement_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'performance_indicators_impact', 'performance_indicators_district_village', 'performance_indicators_infrastructure', 'performance_indicators_financial', 'performance_indicators_linkages', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  state_admin: {
    permissions: {
      modules: ['all_masters_states_master', 'all_masters_districts_master', 'all_masters_organization_master', 'all_masters_university_master', 'all_masters_kvks', 'all_masters_nicra_master', 'all_masters_impact_area_master', 'all_masters_enterprise_type_master', 'all_masters_account_type_master', 'all_masters_programme_type_master', 'all_masters_ppv_fra_training_type_master', 'all_masters_dignitary_type_master', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'performance_indicators_impact', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  district_admin: {
    permissions: {
      modules: ['all_masters_districts_master', 'all_masters_kvks', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_employee_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
  org_admin: {
    permissions: {
      modules: ['all_masters_organization_master', 'all_masters_kvks', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_employee_details', 'achievements_technical_achievement_summary', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'],
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
        'all_masters_publication_master', 'all_masters_season_master', 'all_masters_sanctioned_post_master', 'all_masters_staff_category_master',
        'all_masters_pay_level_master', 'all_masters_pay_scale_master', 'all_masters_discipline_master', 'all_masters_crop_type_master', 'all_masters_infrastructure_master',
        'all_masters_soil_water_analysis_master', 'all_masters_nari_activity_master', 'all_masters_nari_garden_type_master', 'all_masters_nicra_master',
        'all_masters_impact_area_master', 'all_masters_enterprise_type_master', 'all_masters_account_type_master', 'all_masters_programme_type_master',
        'all_masters_ppv_fra_training_type_master', 'all_masters_dignitary_type_master', 'all_masters_financial_project_master', 'all_masters_funding_agency_master',
        'user_management_users', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_vehicle_details', 'about_kvks_equipment_details', 'about_kvks_farm_implement_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_fld_extension_training', 'achievements_fld_technical_feedback', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'achievements_technology_week_celebration', 'achievements_celebration_days', 'achievements_production_supply_tech_products', 'achievements_soil_water_testing', 'achievements_projects', 'achievements_publications', 'achievements_award_recognition', 'achievements_hrd', 'performance_indicators_impact', 'performance_indicators_district_village', 'performance_indicators_infrastructure', 'performance_indicators_financial', 'performance_indicators_linkages', 'misc_prevalent_diseases_crops', 'misc_prevalent_diseases_livestock', 'misc_nyk_training', 'misc_ppv_fra_training', 'misc_rawe_fet', 'misc_vip_visitors', 'digital_mobile_app', 'digital_web_portal', 'digital_kisan_sarthi', 'digital_kisan_advisory', 'digital_messages_other_channels', 'swachh_observation_sewa', 'swachh_pakhwada', 'swachh_budget_expenditure', 'meetings_sac', 'meetings_other_atari', 'module_images', 'reports', 'log_history', 'notifications', 'form_summary_status'
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
  let createdModules = 0, createdPermissions = 0;
  for (const { menuName, subMenuName, moduleCode } of MODULES) {
    let module = await prisma.module.findUnique({ where: { moduleCode } });
    if (!module) {
      module = await prisma.module.create({ data: { menuName, subMenuName, moduleCode } });
      createdModules++;
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
  console.log(`   ✅ ${createdModules} new modules, ${createdPermissions} new permissions\n`);

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
      // Get module IDs for the specified module codes
      const moduleIds = config.permissions.modules
        .map(code => moduleCodeToIdMap.get(code))
        .filter(id => id !== undefined);

      if (moduleIds.length === 0) {
        console.log(`   ⚠️  No matching modules found for ${roleName}, skipping`);
        continue;
      }

      const perms = await prisma.permission.findMany({
        where: {
          moduleId: { in: moduleIds },
          action: { in: config.permissions.actions },
        },
        select: { permissionId: true },
      });
      permissionIds = perms.map((p) => p.permissionId);
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
