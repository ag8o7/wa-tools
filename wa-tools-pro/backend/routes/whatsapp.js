/**
 * WhatsApp Routes - Connection, Send, QR
 */

const express = require('express');
const router = express.Router();
const waController = require('../controllers/whatsappController');
const { requireAuth } = require('../middleware/auth');

router.get('/qr', requireAuth, waController.getQR);
router.get('/status', requireAuth, waController.getStatus);
router.post('/send', requireAuth, waController.sendMessage);
router.post('/disconnect', requireAuth, waController.disconnect);
router.post('/generate-link', waController.generateLink);

module.exports = router;
