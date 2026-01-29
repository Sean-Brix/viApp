import { PrismaClient } from '@prisma/client';

// Create a single Prisma Client instance
const prisma = new PrismaClient();

// Test connection
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma Client connected to database');
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  });

export default prisma;
