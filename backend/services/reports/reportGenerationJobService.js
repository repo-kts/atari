const { send } = require('@vercel/queue');
const { PDFDocument } = require('pdf-lib');
const prisma = require('../../config/prisma.js');
const { validateSectionIds } = require('../../config/reportConfig.js');
const reportAggregationService = require('./reportAggregationService.js');
const reportService = require('./reportService.js');
const reportTemplateService = require('./reportTemplateService.js');
const pdfGenerationService = require('./pdfGenerationService.js');
const s3 = require('../storage/s3Service.js');
const { addPdfFooterPagination } = require('../../utils/pdfFooterPaginator.js');
const {
    getCompactDateTime,
    getReportScopeFilenamePrefix,
} = require('../../utils/exportHelper.js');

const REPORT_QUEUE_TOPIC = 'report-generation';
const MESSAGE_RETENTION_SECONDS = 24 * 60 * 60;
const RESULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ACTIVE_JOB_STATUSES = ['queued', 'processing', 'finalizing'];
const TERMINAL_JOB_STATUSES = new Set(['completed', 'failed', 'cancelled']);
const DEFAULT_SECTIONS_PER_PART = 4;
const DEFAULT_PARALLEL_PARTS = 4;

function boundedInteger(value, fallback, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

const SECTIONS_PER_PART = boundedInteger(
    process.env.REPORT_SECTIONS_PER_PART,
    DEFAULT_SECTIONS_PER_PART,
    1,
    8,
);
const PARALLEL_PARTS = boundedInteger(
    process.env.REPORT_PARALLEL_PARTS,
    DEFAULT_PARALLEL_PARTS,
    1,
    6,
);

function chunkSectionIds(sectionIds, size = SECTIONS_PER_PART) {
    const chunks = [];
    for (let index = 0; index < sectionIds.length; index += size) {
        chunks.push(sectionIds.slice(index, index + size));
    }
    return chunks;
}

function getJobParallelParts(requestPayload) {
    return boundedInteger(requestPayload?.parallelParts, 1, 1, 6);
}

function partKey(jobId, partIndex) {
    return `report-jobs/${jobId}/parts/${String(partIndex).padStart(4, '0')}.pdf`;
}

function finalKey(jobId) {
    return `report-jobs/${jobId}/final/report.pdf`;
}

async function publish(message, idempotencyKey) {
    return send(REPORT_QUEUE_TOPIC, message, {
        idempotencyKey,
        retentionSeconds: MESSAGE_RETENTION_SECONDS,
    });
}

async function publishPart(jobId, partIndex) {
    return publish(
        { kind: 'part', jobId, partIndex },
        `${jobId}:part:${partIndex}`,
    );
}

async function publishFinalize(jobId) {
    return publish(
        { kind: 'finalize', jobId },
        `${jobId}:finalize`,
    );
}

async function createJob({ scope, sectionIds, filters = {}, user }) {
    if (!scope) throw new Error('Scope is required for aggregated reports');
    if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
        throw new Error('Please select at least one report module.');
    }
    validateSectionIds(sectionIds);
    if (!s3.isConfigured()) {
        throw new Error('Report storage is not configured');
    }

    const kvkIds = await reportAggregationService.getKvkIdsForScope(scope);
    if (kvkIds.length === 0) {
        throw new Error('No KVKs found for the selected scope');
    }

    const isAggregatedView = !['kvk_admin', 'kvk_user', 'kvk_amdin']
        .includes(String(user.roleName || '').toLowerCase());
    const orderedSectionIds = reportTemplateService.orderSectionIds(
        sectionIds,
        isAggregatedView,
    );
    if (orderedSectionIds.length === 0) {
        throw new Error('The selected modules are not available for this report.');
    }

    const generatedBy = user.name || user.email || 'Unknown User';
    const kvkInfo = await reportService.buildAggregatedKvkInfo(scope, kvkIds);
    kvkInfo.isAggregatedView = isAggregatedView;
    const fileName = `${getReportScopeFilenamePrefix(scope)}-${getCompactDateTime()}.pdf`;
    const sectionGroups = chunkSectionIds(orderedSectionIds);
    const requestPayload = {
        scope,
        filters,
        sectionIds: orderedSectionIds,
        generatedBy,
        isAggregatedView,
        kvkIds,
        kvkInfo,
        parallelParts: PARALLEL_PARTS,
        sectionsPerPart: SECTIONS_PER_PART,
    };

    const job = await prisma.reportGenerationJob.create({
        data: {
            requestedBy: user.userId,
            format: 'pdf',
            status: 'queued',
            progress: 0,
            requestPayload,
            fileName,
            totalParts: sectionGroups.length,
            parts: {
                create: sectionGroups.map((groupedSectionIds, partIndex) => ({
                    partIndex,
                    sectionIds: groupedSectionIds,
                })),
            },
        },
        select: {
            reportGenerationJobId: true,
            status: true,
            progress: true,
            totalParts: true,
        },
    });

    try {
        const initialPartCount = Math.min(PARALLEL_PARTS, job.totalParts);
        await Promise.all(
            Array.from(
                { length: initialPartCount },
                (_, partIndex) => publishPart(job.reportGenerationJobId, partIndex),
            ),
        );
        console.log('[report-job] queued', {
            jobId: job.reportGenerationJobId,
            sections: orderedSectionIds.length,
            parts: job.totalParts,
            parallelParts: PARALLEL_PARTS,
        });
    } catch (error) {
        await prisma.reportGenerationJob.update({
            where: { reportGenerationJobId: job.reportGenerationJobId },
            data: {
                status: 'failed',
                errorMessage: `Failed to queue report: ${error.message}`,
            },
        });
        throw error;
    }

    return {
        jobId: job.reportGenerationJobId,
        status: job.status,
        progress: job.progress,
        totalParts: job.totalParts,
    };
}

