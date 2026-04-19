const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/broadcastController');
const { requireAuth } = require('../middleware/auth');

router.post('/send', requireAuth, ctrl.sendBroadcast);
router.get('/history', requireAuth, ctrl.getHistory);

module.exports = router;
