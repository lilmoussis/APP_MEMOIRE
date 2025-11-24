const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => res.json({ message: 'stats dashboard placeholder' }));

module.exports = router;
