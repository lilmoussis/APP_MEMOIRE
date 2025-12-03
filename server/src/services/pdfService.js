const PDFDocument = require('pdfkit');
const { formatDate, generateInvoiceNumber } = require('../utils/helpers');

const generatePDF = async (entry) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const invoiceNumber = generateInvoiceNumber();

      doc.fontSize(20).text('FACTURE DE STATIONNEMENT', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Numero de facture: ${invoiceNumber}`, { align: 'right' });
      doc.text(`Date d'emission: ${formatDate(new Date())}`, { align: 'right' });
      doc.moveDown(2);

      doc.fontSize(14).text('Informations du parking', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Nom: ${entry.parking.name}`);
      if (entry.parking.location) {
        doc.text(`Adresse: ${entry.parking.location}`);
      }
      doc.moveDown(1.5);

      doc.fontSize(14).text('Informations du vehicule', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Plaque d'immatriculation: ${entry.vehicle.plateNumber}`);
      doc.text(`Type de vehicule: ${entry.vehicle.vehicleType}`);
      if (entry.vehicle.brand) {
        doc.text(`Marque: ${entry.vehicle.brand}`);
      }
      if (entry.vehicle.model) {
        doc.text(`Modele: ${entry.vehicle.model}`);
      }
      if (entry.card) {
        doc.text(`Numero de carte: ${entry.card.cardNumber}`);
      }
      doc.moveDown(1.5);

      doc.fontSize(14).text('Details du stationnement', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Heure d'entree: ${formatDate(entry.entryTime)}`);
      doc.text(`Heure de sortie: ${formatDate(entry.exitTime)}`);
      doc.text(`Duree: ${Math.floor(entry.duration / 60)} h ${entry.duration % 60} min`);
      if (entry.paymentMethod) {
        doc.text(`Mode de paiement: ${entry.paymentMethod}`);
      }
      doc.moveDown(2);

      doc.fontSize(16).text(`MONTANT TOTAL: ${entry.amount.toFixed(2)} FCFA`, {
        align: 'right',
        bold: true
      });
      doc.moveDown(3);

      doc.fontSize(10).text('Merci de votre visite!', { align: 'center' });
      doc.text('Conservez cette facture comme justificatif de paiement', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePDF
};
