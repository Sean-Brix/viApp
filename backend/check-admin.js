const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: {
        admin: true
      }
    });

    if (admin) {
      console.log('✅ Admin user exists:');
      console.log('   Username:', admin.username);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Active:', admin.isActive);
    } else {
      console.log('❌ Admin user NOT found in database');
      console.log('   Run: npm run seed');
    }

    const userCount = await prisma.user.count();
    console.log('\nTotal users in database:', userCount);
  } catch (error) {
    console.error('Error checking admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
