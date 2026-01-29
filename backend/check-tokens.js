// Check refresh tokens in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  try {
    const tokens = await prisma.refreshToken.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true } } }
    });

    console.log(`Found ${tokens.length} refresh tokens:\n`);
    tokens.forEach((t, i) => {
      console.log(`${i + 1}. User: ${t.user.username}`);
      console.log(`   Token (first 50 chars): ${t.token.substring(0, 50)}...`);
      console.log(`   Expires: ${t.expiresAt}`);
      console.log(`   Created: ${t.createdAt}`);
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

check();
