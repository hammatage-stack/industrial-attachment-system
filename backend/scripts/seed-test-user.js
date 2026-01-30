#!/usr/bin/env node
/**
 * Test User Seeding Script
 * Creates a test user for Playwright E2E tests
 */

const mongoose = require('mongoose');
const config = require('../src/config/config');
const User = require('../src/models/User');

async function seedTestUser() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    const testUser = {
      fullName: 'UI Test User',
      email: 'ui.test+1@gmail.com',
      phoneNumber: '254700000001',
      password: 'Password123!',
      role: 'student',
      institution: 'Test University'
    };

    const exists = await User.findOne({ email: testUser.email });
    if (exists) {
      console.log('⏭️  Test user already exists. Skipping...');
    } else {
      await User.create(testUser);
      console.log('✅ Test user created:', testUser.email);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test user:', error.message);
    process.exit(1);
  }
}

seedTestUser();
