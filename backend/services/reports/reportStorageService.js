const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { randomUUID } = require('crypto');
const { ValidationError } = require('../../utils/errorHandler.js');
const s3 = require('../storage/s3Service.js');

// Local report generation should not require AWS credentials. Production keeps
// using S3; developers can explicitly exercise S3 with REPORT_USE_S3=true.
const USE_LOCAL_REPORT_STORAGE =
    process.env.NODE_ENV === 'development' &&
    process.env.REPORT_USE_S3 !== 'true';
const LOCAL_STORAGE_ROOT = path.resolve(
    process.env.REPORT_LOCAL_STORAGE_DIR
        || path.join(os.tmpdir(), 'atari-report-jobs'),
);

function resolveLocalPath(key) {
    if (typeof key !== 'string' || !/^report-jobs\/[a-z0-9-]+\/.+$/i.test(key)) {
        throw new ValidationError('Invalid report storage key');
    }
    const normalized = path.posix.normalize(key);
    if (normalized.startsWith('../') || normalized.includes('/../')) {
        throw new ValidationError('Invalid report storage key');
    }
    const resolved = path.resolve(LOCAL_STORAGE_ROOT, ...normalized.split('/'));
    if (
        resolved !== LOCAL_STORAGE_ROOT
        && !resolved.startsWith(`${LOCAL_STORAGE_ROOT}${path.sep}`)
    ) {
        throw new ValidationError('Invalid report storage key');
    }
    return resolved;
}

function jobIdFromKey(key) {
    const match = /^report-jobs\/([0-9a-f-]+)\//i.exec(key || '');
    if (!match) throw new ValidationError('Invalid report storage key');
    return match[1];
}

async function putBuffer({ key, body, mimeType = 'application/octet-stream' }) {
    if (!USE_LOCAL_REPORT_STORAGE) {
        return s3.putBuffer({ key, body, mimeType });
    }
    if (!body) throw new ValidationError('A storage key and body are required');

    const filePath = resolveLocalPath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
    try {
        await fs.writeFile(temporaryPath, body);
        await fs.rename(temporaryPath, filePath);
    } finally {
        await fs.rm(temporaryPath, { force: true }).catch(() => {});
    }
    return key;
}

async function getBuffer(key) {
    if (!USE_LOCAL_REPORT_STORAGE) return s3.getBuffer(key);
    return fs.readFile(resolveLocalPath(key));
}

async function deleteOne(key) {
    if (!key) return;
    if (!USE_LOCAL_REPORT_STORAGE) return s3.deleteOne(key);
    await fs.rm(resolveLocalPath(key), { force: true });
}

async function deleteMany(keys) {
    if (!Array.isArray(keys) || keys.length === 0) return;
    if (!USE_LOCAL_REPORT_STORAGE) return s3.deleteMany(keys);
    await Promise.all(keys.filter(Boolean).map(deleteOne));
}

async function presignGet(options) {
    if (!USE_LOCAL_REPORT_STORAGE) return s3.presignGet(options);
    const jobId = jobIdFromKey(options.key);
    const disposition = options.disposition === 'attachment' ? 'attachment' : 'inline';
    return `/api/reports/aggregated/jobs/${encodeURIComponent(jobId)}/file?disposition=${disposition}`;
}

function isConfigured() {
    return USE_LOCAL_REPORT_STORAGE || s3.isConfigured();
}

module.exports = {
    USE_LOCAL_REPORT_STORAGE,
    LOCAL_STORAGE_ROOT,
    putBuffer,
    getBuffer,
    deleteOne,
    deleteMany,
    presignGet,
    isConfigured,
};
