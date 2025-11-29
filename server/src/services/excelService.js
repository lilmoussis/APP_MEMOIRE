const ExcelJS = require('exceljs');
const { formatDate } = require('../utils/helpers');

const generateExcel = async (entries, options = {}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rapport de Stationnement');

    worksheet.columns = [
      { header: 'ID Entree', key: 'id', width: 15 },
      { header: 'Parking', key: 'parking', width: 20 },
      { header: 'Plaque', key: 'plateNumber', width: 15 },
      { header: 'Type Vehicule', key: 'vehicleType', width: 15 },
      { header: 'Marque', key: 'brand', width: 15 },
      { header: 'Modele', key: 'model', width: 15 },
      { header: 'Carte', key: 'cardNumber', width: 15 },
      { header: 'Entree', key: 'entryTime', width: 20 },
      { header: 'Sortie', key: 'exitTime', width: 20 },
      { header: 'Duree (min)', key: 'duration', width: 12 },
      { header: 'Montant (FCFA)', key: 'amount', width: 15 },
      { header: 'Paiement', key: 'paymentMethod', width: 15 },
      { header: 'Statut', key: 'status', width: 12 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    entries.forEach(entry => {
      worksheet.addRow({
        id: entry.id,
        parking: entry.parking?.name || '',
        plateNumber: entry.vehicle?.plateNumber || '',
        vehicleType: entry.vehicle?.vehicleType || '',
        brand: entry.vehicle?.brand || '',
        model: entry.vehicle?.model || '',
        cardNumber: entry.card?.cardNumber || '',
        entryTime: formatDate(entry.entryTime),
        exitTime: entry.exitTime ? formatDate(entry.exitTime) : 'En cours',
        duration: entry.duration || '',
        amount: entry.amount ? entry.amount.toFixed(2) : '',
        paymentMethod: entry.paymentMethod || '',
        status: entry.status
      });
    });

    const totalAmount = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const completedEntries = entries.filter(e => e.status === 'COMPLETED').length;

    worksheet.addRow({});
    worksheet.addRow({});
    
    const summaryRow1 = worksheet.addRow({
      id: 'RESUME',
      parking: '',
      plateNumber: `Total entrees: ${entries.length}`,
      vehicleType: `Terminees: ${completedEntries}`,
      brand: '',
      model: '',
      cardNumber: '',
      entryTime: '',
      exitTime: '',
      duration: '',
      amount: `TOTAL: ${totalAmount.toFixed(2)} FCFA`,
      paymentMethod: '',
      status: ''
    });
    
    summaryRow1.font = { bold: true };
    summaryRow1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB9C' }
    };

    if (options.startDate && options.endDate) {
      const dateRow = worksheet.addRow({
        id: `Periode: ${options.startDate} au ${options.endDate}`,
        parking: '',
        plateNumber: '',
        vehicleType: '',
        brand: '',
        model: '',
        cardNumber: '',
        entryTime: '',
        exitTime: '',
        duration: '',
        amount: '',
        paymentMethod: '',
        status: ''
      });
      dateRow.font = { italic: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(`Erreur lors de la generation du fichier Excel: ${error.message}`);
  }
};

module.exports = {
  generateExcel
};
