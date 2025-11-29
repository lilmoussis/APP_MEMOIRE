const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/roles');
const { 
  createUserValidator, 
  updateUserValidator, 
  idValidator 
} = require('../middleware/validators');

router.get('/', authenticateToken, isSuperAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, isSuperAdmin, idValidator, userController.getUserById);
router.post('/', authenticateToken, isSuperAdmin, createUserValidator, userController.createUser);
router.put('/:id', authenticateToken, isSuperAdmin, idValidator, updateUserValidator, userController.updateUser);
router.delete('/:id', authenticateToken, isSuperAdmin, idValidator, userController.deleteUser);
router.patch('/:id/toggle-status', authenticateToken, isSuperAdmin, idValidator, userController.toggleUserStatus);

module.exports = router;
