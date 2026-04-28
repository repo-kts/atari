const express = require('express');
const router = express.Router();
const kvkImpactActivityRepository = require('../../repositories/forms/kvkImpactActivityRepository.js');
const entrepreneurshipRepository = require('../../repositories/forms/entrepreneurshipRepository.js');
const successStoryRepository = require('../../repositories/forms/successStoryRepository.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');
const { authenticateToken, requireRole } = require('../../middleware/auth.js');
const { sendFormRouteError } = require('../../utils/errorHandler.js');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// 1. Impact of KVK Activities
router.get('/kvk-activities', requireRole(allRoles), async (req, res) => {
    try {
        const data = await kvkImpactActivityRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/kvk-activities', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await kvkImpactActivityRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('kvkImpactActivity', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateKvkActivities = async (req, res) => {
    try {
        const data = await kvkImpactActivityRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('kvkImpactActivity', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/kvk-activities/:id', requireRole([...kvkRoles, 'super_admin']), updateKvkActivities);
router.patch('/kvk-activities/:id', requireRole([...kvkRoles, 'super_admin']), updateKvkActivities);

router.delete('/kvk-activities/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await kvkImpactActivityRepository.findById(req.params.id, req.user);
        await kvkImpactActivityRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('kvkImpactActivity', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 2. Entrepreneurship
router.get('/entrepreneurship', requireRole(allRoles), async (req, res) => {
    try {
        const data = await entrepreneurshipRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/entrepreneurship', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await entrepreneurshipRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('entrepreneurship', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateEntrepreneurship = async (req, res) => {
    try {
        const data = await entrepreneurshipRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('entrepreneurship', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/entrepreneurship/:id', requireRole([...kvkRoles, 'super_admin']), updateEntrepreneurship);
router.patch('/entrepreneurship/:id', requireRole([...kvkRoles, 'super_admin']), updateEntrepreneurship);

router.delete('/entrepreneurship/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await entrepreneurshipRepository.findById(req.params.id, req.user);
        await entrepreneurshipRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('entrepreneurship', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 3. Success Stories
router.get('/success-stories', requireRole(allRoles), async (req, res) => {
    try {
        const data = await successStoryRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/success-stories', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await successStoryRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('successStory', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateSuccessStories = async (req, res) => {
    try {
        const data = await successStoryRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('successStory', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/success-stories/:id', requireRole([...kvkRoles, 'super_admin']), updateSuccessStories);
router.patch('/success-stories/:id', requireRole([...kvkRoles, 'super_admin']), updateSuccessStories);

router.delete('/success-stories/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await successStoryRepository.findById(req.params.id, req.user);
        await successStoryRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('successStory', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

module.exports = router;
