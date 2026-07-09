const { randomUUID } = require('crypto');
const s3 = require('../services/storage/s3Service.js');

// Vercel/serverless functions cap the response body at ~4.5 MB. Anything bigger
// must be handed off via S3 so the browser downloads it directly, not through
// the function response. Keep a safety margin under the hard limit.
const INLINE_LIMIT_BYTES = 4 * 1024 * 1024;

const EXT_MIME = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/**
 * Deliver a generated report buffer to the client.
 *  - Small buffers are streamed straight back (works everywhere).
 *  - Large buffers are uploaded to S3 and returned as a presigned download URL
 *    ({ url, fileName }) so they never cross the serverless response limit.
 *    Falls back to streaming when S3 isn't configured (e.g. local dev).
 */
async function deliverReport(res, { buffer, ext, fileName }) {
    const mime = EXT_MIME[ext] || 'application/octet-stream';
    const name = fileName || `report.${ext}`;

    const tooBigToStream = buffer.length > INLINE_LIMIT_BYTES;
    if (tooBigToStream && s3.isConfigured()) {
        const key = `exports/${randomUUID()}.${ext}`;
        await s3.putObject({ key, body: buffer, mimeType: mime });
        const url = await s3.presignGet({ key, downloadFileName: name });
        return res.status(200).json({ url, fileName: name });
    }

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    return res.send(buffer);
}

module.exports = { deliverReport, INLINE_LIMIT_BYTES };
