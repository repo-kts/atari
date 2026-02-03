const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes.js');
const authRoutes = require('./authRoutes.js');
const adminRoutes = require('./adminRoutes.js');
const oftFldRoutes = require('./all-masters/oftFldRoutes.js');
const masterDataRoutes = require('./all-masters/masterDataRoutes.js');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', masterDataRoutes); // Master data routes under /admin
router.use('/admin/masters', oftFldRoutes); // OFT/FLD master data routes
router.use('/users', userRoutes);

module.exports = router;
