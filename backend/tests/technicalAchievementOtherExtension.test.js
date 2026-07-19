const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';

const prisma = require('../config/prisma.js');
const technicalSummaryService = require('../services/technicalAchievementSummaryService.js');
const {
  getTechnicalAchievementSummary,
  mergeTechnicalAchievementSummaries,
} = require('../repositories/reports/technicalAchievementSummaryReport/index.js');
const {
  renderTechnicalAchievementSummarySection,
} = require('../services/reports/formsTemplate/achievementTemplates/technicalAchievementSummaryTemplate.js');
const { parseSectionHtml } = require('../utils/htmlReportTableParser.js');

function zeroAggregate() {
  return { _count: { _all: 0 }, _sum: {} };
}

test('web technical summary includes scoped Other Extension activity totals', async () => {
  const methods = [
    ['target', 'aggregate'],
    ['kvkoft', 'aggregate'],
    ['kvkFldIntroduction', 'aggregate'],
    ['trainingAchievement', 'aggregate'],
    ['kvkExtensionActivity', 'aggregate'],
    ['kvkOtherExtensionActivity', 'aggregate'],
    ['kvkProductionSupply', 'aggregate'],
    ['kkvSoilWaterAnalysis', 'aggregate'],
    ['kvkPublicationDetails', 'groupBy'],
  ];
  const originals = new Map(
    methods.map(([name, method]) => [`${name}.${method}`, prisma[name][method]]),
  );

  let capturedOtherExtensionWhere;
  prisma.target.aggregate = async () => zeroAggregate();
  prisma.kvkoft.aggregate = async () => zeroAggregate();
  prisma.kvkFldIntroduction.aggregate = async () => zeroAggregate();
  prisma.trainingAchievement.aggregate = async () => zeroAggregate();
  prisma.kvkExtensionActivity.aggregate = async () => zeroAggregate();
  prisma.kvkOtherExtensionActivity.aggregate = async (args) => {
    capturedOtherExtensionWhere = args.where;
    return { _sum: { numberOfActivities: 7 } };
  };
  prisma.kvkProductionSupply.aggregate = async () => zeroAggregate();
  prisma.kkvSoilWaterAnalysis.aggregate = async () => zeroAggregate();
  prisma.kvkPublicationDetails.groupBy = async () => [];

  try {
    const result = await technicalSummaryService.getSummary(
      { role: 'super_admin' },
      { reportingYear: 2025 },
    );

    assert.equal(result.sections.otherExtension.achievement, 7);
    assert.equal(capturedOtherExtensionWhere.startDate.gte.toISOString(), '2025-04-01T00:00:00.000Z');
    assert.equal(capturedOtherExtensionWhere.startDate.lt.toISOString(), '2026-04-01T00:00:00.000Z');
  } finally {
    for (const [name, method] of methods) {
      prisma[name][method] = originals.get(`${name}.${method}`);
    }
  }
});

test('KVK report repository includes Other Extension activity totals', async () => {
  const findManyDelegates = [
    'target',
    'kvkoft',
    'kvkFldIntroduction',
    'trainingAchievement',
    'kvkExtensionActivity',
    'kvkOtherExtensionActivity',
    'kvkProductionSupply',
  ];
  const originals = new Map(
    findManyDelegates.map((name) => [name, prisma[name].findMany]),
  );

  for (const name of findManyDelegates) prisma[name].findMany = async () => [];
  prisma.kvkOtherExtensionActivity.findMany = async () => [
    { numberOfActivities: 2 },
    { numberOfActivities: 3 },
  ];

  try {
    const result = await getTechnicalAchievementSummary(12, { year: 2025 });
    assert.equal(result.otherExtension.activities, 5);
  } finally {
    for (const [name, original] of originals) prisma[name].findMany = original;
  }
});

test('zone and Super Admin aggregation sums Other Extension activities', () => {
  const merged = mergeTechnicalAchievementSummaries([
    { otherExtension: { activities: 4 }, production: [] },
    { otherExtension: { activities: 6 }, production: [] },
  ]);

  assert.equal(merged.otherExtension.activities, 10);
});

test('report and standalone export layouts include Other Extension Activities', () => {
  const html = renderTechnicalAchievementSummarySection.call(
    {
      _escapeHtml: (value) => String(value),
      _generateEmptySection: () => 'empty',
    },
    { id: '2.1', title: 'Technical Achievement Summary' },
    { otherExtension: { activities: 9 }, production: [] },
    'section-2-1',
    true,
  );

  assert.match(html, /Other Extension Activities/);
  assert.match(html, /Number of Activities/);
  assert.match(html, />9</);

  const parsed = parseSectionHtml(html);
  assert.equal(parsed.tables[0].rows[0][0].text, 'Other Extension Activities');
  assert.equal(parsed.tables[0].rows[2][1].text, '9');

  const frontend = fs.readFileSync(
    path.resolve(__dirname, '../../frontend/src/pages/dashboard/forms/TechnicalAchievementSummary.tsx'),
    'utf8',
  );
  assert.match(
    frontend,
    /title:\s*'Other Extension Activities',[\s\S]*?headers:\s*\['Number of Activities'\],[\s\S]*?sections\.otherExtension\?\.achievement/,
  );
});