async function getJobForUser(jobId, userId) {
    const job = await prisma.reportGenerationJob.findFirst({
        where: {
            reportGenerationJobId: jobId,
            requestedBy: userId,
        },
    });
    if (!job) return null;

    let previewUrl = null;
    let downloadUrl = null;
    if (job.status === 'completed' && job.resultKey) {
        [previewUrl, downloadUrl] = await Promise.all([
            s3.presignGet({
                key: job.resultKey,
                downloadFileName: job.fileName,
                disposition: 'inline',
            }),
            s3.presignGet({
                key: job.resultKey,
                downloadFileName: job.fileName,
                disposition: 'attachment',
            }),
        ]);
    }

    return {
        jobId: job.reportGenerationJobId,
        status: job.status,
        progress: job.progress,
        completedParts: job.completedParts,
        totalParts: job.totalParts,
        fileName: job.fileName,
        error: job.errorMessage,
        previewUrl,
        downloadUrl,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
    };
}

async function failJob(jobId, error) {
    await prisma.reportGenerationJob.updateMany({
        where: {
            reportGenerationJobId: jobId,
            status: { in: ACTIVE_JOB_STATUSES },
        },
        data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : String(error),
        },
    });
}

async function recordPartFailure(jobId, partIndex, error) {
    await prisma.reportGenerationJobPart.updateMany({
        where: {
            reportGenerationJobId: jobId,
            partIndex,
            status: { notIn: ['completed', 'cancelled'] },
        },
        data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : String(error),
        },
    });
}

async function cancelJobForUser(jobId, userId) {
    const job = await prisma.reportGenerationJob.findFirst({
        where: {
            reportGenerationJobId: jobId,
            requestedBy: userId,
        },
        select: {
            reportGenerationJobId: true,
            status: true,
            totalParts: true,
        },
    });
    if (!job) return null;
    if (TERMINAL_JOB_STATUSES.has(job.status)) {
        return getJobForUser(jobId, userId);
    }

    const cancelled = await prisma.reportGenerationJob.updateMany({
        where: {
            reportGenerationJobId: jobId,
            requestedBy: userId,
            status: { in: ACTIVE_JOB_STATUSES },
        },
        data: {
            status: 'cancelled',
            errorMessage: null,
        },
    });
    if (cancelled.count === 0) {
        return getJobForUser(jobId, userId);
    }

    await prisma.reportGenerationJobPart.updateMany({
        where: {
            reportGenerationJobId: jobId,
            status: { notIn: ['completed', 'cancelled'] },
        },
        data: {
            status: 'cancelled',
            errorMessage: null,
        },
    });

    const storageKeys = [
        ...Array.from(
            { length: job.totalParts },
            (_, partIndex) => partKey(jobId, partIndex),
        ),
        finalKey(jobId),
    ];
    await s3.deleteMany(storageKeys).catch((error) => {
        console.warn(`Could not remove cancelled report files for ${jobId}:`, error.message);
    });
    console.log('[report-job] cancelled', { jobId, totalParts: job.totalParts });

    return getJobForUser(jobId, userId);
}

