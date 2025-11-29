const prisma = require('../config/database');
const logger = require('../utils/logger');

const getAllParkings = async (req, res) => {
  try {
    const parkings = await prisma.parking.findMany({
      include: {
        tariffs: true,
        _count: {
          select: {
            entries: {
              where: { status: 'IN_PROGRESS' }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: parkings
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des parkings', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getParkingById = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await prisma.parking.findUnique({
      where: { id },
      include: {
        tariffs: true,
        _count: {
          select: {
            entries: {
              where: { status: 'IN_PROGRESS' }
            }
          }
        }
      }
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: 'Parking non trouve'
      });
    }

    res.json({
      success: true,
      data: parking
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation du parking', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createParking = async (req, res) => {
  try {
    const { name, totalCapacity, location, description } = req.body;

    const parking = await prisma.parking.create({
      data: {
        name,
        totalCapacity,
        availableSpaces: totalCapacity,
        location,
        description
      }
    });

    logger.info(`Parking cree: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Parking cree avec succes',
      data: parking
    });
  } catch (error) {
    logger.error('Erreur lors de la creation du parking', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const updateParking = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, totalCapacity, location, description } = req.body;

    const existingParking = await prisma.parking.findUnique({
      where: { id }
    });

    if (!existingParking) {
      return res.status(404).json({
        success: false,
        message: 'Parking non trouve'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (description !== undefined) updateData.description = description;
    
    if (totalCapacity !== undefined) {
      const occupiedSpaces = existingParking.totalCapacity - existingParking.availableSpaces;
      
      if (totalCapacity < occupiedSpaces) {
        return res.status(400).json({
          success: false,
          message: `Impossible de reduire la capacite. ${occupiedSpaces} places sont actuellement occupees`
        });
      }
      
      updateData.totalCapacity = totalCapacity;
      updateData.availableSpaces = totalCapacity - occupiedSpaces;
    }

    const updatedParking = await prisma.parking.update({
      where: { id },
      data: updateData,
      include: { tariffs: true }
    });

    logger.info(`Parking modifie: ${id}`);

    res.json({
      success: true,
      message: 'Parking modifie avec succes',
      data: updatedParking
    });
  } catch (error) {
    logger.error('Erreur lors de la modification du parking', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const deleteParking = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await prisma.parking.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: {
              where: { status: 'IN_PROGRESS' }
            }
          }
        }
      }
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: 'Parking non trouve'
      });
    }

    if (parking._count.entries > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un parking avec des vehicules en cours'
      });
    }

    await prisma.parking.delete({
      where: { id }
    });

    logger.info(`Parking supprime: ${id}`);

    res.json({
      success: true,
      message: 'Parking supprime avec succes'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression du parking', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const parking = await prisma.parking.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        totalCapacity: true,
        availableSpaces: true
      }
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: 'Parking non trouve'
      });
    }

    const occupancyRate = ((parking.totalCapacity - parking.availableSpaces) / parking.totalCapacity * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        ...parking,
        occupiedSpaces: parking.totalCapacity - parking.availableSpaces,
        occupancyRate: parseFloat(occupancyRate),
        isFull: parking.availableSpaces === 0
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation de la disponibilite', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getTariffs = async (req, res) => {
  try {
    const { parkingId } = req.params;

    const tariffs = await prisma.tariff.findMany({
      where: { parkingId },
      include: {
        parking: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: tariffs
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des tarifs', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createTariff = async (req, res) => {
  try {
    const { parkingId, vehicleType, pricePerHour } = req.body;

    const parking = await prisma.parking.findUnique({
      where: { id: parkingId }
    });

    if (!parking) {
      return res.status(404).json({
        success: false,
        message: 'Parking non trouve'
      });
    }

    const existingTariff = await prisma.tariff.findUnique({
      where: {
        parkingId_vehicleType: {
          parkingId,
          vehicleType
        }
      }
    });

    if (existingTariff) {
      return res.status(400).json({
        success: false,
        message: 'Un tarif existe deja pour ce type de vehicule dans ce parking'
      });
    }

    const tariff = await prisma.tariff.create({
      data: {
        parkingId,
        vehicleType,
        pricePerHour
      }
    });

    logger.info(`Tarif cree: ${vehicleType} pour parking ${parkingId}`);

    res.status(201).json({
      success: true,
      message: 'Tarif cree avec succes',
      data: tariff
    });
  } catch (error) {
    logger.error('Erreur lors de la creation du tarif', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const updateTariff = async (req, res) => {
  try {
    const { id } = req.params;
    const { pricePerHour } = req.body;

    const tariff = await prisma.tariff.findUnique({
      where: { id }
    });

    if (!tariff) {
      return res.status(404).json({
        success: false,
        message: 'Tarif non trouve'
      });
    }

    const updatedTariff = await prisma.tariff.update({
      where: { id },
      data: { pricePerHour }
    });

    logger.info(`Tarif modifie: ${id}`);

    res.json({
      success: true,
      message: 'Tarif modifie avec succes',
      data: updatedTariff
    });
  } catch (error) {
    logger.error('Erreur lors de la modification du tarif', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const deleteTariff = async (req, res) => {
  try {
    const { id } = req.params;

    const tariff = await prisma.tariff.findUnique({
      where: { id }
    });

    if (!tariff) {
      return res.status(404).json({
        success: false,
        message: 'Tarif non trouve'
      });
    }

    await prisma.tariff.delete({
      where: { id }
    });

    logger.info(`Tarif supprime: ${id}`);

    res.json({
      success: true,
      message: 'Tarif supprime avec succes'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression du tarif', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, vehicleType, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (vehicleType) where.vehicleType = vehicleType;
    if (search) {
      where.OR = [
        { plateNumber: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        include: {
          cards: true,
          _count: {
            select: { entries: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vehicle.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des vehicules', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        cards: true,
        entries: {
          take: 10,
          orderBy: { entryTime: 'desc' }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicule non trouve'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation du vehicule', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { plateNumber, vehicleType, brand, model, color } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plateNumber }
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Un vehicule avec cette plaque existe deja'
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        vehicleType,
        brand,
        model,
        color
      }
    });

    logger.info(`Vehicule cree: ${plateNumber}`);

    res.status(201).json({
      success: true,
      message: 'Vehicule cree avec succes',
      data: vehicle
    });
  } catch (error) {
    logger.error('Erreur lors de la creation du vehicule', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, vehicleType, brand, model, color } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicule non trouve'
      });
    }

    if (plateNumber && plateNumber !== vehicle.plateNumber) {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { plateNumber }
      });

      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Un vehicule avec cette plaque existe deja'
        });
      }
    }

    const updateData = {};
    if (plateNumber !== undefined) updateData.plateNumber = plateNumber;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (color !== undefined) updateData.color = color;

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData
    });

    logger.info(`Vehicule modifie: ${id}`);

    res.json({
      success: true,
      message: 'Vehicule modifie avec succes',
      data: updatedVehicle
    });
  } catch (error) {
    logger.error('Erreur lors de la modification du vehicule', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entries: {
              where: { status: 'IN_PROGRESS' }
            }
          }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicule non trouve'
      });
    }

    if (vehicle._count.entries > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un vehicule actuellement dans le parking'
      });
    }

    await prisma.vehicle.delete({
      where: { id }
    });

    logger.info(`Vehicule supprime: ${id}`);

    res.json({
      success: true,
      message: 'Vehicule supprime avec succes'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression du vehicule', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getCards = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, vehicleId } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (vehicleId) where.vehicleId = vehicleId;

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip,
        take,
        include: {
          vehicle: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.card.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        cards,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des cartes', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const createCard = async (req, res) => {
  try {
    const { cardNumber, vehicleId } = req.body;

    const existingCard = await prisma.card.findUnique({
      where: { cardNumber }
    });

    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: 'Cette carte existe deja'
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

    const card = await prisma.card.create({
      data: {
        cardNumber,
        vehicleId
      },
      include: {
        vehicle: true
      }
    });

    logger.info(`Carte creee: ${cardNumber} pour vehicule ${vehicleId}`);

    res.status(201).json({
      success: true,
      message: 'Carte creee avec succes',
      data: card
    });
  } catch (error) {
    logger.error('Erreur lors de la creation de la carte', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.body;

    const card = await prisma.card.findUnique({
      where: { id }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Carte non trouvee'
      });
    }

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicule non trouve'
        });
      }
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: { vehicleId },
      include: { vehicle: true }
    });

    logger.info(`Carte modifiee: ${id}`);

    res.json({
      success: true,
      message: 'Carte modifiee avec succes',
      data: updatedCard
    });
  } catch (error) {
    logger.error('Erreur lors de la modification de la carte', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await prisma.card.findUnique({
      where: { id }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Carte non trouvee'
      });
    }

    await prisma.card.delete({
      where: { id }
    });

    logger.info(`Carte supprimee: ${id}`);

    res.json({
      success: true,
      message: 'Carte supprimee avec succes'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la carte', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const toggleCardStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await prisma.card.findUnique({
      where: { id }
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Carte non trouvee'
      });
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: { isActive: !card.isActive },
      include: { vehicle: true }
    });

    logger.info(`Statut carte modifie: ${id} -> ${updatedCard.isActive}`);

    res.json({
      success: true,
      message: `Carte ${updatedCard.isActive ? 'activee' : 'desactivee'} avec succes`,
      data: updatedCard
    });
  } catch (error) {
    logger.error('Erreur lors du changement de statut de la carte', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getAllParkings,
  getParkingById,
  createParking,
  updateParking,
  deleteParking,
  getAvailability,
  getTariffs,
  createTariff,
  updateTariff,
  deleteTariff,
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getCards,
  createCard,
  updateCard,
  deleteCard,
  toggleCardStatus
};
