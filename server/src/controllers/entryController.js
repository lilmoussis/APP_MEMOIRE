const prisma = require('../config/database');
const logger = require('../utils/logger');
const { calculateDuration, calculateAmount } = require('../utils/helpers');

const getAllEntries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, parkingId, vehicleType, startDate, endDate } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (parkingId) where.parkingId = parkingId;
    
    if (startDate || endDate) {
      where.entryTime = {};
      if (startDate) where.entryTime.gte = new Date(startDate);
      if (endDate) where.entryTime.lte = new Date(endDate);
    }

    if (vehicleType) {
      where.vehicle = {
        vehicleType: vehicleType
      };
    }

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        skip,
        take,
        include: {
          parking: {
            select: {
              id: true,
              name: true
            }
          },
          vehicle: true,
          card: true
        },
        orderBy: { entryTime: 'desc' }
      }),
      prisma.entry.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des entrees', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        parking: true,
        vehicle: true,
        card: true
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entree non trouvee'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation de l\'entree', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getActiveEntries = async (req, res) => {
  try {
    const { parkingId } = req.query;

    const where = { status: 'IN_PROGRESS' };
    if (parkingId) where.parkingId = parkingId;

    const entries = await prisma.entry.findMany({
      where,
      include: {
        parking: {
          select: {
            id: true,
            name: true
          }
        },
        vehicle: true,
        card: true
      },
      orderBy: { entryTime: 'desc' }
    });

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des entrees actives', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getVehicleHistory = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where: { vehicleId },
        skip,
        take,
        include: {
          parking: {
            select: {
              id: true,
              name: true
            }
          },
          card: true
        },
        orderBy: { entryTime: 'desc' }
      }),
      prisma.entry.count({ where: { vehicleId } })
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation de l\'historique du vehicule', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createEntry = async (req, res) => {
  try {
    const { parkingId, vehicleId, cardId } = req.body;

    const parking = await prisma.parking.findUnique({
      where: { id: parkingId }
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: 'Parking non trouve'
      });
    }

    if (parking.availableSpaces <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Parking complet. Aucune place disponible'
      });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicule non trouve'
      });
    }

    const activeEntry = await prisma.entry.findFirst({
      where: {
        vehicleId,
        status: 'IN_PROGRESS'
      }
    });

    if (activeEntry) {
      return res.status(400).json({
        success: false,
        message: 'Ce vehicule est deja dans un parking'
      });
    }

    if (cardId) {
      const card = await prisma.card.findUnique({
        where: { id: cardId }
      });

      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Carte non trouvee'
        });
      }

      if (!card.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Carte desactivee'
        });
      }

      if (card.vehicleId !== vehicleId) {
        return res.status(400).json({
          success: false,
          message: 'Cette carte n\'est pas associee a ce vehicule'
        });
      }
    }

    const [entry] = await prisma.$transaction([
      prisma.entry.create({
        data: {
          parkingId,
          vehicleId,
          cardId,
          entryTime: new Date()
        },
        include: {
          parking: true,
          vehicle: true,
          card: true
        }
      }),
      prisma.parking.update({
        where: { id: parkingId },
        data: {
          availableSpaces: {
            decrement: 1
          }
        }
      })
    ]);

    logger.info(`Entree creee pour vehicule ${vehicle.plateNumber} dans parking ${parking.name}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('parking:update', {
        parkingId: parking.id,
        availableSpaces: parking.availableSpaces - 1
      });
      io.emit('entry:created', entry);
    }

    res.status(201).json({
      success: true,
      message: 'Entree enregistree avec succes',
      data: entry
    });
  } catch (error) {
    logger.error('Erreur lors de la creation de l\'entree', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createAutoEntry = async (req, res) => {
  try {
    const { cardNumber, parkingId, sensorId, timestamp } = req.body;

    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ARDUINO_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Cle API invalide'
      });
    }

    const card = await prisma.card.findUnique({
      where: { cardNumber },
      include: { vehicle: true }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        action: 'DENY',
        message: 'Carte non reconnue'
      });
    }

    if (!card.isActive) {
      return res.status(403).json({
        success: false,
        action: 'DENY',
        message: 'Carte desactivee'
      });
    }

    const parking = await prisma.parking.findUnique({
      where: { id: parkingId }
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        action: 'DENY',
        message: 'Parking non trouve'
      });
    }

    if (parking.availableSpaces <= 0) {
      return res.status(400).json({
        success: false,
        action: 'DENY',
        message: 'Parking complet'
      });
    }

    const activeEntry = await prisma.entry.findFirst({
      where: {
        vehicleId: card.vehicleId,
        status: 'IN_PROGRESS'
      }
    });

    if (activeEntry) {
      return res.status(400).json({
        success: false,
        action: 'DENY',
        message: 'Vehicule deja dans un parking'
      });
    }

    const [entry] = await prisma.$transaction([
      prisma.entry.create({
        data: {
          parkingId,
          vehicleId: card.vehicleId,
          cardId: card.id,
          entryTime: timestamp ? new Date(timestamp) : new Date()
        },
        include: {
          parking: true,
          vehicle: true,
          card: true
        }
      }),
      prisma.parking.update({
        where: { id: parkingId },
        data: {
          availableSpaces: {
            decrement: 1
          }
        }
      })
    ]);

    logger.info(`Entree automatique: ${card.vehicle.plateNumber} via carte ${cardNumber}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('parking:update', {
        parkingId: parking.id,
        availableSpaces: parking.availableSpaces - 1
      });
      io.emit('entry:created', entry);
      
      if (parking.availableSpaces - 1 === 0) {
        io.emit('capacity:alert', {
          parkingId: parking.id,
          message: 'Parking complet'
        });
      }
    }

    res.json({
      success: true,
      action: 'OPEN_BARRIER',
      duration: 5000,
      message: 'Entree autorisee',
      data: {
        vehicleType: card.vehicle.vehicleType,
        plateNumber: card.vehicle.plateNumber,
        availableSpaces: parking.availableSpaces - 1
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'entree automatique', error);
    res.status(500).json({
      success: false,
      action: 'DENY',
      message: 'Erreur serveur'
    });
  }
};

const exitEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { exitTime, paymentMethod } = req.body;

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        parking: {
          include: {
            tariffs: true
          }
        },
        vehicle: true
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entree non trouvee'
      });
    }

    if (entry.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Cette entree est deja terminee'
      });
    }

    const exit = exitTime ? new Date(exitTime) : new Date();
    const duration = calculateDuration(entry.entryTime, exit);

    const tariff = entry.parking.tariffs.find(t => t.vehicleType === entry.vehicle.vehicleType);
    
    if (!tariff) {
      return res.status(400).json({
        success: false,
        message: `Aucun tarif defini pour les vehicules de type ${entry.vehicle.vehicleType}`
      });
    }

    const amount = calculateAmount(duration, tariff.pricePerHour);

    const [updatedEntry] = await prisma.$transaction([
      prisma.entry.update({
        where: { id },
        data: {
          exitTime: exit,
          duration,
          amount,
          status: 'COMPLETED',
          paymentMethod
        },
        include: {
          parking: true,
          vehicle: true,
          card: true
        }
      }),
      prisma.parking.update({
        where: { id: entry.parkingId },
        data: {
          availableSpaces: {
            increment: 1
          }
        }
      })
    ]);

    logger.info(`Sortie enregistree pour vehicule ${entry.vehicle.plateNumber}. Montant: ${amount}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('parking:update', {
        parkingId: entry.parkingId,
        availableSpaces: entry.parking.availableSpaces + 1
      });
      io.emit('entry:completed', updatedEntry);
    }

    res.json({
      success: true,
      message: 'Sortie enregistree avec succes',
      data: updatedEntry
    });
  } catch (error) {
    logger.error('Erreur lors de la sortie', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createAutoExit = async (req, res) => {
  try {
    const { cardNumber, parkingId, sensorId, timestamp } = req.body;

    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ARDUINO_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Cle API invalide'
      });
    }

    const card = await prisma.card.findUnique({
      where: { cardNumber },
      include: { vehicle: true }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        action: 'DENY',
        message: 'Carte non reconnue'
      });
    }

    const entry = await prisma.entry.findFirst({
      where: {
        vehicleId: card.vehicleId,
        parkingId,
        status: 'IN_PROGRESS'
      },
      include: {
        parking: {
          include: {
            tariffs: true
          }
        },
        vehicle: true
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        action: 'DENY',
        message: 'Aucune entree active trouvee pour ce vehicule'
      });
    }

    const exit = timestamp ? new Date(timestamp) : new Date();
    const duration = calculateDuration(entry.entryTime, exit);

    const tariff = entry.parking.tariffs.find(t => t.vehicleType === entry.vehicle.vehicleType);
    
    if (!tariff) {
      return res.status(400).json({
        success: false,
        action: 'DENY',
        message: `Aucun tarif defini pour ce type de vehicule`
      });
    }

    const amount = calculateAmount(duration, tariff.pricePerHour);

    const [updatedEntry] = await prisma.$transaction([
      prisma.entry.update({
        where: { id: entry.id },
        data: {
          exitTime: exit,
          duration,
          amount,
          status: 'COMPLETED',
          paymentMethod: 'AUTOMATIQUE'
        },
        include: {
          parking: true,
          vehicle: true,
          card: true
        }
      }),
      prisma.parking.update({
        where: { id: parkingId },
        data: {
          availableSpaces: {
            increment: 1
          }
        }
      })
    ]);

    logger.info(`Sortie automatique: ${card.vehicle.plateNumber}. Montant: ${amount}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('parking:update', {
        parkingId,
        availableSpaces: entry.parking.availableSpaces + 1
      });
      io.emit('entry:completed', updatedEntry);
    }

    res.json({
      success: true,
      action: 'OPEN_BARRIER',
      duration: 5000,
      message: 'Sortie autorisee',
      data: {
        billing: {
          amount,
          duration,
          vehicleType: card.vehicle.vehicleType,
          plateNumber: card.vehicle.plateNumber
        },
        availableSpaces: entry.parking.availableSpaces + 1
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la sortie automatique', error);
    res.status(500).json({
      success: false,
      action: 'DENY',
      message: 'Erreur serveur'
    });
  }
};

const cancelEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: { parking: true }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entree non trouvee'
      });
    }

    if (entry.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Seules les entrees en cours peuvent etre annulees'
      });
    }

    const [updatedEntry] = await prisma.$transaction([
      prisma.entry.update({
        where: { id },
        data: { status: 'CANCELLED' }
      }),
      prisma.parking.update({
        where: { id: entry.parkingId },
        data: {
          availableSpaces: {
            increment: 1
          }
        }
      })
    ]);

    logger.info(`Entree annulee: ${id}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('parking:update', {
        parkingId: entry.parkingId,
        availableSpaces: entry.parking.availableSpaces + 1
      });
    }

    res.json({
      success: true,
      message: 'Entree annulee avec succes',
      data: updatedEntry
    });
  } catch (error) {
    logger.error('Erreur lors de l\'annulation de l\'entree', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getAllEntries,
  getEntryById,
  getActiveEntries,
  getVehicleHistory,
  createEntry,
  createAutoEntry,
  exitEntry,
  createAutoExit,
  cancelEntry
};
