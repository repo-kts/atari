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
  { menuName: 'All Masters', subMenuName: 'OFT Master', moduleCode: 'all_masters_oft_master' },
  { menuName: 'All Masters', subMenuName: 'FLD Master', moduleCode: 'all_masters_fld_master' },
  { menuName: 'All Masters', subMenuName: 'CFLD Master', moduleCode: 'all_masters_cfld_master' },
  { menuName: 'All Masters', subMenuName: 'Training Master', moduleCode: 'all_masters_training_master' },
  { menuName: 'All Masters', subMenuName: 'Extension Activity Master', moduleCode: 'all_masters_extension_activity_master' },
  { menuName: 'All Masters', subMenuName: 'Other Extension Activity Master', moduleCode: 'all_masters_other_extension_activity_master' },
  { menuName: 'All Masters', subMenuName: 'Events Master', moduleCode: 'all_masters_events_master' },
  { menuName: 'All Masters', subMenuName: 'Products Master', moduleCode: 'all_masters_products_master' },
  { menuName: 'All Masters', subMenuName: 'Climate Master', moduleCode: 'all_masters_climate_master' },
  { menuName: 'All Masters', subMenuName: 'ARYA Master', moduleCode: 'all_masters_arya_master' },
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
  { menuName: 'All Masters', subMenuName: 'Year Master', moduleCode: 'all_masters_year_master' },
  { menuName: 'All Masters', subMenuName: 'Staff Category Master', moduleCode: 'all_masters_staff_category_master' },
  { menuName: 'All Masters', subMenuName: 'Pay Level Master', moduleCode: 'all_masters_pay_level_master' },
  { menuName: 'All Masters', subMenuName: 'Discipline Master', moduleCode: 'all_masters_discipline_master' },
  { menuName: 'All Masters', subMenuName: 'Crop Type Master', moduleCode: 'all_masters_crop_type_master' },
  { menuName: 'All Masters', subMenuName: 'Infrastructure Master', moduleCode: 'all_masters_infrastructure_master' },
  { menuName: 'Form Management', subMenuName: 'Success Stories', moduleCode: 'form_management_success_stories' },
  { menuName: 'Module Images', subMenuName: '—', moduleCode: 'module_images' },
  { menuName: 'Targets', subMenuName: '—', moduleCode: 'targets' },
  { menuName: 'Log History', subMenuName: '—', moduleCode: 'log_history' },
  { menuName: 'Notifications', subMenuName: '—', moduleCode: 'notifications' },
  { menuName: 'Reports', subMenuName: '—', moduleCode: 'reports' },
];

