const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const logger = require('../utils/logger');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des utilisateurs', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouve'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation de l\'utilisateur', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, phone, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email ou nom d\'utilisateur deja utilise'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'GERANT'
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    logger.info(`Utilisateur cree par ${req.user.username}: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Utilisateur cree avec succes',
      data: newUser
    });
  } catch (error) {
    logger.error('Erreur lors de la creation de l\'utilisateur', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, firstName, lastName, phone, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouve'
      });
    }

    if (email || username) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                email ? { email } : {},
                username ? { username } : {}
              ]
            }
          ]
        }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Email ou nom d\'utilisateur deja utilise'
        });
      }
    }

    const updateData = {
      email,
      username,
      firstName,
      lastName,
      phone
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    logger.info(`Utilisateur modifie: ${id}`);

    res.json({
      success: true,
      message: 'Utilisateur modifie avec succes',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Erreur lors de la modification de l\'utilisateur', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouve'
      });
    }

    if (existingUser.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    logger.info(`Utilisateur supprime: ${id}`);

    res.json({
      success: true,
      message: 'Utilisateur supprime avec succes'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'utilisateur', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouve'
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier le statut de votre propre compte'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true
      }
    });

    logger.info(`Statut utilisateur modifie: ${id} -> ${updatedUser.isActive}`);

    res.json({
      success: true,
      message: `Utilisateur ${updatedUser.isActive ? 'active' : 'desactive'} avec succes`,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Erreur lors du changement de statut', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
};
