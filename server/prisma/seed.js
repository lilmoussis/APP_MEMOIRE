const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create a default parking if none exists
  const existingParking = await prisma.parking.findFirst({
    where: { name: 'Main Parking' }
  });

  if (!existingParking) {
    await prisma.parking.create({
      data: {
        name: 'Main Parking',
        totalCapacity: 50,
        availableSpaces: 50,
        location: 'Local',
        description: 'Parking principal'
      }
    });
    console.log('Created Main Parking');
  } else {
    console.log('Main Parking already exists');
  }

  // Super admin credentials (can be overridden via env)
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'superadmin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'noverprime';

  // Hash the password before storing
  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);

  // Create or update the super admin
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      username: ADMIN_USERNAME,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    },
    create: {
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
