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
    const requestPayload = {
        scope,
        filters,
        sectionIds: orderedSectionIds,
        generatedBy,
        isAggregatedView,
        kvkIds,
        kvkInfo,
    };

    const job = await prisma.reportGenerationJob.create({
        data: {
            requestedBy: user.userId,
            format: 'pdf',
            status: 'queued',
            progress: 0,
            requestPayload,
            fileName,
            totalParts: orderedSectionIds.length,
            parts: {
                create: orderedSectionIds.map((sectionId, partIndex) => ({
                    partIndex,
                    sectionIds: [sectionId],
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
        await publishPart(job.reportGenerationJobId, 0);
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
            status: { not: 'completed' },
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
            status: { not: 'completed' },
        },
        data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : String(error),
        },
    });
}

async function processPart({ jobId, partIndex }) {
    const job = await prisma.reportGenerationJob.findUnique({
        where: { reportGenerationJobId: jobId },
        include: {
            parts: {
                where: { partIndex },
                take: 1,
            },
        },
    });
    if (!job || job.status === 'failed' || job.status === 'completed') return;

    const part = job.parts[0];
    if (!part) throw new Error(`Report part ${partIndex} was not found`);
    if (part.status === 'completed') {
        if (partIndex + 1 < job.totalParts) {
            await publishPart(jobId, partIndex + 1);
        } else {
            await publishFinalize(jobId);
        }
        return;
    }

    await prisma.$transaction([
        prisma.reportGenerationJob.update({
            where: { reportGenerationJobId: jobId },
            data: {
                status: 'processing',
                errorMessage: null,
            },
        }),
        prisma.reportGenerationJobPart.update({
            where: {
                reportGenerationJobPartId: part.reportGenerationJobPartId,
            },
            data: {
                status: 'processing',
                errorMessage: null,
                attemptCount: { increment: 1 },
                startedAt: new Date(),
            },
        }),
    ]);

    const payload = job.requestPayload;
    const sectionIds = Array.isArray(part.sectionIds) ? part.sectionIds : [];
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
        select: { completedParts: true, totalParts: true },
    });
    const progress = Math.min(
        95,
        Math.floor((progressJob.completedParts / progressJob.totalParts) * 90),
    );
    await prisma.reportGenerationJob.update({
        where: { reportGenerationJobId: jobId },
        data: { progress },
    });

    if (partIndex + 1 < progressJob.totalParts) {
        await publishPart(jobId, partIndex + 1);
    } else {
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
    const job = await prisma.reportGenerationJob.findUnique({
        where: { reportGenerationJobId: jobId },
        include: {
            parts: { orderBy: { partIndex: 'asc' } },
        },
    });
    if (!job || job.status === 'failed' || job.status === 'completed') return;
    if (
        job.parts.length !== job.totalParts ||
        job.parts.some(part => part.status !== 'completed' || !part.resultKey)
    ) {
        throw new Error('Report parts are not ready for finalization');
    }

    await prisma.reportGenerationJob.update({
        where: { reportGenerationJobId: jobId },
        data: {
            status: 'finalizing',
            progress: 95,
            errorMessage: null,
        },
    });

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
    await s3.putBuffer({
        key: storageKey,
        body: finalPdf,
        mimeType: 'application/pdf',
    });

    await prisma.reportGenerationJob.update({
        where: { reportGenerationJobId: jobId },
        data: {
            status: 'completed',
            progress: 100,
            resultKey: storageKey,
            errorMessage: null,
            expiresAt: new Date(Date.now() + RESULT_TTL_MS),
        },
    });

    await s3.deleteMany(job.parts.map(part => part.resultKey)).catch((error) => {
        console.warn(`Could not remove temporary report parts for ${jobId}:`, error.message);
    });
}

module.exports = {
    REPORT_QUEUE_TOPIC,
    createJob,
    getJobForUser,
    failJob,
    recordPartFailure,
    processPart,
    processFinalize,
};
