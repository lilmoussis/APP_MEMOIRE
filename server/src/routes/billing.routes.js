const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticateToken } = require('../middleware/auth');
const { isGerant } = require('../middleware/roles');
const { idValidator, dateRangeValidator } = require('../middleware/validators');

router.get('/history', authenticateToken, isGerant, billingController.getBillingHistory);
router.get('/export/excel', authenticateToken, isGerant, dateRangeValidator, billingController.exportExcel);
router.get('/:entryId', authenticateToken, isGerant, idValidator, billingController.getBilling);
router.get('/:entryId/pdf', authenticateToken, isGerant, idValidator, billingController.downloadPDF);

module.exports = router;
