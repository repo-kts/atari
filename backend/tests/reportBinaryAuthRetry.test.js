const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../../frontend/node_modules/typescript');

const ROOT = path.resolve(__dirname, '..', '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function loadApiClient(fetchMock) {
    const source = read('frontend/src/services/api.ts').replace(
        "import { API_BASE_URL, defaultFetchOptions } from '../config/api';",
        "const API_BASE_URL = 'https://api.test/api'; const defaultFetchOptions = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };",
    );
    const output = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
        },
    }).outputText;
    const module = { exports: {} };
    const context = vm.createContext({
        module,
        exports: module.exports,
        fetch: fetchMock,
        Response,
        Blob,
        console,
    });
    vm.runInContext(output, context);
    return module.exports;
}

test('report and export binary downloads use the auth-aware API client', () => {
    const api = read('frontend/src/services/api.ts');
    const reports = read('frontend/src/services/reportApi.ts');
    const exports = read('frontend/src/services/exportApi.ts');

    assert.match(api, /private async fetchWithAuth\(/);
    assert.match(api, /response\.status === 401[\s\S]*callRefreshEndpoint\(this\.baseUrl\)/);
    assert.match(api, /async postBlob\(/);

    assert.match(reports, /postBlob\(`\/reports\/kvk\/generate\?format=\$\{format\}`/);
    assert.match(reports, /postBlob\(`\/reports\/aggregated\/generate\?format=\$\{format\}`/);
    assert.doesNotMatch(reports, /\bfetch\(/);

    assert.match(exports, /return apiClient\.postBlob\(baseUrl, data\)/);
    assert.doesNotMatch(exports, /\bfetch\(/);
});

test('binary requests refresh once after 401 and retry the original report request', async () => {
    const calls = [];
    const fetchMock = async (url, options) => {
        calls.push({ url, options });
        if (calls.length === 1) {
            return new Response(JSON.stringify({ error: 'Token expired' }), {
                status: 401,
                statusText: 'Unauthorized',
                headers: { 'Content-Type': 'application/json' },
            });
        }
        if (calls.length === 2) {
            return new Response(JSON.stringify({ message: 'Token refreshed successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response('pdf-bytes', {
            status: 200,
            headers: { 'Content-Type': 'application/pdf' },
        });
    };
    const { apiClient } = loadApiClient(fetchMock);

    const blob = await apiClient.postBlob(
        '/reports/aggregated/generate?format=pdf',
        { sectionIds: ['1.1'] },
    );

    assert.equal(await blob.text(), 'pdf-bytes');
    assert.deepEqual(calls.map((call) => call.url), [
        'https://api.test/api/reports/aggregated/generate?format=pdf',
        'https://api.test/api/auth/refresh',
        'https://api.test/api/reports/aggregated/generate?format=pdf',
    ]);
    assert.equal(calls[0].options.credentials, 'include');
    assert.equal(calls[1].options.credentials, 'include');
    assert.equal(calls[2].options.credentials, 'include');
    assert.equal(calls[0].options.body, calls[2].options.body);
});
