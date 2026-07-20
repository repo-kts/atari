const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(backendRoot, relativePath), 'utf8');

test('Priority Thrust storage includes every field submitted by the form', () => {
    const schema = read('prisma/kvk/performance-indicators/district-village/priority_thrust_schema.prisma');
    const repository = read('repositories/forms/priorityThrustAreaRepository.js');
    const migration = read('prisma/migrations/20260721020000_add_priority_thrust_fields/migration.sql');

    assert.match(schema, /majorFocus\s+String\s+@default\(""\)\s+@map\("major_focus"\)/);
    assert.match(schema, /achievement\s+String\s+@default\(""\)\s+@map\("achievement"\)/);
    assert.match(repository, /majorFocus:\s*requireText\(data\.majorFocus/);
    assert.match(repository, /achievement:\s*requireText\(data\.achievement/);
    assert.match(migration, /ADD COLUMN IF NOT EXISTS "major_focus" TEXT NOT NULL DEFAULT ''/);
    assert.match(migration, /ADD COLUMN IF NOT EXISTS "achievement" TEXT NOT NULL DEFAULT ''/);
});
