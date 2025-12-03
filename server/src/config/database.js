const { PrismaClient } = require('@prisma/client');

// Prisma 7+ removes `url` from schema files — provide the connection URL
// at runtime when creating the client. This override uses the
// `DATABASE_URL` environment variable from `.env`.

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DATABASE_URL,
		},
	},
});

module.exports = prisma;
