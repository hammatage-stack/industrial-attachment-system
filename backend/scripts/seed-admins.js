#!/usr/bin/env node
/**
 * Admin User Seeding Script
 * Creates admin users with predefined credentials
 * Usage: npm run seed:admins
 */

const mongoose = require('mongoose');
const config = require('../src/config/config');
const User = require('../src/models/User');

async function seedAdminUsers() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const admins = [
      {
        admissionNumber: 'ADMIN001',
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '254712345678',
        password: 'Manuu254@',
        role: 'admin'
      },
      {
        admissionNumber: 'ADMIN002',
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '254712345679',
        password: 'Ham254@',
        role: 'admin'
      }
    ];

    console.log('👤 Creating admin users...');

    // Check if admins already exist
    const existingAdmins = await User.countDocuments({ role: 'admin' });
    
    if (existingAdmins > 0) {
      console.log(`⚠️  ${existingAdmins} admin user(s) already exist. Skipping creation to avoid duplicates.`);
      console.log('   To force recreate, delete existing admins from the database first.\n');
    }

    for (const admin of admins) {
      const adminExists = await User.findOne({ admissionNumber: admin.admissionNumber });
      
      if (adminExists) {
        console.log(`⏭️  Admin with admission number ${admin.admissionNumber} already exists. Skipping...`);
        continue;
      }

      const newAdmin = await User.create(admin);
      console.log(`✅ Admin user created`);
      console.log(`   Admission Number: ${admin.admissionNumber}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    }

    console.log('\n✨ Admin seeding completed!\n');
    console.log('📝 Admin Credentials:');
    admins.forEach(admin => {
      console.log(`   - Admission: ${admin.admissionNumber} | Password: ${admin.password}`);
    });
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin users:', error.message);
    process.exit(1);
  }
}

// Run seeding
seedAdminUsers();
