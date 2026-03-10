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

router.put('/basic/:id', async (req, res) => {
    try {
        const data = await nicraService.updateBasicInfo(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

router.put('/training/:id', async (req, res) => {
    try {
        const data = await nicraService.updateTraining(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

router.put('/extension/:id', async (req, res) => {
    try {
        const data = await nicraService.updateExtensionActivity(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

router.put('/details/:id', async (req, res) => {
    try {
        const data = await nicraService.updateDetails(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/details/:id', async (req, res) => {
    try {
        await nicraService.deleteDetails(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
