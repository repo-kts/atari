const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes.js');
const authRoutes = require('./authRoutes.js');
const adminRoutes = require('./adminRoutes.js');
const masterDataRoutes = require('./masterDataRoutes.js');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', masterDataRoutes); // Master data routes under /admin
router.use('/users', userRoutes);

module.exports = router;
