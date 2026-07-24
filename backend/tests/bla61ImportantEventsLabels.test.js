const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ExcelJS = require('exceljs');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(
    path.resolve(ROOT, relativePath),
    'utf8',
);

const reportTemplateService = require('../services/reports/reportTemplateService.js');
const {
    generateCelebrationDaysPageExcelBuffer,
} = require('../utils/celebrationDaysPageExport.js');

test('BLA-61 uses Important Events in all user-facing registries', () => {
    const sources = [
        read('../frontend/src/config/route/achievements.ts'),
        read('../frontend/src/pages/dashboard/forms/AchievementsTab.tsx'),
        read('../frontend/src/config/reportIndexTaxonomy.ts'),
        read('config/reportConfig.js'),
        read('config/reportIndexTaxonomy.js'),
        read('config/formSummaryRegistry.js'),
        read('services/forms/kvkModuleWipeRegistry.js'),
        read('scripts/permissions.js'),
        read('scripts/main_permissions.js'),
        read('services/reports/formsTemplate/achievementTemplates/celebrationDaysPageReportTemplate.js'),
        read('services/reports/formsTemplate/achievementTemplates/celebrationDaysStateMatrixReportTemplate.js'),
        read('utils/celebrationDaysPageExport.js'),
    ];

    for (const source of sources) {
        assert.match(source, /Important Events/);
        assert.doesNotMatch(source, /Celebration Days/i);
        assert.doesNotMatch(source, /Celebration of Important Days/i);
    }
});

test('BLA-61 preserves stable internal identifiers', () => {
    const routes = read('../frontend/src/constants/routePaths.ts');
    const achievements = read('../frontend/src/config/route/achievements.ts');

    assert.match(routes, /\/forms\/achievements\/celebration-days/);
    assert.match(achievements, /achievements_celebration_days/);
});

test('BLA-61 migration updates the existing permission display label only', () => {
    const migration = read(
        'prisma/migrations/20260724160000_rename_celebration_days_label/migration.sql',
    );
    assert.match(migration, /UPDATE "modules"/);
    assert.match(migration, /"sub_menu_name" = 'Important Events'/);
    assert.match(migration, /"module_code" = 'achievements_celebration_days'/);
});

test('comprehensive report renders Important Events without the old heading', async () => {
    const html = await reportTemplateService.generateReportHTML(
        { kvkId: null, kvkName: 'Patna Zone', isAggregatedView: true },
        {
            '2.11': {
                data: {
                    matrixPayload: {
                        yearLabel: '2026',
                        stateColumns: ['Bihar'],
                        matrixRows: [{
                            label: 'Independence Day',
                            valuesByState: {
                                Bihar: { kvks: 2, activities: 3, participants: 94 },
                            },
                            total: { kvks: 2, activities: 3, participants: 94 },
                        }],
                    },
                },
            },
        },
        { year: 2026 },
        'Report Admin',
    );

    assert.match(html, />Important Events</);
    assert.doesNotMatch(html, /Celebration Days/i);
});

test('Important Events is the Excel worksheet and empty-state label', async () => {
    const buffer = await generateCelebrationDaysPageExcelBuffer(
        'Important Events',
        { groups: [] },
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    assert.equal(worksheet.name, 'Important Events');
    assert.equal(worksheet.getCell(3, 1).value, 'No important events data for export.');
});
