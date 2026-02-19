require('dotenv').config();
const prisma = require('../config/prisma');

const PERMISSION_ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'];

/**
 * Full list of Menu > Sub Menus for the Role Permissions UI (matches the design).
 * Each gets a unique moduleCode and four permissions (VIEW, ADD, EDIT, DELETE).
 */
const MODULES = [
  // All Masters
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
  // Role Management
  { menuName: 'Role Management', subMenuName: 'Roles', moduleCode: 'role_management_roles' },
  // User Management
  { menuName: 'User Management', subMenuName: 'Users', moduleCode: 'user_management_users' },
  // About KVKs
  { menuName: 'About KVKs', subMenuName: 'View KVKs', moduleCode: 'about_kvks_view_kvks' },
  { menuName: 'About KVKs', subMenuName: 'Bank Account Details', moduleCode: 'about_kvks_bank_account_details' },
  { menuName: 'About KVKs', subMenuName: 'Employee Details', moduleCode: 'about_kvks_employee_details' },
  { menuName: 'About KVKs', subMenuName: 'Staff Details', moduleCode: 'about_kvks_staff_details' },
  { menuName: 'About KVKs', subMenuName: 'Infrastructure Details', moduleCode: 'about_kvks_infrastructure_details' },
  { menuName: 'About KVKs', subMenuName: 'Vehicle Details', moduleCode: 'about_kvks_vehicle_details' },
  { menuName: 'About KVKs', subMenuName: 'Equipment Details', moduleCode: 'about_kvks_equipment_details' },
  { menuName: 'About KVKs', subMenuName: 'Farm Implement Details', moduleCode: 'about_kvks_farm_implement_details' },
  // Achievements
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
  // Performance Indicators
  { menuName: 'Performance Indicators', subMenuName: 'Impact', moduleCode: 'performance_indicators_impact' },
  { menuName: 'Performance Indicators', subMenuName: 'Infrastructure Performance', moduleCode: 'performance_indicators_infrastructure' },
  { menuName: 'Performance Indicators', subMenuName: 'Financial Performance', moduleCode: 'performance_indicators_financial' },
  { menuName: 'Performance Indicators', subMenuName: 'Linkages', moduleCode: 'performance_indicators_linkages' },
  // Miscellaneous Information
  { menuName: 'Miscellaneous Information', subMenuName: 'Prevalent Diseases in Crops', moduleCode: 'misc_prevalent_diseases_crops' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Prevalent Diseases in Livestock', moduleCode: 'misc_prevalent_diseases_livestock' },
  { menuName: 'Miscellaneous Information', subMenuName: 'Nehru Yuva Kendra (NYK) Training', moduleCode: 'misc_nyk_training' },
  { menuName: 'Miscellaneous Information', subMenuName: 'PPV & FRA Sensitization Training Programme', moduleCode: 'misc_ppv_fra_training' },
  { menuName: 'Miscellaneous Information', subMenuName: 'RAWE/FET Programme', moduleCode: 'misc_rawe_fet' },
  { menuName: 'Miscellaneous Information', subMenuName: 'List of VIP Visitors', moduleCode: 'misc_vip_visitors' },
  // Digital Information
  { menuName: 'Digital Information', subMenuName: 'Details of Mobile App', moduleCode: 'digital_mobile_app' },
  { menuName: 'Digital Information', subMenuName: 'Details of Web Portal', moduleCode: 'digital_web_portal' },
  { menuName: 'Digital Information', subMenuName: 'Details of Kisan Sarthi', moduleCode: 'digital_kisan_sarthi' },
  { menuName: 'Digital Information', subMenuName: 'Kisan Mobile Advisory Services/KMAS(m-Kisan Portal/National Farmers Portal/ SMS Portal)', moduleCode: 'digital_kisan_advisory' },
  { menuName: 'Digital Information', subMenuName: 'Details of Messages Send Through Other Channels', moduleCode: 'digital_messages_other_channels' },
  // Swachh Bharat Abhiyaan
  { menuName: 'Swachh Bharat Abhiyaan', subMenuName: 'Observation of Swachhta hi Sewa SBA', moduleCode: 'swachh_observation_sewa' },
  { menuName: 'Swachh Bharat Abhiyaan', subMenuName: 'Observation of Swachta Pakhwada', moduleCode: 'swachh_pakhwada' },
  { menuName: 'Swachh Bharat Abhiyaan', subMenuName: 'Details of Quarterly Budget Expenditure on Swachh Activities Including SAP', moduleCode: 'swachh_budget_expenditure' },
  // Meetings
  { menuName: 'Meetings', subMenuName: 'Details of Scientific Advisory Committee(SAC) Meetings', moduleCode: 'meetings_sac' },
  { menuName: 'Meetings', subMenuName: 'Details of Other Meeting Related to ATARI', moduleCode: 'meetings_other_atari' },
  // Other Masters (used in All Masters > Other Masters section)
  { menuName: 'All Masters', subMenuName: 'Season Master', moduleCode: 'all_masters_season_master' },
  { menuName: 'All Masters', subMenuName: 'Sanctioned Post Master', moduleCode: 'all_masters_sanctioned_post_master' },
  { menuName: 'All Masters', subMenuName: 'Year Master', moduleCode: 'all_masters_year_master' },

  // Form Management
  { menuName: 'Form Management', subMenuName: 'Success Stories', moduleCode: 'success_stories' },

  // Single-item modules (display as "—" in submenu if desired)
  { menuName: 'Module Images', subMenuName: '—', moduleCode: 'module_images' },
  { menuName: 'Targets', subMenuName: '—', moduleCode: 'targets' },
  { menuName: 'Log History', subMenuName: '—', moduleCode: 'log_history' },
  { menuName: 'Notifications', subMenuName: '—', moduleCode: 'notifications' },
  { menuName: 'Reports', subMenuName: '—', moduleCode: 'reports' },
];

async function seedModulesForRolePermissions() {
  console.log('🌱 Seeding modules and permissions for Role Permissions UI...\n');

  try {
    let createdModules = 0;
    let createdPermissions = 0;

    for (const { menuName, subMenuName, moduleCode } of MODULES) {
      let module = await prisma.module.findUnique({
        where: { moduleCode },
      });

      if (!module) {
        module = await prisma.module.create({
          data: { menuName, subMenuName, moduleCode },
        });
        createdModules++;
        console.log(`✅ Module: ${menuName} > ${subMenuName} (${moduleCode})`);
      }

      for (const action of PERMISSION_ACTIONS) {
        const existing = await prisma.permission.findFirst({
          where: { moduleId: module.moduleId, action },
        });
        if (!existing) {
          await prisma.permission.create({
            data: { moduleId: module.moduleId, action },
          });
          createdPermissions++;
        }
      }
    }

    console.log(`\n✨ Done. Created ${createdModules} new modules and ${createdPermissions} new permissions.\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedModulesForRolePermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
