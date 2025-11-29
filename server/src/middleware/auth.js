const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token d\'authentification manquant' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn('Token invalide ou expire', { error: err.message });
        return res.status(403).json({ 
          success: false, 
          message: 'Token invalide ou expire' 
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    logger.error('Erreur authentification', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de l\'authentification' 
    });
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Token de rafraichissement invalide');
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken
};
