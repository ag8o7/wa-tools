const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/auth');

router.get('/stats', requireAuth, ctrl.getStats);
router.get('/messages', requireAuth, ctrl.getMessageLogs);

module.exports = router;
