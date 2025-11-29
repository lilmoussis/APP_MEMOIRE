const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');
const { isGerant } = require('../middleware/roles');
const { periodValidator, dateRangeValidator } = require('../middleware/validators');

router.get('/dashboard', authenticateToken, isGerant, statsController.getDashboardStats);
router.get('/revenue', authenticateToken, isGerant, periodValidator, dateRangeValidator, statsController.getRevenueStats);
router.get('/occupancy', authenticateToken, isGerant, periodValidator, statsController.getOccupancyStats);
router.get('/traffic', authenticateToken, isGerant, periodValidator, statsController.getTrafficStats);
router.get('/vehicles-by-type', authenticateToken, isGerant, statsController.getVehiclesByType);

module.exports = router;
