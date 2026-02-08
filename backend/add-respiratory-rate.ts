import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addRespiratoryRateVitals() {
  console.log('🌱 Adding sample vitals with respiratory rate...');

  const students = await prisma.student.findMany();
  
  for (const student of students) {
    // Create a new vital reading with respiratory rate
    await prisma.vital.create({
      data: {
        studentId: student.id,
        deviceId: 'ESP32-001',
        heartRate: 72 + Math.floor(Math.random() * 16), // 72-88
        heartRateStatus: 'NORMAL',
        heartRateTrend: 'STABLE',
        temperature: 36.5 + Math.random() * 0.5, // 36.5-37.0
        temperatureStatus: 'NORMAL',
        temperatureTrend: 'STABLE',
        spO2: 96 + Math.floor(Math.random() * 4), // 96-99
        spO2Status: 'NORMAL',
        spO2Trend: 'STABLE',
        respiratoryRate: 14 + Math.floor(Math.random() * 4), // 14-17 breaths/min (normal range)
        respiratoryRateStatus: 'NORMAL',
        respiratoryRateTrend: 'STABLE',
        bloodPressureSystolic: 110 + Math.floor(Math.random() * 10), // 110-119
        bloodPressureDiastolic: 70 + Math.floor(Math.random() * 10), // 70-79
        bloodPressureStatus: 'NORMAL',
        bloodPressureTrend: 'STABLE',
        timestamp: new Date(),
        isManualEntry: false,
      },
    });
    console.log(`✅ Added vital with respiratory rate for: ${student.firstName} ${student.lastName}`);
  }

  console.log('\n✨ Successfully added respiratory rate vitals!');
}

addRespiratoryRateVitals()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
