const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { listModules } = require('./registry.js');
const { listMasterOptions } = require('./masterCatalog.js');
const engine = require('./engine.js');

// All migration endpoints require an authenticated (admin) session.
router.use(authenticateToken);

router.get('/kvks', async (req, res) => {
    try {
        res.json({ kvks: await engine.listKvks() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

// Replay a pasted curl against the old site, return its raw JSON.
router.post('/fetch', async (req, res) => {
    try {
        const { curl } = req.body;
        if (!curl) return res.status(400).json({ error: 'curl is required' });
        const out = await engine.fetchFromCurl(curl);
        res.json(out);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Map raw rows -> our schema, with a validation report. No DB writes.
router.post('/transform', async (req, res) => {
    try {
        const { module, kvkId, raw } = req.body;
        if (!module || !kvkId || raw === undefined) {
            return res.status(400).json({ error: 'module, kvkId and raw are required' });
        }
        const out = await engine.transform(module, kvkId, raw);
        res.json(out);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Persist mapped records (idempotent upsert by natural key).
router.post('/seed', async (req, res) => {
    try {
        const { module, kvkId, records } = req.body;
        if (!module || !kvkId || !Array.isArray(records)) {
            return res.status(400).json({ error: 'module, kvkId and records[] are required' });
        }
        const out = await engine.seed(module, kvkId, records);
        res.json(out);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
