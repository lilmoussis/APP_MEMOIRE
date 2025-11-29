const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');

router.post('/entry', entryController.createAutoEntry);
router.post('/exit', entryController.createAutoExit);
router.post('/heartbeat', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Arduino connecte',
    timestamp: new Date().toISOString()
  });
});
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    server: 'operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
