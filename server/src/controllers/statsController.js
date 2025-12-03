const prisma = require('../config/database');
const logger = require('../utils/logger');
const { getPeriodDates } = require('../utils/helpers');

const getDashboardStats = async (req, res) => {
  try {
    const { parkingId } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {};
    if (parkingId) where.parkingId = parkingId;

    const [
      totalParkings,
      totalVehicles,
      totalCards,
      activeEntries,
      todayEntries,
      todayRevenue,
      totalRevenue
    ] = await Promise.all([
      prisma.parking.count(),
      prisma.vehicle.count(),
      prisma.card.count({ where: { isActive: true } }),
      prisma.entry.count({
        where: {
          ...where,
          status: 'IN_PROGRESS'
        }
      }),
      prisma.entry.count({
        where: {
          ...where,
          entryTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.entry.aggregate({
        where: {
          ...where,
          entryTime: {
            gte: today,
            lt: tomorrow
          },
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.entry.aggregate({
        where: {
          ...where,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      })
    ]);

    const parkings = await prisma.parking.findMany({
      where: parkingId ? { id: parkingId } : {},
      select: {
        id: true,
        name: true,
        totalCapacity: true,
        availableSpaces: true
      }
    });

    const occupancyStats = parkings.map(p => ({
      parkingId: p.id,
      parkingName: p.name,
      totalCapacity: p.totalCapacity,
      availableSpaces: p.availableSpaces,
      occupiedSpaces: p.totalCapacity - p.availableSpaces,
      occupancyRate: ((p.totalCapacity - p.availableSpaces) / p.totalCapacity * 100).toFixed(2)
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalParkings,
          totalVehicles,
          totalCards,
          activeEntries,
          todayEntries,
          todayRevenue: todayRevenue._sum.amount || 0,
          totalRevenue: totalRevenue._sum.amount || 0
        },
        occupancy: occupancyStats
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des statistiques du dashboard', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const { period = 'month', parkingId, startDate, endDate } = req.query;

    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    } else {
      dateRange = getPeriodDates(period);
    }

    const where = {
      status: 'COMPLETED',
      exitTime: {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      }
    };

    if (parkingId) where.parkingId = parkingId;

    const [totalRevenue, entriesCount, averageAmount, revenueByVehicleType] = await Promise.all([
      prisma.entry.aggregate({
        where,
        _sum: { amount: true }
      }),
      prisma.entry.count({ where }),
      prisma.entry.aggregate({
        where,
        _avg: { amount: true }
      }),
      prisma.entry.groupBy({
        by: ['vehicleId'],
        where,
        _sum: {
          amount: true
        },
        _count: true
      })
    ]);

    const vehicleIds = revenueByVehicleType.map(r => r.vehicleId);
    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, vehicleType: true }
    });

    const vehicleTypeMap = {};
    vehicles.forEach(v => {
      vehicleTypeMap[v.id] = v.vehicleType;
    });

    const revenueByType = {};
    revenueByVehicleType.forEach(r => {
      const type = vehicleTypeMap[r.vehicleId];
      if (!revenueByType[type]) {
        revenueByType[type] = {
          vehicleType: type,
          totalRevenue: 0,
          count: 0
        };
      }
      revenueByType[type].totalRevenue += r._sum.amount || 0;
      revenueByType[type].count += r._count;
    });

    const entries = await prisma.entry.findMany({
      where,
      select: {
        exitTime: true,
        amount: true
      },
      orderBy: { exitTime: 'asc' }
    });

    const dailyRevenue = {};
    entries.forEach(entry => {
      const date = new Date(entry.exitTime).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += entry.amount || 0;
    });

    const timeline = Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount
    }));

    res.json({
      success: true,
      data: {
        period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        summary: {
          totalRevenue: totalRevenue._sum.amount || 0,
          entriesCount,
          averageAmount: averageAmount._avg.amount || 0
        },
        byVehicleType: Object.values(revenueByType),
        timeline
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des statistiques de revenus', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getOccupancyStats = async (req, res) => {
  try {
    const { period = 'month', parkingId } = req.query;

    const dateRange = getPeriodDates(period);

    const where = {
      entryTime: {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      }
    };

    if (parkingId) where.parkingId = parkingId;

    const entries = await prisma.entry.findMany({
      where,
      select: {
        entryTime: true,
        exitTime: true,
        parkingId: true
      },
      orderBy: { entryTime: 'asc' }
    });

    const parkings = await prisma.parking.findMany({
      where: parkingId ? { id: parkingId } : {},
      select: {
        id: true,
        name: true,
        totalCapacity: true,
        availableSpaces: true
      }
    });

    const occupancyByDay = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.entryTime).toISOString().split('T')[0];
      
      if (!occupancyByDay[entryDate]) {
        occupancyByDay[entryDate] = {
          date: entryDate,
          entries: 0,
          exits: 0
        };
      }
      
      occupancyByDay[entryDate].entries += 1;
      
      if (entry.exitTime) {
        const exitDate = new Date(entry.exitTime).toISOString().split('T')[0];
        if (!occupancyByDay[exitDate]) {
          occupancyByDay[exitDate] = {
            date: exitDate,
            entries: 0,
            exits: 0
          };
        }
        occupancyByDay[exitDate].exits += 1;
      }
    });

    const timeline = Object.values(occupancyByDay).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    const currentOccupancy = parkings.map(p => ({
      parkingId: p.id,
      parkingName: p.name,
      totalCapacity: p.totalCapacity,
      availableSpaces: p.availableSpaces,
      occupiedSpaces: p.totalCapacity - p.availableSpaces,
      occupancyRate: ((p.totalCapacity - p.availableSpaces) / p.totalCapacity * 100).toFixed(2)
    }));

    const averageOccupancy = currentOccupancy.reduce((sum, p) => 
      sum + parseFloat(p.occupancyRate), 0
    ) / currentOccupancy.length || 0;

    res.json({
      success: true,
      data: {
        period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        current: currentOccupancy,
        averageOccupancy: averageOccupancy.toFixed(2),
        timeline
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des statistiques d\'occupation', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getTrafficStats = async (req, res) => {
  try {
    const { period = 'month', parkingId } = req.query;

    const dateRange = getPeriodDates(period);

    const where = {
      entryTime: {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      }
    };

    if (parkingId) where.parkingId = parkingId;

    const entries = await prisma.entry.findMany({
      where,
      include: {
        vehicle: {
          select: { vehicleType: true }
        }
      },
      orderBy: { entryTime: 'asc' }
    });

    const trafficByHour = {};
    const trafficByDay = {};
    const trafficByVehicleType = {};

    entries.forEach(entry => {
      const entryDate = new Date(entry.entryTime);
      const hour = entryDate.getHours();
      const day = entryDate.toISOString().split('T')[0];
      const vehicleType = entry.vehicle.vehicleType;

      if (!trafficByHour[hour]) trafficByHour[hour] = 0;
      trafficByHour[hour] += 1;

      if (!trafficByDay[day]) trafficByDay[day] = 0;
      trafficByDay[day] += 1;

      if (!trafficByVehicleType[vehicleType]) trafficByVehicleType[vehicleType] = 0;
      trafficByVehicleType[vehicleType] += 1;
    });

    const hourlyTraffic = Object.entries(trafficByHour).map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    })).sort((a, b) => a.hour - b.hour);

    const dailyTraffic = Object.entries(trafficByDay).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const vehicleTypeTraffic = Object.entries(trafficByVehicleType).map(([type, count]) => ({
      vehicleType: type,
      count,
      percentage: ((count / entries.length) * 100).toFixed(2)
    }));

    const peakHour = hourlyTraffic.reduce((max, current) => 
      current.count > (max?.count || 0) ? current : max, null
    );

    res.json({
      success: true,
      data: {
        period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        summary: {
          totalEntries: entries.length,
          peakHour: peakHour ? `${peakHour.hour}:00` : null,
          peakHourCount: peakHour?.count || 0
        },
        hourlyTraffic,
        dailyTraffic,
        byVehicleType: vehicleTypeTraffic
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des statistiques de trafic', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

const getVehiclesByType = async (req, res) => {
  try {
    const { parkingId } = req.query;

    const where = {};
    if (parkingId) {
      where.entries = {
        some: { parkingId }
      };
    }

    const vehicles = await prisma.vehicle.groupBy({
      by: ['vehicleType'],
      _count: true
    });

    const total = vehicles.reduce((sum, v) => sum + v._count, 0);

    const stats = vehicles.map(v => ({
      vehicleType: v.vehicleType,
      count: v._count,
      percentage: ((v._count / total) * 100).toFixed(2)
    }));

    res.json({
      success: true,
      data: {
        total,
        byType: stats
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la recuperation des statistiques par type de vehicule', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueStats,
  getOccupancyStats,
  getTrafficStats,
  getVehiclesByType
};
