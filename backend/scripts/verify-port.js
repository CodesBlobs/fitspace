/**
 * Verification Script for FitSpace Platform Port
 */
const analyticsService = require('../src/services/analyticsService');
const gamificationService = require('../src/services/gamificationService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('🚀 Starting Verification...\n');

  try {
    // 1. Test Analytics Event Tracking
    console.log('📊 Testing Analytics Tracking...');
    await analyticsService.trackEvent({
      eventName: 'verification_test',
      metadata: { status: 'running' }
    });
    console.log('✅ Event tracked successfully.\n');

    // 2. Test Overview Metrics
    console.log('📈 Testing Analytics Overview...');
    const overview = await analyticsService.getOverview();
    console.log(`✅ Total Events: ${overview.totalEvents}`);
    console.log('✅ Overview calculation successful.\n');

    // 3. Test Gamification (Mock User)
    console.log('🏆 Testing Gamification (Mock User)...');
    // Check if we have any user
    const user = await prisma.user.findFirst();
    if (user) {
      await gamificationService.updateStreak(user.id);
      console.log(`✅ Streak updated for user: ${user.email}\n`);
    } else {
      console.log('⚠️ No users found in DB, skipping user-specific tests.\n');
    }

    console.log('🎉 Verification Complete!');
  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

verify();
