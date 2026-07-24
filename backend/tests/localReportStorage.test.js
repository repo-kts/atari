const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const storageRoot = path.join(os.tmpdir(), `atari-report-storage-test-${randomUUID()}`);
process.env.NODE_ENV = 'development';
process.env.REPORT_USE_S3 = 'false';
process.env.REPORT_LOCAL_STORAGE_DIR = storageRoot;

const storage = require('../services/reports/reportStorageService.js');

test.after(async () => {
    await fs.rm(storageRoot, { recursive: true, force: true });
});

test('development report storage writes, reads, links, and removes local files', async () => {
    const jobId = randomUUID();
    const key = `report-jobs/${jobId}/final/report.pdf`;
    const expected = Buffer.from('local report bytes');

    assert.equal(storage.USE_LOCAL_REPORT_STORAGE, true);
    assert.equal(storage.isConfigured(), true);

    await storage.putBuffer({
        key,
        body: expected,
        mimeType: 'application/pdf',
    });
    assert.deepEqual(await storage.getBuffer(key), expected);
    assert.equal(
        await storage.presignGet({ key, disposition: 'inline' }),
        `/api/reports/aggregated/jobs/${jobId}/file?disposition=inline`,
    );
    assert.equal(
        await storage.presignGet({ key, disposition: 'attachment' }),
        `/api/reports/aggregated/jobs/${jobId}/file?disposition=attachment`,
    );

    await storage.deleteOne(key);
    await assert.rejects(storage.getBuffer(key), { code: 'ENOENT' });
});

test('development report storage rejects traversal keys', async () => {
    await assert.rejects(
        storage.putBuffer({
            key: 'report-jobs/../../outside.pdf',
            body: Buffer.from('nope'),
        }),
        /Invalid report storage key/,
    );
});
