const calculateDuration = (entryTime, exitTime) => {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const durationMs = exit - entry;
  return Math.ceil(durationMs / (1000 * 60)); // Retourne la duree en minutes
};

const calculateAmount = (durationMinutes, pricePerHour) => {
  const durationHours = Math.ceil(durationMinutes / 60);
  return durationHours * pricePerHour;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPeriodDates = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      const firstDay = now.getDate() - now.getDay();
      startDate = new Date(now.setDate(firstDay));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.setDate(firstDay + 6));
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
  }

  return { startDate, endDate };
};

const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
};

const validatePlateNumber = (plate) => {
  const plateRegex = /^[A-Z0-9]{2,10}$/i;
  return plateRegex.test(plate);
};

const validateCardNumber = (cardNumber) => {
  const cardRegex = /^[A-Z0-9]{6,16}$/i;
  return cardRegex.test(cardNumber);
};

module.exports = {
  calculateDuration,
  calculateAmount,
  formatDate,
  getPeriodDates,
  generateInvoiceNumber,
  validatePlateNumber,
  validateCardNumber
};
