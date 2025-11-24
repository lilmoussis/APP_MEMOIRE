const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');

router.get('/', entryController.list);
router.post('/', entryController.create);
router.post('/auto', entryController.autoEntry);
router.put('/:id/exit', entryController.exit);

module.exports = router;
