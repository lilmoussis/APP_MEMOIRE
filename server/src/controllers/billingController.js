const prisma = require('../config/database');
const logger = require('../utils/logger');
const { generatePDF } = require('../services/pdfService');
const { generateExcel } = require('../services/excelService');

const getBilling = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
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

    if (entry.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'La facturation n\'est disponible que pour les entrees terminees'
      });
    }

    const billing = {
      id: entry.id,
      parking: {
        id: entry.parking.id,
        name: entry.parking.name,
        location: entry.parking.location
      },
      vehicle: {
        plateNumber: entry.vehicle.plateNumber,
        vehicleType: entry.vehicle.vehicleType,
        brand: entry.vehicle.brand,
        model: entry.vehicle.model
      },
      entryTime: entry.entryTime,
      exitTime: entry.exitTime,
      duration: entry.duration,
      amount: entry.amount,
      paymentMethod: entry.paymentMethod,
      createdAt: entry.createdAt
    };

    res.json({
      success: true,
      data: billing
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation de la facturation', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const downloadPDF = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
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

    if (entry.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de generer une facture pour une entree non terminee'
      });
    }

    const pdfBuffer = await generatePDF(entry);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${entry.id}.pdf`);
    res.send(pdfBuffer);

    logger.info(`Facture PDF generee pour l\'entree ${entryId}`);
  } catch (error) {
    logger.error('Erreur lors de la generation du PDF', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la generation du PDF'
    });
  }
};

const exportExcel = async (req, res) => {
  try {
    const { startDate, endDate, parkingId, status } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de debut et de fin sont requises'
      });
    }

    const where = {
      entryTime: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (parkingId) where.parkingId = parkingId;
    if (status) where.status = status;

    const entries = await prisma.entry.findMany({
      where,
      include: {
        parking: {
          select: {
            name: true,
            location: true
          }
        },
        vehicle: {
          select: {
            plateNumber: true,
            vehicleType: true,
            brand: true,
            model: true
          }
        },
        card: {
          select: {
            cardNumber: true
          }
        }
      },
      orderBy: { entryTime: 'desc' }
    });

    const excelBuffer = await generateExcel(entries, { startDate, endDate });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-${startDate}-${endDate}.xlsx`);
    res.send(excelBuffer);

    logger.info(`Rapport Excel genere: ${startDate} a ${endDate}`);
  } catch (error) {
    logger.error('Erreur lors de la generation du fichier Excel', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la generation du fichier Excel'
    });
  }
};

const getBillingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, parkingId, minAmount, maxAmount } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      status: 'COMPLETED'
    };

    if (startDate || endDate) {
      where.exitTime = {};
      if (startDate) where.exitTime.gte = new Date(startDate);
      if (endDate) where.exitTime.lte = new Date(endDate);
    }

    if (parkingId) where.parkingId = parkingId;

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }

    const [billings, total, summary] = await Promise.all([
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
          vehicle: {
            select: {
              plateNumber: true,
              vehicleType: true
            }
          }
        },
        orderBy: { exitTime: 'desc' }
      }),
      prisma.entry.count({ where }),
      prisma.entry.aggregate({
        where,
        _sum: { amount: true },
        _avg: { amount: true },
        _min: { amount: true },
        _max: { amount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        billings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / take)
        },
        summary: {
          totalAmount: summary._sum.amount || 0,
          averageAmount: summary._avg.amount || 0,
          minAmount: summary._min.amount || 0,
          maxAmount: summary._max.amount || 0,
          count: total
        }
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation de l\'historique de facturation', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getBilling,
  downloadPDF,
  exportExcel,
  getBillingHistory
};
