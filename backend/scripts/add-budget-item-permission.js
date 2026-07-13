#!/usr/bin/env node
/**
 * Additive, non-destructive install of the `all_masters_budget_item_master`
 * permission module (CFLD Budget Item Master).
 *
 * - Upserts the module + its VIEW/ADD/EDIT/DELETE permission rows.
 * - Grants it to every role that already holds `all_masters_infrastructure_master`,
 *   mirroring their exact per-action grants (a VIEW-only role gets VIEW only).
 *
 * Does NOT delete any existing role permissions — safe to run on a live DB and
 * safe to re-run (idempotent). Use this instead of `npm run seed:permissions`,
 * which wipes and rebuilds every role's grants.
 *
 * Run: node scripts/add-budget-item-permission.js  or  npm run perm:budget-item
 */
require('dotenv').config();
const prisma = require('../config/prisma.js');
const permissionResolverService = require('../services/auth/permissionResolverService.js');

const NEW_MODULE = {
    menuName: 'All Masters',
    subMenuName: 'CFLD Budget Item Master',
    moduleCode: 'all_masters_budget_item_master',
};
const MIRROR_FROM_MODULE_CODE = 'all_masters_infrastructure_master';
const ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE'];

async function main() {
    console.log('🔐 Installing all_masters_budget_item_master permission...');

    // 1. Upsert module.
    let module = await prisma.module.findUnique({ where: { moduleCode: NEW_MODULE.moduleCode } });
    if (!module) {
        module = await prisma.module.create({ data: { ...NEW_MODULE } });
        console.log(`   ✅ module created (id ${module.moduleId})`);
    } else {
        console.log(`   • module already exists (id ${module.moduleId})`);
    }

    // 2. Ensure the 4 permission rows exist; map action -> permissionId.
    const budgetPermByAction = new Map();
    for (const action of ACTIONS) {
        let perm = await prisma.permission.findFirst({ where: { moduleId: module.moduleId, action } });
        if (!perm) {
            perm = await prisma.permission.create({ data: { moduleId: module.moduleId, action } });
        }
        budgetPermByAction.set(action, perm.permissionId);
    }

    // 3. Find who has Infrastructure Master, per action.
    const infraModule = await prisma.module.findUnique({
        where: { moduleCode: MIRROR_FROM_MODULE_CODE },
        select: { moduleId: true },
    });
    if (!infraModule) {
        console.log(`   ⚠️  ${MIRROR_FROM_MODULE_CODE} module not found — nothing to mirror. Done.`);
        return;
    }
    const infraPerms = await prisma.permission.findMany({
        where: { moduleId: infraModule.moduleId },
        select: { permissionId: true, action: true },
    });
    const infraPermIdToAction = new Map(infraPerms.map((p) => [p.permissionId, p.action]));

    const infraGrants = await prisma.rolePermission.findMany({
        where: { permissionId: { in: infraPerms.map((p) => p.permissionId) } },
        select: { roleId: true, permissionId: true },
    });

    // 4. Build the additive rolePermission rows (same role, same action).
    const rowsToAdd = [];
    for (const grant of infraGrants) {
        const action = infraPermIdToAction.get(grant.permissionId);
        const budgetPermId = budgetPermByAction.get(action);
        if (budgetPermId) rowsToAdd.push({ roleId: grant.roleId, permissionId: budgetPermId });
    }

    if (rowsToAdd.length === 0) {
        console.log('   ⚠️  No role holds Infrastructure Master — no grants added.');
    } else {
        const result = await prisma.rolePermission.createMany({
            data: rowsToAdd,
            skipDuplicates: true,
        });
        const roleIds = [...new Set(rowsToAdd.map((r) => r.roleId))];
        console.log(`   ✅ granted to ${roleIds.length} role(s); ${result.count} new rolePermission row(s) added`);

        // Bust the cached permissions so live sessions see the grant without re-login.
        for (const roleId of roleIds) {
            await permissionResolverService.invalidateRolePermissions(roleId);
        }
        console.log(`   ✅ invalidated permission cache for ${roleIds.length} role(s)`);
    }

    console.log('   Done.\n');
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
