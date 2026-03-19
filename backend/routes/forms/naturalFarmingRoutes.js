const express = require('express');
const router = express.Router();
const naturalFarmingService = require('../../services/forms/naturalFarmingService');
const { authenticateToken, requireRole } = require('../../middleware/auth');

router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// ───── Geographical Info ─────────────────────────────────────────────────────
router.get('/geographical', requireRole(allRoles), async (req, res) => {
    try { res.json(await naturalFarmingService.getAllGeo(req.query, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/geographical', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.status(201).json(await naturalFarmingService.createGeo(req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.put('/geographical/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.json(await naturalFarmingService.updateGeo(req.params.id, req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.delete('/geographical/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { await naturalFarmingService.deleteGeo(req.params.id, req.user); res.json({ message: 'Deleted successfully' }); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// ───── Physical Info ─────────────────────────────────────────────────────────
router.get('/physical', requireRole(allRoles), async (req, res) => {
    try { res.json(await naturalFarmingService.getAllPhysical(req.query, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/physical', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.status(201).json(await naturalFarmingService.createPhysical(req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.put('/physical/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.json(await naturalFarmingService.updatePhysical(req.params.id, req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.delete('/physical/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { await naturalFarmingService.deletePhysical(req.params.id, req.user); res.json({ message: 'Deleted successfully' }); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// ───── Demonstration Info ────────────────────────────────────────────────────
router.get('/demonstration', requireRole(allRoles), async (req, res) => {
    try { res.json(await naturalFarmingService.getAllDemo({ ...req.query, type: 'DEMONSTRATION' }, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/demonstration', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.status(201).json(await naturalFarmingService.createDemo({ ...req.body, type: 'DEMONSTRATION' }, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.put('/demonstration/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.json(await naturalFarmingService.updateDemo(req.params.id, req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.delete('/demonstration/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { await naturalFarmingService.deleteDemo(req.params.id, req.user); res.json({ message: 'Deleted successfully' }); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// ───── Farmers Practicing (uses Demonstration Info model, different endpoint) ─
// Note: Farmers Practicing uses the same DemonstrationInfo model via a type flag.
// You can extend this if a separate FarmersPracticing model exists.
router.get('/farmers', requireRole(allRoles), async (req, res) => {
    try { res.json(await naturalFarmingService.getAllDemo({ ...req.query, type: 'PRACTICING' }, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/farmers', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.status(201).json(await naturalFarmingService.createDemo({ ...req.body, type: 'PRACTICING' }, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.put('/farmers/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.json(await naturalFarmingService.updateDemo(req.params.id, req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.delete('/farmers/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { await naturalFarmingService.deleteDemo(req.params.id, req.user); res.json({ message: 'Deleted successfully' }); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// ───── Beneficiaries Details ─────────────────────────────────────────────────
router.get('/beneficiaries', requireRole(allRoles), async (req, res) => {
    try { res.json(await naturalFarmingService.getAllBeneficiaries(req.query, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/beneficiaries', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.status(201).json(await naturalFarmingService.createBeneficiaries(req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.put('/beneficiaries/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.json(await naturalFarmingService.updateBeneficiaries(req.params.id, req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.delete('/beneficiaries/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { await naturalFarmingService.deleteBeneficiaries(req.params.id, req.user); res.json({ message: 'Deleted successfully' }); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// ───── Soil Data ─────────────────────────────────────────────────────────────
router.get('/soil', requireRole(allRoles), async (req, res) => {
    try { res.json(await naturalFarmingService.getAllSoil(req.query, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/soil', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.status(201).json(await naturalFarmingService.createSoil(req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.put('/soil/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.json(await naturalFarmingService.updateSoil(req.params.id, req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.delete('/soil/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { await naturalFarmingService.deleteSoil(req.params.id, req.user); res.json({ message: 'Deleted successfully' }); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// ───── Financial Info (Budget Expenditure) ───────────────────────────────────
router.get('/budget', requireRole(allRoles), async (req, res) => {
    try { res.json(await naturalFarmingService.getAllFinancial(req.query, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.post('/budget', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.status(201).json(await naturalFarmingService.createFinancial(req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.put('/budget/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { res.json(await naturalFarmingService.updateFinancial(req.params.id, req.body, req.user)); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});
router.delete('/budget/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try { await naturalFarmingService.deleteFinancial(req.params.id, req.user); res.json({ message: 'Deleted successfully' }); }
    catch (e) {
        console.error("Natural Farming API Error:", e);
        res.status(500).json({ message: e.message });
    }
});

module.exports = router;
