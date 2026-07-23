const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
    return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('report job schema and migration define durable job and part records', () => {
    const schema = read('prisma/superadmin/report_generation_job.prisma');
    const migration = read('prisma/migrations/20260724090000_add_report_generation_jobs/migration.sql');

    assert.match(schema, /model ReportGenerationJob \{/);
    assert.match(schema, /model ReportGenerationJobPart \{/);
    assert.match(schema, /@@unique\(\[reportGenerationJobId, partIndex\]\)/);
    assert.match(migration, /CREATE TABLE "report_generation_jobs"/);
    assert.match(migration, /CREATE TABLE "report_generation_job_parts"/);
    assert.match(migration, /ON DELETE CASCADE/);
});

test('Vercel queue consumer is private, durable, and bounded to one report topic', () => {
    const vercelConfig = JSON.parse(read('vercel.json'));
    const consumer = vercelConfig.functions['api/report-generation.js'];
    const worker = read('api/report-generation.js');

    assert.equal(consumer.maxDuration, 300);
    assert.deepEqual(consumer.experimentalTriggers, [{
        type: 'queue/v2beta',
        topic: 'report-generation',
        retryAfterSeconds: 30,
        initialDelaySeconds: 0,
    }]);
    assert.match(worker, /handleNodeCallback/);
    assert.match(worker, /metadata\.deliveryCount >= 4/);
});

test('aggregated PDF UI uses job creation and polling while other formats remain synchronous', () => {
    const api = read('../frontend/src/services/reportApi.ts');
    const page = read('../frontend/src/pages/reports/KvkReportPage.tsx');

    assert.match(api, /createAggregatedReportJob/);
    assert.match(api, /waitForAggregatedReportJob/);
    assert.match(page, /format === 'pdf'/);
    assert.match(page, /runAggregatedPdfJob\(request\)/);
    assert.match(page, /generateAggregatedReport\(request, format\)/);
});

test('PDF parts disable per-part serials and pagination before global merge', () => {
    const pdfService = read('services/reports/pdfGenerationService.js');
    const jobService = read('services/reports/reportGenerationJobService.js');

    assert.match(pdfService, /includeSerial: false/);
    assert.match(pdfService, /includeFooter: false/);
    assert.match(jobService, /mergeStoredPdfParts\(frontMatter, job\.parts\)/);
    assert.match(jobService, /addPdfFooterPagination\(merged\)/);
});

test('aggregated jobs group sections and use bounded parallel queue lanes', () => {
    const jobService = read('services/reports/reportGenerationJobService.js');

    assert.match(jobService, /DEFAULT_SECTIONS_PER_PART = 4/);
    assert.match(jobService, /DEFAULT_PARALLEL_PARTS = 4/);
    assert.match(jobService, /const sectionGroups = chunkSectionIds\(orderedSectionIds\)/);
    assert.match(jobService, /partIndex \+ parallelParts/);
    assert.match(jobService, /job\.completedParts >= job\.totalParts/);
});

test('report jobs support owner-scoped cancellation and worker cancellation guards', () => {
    const jobService = read('services/reports/reportGenerationJobService.js');
    const controller = read('controllers/reports/reportController.js');
    const routes = read('routes/reports/reportRoutes.js');
    const reportApi = read('../frontend/src/services/reportApi.ts');
    const reportPage = read('../frontend/src/pages/reports/KvkReportPage.tsx');
    const reportPreview = read('../frontend/src/components/reports/ReportPreview.tsx');

    assert.match(jobService, /async function cancelJobForUser\(jobId, userId\)/);
    assert.match(jobService, /requestedBy: userId/);
    assert.match(jobService, /status: 'cancelled'/);
    assert.match(jobService, /TERMINAL_JOB_STATUSES\.has\(job\.status\)/);
    assert.match(jobService, /status: 'finalizing'/);
    assert.match(controller, /cancelAggregatedReportJob/);
    assert.match(routes, /aggregated\/jobs\/:jobId\/cancel/);
    assert.match(reportApi, /cancelAggregatedReportJob/);
    assert.match(reportPage, /handleCancelReportGeneration/);
    assert.match(reportPreview, /Cancel generation/);
});

test('local development runs report jobs without requiring Vercel OIDC', () => {
    const packageJson = JSON.parse(read('package.json'));
    const jobService = read('services/reports/reportGenerationJobService.js');

    assert.match(packageJson.scripts.dev, /NODE_ENV=development/);
    assert.doesNotMatch(packageJson.scripts.dev, /--watch/);
    assert.match(packageJson.scripts['dev:watch'], /--watch/);
    assert.match(jobService, /USE_LOCAL_REPORT_RUNNER/);
    assert.match(jobService, /scheduleLocalMessage\(message\)/);
    assert.match(jobService, /REPORT_USE_VERCEL_QUEUE !== 'true'/);
});
