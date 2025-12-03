const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const { authenticateToken } = require('../middleware/auth');
const { isSuperAdmin, isGerant } = require('../middleware/roles');
const { 
  createParkingValidator, 
  updateParkingValidator, 
  createTariffValidator,
  createVehicleValidator,
  createCardValidator,
  idValidator 
} = require('../middleware/validators');

router.get('/', authenticateToken, isGerant, parkingController.getAllParkings);
router.get('/:id', authenticateToken, isGerant, idValidator, parkingController.getParkingById);
router.post('/', authenticateToken, isSuperAdmin, createParkingValidator, parkingController.createParking);
router.put('/:id', authenticateToken, isSuperAdmin, idValidator, updateParkingValidator, parkingController.updateParking);
router.delete('/:id', authenticateToken, isSuperAdmin, idValidator, parkingController.deleteParking);
router.get('/:id/availability', authenticateToken, isGerant, idValidator, parkingController.getAvailability);

router.get('/:parkingId/tariffs', authenticateToken, isGerant, parkingController.getTariffs);
router.post('/tariffs', authenticateToken, isSuperAdmin, createTariffValidator, parkingController.createTariff);
router.put('/tariffs/:id', authenticateToken, isSuperAdmin, idValidator, parkingController.updateTariff);
router.delete('/tariffs/:id', authenticateToken, isSuperAdmin, idValidator, parkingController.deleteTariff);

router.get('/vehicles/all', authenticateToken, isGerant, parkingController.getVehicles);
router.get('/vehicles/:id', authenticateToken, isGerant, idValidator, parkingController.getVehicleById);
router.post('/vehicles', authenticateToken, isGerant, createVehicleValidator, parkingController.createVehicle);
router.put('/vehicles/:id', authenticateToken, isGerant, idValidator, parkingController.updateVehicle);
router.delete('/vehicles/:id', authenticateToken, isGerant, idValidator, parkingController.deleteVehicle);

router.get('/cards/all', authenticateToken, isGerant, parkingController.getCards);
router.post('/cards', authenticateToken, isGerant, createCardValidator, parkingController.createCard);
router.put('/cards/:id', authenticateToken, isGerant, idValidator, parkingController.updateCard);
router.delete('/cards/:id', authenticateToken, isGerant, idValidator, parkingController.deleteCard);
router.patch('/cards/:id/toggle-status', authenticateToken, isGerant, idValidator, parkingController.toggleCardStatus);

module.exports = router;
