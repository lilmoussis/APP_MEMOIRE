const express = require('express');
const router = express.Router();

router.get('/:entryId', (req, res) => res.json({ message: 'billing placeholder' }));
router.get('/:entryId/pdf', (req, res) => res.json({ message: 'pdf placeholder' }));

module.exports = router;
