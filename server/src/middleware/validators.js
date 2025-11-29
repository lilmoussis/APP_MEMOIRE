const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array()
    });
  }
  next();
};

const loginValidator = [
  body('username').notEmpty().withMessage('Nom d\'utilisateur requis'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  handleValidationErrors
];

const registerValidator = [
  body('email').isEmail().withMessage('Email invalide'),
  body('username').isLength({ min: 3 }).withMessage('Nom d\'utilisateur minimum 3 caracteres'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caracteres'),
  body('role').optional().isIn(['SUPER_ADMIN', 'GERANT']).withMessage('Role invalide'),
  handleValidationErrors
];

const createUserValidator = [
  body('email').isEmail().withMessage('Email invalide'),
  body('username').isLength({ min: 3 }).withMessage('Nom d\'utilisateur minimum 3 caracteres'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caracteres'),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('phone').optional().isString(),
  body('role').optional().isIn(['SUPER_ADMIN', 'GERANT']).withMessage('Role invalide'),
  handleValidationErrors
];

const updateUserValidator = [
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('username').optional().isLength({ min: 3 }).withMessage('Nom d\'utilisateur minimum 3 caracteres'),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('phone').optional().isString(),
  handleValidationErrors
];

const createParkingValidator = [
  body('name').notEmpty().withMessage('Nom du parking requis'),
  body('totalCapacity').isInt({ min: 1 }).withMessage('Capacite totale doit etre un entier positif'),
  body('location').optional().isString(),
  body('description').optional().isString(),
  handleValidationErrors
];

const updateParkingValidator = [
  body('name').optional().isString(),
  body('totalCapacity').optional().isInt({ min: 1 }).withMessage('Capacite totale doit etre un entier positif'),
  body('location').optional().isString(),
  body('description').optional().isString(),
  handleValidationErrors
];

const createTariffValidator = [
  body('parkingId').notEmpty().withMessage('ID parking requis'),
  body('vehicleType').isIn(['MOTO', 'VOITURE', 'CAMION', 'AUTRE']).withMessage('Type de vehicule invalide'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Prix par heure doit etre un nombre positif'),
  handleValidationErrors
];

const createVehicleValidator = [
  body('plateNumber').notEmpty().withMessage('Numero de plaque requis'),
  body('vehicleType').isIn(['MOTO', 'VOITURE', 'CAMION', 'AUTRE']).withMessage('Type de vehicule invalide'),
  body('brand').optional().isString(),
  body('model').optional().isString(),
  body('color').optional().isString(),
  handleValidationErrors
];

const createCardValidator = [
  body('cardNumber').notEmpty().withMessage('Numero de carte requis'),
  body('vehicleId').notEmpty().withMessage('ID vehicule requis'),
  handleValidationErrors
];

const createEntryValidator = [
  body('parkingId').notEmpty().withMessage('ID parking requis'),
  body('vehicleId').notEmpty().withMessage('ID vehicule requis'),
  body('cardId').optional().isString(),
  handleValidationErrors
];

const exitEntryValidator = [
  body('exitTime').optional().isISO8601().withMessage('Format de date invalide'),
  body('paymentMethod').optional().isString(),
  handleValidationErrors
];

const idValidator = [
  param('id').isUUID().withMessage('ID invalide'),
  handleValidationErrors
];

const periodValidator = [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Periode invalide'),
  handleValidationErrors
];

const dateRangeValidator = [
  query('startDate').optional().isISO8601().withMessage('Format de date de debut invalide'),
  query('endDate').optional().isISO8601().withMessage('Format de date de fin invalide'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  loginValidator,
  registerValidator,
  createUserValidator,
  updateUserValidator,
  createParkingValidator,
  updateParkingValidator,
  createTariffValidator,
  createVehicleValidator,
  createCardValidator,
  createEntryValidator,
  exitEntryValidator,
  idValidator,
  periodValidator,
  dateRangeValidator
};
