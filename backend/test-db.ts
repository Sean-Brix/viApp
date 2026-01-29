import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Testing Prisma connection...');

prisma.$connect()
  .then(() => {
    console.log('✅ Successfully connected to database!');
    return prisma.user.count();
  })
  .then((count) => {
    console.log(`✅ Found ${count} users in database`);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('✅ Disconnected from database');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database error:', error);
    process.exit(1);
  });
