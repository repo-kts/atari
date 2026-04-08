const express = require('express');
const router = express.Router();
const demonstrationUnitRepository = require('../../repositories/forms/demonstrationUnitRepository');
const instructionalFarmCropRepository = require('../../repositories/forms/instructionalFarmCropRepository');
const productionUnitRepository = require('../../repositories/forms/productionUnitRepository');
const instructionalFarmLivestockRepository = require('../../repositories/forms/instructionalFarmLivestockRepository');
const hostelUtilizationRepository = require('../../repositories/forms/hostelUtilizationRepository');
const staffQuartersUtilizationRepository = require('../../repositories/forms/staffQuartersUtilizationRepository');
const rainwaterHarvestingRepository = require('../../repositories/forms/rainwaterHarvestingRepository');
const { authenticateToken, requireRole } = require('../../middleware/auth');
const { sendFormRouteError } = require('../../utils/errorHandler.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService');

// All routes require authentication
router.use(authenticateToken);

// Role groups
const kvkRoles = ['kvk_admin', 'kvk_user'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin'];

// Helper for route generation
const createRoutes = (path, repository) => {
    router.get(`/${path}`, requireRole(allRoles), async (req, res) => {
        try {
            const data = await repository.findAll(req.query, req.user);
            res.json(data);
        } catch (error) {
            sendFormRouteError(res, error);
        }
    });

    router.post(`/${path}`, requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
        try {
            const data = await repository.create(req.body, req.user);
            res.status(201).json(data);
        } catch (error) {
            sendFormRouteError(res, error);
        }
    });

    const updateHandler = async (req, res) => {
        try {
            const data = await repository.update(req.params.id, req.body, req.user);
            res.json(data);
        } catch (error) {
            sendFormRouteError(res, error);
        }
    };
    router.put(`/${path}/:id`, requireRole([...kvkRoles, 'super_admin']), updateHandler);
    router.patch(`/${path}/:id`, requireRole([...kvkRoles, 'super_admin']), updateHandler);

    router.delete(`/${path}/:id`, requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
        try {
            await repository.delete(req.params.id, req.user);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            sendFormRouteError(res, error);
        }
    });
};

