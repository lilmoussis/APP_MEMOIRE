// Prisma configuration (CommonJS) at server root so Prisma CLI finds it.
module.exports = {
  datasources: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
    },
  },
};
