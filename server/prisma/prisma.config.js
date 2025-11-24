// Prisma configuration for migrations and CLI (Prisma 7+)
// Move connection URL and related settings here when using Prisma Migrate.
// This file is read by Prisma CLI. Keep sensitive values in environment variables.

module.exports = {
  datasources: {
    db: {
      provider: 'postgresql',
      // Use environment variable for the database URL
      url: process.env.DATABASE_URL,
    },
  },
};
