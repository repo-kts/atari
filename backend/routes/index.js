
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
const cfldTechnicalParameterRoutes = require('./forms/cfldTechnicalParameterRoutes.js');
const cfldExtensionActivityRoutes = require('./forms/cfldExtensionActivityRoutes.js');
const cfldBudgetUtilizationRoutes = require('./forms/cfldBudgetUtilizationRoutes.js');
const soilWaterRoutes = require('./forms/soilWaterRoutes.js');
const hrdRoutes = require('./forms/hrdRoutes.js');
const techWeekRoutes = require('./forms/techWeekRoutes.js');
const celebrationDayRoutes = require('./forms/celebrationDayRoutes.js');
const fpoManagementRoutes = require('./forms/fpoManagementRoutes.js');
const fpoCbboDetailsRoutes = require('./forms/fpoCbboDetailsRoutes.js');
const seedHubRoutes = require('./forms/seedHubRoutes.js');
const reportRoutes = require('./reports/reportRoutes.js');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', masterDataRoutes);
router.use('/admin/masters', oftFldRoutes);
router.use('/admin/masters', trainingExtensionEventsRoutes);
router.use('/admin/masters', productionProjectsRoutes);
router.use('/admin/masters', publicationRoutes);
router.use('/admin/masters', otherMastersRoutes);
router.use('/admin/masters', exportRoutes);
router.use('/users', userRoutes);
router.use('/forms/about-kvk', aboutKvkRoutes);
router.use('/forms/achievements/kvk-awards', kvkAwardRoutes);
router.use('/forms/achievements/scientist-awards', scientistAwardRoutes);
router.use('/forms/achievements/farmer-awards', farmerAwardRoutes);
router.use('/forms/achievements/extension-activities', extensionActivityRoutes);
router.use('/forms/achievements/other-extension-activities', otherExtensionActivityRoutes);
router.use('/forms/achievements/cfld-technical-parameters', cfldTechnicalParameterRoutes);
router.use('/forms/achievements/cfld-extension-activities', cfldExtensionActivityRoutes);
router.use('/forms/achievements/cfld-budget-utilizations', cfldBudgetUtilizationRoutes);
router.use('/forms/achievements/soil-water', soilWaterRoutes);
router.use('/forms/achievements/hrd', hrdRoutes);
router.use('/forms/achievements/technology-week', techWeekRoutes);
router.use('/forms/achievements/celebration-days', celebrationDayRoutes);
router.use('/forms/achievements/projects/fpo/details', fpoCbboDetailsRoutes);
router.use('/forms/achievements/projects/fpo/management', fpoManagementRoutes);
router.use('/forms/achievements/projects/seed-hub', seedHubRoutes);
router.use('/reports', reportRoutes);

module.exports = router;