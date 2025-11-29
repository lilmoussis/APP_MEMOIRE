const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Demarrage du seeding...');

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@parking.com';
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'superadmin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      username: ADMIN_USERNAME,
      password: hashedAdminPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    },
    create: {
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: hashedAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+221 77 123 45 67',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });
  console.log(`Super Admin cree/mis a jour: ${superAdmin.email}`);

  const hashedGerantPassword = await bcrypt.hash('gerant123456', 10);
  const gerant = await prisma.user.upsert({
    where: { email: 'gerant@parking.com' },
    update: {
      username: 'gerant1',
      password: hashedGerantPassword,
      role: 'GERANT',
      isActive: true
    },
    create: {
      email: 'gerant@parking.com',
      username: 'gerant1',
      password: hashedGerantPassword,
      firstName: 'Mohamed',
      lastName: 'Diallo',
      phone: '+221 77 987 65 43',
      role: 'GERANT',
      isActive: true
    }
  });
  console.log(`Gerant cree/mis a jour: ${gerant.email}`);

  const parking = await prisma.parking.upsert({
    where: { id: 'parking-principal-001' },
    update: {
      name: 'Parking Principal Centre-Ville',
      totalCapacity: 100,
      availableSpaces: 100,
      location: 'Avenue Hassan II, Dakar',
      description: 'Parking securise au coeur du centre-ville'
    },
    create: {
      id: 'parking-principal-001',
      name: 'Parking Principal Centre-Ville',
      totalCapacity: 100,
      availableSpaces: 100,
      location: 'Avenue Hassan II, Dakar',
      description: 'Parking securise au coeur du centre-ville'
    }
  });
  console.log(`Parking cree/mis a jour: ${parking.name}`);

  const tariffs = [
    { vehicleType: 'MOTO', pricePerHour: 500 },
    { vehicleType: 'VOITURE', pricePerHour: 1000 },
    { vehicleType: 'CAMION', pricePerHour: 2000 },
    { vehicleType: 'AUTRE', pricePerHour: 1500 }
  ];

  for (const tariff of tariffs) {
    await prisma.tariff.upsert({
      where: {
        parkingId_vehicleType: {
          parkingId: parking.id,
          vehicleType: tariff.vehicleType
        }
      },
      update: {
        pricePerHour: tariff.pricePerHour
      },
      create: {
        parkingId: parking.id,
        vehicleType: tariff.vehicleType,
        pricePerHour: tariff.pricePerHour
      }
    });
  }
  console.log('Tarifs crees/mis a jour');

  const vehicles = [
    {
      plateNumber: 'DK-1234-AA',
      vehicleType: 'VOITURE',
      brand: 'Toyota',
      model: 'Corolla',
      color: 'Blanc'
    },
    {
      plateNumber: 'DK-5678-BB',
      vehicleType: 'VOITURE',
      brand: 'Peugeot',
      model: '208',
      color: 'Noir'
    },
    {
      plateNumber: 'DK-9012-CC',
      vehicleType: 'MOTO',
      brand: 'Honda',
      model: 'CBR',
      color: 'Rouge'
    },
    {
      plateNumber: 'DK-3456-DD',
      vehicleType: 'CAMION',
      brand: 'Mercedes',
      model: 'Actros',
      color: 'Bleu'
    },
    {
      plateNumber: 'DK-7890-EE',
      vehicleType: 'VOITURE',
      brand: 'Renault',
      model: 'Clio',
      color: 'Gris'
    }
  ];

  for (const vehicleData of vehicles) {
    await prisma.vehicle.upsert({
      where: { plateNumber: vehicleData.plateNumber },
      update: vehicleData,
      create: vehicleData
    });
  }
  console.log(`${vehicles.length} vehicules crees/mis a jour`);

  const cards = [
    { cardNumber: 'CARD001', plateNumber: 'DK-1234-AA' },
    { cardNumber: 'CARD002', plateNumber: 'DK-5678-BB' },
    { cardNumber: 'CARD003', plateNumber: 'DK-9012-CC' },
    { cardNumber: 'CARD004', plateNumber: 'DK-3456-DD' },
    { cardNumber: 'CARD005', plateNumber: 'DK-7890-EE' }
  ];

  for (const cardData of cards) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { plateNumber: cardData.plateNumber }
    });

    if (vehicle) {
      await prisma.card.upsert({
        where: { cardNumber: cardData.cardNumber },
        update: {
          vehicleId: vehicle.id,
          isActive: true
        },
        create: {
          cardNumber: cardData.cardNumber,
          vehicleId: vehicle.id,
          isActive: true
        }
      });
    }
  }
  console.log(`${cards.length} cartes creees/mises a jour`);

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const vehicle1 = await prisma.vehicle.findUnique({
    where: { plateNumber: 'DK-1234-AA' }
  });

  const vehicle2 = await prisma.vehicle.findUnique({
    where: { plateNumber: 'DK-5678-BB' }
  });

  if (vehicle1 && vehicle2) {
    const entryTime1 = new Date(yesterday);
    entryTime1.setHours(9, 0, 0);
    const exitTime1 = new Date(yesterday);
    exitTime1.setHours(17, 30, 0);
    const duration1 = Math.ceil((exitTime1 - entryTime1) / (1000 * 60));
    const amount1 = Math.ceil(duration1 / 60) * 1000;

    await prisma.entry.create({
      data: {
        parkingId: parking.id,
        vehicleId: vehicle1.id,
        entryTime: entryTime1,
        exitTime: exitTime1,
        duration: duration1,
        amount: amount1,
        status: 'COMPLETED',
        paymentMethod: 'CARTE'
      }
    });

    const entryTime2 = new Date(yesterday);
    entryTime2.setHours(14, 15, 0);
    const exitTime2 = new Date(yesterday);
    exitTime2.setHours(18, 45, 0);
    const duration2 = Math.ceil((exitTime2 - entryTime2) / (1000 * 60));
    const amount2 = Math.ceil(duration2 / 60) * 1000;

    await prisma.entry.create({
      data: {
        parkingId: parking.id,
        vehicleId: vehicle2.id,
        entryTime: entryTime2,
        exitTime: exitTime2,
        duration: duration2,
        amount: amount2,
        status: 'COMPLETED',
        paymentMethod: 'ESPECES'
      }
    });

    console.log('Entrees de demonstration creees');
  }

  console.log('');
  console.log('Seeding termine avec succes!');
  console.log('');
  console.log('Comptes de test:');
  console.log(`- Super Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('- Gerant: gerant@parking.com / gerant123456');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