async function processPart({ jobId, partIndex }) {
    const processStartedAt = Date.now();
    const job = await prisma.reportGenerationJob.findUnique({
        where: { reportGenerationJobId: jobId },
        include: {
            parts: {
                where: { partIndex },
                take: 1,
            },
        },
    });
    if (!job || TERMINAL_JOB_STATUSES.has(job.status)) return;

    const part = job.parts[0];
    if (!part) throw new Error(`Report part ${partIndex} was not found`);
    const parallelParts = getJobParallelParts(job.requestPayload);
    if (part.status === 'completed') {
        const nextPartIndex = partIndex + parallelParts;
        if (nextPartIndex < job.totalParts) {
            await publishPart(jobId, nextPartIndex);
        } else if (job.completedParts >= job.totalParts) {
            await publishFinalize(jobId);
        }
        return;
    }

    const [claimedJob, claimedPart] = await prisma.$transaction([
        prisma.reportGenerationJob.updateMany({
            where: {
                reportGenerationJobId: jobId,
                status: { in: ['queued', 'processing'] },
            },
            data: {
                status: 'processing',
                errorMessage: null,
            },
        }),
        prisma.reportGenerationJobPart.updateMany({
            where: {
                reportGenerationJobPartId: part.reportGenerationJobPartId,
                status: { notIn: ['completed', 'cancelled'] },
            },
            data: {
                status: 'processing',
                errorMessage: null,
                attemptCount: { increment: 1 },
                startedAt: new Date(),
            },
        }),
    ]);
    if (claimedJob.count === 0 || claimedPart.count === 0) return;

    const payload = job.requestPayload;
    const sectionIds = Array.isArray(part.sectionIds) ? part.sectionIds : [];
    console.log('[report-job] part started', {
        jobId,
        partIndex,
        sectionCount: sectionIds.length,
        parallelParts,
    });
    const sectionsData = await reportAggregationService.aggregateMultipleSections(
        sectionIds,
        payload.kvkIds,
        payload.filters || {},
    );
    const pdfBuffer = await pdfGenerationService.generateReportPartPDF(
        payload.kvkInfo,
        sectionsData,
    );
    const storageKey = partKey(jobId, partIndex);
    await s3.putBuffer({
        key: storageKey,
        body: pdfBuffer,
        mimeType: 'application/pdf',
    });

    const currentJob = await prisma.reportGenerationJob.findUnique({
        where: { reportGenerationJobId: jobId },
        select: { status: true },
    });
    if (!currentJob || currentJob.status === 'cancelled') {
        await Promise.all([
            s3.deleteOne(storageKey),
            prisma.reportGenerationJobPart.updateMany({
                where: {
                    reportGenerationJobPartId: part.reportGenerationJobPartId,
                    status: { not: 'completed' },
                },
                data: {
                    status: 'cancelled',
                    errorMessage: null,
                },
            }),
        ]);
        return;
    }

    const updatedPart = await prisma.reportGenerationJobPart.updateMany({
        where: {
            reportGenerationJobPartId: part.reportGenerationJobPartId,
            status: { not: 'completed' },
        },
        data: {
            status: 'completed',
            resultKey: storageKey,
            errorMessage: null,
            completedAt: new Date(),
        },
    });

    if (updatedPart.count > 0) {
        await prisma.reportGenerationJob.update({
            where: { reportGenerationJobId: jobId },
            data: { completedParts: { increment: 1 } },
        });
    }

    const progressJob = await prisma.reportGenerationJob.findUnique({
        where: { reportGenerationJobId: jobId },
        select: { completedParts: true, totalParts: true, status: true },
    });
    if (!progressJob || progressJob.status === 'cancelled') return;
    const progress = Math.min(
        95,
        Math.floor((progressJob.completedParts / progressJob.totalParts) * 90),
    );
    await prisma.reportGenerationJob.updateMany({
        where: {
            reportGenerationJobId: jobId,
            status: 'processing',
        },
        data: { progress },
    });

    console.log('[report-job] part completed', {
        jobId,
        partIndex,
        completedParts: progressJob.completedParts,
        totalParts: progressJob.totalParts,
        durationMs: Date.now() - processStartedAt,
    });

    const nextPartIndex = partIndex + parallelParts;
    if (nextPartIndex < progressJob.totalParts) {
        await publishPart(jobId, nextPartIndex);
    } else if (progressJob.completedParts >= progressJob.totalParts) {
        await publishFinalize(jobId);
    }
}

