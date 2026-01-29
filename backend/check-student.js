const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudent() {
  try {
    const student = await prisma.user.findUnique({
      where: { username: 'ana.cruz' },
      include: {
        student: true
      }
    });

    if (student) {
      console.log('✅ Student user exists:');
      console.log('   Username:', student.username);
      console.log('   Email:', student.email);
      console.log('   Role:', student.role);
      console.log('   Active:', student.isActive);
      console.log('   Student ID:', student.student?.id);
    } else {
      console.log('❌ Student NOT found');
    }
  } catch (error) {
    console.error('Error checking student:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudent();
