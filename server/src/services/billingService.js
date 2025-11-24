exports.calculateAmount = ({ durationMinutes = 0, pricePerHour = 0 }) => {
  const hours = Math.ceil(durationMinutes / 60);
  return hours * pricePerHour;
};