async function appendPdfBuffer(target, buffer) {
    const source = await PDFDocument.load(buffer);
    const pages = await target.copyPages(source, source.getPageIndices());
    pages.forEach(page => target.addPage(page));
}

async function mergeStoredPdfParts(frontMatter, parts) {
    const merged = await PDFDocument.create();
    await appendPdfBuffer(merged, frontMatter);
    for (const part of parts) {
        const buffer = await s3.getBuffer(part.resultKey);
        await appendPdfBuffer(merged, buffer);
    }
    return Buffer.from(await merged.save());
}

async function processFinalize({ jobId }) {
    const finalizeStartedAt = Date.now();
    const job = await prisma.reportGenerationJob.findUnique({
        where: { reportGenerationJobId: jobId },
        include: {
            parts: { orderBy: { partIndex: 'asc' } },
        },
    });
    if (!job || TERMINAL_JOB_STATUSES.has(job.status)) return;
    if (
        job.parts.length !== job.totalParts ||
        job.parts.some(part => part.status !== 'completed' || !part.resultKey)
    ) {
        throw new Error('Report parts are not ready for finalization');
    }

    const claimedFinalize = await prisma.reportGenerationJob.updateMany({
        where: {
            reportGenerationJobId: jobId,
            status: { in: ['queued', 'processing'] },
        },
        data: {
            status: 'finalizing',
            progress: 95,
            errorMessage: null,
        },
    });
    if (claimedFinalize.count === 0) return;

    const payload = job.requestPayload;
    const frontMatter = await pdfGenerationService.generateReportFrontMatterPDF(
        payload.kvkInfo,
        payload.sectionIds,
        payload.filters || {},
        payload.generatedBy,
    );
    const merged = await mergeStoredPdfParts(frontMatter, job.parts);
    const finalPdf = await addPdfFooterPagination(merged);
    const storageKey = finalKey(jobId);

    const beforeUpload = await prisma.reportGenerationJob.findUnique({
        where: { reportGenerationJobId: jobId },
        select: { status: true },
    });
    if (!beforeUpload || beforeUpload.status === 'cancelled') return;

    await s3.putBuffer({
        key: storageKey,
        body: finalPdf,
        mimeType: 'application/pdf',
    });

    const completed = await prisma.reportGenerationJob.updateMany({
        where: {
            reportGenerationJobId: jobId,
            status: 'finalizing',
        },
        data: {
            status: 'completed',
            progress: 100,
            resultKey: storageKey,
            errorMessage: null,
            expiresAt: new Date(Date.now() + RESULT_TTL_MS),
        },
    });
    if (completed.count === 0) {
        await s3.deleteOne(storageKey);
        return;
    }

    await s3.deleteMany(job.parts.map(part => part.resultKey)).catch((error) => {
        console.warn(`Could not remove temporary report parts for ${jobId}:`, error.message);
    });
    console.log('[report-job] completed', {
        jobId,
        parts: job.totalParts,
        durationMs: Date.now() - finalizeStartedAt,
    });
}

module.exports = {
    REPORT_QUEUE_TOPIC,
    SECTIONS_PER_PART,
    PARALLEL_PARTS,
    chunkSectionIds,
    createJob,
    getJobForUser,
    cancelJobForUser,
    failJob,
    recordPartFailure,
    processPart,
    processFinalize,
};