// 1. Demonstration Units (with cache invalidation for reports)
router.get('/demonstration-units', requireRole(allRoles), async (req, res) => {
    try {
        const data = await demonstrationUnitRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/demonstration-units', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await demonstrationUnitRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('demonstrationUnit', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateDemonstrationUnit = async (req, res) => {
    try {
        const data = await demonstrationUnitRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('demonstrationUnit', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/demonstration-units/:id', requireRole([...kvkRoles, 'super_admin']), updateDemonstrationUnit);
router.patch('/demonstration-units/:id', requireRole([...kvkRoles, 'super_admin']), updateDemonstrationUnit);

router.delete('/demonstration-units/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await demonstrationUnitRepository.findById(req.params.id, req.user);
        await demonstrationUnitRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('demonstrationUnit', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 2. Instructional Farm Crops (with cache invalidation for reports)
router.get('/instructional-farm-crops', requireRole(allRoles), async (req, res) => {
    try {
        const data = await instructionalFarmCropRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/instructional-farm-crops', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await instructionalFarmCropRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('instructionalFarmCrop', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateInstructionalFarmCrop = async (req, res) => {
    try {
        const data = await instructionalFarmCropRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('instructionalFarmCrop', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/instructional-farm-crops/:id', requireRole([...kvkRoles, 'super_admin']), updateInstructionalFarmCrop);
router.patch('/instructional-farm-crops/:id', requireRole([...kvkRoles, 'super_admin']), updateInstructionalFarmCrop);

router.delete('/instructional-farm-crops/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await instructionalFarmCropRepository.findById(req.params.id, req.user);
        await instructionalFarmCropRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('instructionalFarmCrop', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 3. Production Units (with cache invalidation for reports)
router.get('/production-units', requireRole(allRoles), async (req, res) => {
    try {
        const data = await productionUnitRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/production-units', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await productionUnitRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('productionUnit', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateProductionUnit = async (req, res) => {
    try {
        const data = await productionUnitRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('productionUnit', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/production-units/:id', requireRole([...kvkRoles, 'super_admin']), updateProductionUnit);
router.patch('/production-units/:id', requireRole([...kvkRoles, 'super_admin']), updateProductionUnit);

router.delete('/production-units/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await productionUnitRepository.findById(req.params.id, req.user);
        await productionUnitRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('productionUnit', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 4. Instructional Farm Livestock (with cache invalidation for reports)
router.get('/instructional-farm-livestock', requireRole(allRoles), async (req, res) => {
    try {
        const data = await instructionalFarmLivestockRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/instructional-farm-livestock', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await instructionalFarmLivestockRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('instructionalFarmLivestock', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateInstructionalFarmLivestock = async (req, res) => {
    try {
        const data = await instructionalFarmLivestockRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('instructionalFarmLivestock', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/instructional-farm-livestock/:id', requireRole([...kvkRoles, 'super_admin']), updateInstructionalFarmLivestock);
router.patch('/instructional-farm-livestock/:id', requireRole([...kvkRoles, 'super_admin']), updateInstructionalFarmLivestock);

router.delete('/instructional-farm-livestock/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await instructionalFarmLivestockRepository.findById(req.params.id, req.user);
        await instructionalFarmLivestockRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('instructionalFarmLivestock', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 5. Hostel Utilization (with cache invalidation for reports)
router.get('/hostel', requireRole(allRoles), async (req, res) => {
    try {
        const data = await hostelUtilizationRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/hostel', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await hostelUtilizationRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('hostelUtilization', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateHostelUtilization = async (req, res) => {
    try {
        const data = await hostelUtilizationRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('hostelUtilization', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/hostel/:id', requireRole([...kvkRoles, 'super_admin']), updateHostelUtilization);
router.patch('/hostel/:id', requireRole([...kvkRoles, 'super_admin']), updateHostelUtilization);

router.delete('/hostel/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await hostelUtilizationRepository.findById(req.params.id, req.user);
        await hostelUtilizationRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('hostelUtilization', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 6. Staff Quarters (with cache invalidation for reports)
router.get('/staff-quarters', requireRole(allRoles), async (req, res) => {
    try {
        const data = await staffQuartersUtilizationRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/staff-quarters', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await staffQuartersUtilizationRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('staffQuartersUtilization', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateStaffQuarters = async (req, res) => {
    try {
        const data = await staffQuartersUtilizationRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('staffQuartersUtilization', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/staff-quarters/:id', requireRole([...kvkRoles, 'super_admin']), updateStaffQuarters);
router.patch('/staff-quarters/:id', requireRole([...kvkRoles, 'super_admin']), updateStaffQuarters);

router.delete('/staff-quarters/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await staffQuartersUtilizationRepository.findById(req.params.id, req.user);
        await staffQuartersUtilizationRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('staffQuartersUtilization', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

// 7. Rainwater Harvesting (with cache invalidation for reports)
router.get('/rainwater-harvesting', requireRole(allRoles), async (req, res) => {
    try {
        const data = await rainwaterHarvestingRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/rainwater-harvesting', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const data = await rainwaterHarvestingRepository.create(req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('rainwaterHarvesting', data?.kvkId || req.user?.kvkId);
        res.status(201).json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

const updateRainwaterHarvesting = async (req, res) => {
    try {
        const data = await rainwaterHarvestingRepository.update(req.params.id, req.body, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('rainwaterHarvesting', data?.kvkId || req.user?.kvkId);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
};
router.put('/rainwater-harvesting/:id', requireRole([...kvkRoles, 'super_admin']), updateRainwaterHarvesting);
router.patch('/rainwater-harvesting/:id', requireRole([...kvkRoles, 'super_admin']), updateRainwaterHarvesting);

router.delete('/rainwater-harvesting/:id', requireRole([...kvkRoles, 'super_admin']), async (req, res) => {
    try {
        const existing = await rainwaterHarvestingRepository.findById(req.params.id, req.user);
        await rainwaterHarvestingRepository.delete(req.params.id, req.user);
        await reportCacheInvalidationService.invalidateDataSourceForKvk('rainwaterHarvesting', existing?.kvkId || req.user?.kvkId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

module.exports = router;
