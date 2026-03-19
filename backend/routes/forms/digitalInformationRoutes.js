const express = require('express');
const router = express.Router();
const mobileAppController = require('../../controllers/forms/mobileAppController.js');
const webPortalController = require('../../controllers/forms/webPortalController.js');
const kisanSarathiController = require('../../controllers/forms/kisanSarathiController.js');
const kmasController = require('../../controllers/forms/kmasController.js');
const msgDetailsController = require('../../controllers/forms/msgDetailsController.js');
const { authenticateToken } = require('../../middleware/auth.js');

// Apply authentication to all routes
router.use(authenticateToken);

// Mobile App routes
router.post('/mobile-app', mobileAppController.create);
router.get('/mobile-app', mobileAppController.findAll);
router.get('/mobile-app/:id', mobileAppController.findById);
router.put('/mobile-app/:id', mobileAppController.update);
router.delete('/mobile-app/:id', mobileAppController.delete);

// Web Portal routes
router.post('/web-portal', webPortalController.create);
router.get('/web-portal', webPortalController.findAll);
router.get('/web-portal/:id', webPortalController.findById);
router.put('/web-portal/:id', webPortalController.update);
router.delete('/web-portal/:id', webPortalController.delete);

// Kisan Sarathi routes
router.post('/kisan-sarathi', kisanSarathiController.create);
router.get('/kisan-sarathi', kisanSarathiController.findAll);
router.get('/kisan-sarathi/:id', kisanSarathiController.findById);
router.put('/kisan-sarathi/:id', kisanSarathiController.update);
router.delete('/kisan-sarathi/:id', kisanSarathiController.delete);

// KMAS routes
router.post('/kmas', kmasController.create);
router.get('/kmas', kmasController.findAll);
router.get('/kmas/:id', kmasController.findById);
router.put('/kmas/:id', kmasController.update);
router.delete('/kmas/:id', kmasController.delete);

// Message Details routes
router.post('/msg-details', msgDetailsController.create);
router.get('/msg-details', msgDetailsController.findAll);
router.get('/msg-details/:id', msgDetailsController.findById);
router.put('/msg-details/:id', msgDetailsController.update);
router.delete('/msg-details/:id', msgDetailsController.delete);

module.exports = router;
