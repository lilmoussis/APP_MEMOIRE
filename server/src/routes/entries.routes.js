const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { authenticateToken } = require('../middleware/auth');
const { isGerant } = require('../middleware/roles');
const { 
  createEntryValidator, 
  exitEntryValidator, 
  idValidator 
} = require('../middleware/validators');

router.get('/', authenticateToken, isGerant, entryController.getAllEntries);
router.get('/active', authenticateToken, isGerant, entryController.getActiveEntries);
router.get('/:id', authenticateToken, isGerant, idValidator, entryController.getEntryById);
router.get('/vehicle/:vehicleId', authenticateToken, isGerant, idValidator, entryController.getVehicleHistory);
router.post('/', authenticateToken, isGerant, createEntryValidator, entryController.createEntry);
router.put('/:id/exit', authenticateToken, isGerant, idValidator, exitEntryValidator, entryController.exitEntry);
router.patch('/:id/cancel', authenticateToken, isGerant, idValidator, entryController.cancelEntry);

module.exports = router;
