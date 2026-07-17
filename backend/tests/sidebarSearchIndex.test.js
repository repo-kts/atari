const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('sidebar search indexes every All Masters section from route configuration', () => {
    const sidebar = read('../frontend/src/components/layout/Sidebar.tsx');

    assert.match(sidebar, /allMastersRoutes/);

    for (const sectionPath of [
        '/all-master/basic',
        '/all-master/oft-fld',
        '/all-master/training',
        '/all-master/production-projects',
        '/all-master/publications',
        '/all-master/other-masters',
    ]) {
        assert.match(
            sidebar,
            new RegExp(`['"]${sectionPath.replace(/\//g, '\\/')}['"]:\\s*buildSubItemsForGroup\\(allMastersRoutes,\\s*['"]${sectionPath.replace(/\//g, '\\/')}['"]\\)`),
            `${sectionPath} should be included in sidebar deep search`,
        );
    }
});

test('Important Day Master remains discoverable through the indexed master routes', () => {
    const routes = read('../frontend/src/config/route/allMasters.ts');

    assert.match(
        routes,
        /path:\s*ENTITY_PATHS\.IMPORTANT_DAY,[\s\S]*?title:\s*'Important Day Master',[\s\S]*?subcategoryPath:\s*ENTITY_PATHS\.OTHER_MASTERS/,
    );
});
