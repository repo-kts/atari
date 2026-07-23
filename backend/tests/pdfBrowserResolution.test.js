const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
    resolveLocalBrowserExecutable,
} = require('../utils/exportHelper.js');

test('local PDF generation honors an explicitly configured browser executable', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atari-chrome-'));
    const executablePath = path.join(tempDir, 'chrome');
    const previousPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    fs.writeFileSync(executablePath, 'test-browser');

    try {
        process.env.PUPPETEER_EXECUTABLE_PATH = executablePath;
        assert.equal(resolveLocalBrowserExecutable(), executablePath);
    } finally {
        if (previousPath === undefined) delete process.env.PUPPETEER_EXECUTABLE_PATH;
        else process.env.PUPPETEER_EXECUTABLE_PATH = previousPath;
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});
