// ─── Seed Script ────────────────────────────────────────────
// Creates a demo user and sample data for testing
// Run: npm run seed  (or: npx prisma db seed)

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FitSpace database...');

  // ─── Create Demo User ──────────────────────────────────────
  const hashed = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@fitspace.app' },
    update: {},
    create: {
      email: 'demo@fitspace.app',
      password: hashed,
      name: 'Alex Demo',
    },
  });
  console.log(`  ✓ User: ${user.email}`);

  // ─── Sample Meals ──────────────────────────────────────────
  const meals = [
    { description: 'Oatmeal with berries and honey', mealType: 'breakfast', calories: 350, protein: 12, carbs: 55, fat: 8, fiber: 7 },
    { description: 'Grilled chicken salad with avocado', mealType: 'lunch', calories: 480, protein: 42, carbs: 18, fat: 28, fiber: 8 },
    { description: 'Salmon with quinoa and steamed broccoli', mealType: 'dinner', calories: 560, protein: 38, carbs: 42, fat: 22, fiber: 6 },
    { description: 'Greek yogurt with granola', mealType: 'snack', calories: 220, protein: 15, carbs: 28, fat: 6, fiber: 2 },
    { description: 'Protein smoothie with banana and peanut butter', mealType: 'breakfast', calories: 380, protein: 28, carbs: 42, fat: 12, fiber: 4 },
    { description: 'Turkey wrap with mixed greens', mealType: 'lunch', calories: 420, protein: 32, carbs: 38, fat: 14, fiber: 5 },
  ];

  for (let i = 0; i < meals.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(i / 2)); // spread over days
    date.setHours(8 + (i % 3) * 5, 0, 0, 0);

    await prisma.meal.create({
      data: { userId: user.id, loggedAt: date, ...meals[i] },
    });
  }
  console.log(`  ✓ ${meals.length} meals created`);

  // ─── Sample Workouts ───────────────────────────────────────
  const workouts = [
    { type: 'cardio', name: 'Morning Run', duration: 35, calories: 320 },
    { type: 'strength', name: 'Upper Body Weights', duration: 45, calories: 280 },
    { type: 'flexibility', name: 'Yoga Flow', duration: 30, calories: 150 },
    { type: 'hiit', name: 'HIIT Circuit', duration: 25, calories: 350 },
    { type: 'cardio', name: 'Cycling', duration: 40, calories: 380 },
  ];

  for (let i = 0; i < workouts.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(7, 0, 0, 0);

    await prisma.workout.create({
      data: { userId: user.id, loggedAt: date, ...workouts[i] },
    });
  }
  console.log(`  ✓ ${workouts.length} workouts created`);

  // ─── Sample Water Logs ─────────────────────────────────────
  for (let day = 0; day < 7; day++) {
    const glasses = 5 + Math.floor(Math.random() * 4); // 5-8 glasses
    for (let g = 0; g < glasses; g++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(8 + g * 2, 0, 0, 0);

      await prisma.waterLog.create({
        data: { userId: user.id, amount: 250, loggedAt: date },
      });
    }
  }
  console.log('  ✓ Water logs created (7 days)');

  // ─── Sample Sleep Logs ─────────────────────────────────────
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(6, 0, 0, 0);

    await prisma.sleepLog.create({
      data: {
        userId: user.id,
        hours: 6.5 + Math.random() * 2, // 6.5 - 8.5 hours
        quality: 3 + Math.floor(Math.random() * 3), // 3-5
        loggedAt: date,
      },
    });
  }
  console.log('  ✓ Sleep logs created (7 days)');

  // ─── Sample Mood Logs ──────────────────────────────────────
  const moods = ['happy', 'energetic', 'calm', 'happy', 'tired', 'energetic', 'calm'];
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(9, 0, 0, 0);

    await prisma.moodLog.create({
      data: {
        userId: user.id,
        mood: moods[day],
        energy: 3 + Math.floor(Math.random() * 3), // 3-5
        loggedAt: date,
      },
    });
  }
  console.log('  ✓ Mood logs created (7 days)');

  console.log('\n✅ Seed complete! Demo login: demo@fitspace.app / demo1234');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
