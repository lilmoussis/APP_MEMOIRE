const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifie'
        });
      }

      if (allowedRoles.length === 0) {
        return next();
      }

      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Acces refuse. Droits insuffisants.'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la verification des droits'
      });
    }
  };
};

const isSuperAdmin = checkRole(['SUPER_ADMIN']);
const isGerant = checkRole(['GERANT', 'SUPER_ADMIN']);

module.exports = {
  checkRole,
  isSuperAdmin,
  isGerant
};
