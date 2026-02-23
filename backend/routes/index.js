
//

const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes.js');
const authRoutes = require('./authRoutes.js');
const adminRoutes = require('./adminRoutes.js');
const oftFldRoutes = require('./all-masters/oftFldRoutes.js');
const masterDataRoutes = require('./all-masters/masterDataRoutes.js');
const trainingExtensionEventsRoutes = require('./all-masters/trainingExtensionEventsRoutes.js');
const productionProjectsRoutes = require('./all-masters/productionProjectsRoutes.js');
const publicationRoutes = require('./all-masters/publicationRoutes.js');
const otherMastersRoutes = require('./all-masters/otherMastersRoutes.js');
const exportRoutes = require('./exportRoutes.js');
const aboutKvkRoutes = require('./forms/aboutKvkRoutes.js');
const kvkAwardRoutes = require('./forms/kvkAwardRoutes.js');
const scientistAwardRoutes = require('./forms/scientistAwardRoutes.js');
const farmerAwardRoutes = require('./forms/farmerAwardRoutes.js');
const extensionActivityRoutes = require('./forms/extensionActivityRoutes.js');
const otherExtensionActivityRoutes = require('./forms/otherExtensionActivityRoutes.js');
const hrdRoutes = require('./forms/hrdRoutes.js');
const oftRoutes = require('./forms/oftRoutes.js');
const techWeekRoutes = require('./forms/techWeekRoutes.js');
const celebrationDaysRoutes = require('./forms/celebrationDaysRoutes.js');
const fldRoutes = require('./forms/fldRoutes.js');
const soilEquipmentRoutes = require('./forms/soilEquipmentRoutes.js');
const soilAnalysisRoutes = require('./forms/soilAnalysisRoutes.js');
const worldSoilDayRoutes = require('./forms/worldSoilDayRoutes.js');


// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', masterDataRoutes); // Master data routes under /admin
router.use('/admin/masters', oftFldRoutes); // OFT/FLD master data routes
router.use('/admin/masters', trainingExtensionEventsRoutes); // Training, Extension & Events master data routes
router.use('/admin/masters', productionProjectsRoutes); // Production & Projects master data routes
router.use('/admin/masters', publicationRoutes); // Publication master data routes
router.use('/admin/masters', otherMastersRoutes); // Other Masters routes (Season, Sanctioned Post, Year)
router.use('/admin/masters', exportRoutes); // Export routes
router.use('/users', userRoutes);
router.use('/forms/about-kvk', aboutKvkRoutes);
router.use('/forms/achievements/kvk-awards', kvkAwardRoutes);
router.use('/forms/achievements/scientist-awards', scientistAwardRoutes);
router.use('/forms/achievements/farmer-awards', farmerAwardRoutes);
router.use('/forms/achievements/extension-activities', extensionActivityRoutes);
router.use('/forms/achievements/other-extension-activities', otherExtensionActivityRoutes);
router.use('/forms/hrd', hrdRoutes);
router.use('/forms/achievements/oft', oftRoutes);
router.use('/forms/achievements/technology-week', techWeekRoutes);
router.use('/forms/achievements/celebration-days', celebrationDaysRoutes);
router.use('/forms/achievements/fld', fldRoutes);
router.use('/forms/soil-water/equipment', soilEquipmentRoutes);
router.use('/forms/soil-water/analysis', soilAnalysisRoutes);
router.use('/forms/soil-water/world-soil-day', worldSoilDayRoutes);






module.exports = router;