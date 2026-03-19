const express = require('express');
const router = express.Router();
const nicraService = require('../../services/forms/nicraService');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// Masters
router.get('/masters/categories', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getCategories();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/masters/subcategories', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getSubCategories(req.query.categoryId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Basic Info
router.get('/basic', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllBasicInfo(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/basic', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createBasicInfo(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateBasicInfo = async (req, res) => {
    try {
        const data = await nicraService.updateBasicInfo(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/basic/:id', requireRole([...kvkRoles, 'super_admin']), updateBasicInfo);
router.patch('/basic/:id', requireRole([...kvkRoles, 'super_admin']), updateBasicInfo);

router.delete('/basic/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteBasicInfo(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Training
router.get('/training', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllTraining(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/training', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createTraining(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateTraining = async (req, res) => {
    try {
        const data = await nicraService.updateTraining(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/training/:id', requireRole([...kvkRoles, 'super_admin']), updateTraining);
router.patch('/training/:id', requireRole([...kvkRoles, 'super_admin']), updateTraining);

router.delete('/training/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteTraining(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Extension Activity
router.get('/extension', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllExtensionActivity(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/extension', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createExtensionActivity(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateExtension = async (req, res) => {
    try {
        const data = await nicraService.updateExtensionActivity(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/extension/:id', requireRole([...kvkRoles, 'super_admin']), updateExtension);
router.patch('/extension/:id', requireRole([...kvkRoles, 'super_admin']), updateExtension);

router.delete('/extension/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteExtensionActivity(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Details
router.get('/details', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllDetails(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/details', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createDetails(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateDetails = async (req, res) => {
    try {
        const data = await nicraService.updateDetails(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/details/:id', requireRole([...kvkRoles, 'super_admin']), updateDetails);
router.patch('/details/:id', requireRole([...kvkRoles, 'super_admin']), updateDetails);

router.delete('/details/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteDetails(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Intervention
router.get('/intervention', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllIntervention(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/intervention', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createIntervention(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateIntervention = async (req, res) => {
    try {
        const data = await nicraService.updateIntervention(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/intervention/:id', requireRole([...kvkRoles, 'super_admin']), updateIntervention);
router.patch('/intervention/:id', requireRole([...kvkRoles, 'super_admin']), updateIntervention);

router.delete('/intervention/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteIntervention(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Revenue
router.get('/revenue', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllRevenue(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/revenue', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createRevenue(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateRevenue = async (req, res) => {
    try {
        const data = await nicraService.updateRevenue(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/revenue/:id', requireRole([...kvkRoles, 'super_admin']), updateRevenue);
router.patch('/revenue/:id', requireRole([...kvkRoles, 'super_admin']), updateRevenue);

router.delete('/revenue/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteRevenue(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Farm Implement (Custom Hiring)
router.get('/farm-implement', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllFarmImplement(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/farm-implement', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createFarmImplement(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateFarmImplement = async (req, res) => {
    try {
        const data = await nicraService.updateFarmImplement(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/farm-implement/:id', requireRole([...kvkRoles, 'super_admin']), updateFarmImplement);
router.patch('/farm-implement/:id', requireRole([...kvkRoles, 'super_admin']), updateFarmImplement);

router.delete('/farm-implement/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteFarmImplement(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// VCRMC
router.get('/vcrmc', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllVcrmc(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/vcrmc', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createVcrmc(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateVcrmc = async (req, res) => {
    try {
        const data = await nicraService.updateVcrmc(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/vcrmc/:id', requireRole([...kvkRoles, 'super_admin']), updateVcrmc);
router.patch('/vcrmc/:id', requireRole([...kvkRoles, 'super_admin']), updateVcrmc);

router.delete('/vcrmc/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteVcrmc(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Soil Health
router.get('/soil-health', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllSoilHealth(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/soil-health', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createSoilHealth(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateSoilHealth = async (req, res) => {
    try {
        const data = await nicraService.updateSoilHealth(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/soil-health/:id', requireRole([...kvkRoles, 'super_admin']), updateSoilHealth);
router.patch('/soil-health/:id', requireRole([...kvkRoles, 'super_admin']), updateSoilHealth);

router.delete('/soil-health/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteSoilHealth(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Convergence
router.get('/convergence', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllConvergence(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/convergence', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createConvergence(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateConvergence = async (req, res) => {
    try {
        const data = await nicraService.updateConvergence(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/convergence/:id', requireRole([...kvkRoles, 'super_admin']), updateConvergence);
router.patch('/convergence/:id', requireRole([...kvkRoles, 'super_admin']), updateConvergence);

router.delete('/convergence/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteConvergence(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dignitaries
router.get('/dignitaries', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllDignitaries(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/dignitaries', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createDignitaries(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateDignitaries = async (req, res) => {
    try {
        const data = await nicraService.updateDignitaries(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/dignitaries/:id', requireRole([...kvkRoles, 'super_admin']), updateDignitaries);
router.patch('/dignitaries/:id', requireRole([...kvkRoles, 'super_admin']), updateDignitaries);

router.delete('/dignitaries/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deleteDignitaries(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PI CO-PI
router.get('/pi-copi', requireRole(allRoles), async (req, res) => {
    try {
        const data = await nicraService.getAllPiCopi(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/pi-copi', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await nicraService.createPiCopi(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updatePiCopi = async (req, res) => {
    try {
        const data = await nicraService.updatePiCopi(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/pi-copi/:id', requireRole([...kvkRoles, 'super_admin']), updatePiCopi);
router.patch('/pi-copi/:id', requireRole([...kvkRoles, 'super_admin']), updatePiCopi);

router.delete('/pi-copi/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        await nicraService.deletePiCopi(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
