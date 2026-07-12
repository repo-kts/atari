const express = require('express');
const router = express.Router();
const demonstrationUnitRepository = require('../../repositories/forms/demonstrationUnitRepository.js');
const instructionalFarmCropRepository = require('../../repositories/forms/instructionalFarmCropRepository.js');
const productionUnitRepository = require('../../repositories/forms/productionUnitRepository.js');
const instructionalFarmLivestockRepository = require('../../repositories/forms/instructionalFarmLivestockRepository.js');
const hostelUtilizationRepository = require('../../repositories/forms/hostelUtilizationRepository.js');
const staffQuartersUtilizationRepository = require('../../repositories/forms/staffQuartersUtilizationRepository.js');
const rainwaterHarvestingRepository = require('../../repositories/forms/rainwaterHarvestingRepository.js');
const { authenticateToken, requirePermission } = require('../../middleware/auth.js');
const { sendFormRouteError } = require('../../utils/errorHandler.js');
const reportCacheInvalidationService = require('../../services/reports/reportCacheInvalidationService.js');

// All routes require authentication
router.use(authenticateToken);

// 1. Demonstration Units (with cache invalidation for reports)
router.get('/demonstration-units', requirePermission('performance_indicators_demonstration_units', 'VIEW'), async (req, res) => {
    try {
        const data = await demonstrationUnitRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/demonstration-units', requirePermission('performance_indicators_demonstration_units', 'ADD'), async (req, res) => {
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
router.put('/demonstration-units/:id', requirePermission('performance_indicators_demonstration_units', 'EDIT'), updateDemonstrationUnit);
router.patch('/demonstration-units/:id', requirePermission('performance_indicators_demonstration_units', 'EDIT'), updateDemonstrationUnit);

router.delete('/demonstration-units/:id', requirePermission('performance_indicators_demonstration_units', 'DELETE'), async (req, res) => {
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
router.get('/instructional-farm-crops', requirePermission('performance_indicators_instructional_farm_crops', 'VIEW'), async (req, res) => {
    try {
        const data = await instructionalFarmCropRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/instructional-farm-crops', requirePermission('performance_indicators_instructional_farm_crops', 'ADD'), async (req, res) => {
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
router.put('/instructional-farm-crops/:id', requirePermission('performance_indicators_instructional_farm_crops', 'EDIT'), updateInstructionalFarmCrop);
router.patch('/instructional-farm-crops/:id', requirePermission('performance_indicators_instructional_farm_crops', 'EDIT'), updateInstructionalFarmCrop);

router.delete('/instructional-farm-crops/:id', requirePermission('performance_indicators_instructional_farm_crops', 'DELETE'), async (req, res) => {
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
router.get('/production-units', requirePermission('performance_indicators_production_units', 'VIEW'), async (req, res) => {
    try {
        const data = await productionUnitRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/production-units', requirePermission('performance_indicators_production_units', 'ADD'), async (req, res) => {
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
router.put('/production-units/:id', requirePermission('performance_indicators_production_units', 'EDIT'), updateProductionUnit);
router.patch('/production-units/:id', requirePermission('performance_indicators_production_units', 'EDIT'), updateProductionUnit);

router.delete('/production-units/:id', requirePermission('performance_indicators_production_units', 'DELETE'), async (req, res) => {
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
router.get('/instructional-farm-livestock', requirePermission('performance_indicators_instructional_farm_livestock', 'VIEW'), async (req, res) => {
    try {
        const data = await instructionalFarmLivestockRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/instructional-farm-livestock', requirePermission('performance_indicators_instructional_farm_livestock', 'ADD'), async (req, res) => {
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
router.put('/instructional-farm-livestock/:id', requirePermission('performance_indicators_instructional_farm_livestock', 'EDIT'), updateInstructionalFarmLivestock);
router.patch('/instructional-farm-livestock/:id', requirePermission('performance_indicators_instructional_farm_livestock', 'EDIT'), updateInstructionalFarmLivestock);

router.delete('/instructional-farm-livestock/:id', requirePermission('performance_indicators_instructional_farm_livestock', 'DELETE'), async (req, res) => {
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
router.get('/hostel', requirePermission('performance_indicators_hostel_facilities', 'VIEW'), async (req, res) => {
    try {
        const data = await hostelUtilizationRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/hostel', requirePermission('performance_indicators_hostel_facilities', 'ADD'), async (req, res) => {
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
router.put('/hostel/:id', requirePermission('performance_indicators_hostel_facilities', 'EDIT'), updateHostelUtilization);
router.patch('/hostel/:id', requirePermission('performance_indicators_hostel_facilities', 'EDIT'), updateHostelUtilization);

router.delete('/hostel/:id', requirePermission('performance_indicators_hostel_facilities', 'DELETE'), async (req, res) => {
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
router.get('/staff-quarters', requirePermission('performance_indicators_staff_quarters', 'VIEW'), async (req, res) => {
    try {
        const data = await staffQuartersUtilizationRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/staff-quarters', requirePermission('performance_indicators_staff_quarters', 'ADD'), async (req, res) => {
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
router.put('/staff-quarters/:id', requirePermission('performance_indicators_staff_quarters', 'EDIT'), updateStaffQuarters);
router.patch('/staff-quarters/:id', requirePermission('performance_indicators_staff_quarters', 'EDIT'), updateStaffQuarters);

router.delete('/staff-quarters/:id', requirePermission('performance_indicators_staff_quarters', 'DELETE'), async (req, res) => {
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
router.get('/rainwater-harvesting', requirePermission('performance_indicators_rainwater_harvesting', 'VIEW'), async (req, res) => {
    try {
        const data = await rainwaterHarvestingRepository.findAll(req.query, req.user);
        res.json(data);
    } catch (error) {
        sendFormRouteError(res, error);
    }
});

router.post('/rainwater-harvesting', requirePermission('performance_indicators_rainwater_harvesting', 'ADD'), async (req, res) => {
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
router.put('/rainwater-harvesting/:id', requirePermission('performance_indicators_rainwater_harvesting', 'EDIT'), updateRainwaterHarvesting);
router.patch('/rainwater-harvesting/:id', requirePermission('performance_indicators_rainwater_harvesting', 'EDIT'), updateRainwaterHarvesting);

router.delete('/rainwater-harvesting/:id', requirePermission('performance_indicators_rainwater_harvesting', 'DELETE'), async (req, res) => {
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
