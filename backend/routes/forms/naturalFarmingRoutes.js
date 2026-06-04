const express = require('express');
const router = express.Router();
const naturalFarmingService = require('../../services/forms/naturalFarmingService.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const { handleError } = require('../../utils/errorHandler.js');

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

// ───── Farmers Practicing (dedicated farmers_practicing_natural_farming table, UUID PK) ─
router.get('/farmers', requireRole(allRoles), async (req, res) => {
    try {
        res.json(await naturalFarmingService.getAllFarmersPracticing(req.query, req.user));
    } catch (e) {
        handleError(e, res, 'Farmers practicing records', 'list');
    }
});
router.post('/farmers', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        res.status(201).json(await naturalFarmingService.createFarmersPracticing(req.body, req.user));
    } catch (e) {
        handleError(e, res, 'Farmers practicing record', 'create');
    }
});
router.put('/farmers/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        res.json(await naturalFarmingService.updateFarmersPracticing(req.params.id, req.body, req.user));
    } catch (e) {
        handleError(e, res, 'Farmers practicing record', 'update');
    }
});
router.delete('/farmers/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await naturalFarmingService.deleteFarmersPracticing(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (e) {
        handleError(e, res, 'Farmers practicing record', 'delete');
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
