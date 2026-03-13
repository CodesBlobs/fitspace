const { PrismaClient } = require('@prisma/client');

/**
 * Platform Database Provider
 * 
 * Uses PLATFORM_DATABASE_URL (separate Neon DB)
 * so platform features don't touch the main FitSpace database.
 */

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PLATFORM_DATABASE_URL
    }
  }
});

module.exports = prisma;