const ROLE_PERMISSIONS = {
  super_admin: { permissions: 'ALL' },
  zone_admin: {
    permissions: {
      modules: ['all_masters_zone_master', 'all_masters_states_master', 'all_masters_districts_master', 'all_masters_organization_master', 'user_management_users', 'role_management_roles', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_vehicle_details', 'about_kvks_equipment_details', 'about_kvks_farm_implement_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'performance_indicators_impact', 'performance_indicators_infrastructure', 'performance_indicators_financial', 'performance_indicators_linkages', 'reports'],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  state_admin: {
    permissions: {
      modules: ['all_masters_states_master', 'all_masters_districts_master', 'all_masters_organization_master', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'performance_indicators_impact', 'reports'],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  district_admin: {
    permissions: {
      modules: ['all_masters_districts_master', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_employee_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'reports'],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
  org_admin: {
    permissions: {
      modules: ['all_masters_organization_master', 'user_management_users', 'about_kvks_view_kvks', 'about_kvks_employee_details', 'achievements_technical_achievement_summary', 'reports'],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
  kvk_admin: {
    permissions: {
      modules: [
        'all_masters_zone_master', 'all_masters_states_master', 'all_masters_organization_master', 'all_masters_districts_master', 'all_masters_university_master',
        'all_masters_oft_master', 'all_masters_fld_master', 'all_masters_cfld_master', 'all_masters_training_master', 'all_masters_extension_activity_master',
        'all_masters_other_extension_activity_master', 'all_masters_events_master', 'all_masters_products_master', 'all_masters_climate_master', 'all_masters_arya_master',
        'all_masters_publication_master', 'all_masters_season_master', 'all_masters_sanctioned_post_master', 'all_masters_year_master', 'all_masters_staff_category_master',
        'all_masters_pay_level_master', 'all_masters_discipline_master', 'all_masters_crop_type_master', 'all_masters_infrastructure_master',
        'user_management_users', 'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_vehicle_details', 'about_kvks_equipment_details', 'about_kvks_farm_implement_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'achievements_technology_week_celebration', 'achievements_celebration_days', 'achievements_production_supply_tech_products', 'achievements_soil_water_testing', 'achievements_projects', 'achievements_publications', 'achievements_award_recognition', 'achievements_hrd', 'performance_indicators_impact', 'performance_indicators_infrastructure', 'performance_indicators_financial', 'performance_indicators_linkages', 'misc_prevalent_diseases_crops', 'misc_prevalent_diseases_livestock', 'misc_nyk_training', 'misc_ppv_fra_training', 'misc_rawe_fet', 'misc_vip_visitors', 'digital_mobile_app', 'digital_web_portal', 'digital_kisan_sarthi', 'digital_kisan_advisory', 'digital_messages_other_channels', 'swachh_observation_sewa', 'swachh_pakhwada', 'swachh_budget_expenditure', 'meetings_sac', 'meetings_other_atari'
      ],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  kvk_user: {
    permissions: {
      modules: [
        'all_masters_zone_master', 'all_masters_states_master', 'all_masters_organization_master', 'all_masters_districts_master', 'all_masters_university_master',
        'all_masters_oft_master', 'all_masters_fld_master', 'all_masters_cfld_master', 'all_masters_training_master', 'all_masters_extension_activity_master',
        'all_masters_other_extension_activity_master', 'all_masters_events_master', 'all_masters_products_master', 'all_masters_climate_master', 'all_masters_arya_master',
        'all_masters_publication_master', 'all_masters_season_master', 'all_masters_sanctioned_post_master', 'all_masters_year_master', 'all_masters_staff_category_master',
        'all_masters_pay_level_master', 'all_masters_discipline_master', 'all_masters_crop_type_master', 'all_masters_infrastructure_master',
        'about_kvks_view_kvks', 'about_kvks_bank_account_details', 'about_kvks_employee_details', 'about_kvks_staff_details', 'about_kvks_infrastructure_details', 'about_kvks_vehicle_details', 'about_kvks_equipment_details', 'about_kvks_farm_implement_details', 'achievements_technical_achievement_summary', 'achievements_oft', 'achievements_fld', 'achievements_trainings', 'achievements_extension_activities', 'achievements_other_extension_activities', 'achievements_technology_week_celebration', 'achievements_celebration_days', 'achievements_production_supply_tech_products', 'achievements_soil_water_testing', 'achievements_projects', 'achievements_publications', 'achievements_award_recognition', 'achievements_hrd', 'performance_indicators_impact', 'performance_indicators_infrastructure', 'performance_indicators_financial', 'performance_indicators_linkages', 'misc_prevalent_diseases_crops', 'misc_prevalent_diseases_livestock', 'misc_nyk_training', 'misc_ppv_fra_training', 'misc_rawe_fet', 'misc_vip_visitors', 'digital_mobile_app', 'digital_web_portal', 'digital_kisan_sarthi', 'digital_kisan_advisory', 'digital_messages_other_channels', 'swachh_observation_sewa', 'swachh_pakhwada', 'swachh_budget_expenditure', 'meetings_sac', 'meetings_other_atari'
      ],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
};

async function run() {
  console.log('🌱 Permissions (modules + role assignments)\n');

  let createdModules = 0, createdPermissions = 0;
  for (const { menuName, subMenuName, moduleCode } of MODULES) {
    let module = await prisma.module.findUnique({ where: { moduleCode } });
    if (!module) {
      module = await prisma.module.create({ data: { menuName, subMenuName, moduleCode } });
      createdModules++;
    }
    for (const action of PERMISSION_ACTIONS) {
      const existing = await prisma.permission.findFirst({ where: { moduleId: module.moduleId, action } });
      if (!existing) {
        await prisma.permission.create({ data: { moduleId: module.moduleId, action } });
        createdPermissions++;
      }
    }
  }
  console.log(`   ✅ ${createdModules} new modules, ${createdPermissions} new permissions\n`);

  for (const [roleName, config] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findFirst({ where: { roleName } });
    if (!role) continue;
    let permissionIds = [];
    if (config.permissions === 'ALL') {
      const all = await prisma.permission.findMany({ select: { permissionId: true } });
      permissionIds = all.map((p) => p.permissionId);
    } else {
      const perms = await prisma.permission.findMany({
        where: { module: { moduleCode: { in: config.permissions.modules } }, action: { in: config.permissions.actions } },
        select: { permissionId: true },
      });
      permissionIds = perms.map((p) => p.permissionId);
    }
    if (permissionIds.length === 0) continue;
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: role.roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId: role.roleId, permissionId })),
        skipDuplicates: true,
      }),
    ]);
    console.log(`   ✅ ${roleName}: ${permissionIds.length} permissions`);
  }
  console.log('');
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
} else {
  module.exports = { run };
}
