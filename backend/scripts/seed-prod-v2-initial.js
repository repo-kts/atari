#!/usr/bin/env node
/**
 * Seed a clean production v2 database from an existing production database.
 *
 * Copies only startup data:
 * - roles
 * - zone/state/district/org/university hierarchy
 * - KVK master rows
 * - active users, preserving password hashes and scope links
 * - per-user permissions, mapped by module_code + action
 *
 * It intentionally does not copy form, achievement, report, attachment,
 * notification, target, staff, bank, vehicle, equipment, or other KVK detail data.
 *
 * Usage:
 *   OLD_DATABASE_URL=... DATABASE_URL=... node scripts/seed-prod-v2-initial.js
 */
require('dotenv').config();

const { Pool } = require('pg');

const sourceUrl = process.env.OLD_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;

if (!sourceUrl) throw new Error('OLD_DATABASE_URL is required.');
if (!targetUrl) throw new Error('DATABASE_URL is required.');
if (sourceUrl === targetUrl) throw new Error('OLD_DATABASE_URL and DATABASE_URL must be different.');

const source = new Pool({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
const target = new Pool({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });

async function tableExists(client, tableName) {
  const { rows } = await client.query(
    `select exists (
       select 1
       from information_schema.tables
       where table_schema = 'public' and table_name = $1
     ) as exists`,
    [tableName],
  );
  return Boolean(rows[0]?.exists);
}

async function columnNames(client, tableName) {
  const { rows } = await client.query(
    `select column_name
     from information_schema.columns
     where table_schema = 'public' and table_name = $1
     order by ordinal_position`,
    [tableName],
  );
  return rows.map((row) => row.column_name);
}

async function commonColumns(tableName, requested) {
  const [srcCols, dstCols] = await Promise.all([
    columnNames(source, tableName),
    columnNames(target, tableName),
  ]);
  const src = new Set(srcCols);
  const dst = new Set(dstCols);
  return requested.filter((col) => src.has(col) && dst.has(col));
}

function quotedIdentifier(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function upsertRows({ table, key, columns, rows }) {
  if (!rows.length) return 0;
  const cols = columns.filter((col) => Object.prototype.hasOwnProperty.call(rows[0], col));
  const colSql = cols.map(quotedIdentifier).join(', ');
  const keyCols = Array.isArray(key) ? key : [key];
  const keySql = keyCols.map(quotedIdentifier).join(', ');
  const updateCols = cols.filter((col) => !keyCols.includes(col) && col !== 'created_at');
  const updateSql = updateCols.length
    ? `do update set ${updateCols.map((col) => `${quotedIdentifier(col)} = excluded.${quotedIdentifier(col)}`).join(', ')}`
    : 'do nothing';

  for (const row of rows) {
    const values = cols.map((col) => row[col]);
    const params = values.map((_, idx) => `$${idx + 1}`).join(', ');
    await target.query(
      `insert into ${quotedIdentifier(table)} (${colSql})
       values (${params})
       on conflict (${keySql}) ${updateSql}`,
      values,
    );
  }
  return rows.length;
}

async function copyTable({ table, key, requestedColumns, orderBy }) {
  const exists = await tableExists(source, table);
  if (!exists) {
    console.log(`   - ${table}: skipped, missing in source`);
    return 0;
  }
  const columns = await commonColumns(table, requestedColumns);
  if (!columns.includes(Array.isArray(key) ? key[0] : key)) {
    throw new Error(`${table}: target/source common columns missing key ${key}`);
  }
  const { rows } = await source.query(
    `select ${columns.map(quotedIdentifier).join(', ')}
     from ${quotedIdentifier(table)}
     ${orderBy ? `order by ${orderBy}` : ''}`,
  );
  return upsertRows({ table, key, columns, rows });
}

async function resetSequence(table, idColumn) {
  const relationName = /[A-Z]/.test(table) ? quotedIdentifier(table) : table;
  const { rows } = await target.query(`select pg_get_serial_sequence($1, $2) as seq`, [relationName, idColumn]);
  const seq = rows[0]?.seq;
  if (!seq) return;
  await target.query(`select setval($1, coalesce((select max(${quotedIdentifier(idColumn)}) from ${quotedIdentifier(table)}), 1), true)`, [seq]);
}

async function seedRoles() {
  const count = await copyTable({
    table: 'roles',
    key: 'role_id',
    requestedColumns: ['role_id', 'role_name', 'description', 'hierarchy_level', 'created_at', 'updated_at'],
    orderBy: 'role_id',
  });
  await resetSequence('roles', 'role_id');
  console.log(`   roles: ${count}`);
}

async function seedHierarchyAndKvks() {
  const specs = [
    {
      table: 'zone',
      key: 'zone_id',
      requestedColumns: ['zone_id', 'zone_name', 'created_at', 'updated_at'],
      orderBy: 'zone_id',
    },
    {
      table: 'stateMaster',
      key: 'state_id',
      requestedColumns: ['state_id', 'state_name', 'zoneId', 'created_at', 'updated_at'],
      orderBy: 'state_id',
    },
    {
      table: 'districtMaster',
      key: 'district_id',
      requestedColumns: ['district_id', 'district_name', 'stateId', 'zoneId', 'created_at', 'updated_at'],
      orderBy: 'district_id',
    },
    {
      table: 'orgMaster',
      key: 'org_id',
      requestedColumns: ['org_id', 'org_name', 'district_id', 'created_at', 'updated_at'],
      orderBy: 'org_id',
    },
    {
      table: 'universityMaster',
      key: 'university_id',
      requestedColumns: [
        'university_id', 'university_name', 'org_id', 'host_mobile', 'host_landline',
        'host_fax', 'host_email', 'host_address', 'host_org', 'created_at', 'updated_at',
      ],
      orderBy: 'university_id',
    },
    {
      table: 'kvk',
      key: 'kvk_id',
      requestedColumns: [
        'kvk_id', 'kvk_name', 'zoneId', 'stateId', 'districtId', 'org_id', 'university_id',
        'mobile', 'landline', 'fax', 'email', 'address', 'host_org_name', 'host_mobile', 'host_landline',
        'host_fax', 'host_email', 'host_address', 'year_of_sanction', 'created_at', 'updated_at',
      ],
      orderBy: 'kvk_id',
    },
  ];

  for (const spec of specs) {
    const count = await copyTable(spec);
    console.log(`   ${spec.table}: ${count}`);
    await resetSequence(spec.table, Array.isArray(spec.key) ? spec.key[0] : spec.key);
  }
}

async function roleIdByName(client) {
  const { rows } = await client.query('select role_id, role_name from roles');
  return new Map(rows.map((row) => [row.role_name, row.role_id]));
}

async function seedUsers() {
  const sourceRoles = await roleIdByName(source);
  const targetRoles = await roleIdByName(target);
  const sourceRoleNameById = new Map([...sourceRoles.entries()].map(([name, id]) => [id, name]));

  const columns = await commonColumns('users', [
    'user_id', 'name', 'email', 'password_hash', 'role_id', 'zone_id', 'state_id',
    'district_id', 'org_id', 'university_id', 'kvk_id', 'created_at', 'updated_at',
    'last_login_at', 'deleted_at', 'phone_number',
  ]);
  const { rows } = await source.query(
    `select ${columns.map(quotedIdentifier).join(', ')}
     from users
     where deleted_at is null
     order by user_id`,
  );

  let copied = 0;
  for (const row of rows) {
    const sourceRoleName = sourceRoleNameById.get(row.role_id);
    const targetRoleId = targetRoles.get(sourceRoleName);
    if (!targetRoleId) {
      console.log(`   - users: skipped ${row.email}, missing target role ${sourceRoleName || row.role_id}`);
      continue;
    }
    const next = { ...row, role_id: targetRoleId };
    await upsertRows({ table: 'users', key: 'email', columns, rows: [next] });
    copied += 1;
  }
  await resetSequence('users', 'user_id');
  console.log(`   users: ${copied}`);
}

async function seedUserPermissions() {
  const sourceHasUserPermissions = await tableExists(source, 'user_permissions');
  if (!sourceHasUserPermissions) {
    console.log('   user_permissions: skipped, missing in source');
    return;
  }

  const { rows } = await source.query(`
    select u.email, m.module_code, p.action
    from user_permissions up
    join users u on u.user_id = up.user_id
    join permissions p on p.permission_id = up.permission_id
    join modules m on m.module_id = p.module_id
    where u.deleted_at is null
    order by u.email, m.module_code, p.action
  `);

  let copied = 0;
  for (const row of rows) {
    const found = await target.query(`
      select u.user_id, p.permission_id
      from users u
      join permissions p on p.action = $2
      join modules m on m.module_id = p.module_id and m.module_code = $3
      where u.email = $1
      limit 1
    `, [row.email, row.action, row.module_code]);
    const match = found.rows[0];
    if (!match) continue;
    await target.query(
      `insert into user_permissions (user_id, permission_id)
       values ($1, $2)
       on conflict (user_id, permission_id) do nothing`,
      [match.user_id, match.permission_id],
    );
    copied += 1;
  }
  console.log(`   user_permissions: ${copied}`);
}

async function printSummary() {
  const tables = ['roles', 'modules', 'permissions', 'role_permissions', 'zone', 'stateMaster', 'districtMaster', 'orgMaster', 'universityMaster', 'kvk', 'users', 'user_permissions'];
  console.log('\nSummary');
  for (const table of tables) {
    const { rows } = await target.query(`select count(*)::int as count from ${quotedIdentifier(table)}`);
    console.log(`   ${table}: ${rows[0].count}`);
  }
}

async function main() {
  console.log('\nSeeding clean prod v2 startup data\n');
  await seedRoles();
  await seedHierarchyAndKvks();
  await seedUsers();
  await seedUserPermissions();
  await printSummary();
  console.log('\nDone.\n');
}

main()
  .catch((error) => {
    console.error('\nSeed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.end();
    await target.end();
  });
