const { calculateDuration, calculateAmount } = require('../utils/helpers');

const calculateBilling = (entryTime, exitTime, pricePerHour) => {
  const duration = calculateDuration(entryTime, exitTime);
  const amount = calculateAmount(duration, pricePerHour);
  
  return {
    duration,
    amount,
    durationHours: Math.ceil(duration / 60),
    pricePerHour
  };
};

const getBillingDetails = (entry, tariff) => {
  if (!entry.exitTime) {
    return {
      status: 'IN_PROGRESS',
      message: 'Vehicule encore dans le parking',
      currentDuration: calculateDuration(entry.entryTime, new Date()),
      estimatedAmount: calculateAmount(
        calculateDuration(entry.entryTime, new Date()),
        tariff.pricePerHour
      )
    };
  }

  return {
    status: 'COMPLETED',
    entryTime: entry.entryTime,
    exitTime: entry.exitTime,
    duration: entry.duration,
    amount: entry.amount,
    paymentMethod: entry.paymentMethod
  };
};

const validateBilling = (entry) => {
  const errors = [];

  if (!entry.exitTime) {
    errors.push('Heure de sortie manquante');
  }

  if (!entry.duration || entry.duration <= 0) {
    errors.push('Duree invalide');
  }

  if (!entry.amount || entry.amount < 0) {
    errors.push('Montant invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  calculateBilling,
  getBillingDetails,
  validateBilling
};
