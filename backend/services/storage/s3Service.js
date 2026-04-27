const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { ValidationError } = require('../../utils/errorHandler.js');

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const PUT_TTL_SECONDS = 60 * 5;
const GET_TTL_SECONDS = 60 * 60;

let cachedClient = null;
function client() {
    if (cachedClient) return cachedClient;
    if (!REGION || !BUCKET) {
        throw new Error('S3 not configured: set AWS_REGION and AWS_S3_BUCKET');
    }
    cachedClient = new S3Client({
        region: REGION,
        credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        } : undefined,
    });
    return cachedClient;
}

const SAFE_FORM_CODE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;
const ALLOWED_EXT = new Set([
    'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg',
    'xls', 'xlsx', 'doc', 'docx', 'csv', 'txt',
]);

function sanitizeExt(fileName, mimeType) {
    let ext = (path.extname(fileName || '') || '').replace(/^\./, '').toLowerCase();
    if (!ext && mimeType) {
        const fromMime = mimeType.split('/')[1] || '';
        ext = fromMime.replace(/^vnd\..*$/, '').toLowerCase();
    }
    if (!ext || !ALLOWED_EXT.has(ext)) ext = 'bin';
    return ext;
}

function buildAttachmentKey({ formCode, fileName, mimeType }) {
    if (!formCode || !SAFE_FORM_CODE.test(formCode)) {
        throw new ValidationError('Invalid formCode for attachment');
    }
    const ext = sanitizeExt(fileName, mimeType);
    const id = uuidv4();
    return `forms/${formCode}/${id}.${ext}`;
}

async function presignPut({ key, mimeType, expiresIn = PUT_TTL_SECONDS }) {
    const cmd = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: mimeType || 'application/octet-stream',
    });
    return getSignedUrl(client(), cmd, { expiresIn });
}

async function presignGet({ key, downloadFileName, expiresIn = GET_TTL_SECONDS }) {
    const cmd = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ResponseContentDisposition: downloadFileName
            ? `inline; filename="${downloadFileName.replace(/"/g, '')}"`
            : undefined,
    });
    return getSignedUrl(client(), cmd, { expiresIn });
}

async function deleteOne(key) {
    if (!key) return;
    await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

async function deleteMany(keys) {
    if (!Array.isArray(keys) || keys.length === 0) return;
    const objects = keys.filter(Boolean).map((k) => ({ Key: k }));
    if (objects.length === 0) return;
    await client().send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: objects, Quiet: true },
    }));
}

function isConfigured() {
    return Boolean(REGION && BUCKET);
}

module.exports = {
    buildAttachmentKey,
    presignPut,
    presignGet,
    deleteOne,
    deleteMany,
    isConfigured,
    PUT_TTL_SECONDS,
    GET_TTL_SECONDS,
};
