const express = require('express');
const router = express.Router();
const formAttachmentController = require('../controllers/formAttachmentController');
const { authenticateToken, requireRole } = require('../middleware/auth.js');

const kvkRoles = ['kvk_admin', 'kvk_user', 'kvk_staff'];
const allRoles = [...kvkRoles, 'super_admin', 'zone_admin', 'state_admin', 'district_admin', 'org_admin', 'kvk_viewer'];
const writeRoles = [...kvkRoles, 'super_admin'];

router.use(authenticateToken);

router.post('/presign', requireRole(writeRoles), formAttachmentController.presignUpload);
router.post('/confirm', requireRole(writeRoles), formAttachmentController.confirmUpload);
router.post('/attach', requireRole(writeRoles), formAttachmentController.attachToRecord);

router.get('/', requireRole(allRoles), formAttachmentController.list);

router.get('/gallery', requireRole(allRoles), formAttachmentController.gallery);
router.get('/gallery/forms', requireRole(allRoles), formAttachmentController.galleryForms);
router.get('/gallery/kvks', requireRole(allRoles), formAttachmentController.galleryKvks);

router.patch('/:attachmentId', requireRole(writeRoles), formAttachmentController.update);
router.delete('/:attachmentId', requireRole(writeRoles), formAttachmentController.remove);

module.exports = router;
