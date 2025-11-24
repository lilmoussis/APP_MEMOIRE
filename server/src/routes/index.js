const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/parking', require('./parking.routes'));
router.use('/entries', require('./entries.routes'));
router.use('/billing', require('./billing.routes'));
router.use('/users', require('./users.routes'));
router.use('/stats', require('./stats.routes'));
router.use('/arduino', require('./arduino.routes'));

router.get('/', (req, res) => res.json({ ok: true, message: 'Parking API' }));

module.exports = router;
