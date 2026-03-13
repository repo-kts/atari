const express = require('express');
const router = express.Router();
const nicraService = require('../../services/forms/nicraService');
const { authenticateToken } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Masters
router.get('/masters/categories', async (req, res) => {
    try {
        const data = await nicraService.getCategories();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/masters/subcategories', async (req, res) => {
    try {
        const data = await nicraService.getSubCategories(req.query.categoryId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Basic Info
router.get('/basic', async (req, res) => {
    try {
        const data = await nicraService.getAllBasicInfo(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/basic', async (req, res) => {
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
router.put('/basic/:id', updateBasicInfo);
router.patch('/basic/:id', updateBasicInfo);

router.delete('/basic/:id', async (req, res) => {
    try {
        await nicraService.deleteBasicInfo(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Training
router.get('/training', async (req, res) => {
    try {
        const data = await nicraService.getAllTraining(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/training', async (req, res) => {
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
router.put('/training/:id', updateTraining);
router.patch('/training/:id', updateTraining);

router.delete('/training/:id', async (req, res) => {
    try {
        await nicraService.deleteTraining(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Extension Activity
router.get('/extension', async (req, res) => {
    try {
        const data = await nicraService.getAllExtensionActivity(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/extension', async (req, res) => {
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
router.put('/extension/:id', updateExtension);
router.patch('/extension/:id', updateExtension);

router.delete('/extension/:id', async (req, res) => {
    try {
        await nicraService.deleteExtensionActivity(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Details
router.get('/details', async (req, res) => {
    try {
        const data = await nicraService.getAllDetails(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/details', async (req, res) => {
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
router.put('/details/:id', updateDetails);
router.patch('/details/:id', updateDetails);

router.delete('/details/:id', async (req, res) => {
    try {
        await nicraService.deleteDetails(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Intervention
router.get('/intervention', async (req, res) => {
    try {
        const data = await nicraService.getAllIntervention(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/intervention', async (req, res) => {
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
router.put('/intervention/:id', updateIntervention);
router.patch('/intervention/:id', updateIntervention);

router.delete('/intervention/:id', async (req, res) => {
    try {
        await nicraService.deleteIntervention(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Revenue
router.get('/revenue', async (req, res) => {
    try {
        const data = await nicraService.getAllRevenue(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/revenue', async (req, res) => {
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
router.put('/revenue/:id', updateRevenue);
router.patch('/revenue/:id', updateRevenue);

router.delete('/revenue/:id', async (req, res) => {
    try {
        await nicraService.deleteRevenue(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Farm Implement (Custom Hiring)
router.get('/farm-implement', async (req, res) => {
    try {
        const data = await nicraService.getAllFarmImplement(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/farm-implement', async (req, res) => {
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
router.put('/farm-implement/:id', updateFarmImplement);
router.patch('/farm-implement/:id', updateFarmImplement);

router.delete('/farm-implement/:id', async (req, res) => {
    try {
        await nicraService.deleteFarmImplement(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// VCRMC
router.get('/vcrmc', async (req, res) => {
    try {
        const data = await nicraService.getAllVcrmc(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/vcrmc', async (req, res) => {
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
router.put('/vcrmc/:id', updateVcrmc);
router.patch('/vcrmc/:id', updateVcrmc);

router.delete('/vcrmc/:id', async (req, res) => {
    try {
        await nicraService.deleteVcrmc(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Soil Health
router.get('/soil-health', async (req, res) => {
    try {
        const data = await nicraService.getAllSoilHealth(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/soil-health', async (req, res) => {
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
router.put('/soil-health/:id', updateSoilHealth);
router.patch('/soil-health/:id', updateSoilHealth);

router.delete('/soil-health/:id', async (req, res) => {
    try {
        await nicraService.deleteSoilHealth(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Convergence
router.get('/convergence', async (req, res) => {
    try {
        const data = await nicraService.getAllConvergence(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/convergence', async (req, res) => {
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
router.put('/convergence/:id', updateConvergence);
router.patch('/convergence/:id', updateConvergence);

router.delete('/convergence/:id', async (req, res) => {
    try {
        await nicraService.deleteConvergence(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dignitaries
router.get('/dignitaries', async (req, res) => {
    try {
        const data = await nicraService.getAllDignitaries(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/dignitaries', async (req, res) => {
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
router.put('/dignitaries/:id', updateDignitaries);
router.patch('/dignitaries/:id', updateDignitaries);

router.delete('/dignitaries/:id', async (req, res) => {
    try {
        await nicraService.deleteDignitaries(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PI CO-PI
router.get('/pi-copi', async (req, res) => {
    try {
        const data = await nicraService.getAllPiCopi(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/pi-copi', async (req, res) => {
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
router.put('/pi-copi/:id', updatePiCopi);
router.patch('/pi-copi/:id', updatePiCopi);

router.delete('/pi-copi/:id', async (req, res) => {
    try {
        await nicraService.deletePiCopi(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
