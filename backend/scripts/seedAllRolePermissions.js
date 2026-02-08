require('dotenv').config();
const prisma = require('../config/prisma');

/**
 * Assigns tiered permissions to all admin roles.
 * - super_admin: Full access (VIEW/ADD/EDIT/DELETE) to everything
 * - zone_admin: Full access to zone-level features
 * - state_admin: Full access to state-level features
 * - district_admin: Full access to district-level features
 * - org_admin: Full access to org-level features
 * - kvk: Limited access to KVK-specific features
 */

const ROLE_PERMISSIONS = {
  super_admin: {
    description: 'Full system access - all modules, all actions',
    permissions: 'ALL', // Special: all permissions
  },
  zone_admin: {
    description: 'Zone Administrator - manage zone-level data and below',
    permissions: {
      // Full access to most masters
      modules: [
        'all_masters_zone_master',
        'all_masters_states_master',
        'all_masters_districts_master',
        'all_masters_organization_master',
        'user_management_users',
        'role_management_roles',
        'about_kvks_view_kvks',
        'about_kvks_bank_account_details',
        'about_kvks_employee_details',
        'about_kvks_staff_details',
        'about_kvks_infrastructure_details',
        'about_kvks_vehicle_details',
        'about_kvks_equipment_details',
        'about_kvks_farm_implement_details',
        'achievements_technical_achievement_summary',
        'achievements_oft',
        'achievements_fld',
        'achievements_trainings',
        'achievements_extension_activities',
        'achievements_other_extension_activities',
        'performance_indicators_impact',
        'performance_indicators_infrastructure',
        'performance_indicators_financial',
        'performance_indicators_linkages',
        'reports',
      ],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  state_admin: {
    description: 'State Administrator - manage state-level data',
    permissions: {
      modules: [
        'all_masters_states_master',
        'all_masters_districts_master',
        'all_masters_organization_master',
        'user_management_users',
        'about_kvks_view_kvks',
        'about_kvks_bank_account_details',
        'about_kvks_employee_details',
        'about_kvks_staff_details',
        'achievements_technical_achievement_summary',
        'achievements_oft',
        'achievements_fld',
        'achievements_trainings',
        'performance_indicators_impact',
        'reports',
      ],
      actions: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
    },
  },
  district_admin: {
    description: 'District Administrator - manage district-level data',
    permissions: {
      modules: [
        'all_masters_districts_master',
        'user_management_users',
        'about_kvks_view_kvks',
        'about_kvks_employee_details',
        'achievements_technical_achievement_summary',
        'achievements_oft',
        'achievements_fld',
        'reports',
      ],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
  org_admin: {
    description: 'Organization Administrator - manage org-level data',
    permissions: {
      modules: [
        'all_masters_organization_master',
        'user_management_users',
        'about_kvks_view_kvks',
        'about_kvks_employee_details',
        'achievements_technical_achievement_summary',
        'reports',
      ],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
  kvk: {
    description: 'KVK User - manage own KVK data',
    permissions: {
      modules: [
        'about_kvks_view_kvks',
        'about_kvks_bank_account_details',
        'about_kvks_employee_details',
        'about_kvks_staff_details',
        'about_kvks_infrastructure_details',
        'about_kvks_vehicle_details',
        'about_kvks_equipment_details',
        'about_kvks_farm_implement_details',
        'achievements_technical_achievement_summary',
        'achievements_oft',
        'achievements_fld',
        'achievements_trainings',
        'achievements_extension_activities',
        'achievements_other_extension_activities',
        'achievements_technology_week_celebration',
        'achievements_celebration_days',
        'achievements_production_supply_tech_products',
        'achievements_soil_water_testing',
        'achievements_projects',
        'achievements_publications',
        'achievements_award_recognition',
        'achievements_hrd',
        'performance_indicators_impact',
        'performance_indicators_infrastructure',
        'performance_indicators_financial',
        'performance_indicators_linkages',
        'misc_prevalent_diseases_crops',
        'misc_prevalent_diseases_livestock',
        'misc_nyk_training',
        'misc_ppv_fra_training',
        'misc_rawe_fet',
        'misc_vip_visitors',
        'digital_mobile_app',
        'digital_web_portal',
        'digital_kisan_sarthi',
        'digital_kisan_advisory',
        'digital_messages_other_channels',
        'swachh_observation_sewa',
        'swachh_pakhwada',
        'swachh_budget_expenditure',
        'meetings_sac',
        'meetings_other_atari',
      ],
      actions: ['VIEW', 'ADD', 'EDIT'],
    },
  },
};

async function seedAllRolePermissions() {
  console.log('🌱 Assigning permissions to all roles...\n');

  try {
    const stats = {
      total: 0,
      success: 0,
      skipped: 0,
      failed: 0,
    };

    for (const [roleName, config] of Object.entries(ROLE_PERMISSIONS)) {
      stats.total++;
      console.log(`\n📋 Processing role: ${roleName}`);
      console.log(`   ${config.description}`);

      // Find the role
      const role = await prisma.role.findFirst({
        where: { roleName },
      });

      if (!role) {
        console.log(`   ⚠️  Role '${roleName}' not found - skipping`);
        stats.skipped++;
        continue;
      }

      console.log(`   ✅ Found role (ID: ${role.roleId})`);

      // Get permission IDs
      let permissionIds = [];

      if (config.permissions === 'ALL') {
        // Super admin gets everything
        const allPerms = await prisma.permission.findMany({
          select: { permissionId: true },
        });
        permissionIds = allPerms.map((p) => p.permissionId);
        console.log(`   📦 Assigning ALL ${permissionIds.length} permissions`);
      } else {
        // Get specific permissions
        const { modules, actions } = config.permissions;

        const perms = await prisma.permission.findMany({
          where: {
            module: {
              moduleCode: { in: modules },
            },
            action: { in: actions },
          },
          select: { permissionId: true },
        });

        permissionIds = perms.map((p) => p.permissionId);
        console.log(`   📦 Found ${permissionIds.length} matching permissions`);
      }

      if (permissionIds.length === 0) {
        console.log(`   ⚠️  No permissions found for this role - skipping`);
        stats.skipped++;
        continue;
      }

      // Clear existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.roleId },
      });

      // Assign new permissions
      const data = permissionIds.map((permissionId) => ({
        roleId: role.roleId,
        permissionId,
      }));

      const result = await prisma.rolePermission.createMany({
        data,
        skipDuplicates: true,
      });

      console.log(`   ✨ Assigned ${result.count} permissions`);
      stats.success++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Total roles processed: ${stats.total}`);
    console.log(`   ✅ Successfully assigned: ${stats.success}`);
    console.log(`   ⚠️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Failed: ${stats.failed}`);
    console.log('='.repeat(60) + '\n');

    console.log('✅ All role permissions have been configured!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAllRolePermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
