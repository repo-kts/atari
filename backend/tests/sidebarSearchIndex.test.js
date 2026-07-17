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

    // Form-aligned All Masters groups (mirror the Form Management order, plus Others).
    for (const sectionPath of [
        '/all-master/basic',
        '/all-master/about-kvk',
        '/all-master/achievements',
        '/all-master/projects',
        '/all-master/performance',
        '/all-master/miscellaneous',
        '/all-master/others',
    ]) {
        const escaped = sectionPath.replace(/\//g, '\\/');
        assert.match(
            sidebar,
            new RegExp(`['"]${escaped}['"]:\\s*masterSubItemsFor\\(\\s*['"]${escaped}['"]\\s*\\)`),
            `${sectionPath} should be included in sidebar deep search`,
        );
    }
});

test('Important Day Master remains discoverable through the indexed master routes', () => {
    const routes = read('../frontend/src/config/route/allMasters.ts');

    // Important Day now lives under the Achievements master group.
    assert.match(
        routes,
        /path:\s*ENTITY_PATHS\.IMPORTANT_DAY,[\s\S]*?title:\s*'Important Day Master',[\s\S]*?subcategoryPath:\s*GROUP\.ACHIEVEMENTS\.path/,
    );
});
