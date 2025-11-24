const express = require('express');
const router = express.Router();

router.post('/entry', (req, res) => res.json({ message: 'arduino entry received' }));
router.post('/exit', (req, res) => res.json({ message: 'arduino exit received' }));
router.post('/heartbeat', (req, res) => res.json({ message: 'heartbeat' }));

module.exports = router;
