const { QueueClient } = require('@vercel/queue');
const reportGenerationJobService = require('../services/reports/reportGenerationJobService.js');

const queue = new QueueClient();

module.exports = queue.handleNodeCallback(async (message, metadata) => {
    if (!message || !message.jobId) {
        throw new Error('Invalid report-generation message');
    }

    try {
        if (message.kind === 'part') {
            await reportGenerationJobService.processPart(message);
            return;
        }
        if (message.kind === 'finalize') {
            await reportGenerationJobService.processFinalize(message);
            return;
        }
        throw new Error(`Unsupported report-generation message kind: ${message.kind}`);
    } catch (error) {
        if (message.kind === 'part' && Number.isInteger(message.partIndex)) {
            await reportGenerationJobService.recordPartFailure(
                message.jobId,
                message.partIndex,
                error,
            );
        }
        if (metadata.deliveryCount >= 4) {
            await reportGenerationJobService.failJob(message.jobId, error);
            console.error(`Report job ${message.jobId} failed permanently:`, error);
            return;
        }
        throw error;
    }
});
