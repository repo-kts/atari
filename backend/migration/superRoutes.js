const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { listModules } = require('./registry.js');
const { listMasterOptions } = require('./masterCatalog.js');
const engine = require('./engine.js');
const superEngine = require('./superEngine.js');
const { parseCurl } = require('./curlParser.js');

// Super-migration: paste a SUPERADMIN curl (kvk_id empty → all KVKs), pick a
// module; the target KVK is resolved per-row from the curl. No KVK picker.
router.use(authenticateToken);

router.get('/modules', (req, res) => {
    res.json({ modules: listModules() });
});

// Master options for FK pickers (whitelisted via masterCatalog).
router.get('/master-options/:master', async (req, res) => {
    try {
        res.json({ options: await listMasterOptions(req.params.master) });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/oft/problem-diagnosed-issues', async (req, res) => {
    try {
        res.json(await superEngine.listOftProblemDiagnosedIssues());
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Replay a pasted curl against the old site, return its raw JSON. Same as
// /migration/fetch — enrichment hooks live in the shared engine.
router.post('/fetch', async (req, res) => {
    try {
        const { curl } = req.body;
        if (!curl) return res.status(400).json({ error: 'curl is required' });
        // Defer OFT/FLD edit-page enrichment to transform-time — it then runs
        // over only the rows for the user's selected KVKs instead of every KVK.
        const out = await engine.fetchFromCurl(curl, {
            deferOftEnrich: true,
            deferFldEnrich: true,
        });
        res.json(out);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Map raw rows -> our schema, resolving each row's KVK from the row itself.
router.post('/transform', async (req, res) => {
    try {
        const { module, raw, curl } = req.body;
        if (!module || raw === undefined) {
            return res.status(400).json({ error: 'module and raw are required' });
        }
        // Headers (old-site session cookie) let OFT enrich each row's edit page
        // here, over just this batch's selected-KVK rows.
        const headers = curl ? parseCurl(curl).headers : undefined;
        const out = await superEngine.superTransform(module, raw, headers);
        res.json(out);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Persist mapped records (insert-only); kvkId taken per-record from the data.
router.post('/seed', async (req, res) => {
    try {
        const { module, records } = req.body;
        if (!module || !Array.isArray(records)) {
            return res.status(400).json({ error: 'module and records[] are required' });
        }
        const out = await superEngine.superSeed(module, records);
        res.json(out);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update-only repair for already-created rows. This is intentionally separate
// from transform/seed: it replays the old-site curl, enriches OFT edit pages,
// matches existing records, and updates only problemDiagnosed.
router.post('/update-existing', async (req, res) => {
    try {
        const { module, raw, curl, force, dryRun } = req.body;
        if (!module || raw === undefined) {
            return res.status(400).json({ error: 'module and raw are required' });
        }
        const headers = curl ? parseCurl(curl).headers : undefined;
        const out = await superEngine.superUpdateExisting(module, raw, headers, {
            force: Boolean(force),
            dryRun: Boolean(dryRun),
        });
        res.json(out);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
