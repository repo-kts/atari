const express = require('express');
const router = express.Router();
const kvkImpactActivityRepository = require('../../repositories/forms/kvkImpactActivityRepository');
const entrepreneurshipRepository = require('../../repositories/forms/entrepreneurshipRepository');
const successStoryRepository = require('../../repositories/forms/successStoryRepository');
const { authenticateToken } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// 1. Impact of KVK Activities
router.get('/kvk-activities', async (req, res) => {
    try {
        const data = await kvkImpactActivityRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/kvk-activities', async (req, res) => {
    try {
        const data = await kvkImpactActivityRepository.create(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateKvkActivities = async (req, res) => {
    try {
        const data = await kvkImpactActivityRepository.update(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/kvk-activities/:id', updateKvkActivities);
router.patch('/kvk-activities/:id', updateKvkActivities);

router.delete('/kvk-activities/:id', async (req, res) => {
    try {
        await kvkImpactActivityRepository.delete(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Entrepreneurship
router.get('/entrepreneurship', async (req, res) => {
    try {
        const data = await entrepreneurshipRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/entrepreneurship', async (req, res) => {
    try {
        const data = await entrepreneurshipRepository.create(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateEntrepreneurship = async (req, res) => {
    try {
        const data = await entrepreneurshipRepository.update(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/entrepreneurship/:id', updateEntrepreneurship);
router.patch('/entrepreneurship/:id', updateEntrepreneurship);

router.delete('/entrepreneurship/:id', async (req, res) => {
    try {
        await entrepreneurshipRepository.delete(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Success Stories
router.get('/success-stories', async (req, res) => {
    try {
        const data = await successStoryRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/success-stories', async (req, res) => {
    try {
        const data = await successStoryRepository.create(req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateSuccessStories = async (req, res) => {
    try {
        const data = await successStoryRepository.update(req.params.id, req.body, req.user);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/success-stories/:id', updateSuccessStories);
router.patch('/success-stories/:id', updateSuccessStories);

router.delete('/success-stories/:id', async (req, res) => {
    try {
        await successStoryRepository.delete(req.params.id, req.user);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
