import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPasswordHash = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@sfmnhs.edu',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      admin: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          position: 'School Nurse',
        },
      },
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Create sample students
  const studentData = [
    {
      username: 'maria.santos',
      email: 'maria.santos@sfmnhs.edu',
      firstName: 'Maria',
      lastName: 'Santos',
      birthdate: new Date('2007-05-15'),
      gender: 'FEMALE' as const,
      gradeLevel: 'Grade 11',
      section: 'A',
      weight: 52,
      height: 160,
    },
    {
      username: 'john.reyes',
      email: 'john.reyes@sfmnhs.edu',
      firstName: 'John',
      lastName: 'Reyes',
      birthdate: new Date('2008-03-22'),
      gender: 'MALE' as const,
      gradeLevel: 'Grade 10',
      section: 'B',
      weight: 65,
      height: 172,
    },
    {
      username: 'ana.cruz',
      email: 'ana.cruz@sfmnhs.edu',
      firstName: 'Ana',
      lastName: 'Cruz',
      birthdate: new Date('2006-11-08'),
      gender: 'FEMALE' as const,
      gradeLevel: 'Grade 12',
      section: 'A',
      weight: 58,
      height: 165,
    },
  ];

  for (const data of studentData) {
    const passwordHash = await hashPassword('student123');
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: 'STUDENT',
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            birthdate: data.birthdate,
            gender: data.gender,
            gradeLevel: data.gradeLevel,
            section: data.section,
            weight: data.weight,
            height: data.height,
          },
        },
      },
      include: { student: true },
    });

    // Add medical history
    if (data.username === 'maria.santos') {
      await prisma.medicalHistory.create({
        data: {
          studentId: user.student!.id,
          type: 'CONDITION',
          description: 'Asthma - Mild',
          diagnosedAt: new Date('2020-01-15'),
        },
      });
    }

    // Add emergency contact
    await prisma.emergencyContact.create({
      data: {
        studentId: user.student!.id,
        name: `${data.firstName}'s Parent`,
        relationship: 'Parent',
        phoneNumber: '+63 912 345 6789',
        isPrimary: true,
      },
    });

    console.log(`✅ Student created: ${user.username}`);
  }

  // Create sample devices
  const devices = await prisma.device.createMany({
    data: [
      {
        deviceId: 'VB-001-2024',
        serialNumber: 'SN001234567890',
        model: 'ViBand v1',
        firmwareVersion: '1.0.0',
        status: 'INACTIVE',
      },
      {
        deviceId: 'VB-002-2024',
        serialNumber: 'SN001234567891',
        model: 'ViBand v1',
        firmwareVersion: '1.0.0',
        status: 'INACTIVE',
      },
      {
        deviceId: 'VB-003-2024',
        serialNumber: 'SN001234567892',
        model: 'ViBand v1',
        firmwareVersion: '1.0.0',
        status: 'INACTIVE',
      },
    ],
  });
  console.log(`✅ Created ${devices.count} devices`);

  console.log('\n✨ Database seeded successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Admin: username=admin, password=admin123');
  console.log('   Students: username=<firstname>.<lastname>, password=student123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
