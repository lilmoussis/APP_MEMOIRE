const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.get('/', parkingController.getParking);
router.put('/:id', parkingController.updateParking);
router.get('/availability', parkingController.getAvailability);

module.exports = router;
