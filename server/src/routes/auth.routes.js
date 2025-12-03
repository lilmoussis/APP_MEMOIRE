const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/roles');
const { loginValidator, registerValidator } = require('../middleware/validators');

router.post('/login', loginValidator, authController.login);
router.post('/register', authenticateToken, isSuperAdmin, registerValidator, authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
