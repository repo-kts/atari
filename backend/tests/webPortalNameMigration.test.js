const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('Web Portal name has matching Prisma storage and a deployable migration', () => {
  const schema = read('prisma/kvk/digital_information/web_portal_schema.prisma');
  const migration = read(
    'prisma/migrations/20260720000000_add_web_portal_name/migration.sql',
  );
  const repository = read('repositories/forms/webPortalRepository.js');

  assert.match(
    schema,
    /^\s*webPortalName\s+String\s+@default\(""\)\s+@map\("web_portal_name"\)/m,
  );
  assert.match(migration, /ALTER TABLE "web_portal"/);
  assert.match(
    migration,
    /ADD COLUMN "web_portal_name" TEXT NOT NULL DEFAULT ''/,
  );
  assert.match(repository, /webPortalName:\s*requireText\(data\.webPortalName/);
});
