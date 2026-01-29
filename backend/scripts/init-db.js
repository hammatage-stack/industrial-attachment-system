#!/usr/bin/env node
/**
 * Database Initialization Script
 * Creates sample data for development/testing
 * Usage: npm run init:db
 */

const mongoose = require('mongoose');
const config = require('../src/config/config');
const User = require('../src/models/User');
const Opportunity = require('../src/models/Opportunity');
const Institution = require('../src/models/Institution');

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    await Institution.deleteMany({});

    // Create sample institutions
    console.log('🏢 Creating sample institutions...');
    const institutions = await Institution.insertMany([
      {
        name: 'NITA (Kenya)',
        location: 'Nairobi',
        email: 'admin@nita.ac.ke',
        phone: '+254 700 000000',
        website: 'https://nita.ac.ke',
        description: 'A leading institution for ICT training and development'
      },
      {
        name: 'KCA University',
        location: 'Nairobi',
        email: 'info@kca.ac.ke',
        phone: '+254 700 111111',
        website: 'https://kca.ac.ke',
        description: 'A university focused on technology and business education'
      }
    ]);
    console.log(`✅ Created ${institutions.length} institutions`);

    // Create sample admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ias.com',
      password: 'admin123', // Will be hashed by pre-save hook
      phoneNumber: '+254712345678',
      role: 'admin',
      institution: institutions[0]._id,
      isVerified: true,
      verifiedAt: new Date()
    });
    console.log('✅ Admin user created - Email: admin@ias.com, Password: admin123');

    // Create sample student user
    console.log('👤 Creating sample student user...');
    const studentUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'student@ias.com',
      password: 'student123',
      phoneNumber: '+254712345679',
      role: 'student',
      institution: institutions[0]._id,
      isVerified: true,
      verifiedAt: new Date()
    });
    console.log('✅ Student user created - Email: student@ias.com, Password: student123');

    // Create sample company user
    console.log('👤 Creating sample company user...');
    const companyUser = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'company@ias.com',
      password: 'company123',
      phoneNumber: '+254712345680',
      role: 'company',
      companyName: 'Tech Solutions Ltd',
      isVerified: true,
      verifiedAt: new Date()
    });
    console.log('✅ Company user created - Email: company@ias.com, Password: company123');

    // Create sample opportunities
    console.log('💼 Creating sample opportunities...');
    const opportunities = await Opportunity.insertMany([
      {
        title: 'Software Development Internship',
        company: 'Tech Solutions Ltd',
        industry: 'Technology',
        description: 'Join our development team and work on exciting projects',
        requirements: ['Proficiency in JavaScript', 'Basic understanding of React', 'Team player'],
        location: 'Nairobi',
        duration: '3 months',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        postedBy: companyUser._id,
        status: 'active'
      },
      {
        title: 'Data Science Internship',
        company: 'Analytics Hub',
        industry: 'Data Science',
        description: 'Work with real datasets and machine learning models',
        requirements: ['Python proficiency', 'Statistical knowledge', 'SQL basics'],
        location: 'Nairobi',
        duration: '4 months',
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        postedBy: companyUser._id,
        status: 'active'
      },
      {
        title: 'Business Analysis',
        company: 'Consulting Partners',
        industry: 'Business Consulting',
        description: 'Analyze business processes and propose improvements',
        requirements: ['Analytical skills', 'Attention to detail', 'Communication skills'],
        location: 'Nairobi',
        duration: '3 months',
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        postedBy: companyUser._id,
        status: 'active'
      }
    ]);
    console.log(`✅ Created ${opportunities.length} opportunities`);

    console.log('\n✨ Database initialization completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('   Admin: admin@ias.com / admin123');
    console.log('   Student: student@ias.com / student123');
    console.log('   Company: company@ias.com / company123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
