// Prisma configuration for migrations and CLI (Prisma 7+)
// Using CommonJS (.cjs) so the Prisma CLI can load it without ESM tooling.

module.exports = {
  datasources: {
    db: {
      provider: 'postgresql',
      // Use environment variable for the database URL
      url: process.env.DATABASE_URL,
    },
  },
};
