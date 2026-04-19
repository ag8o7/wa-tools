const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/autoReplyController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, ctrl.getAll);
router.post('/', requireAuth, ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.remove);
router.post('/toggle/:id', requireAuth, ctrl.toggle);

module.exports = router;
