#!/usr/bin/env node
/**
 * Archive Opportunities Script
 * Moves opportunities with status 'closed' older than X days to 'archived'
 * Usage: node scripts/archive-opportunities.js [days]
 */
const mongoose = require('mongoose');
const config = require('../src/config/config');
const Opportunity = require('../src/models/Opportunity');

const days = Number(process.argv[2]) || 30; // default 30 days

async function run() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to DB');

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const res = await Opportunity.updateMany(
    { status: 'closed', updatedAt: { $lt: cutoff } },
    { $set: { status: 'archived' } }
  );

  console.log(`Archived ${res.modifiedCount} opportunities older than ${days} days`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
