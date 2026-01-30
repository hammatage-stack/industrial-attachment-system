const mongoose = require('mongoose');
const config = require('../src/config/config');
const Opportunity = require('../src/models/Opportunity');
const User = require('../src/models/User');

const fields = [
  'IT & Software',
  'Engineering',
  'Business & Finance',
  'Marketing & Sales',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Hospitality',
  'Media & Communications',
  'Other'
];

const locations = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Kisii',
  'Nyeri',
  'Kitale',
  'Meru'
];

const sampleCompanies = [
  'Apex Solutions',
  'BrightWave Ltd',
  'KenyaTech',
  'Greenfield Industries',
  'Coastal Hospitality',
  'HealthFirst Clinics',
  'EduBridge Institute',
  'MarketMakers Ltd',
  'BuildRight Engineering',
  'MediaCore'
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to DB');

  // Find or create a seed company user to set as postedBy
  let companyUser = await User.findOne({ email: 'seed-company@ias.local' });
  if (!companyUser) {
    companyUser = await User.create({
      fullName: 'Seed Company',
      email: 'seed-company@ias.local',
      phoneNumber: '254700000000',
      institution: 'Seed Inc',
      password: 'ChangeMe123!',
      role: 'company'
    });
    console.log('Created seed company user:', companyUser._id);
  }

  const created = [];
  for (const field of fields) {
    for (const loc of locations) {
      const company = randomFrom(sampleCompanies) + ' ' + loc;
      const title = `${field} Attachment Opportunity`;
      const description = `A ${field} attachment position at ${company} located in ${loc}. Gain practical experience and mentorship.`;
      const data = {
        companyName: company,
        companyEmail: `hr@${company.replace(/\s+/g, '').toLowerCase()}.com`,
        companyPhone: '2547' + Math.floor(10000000 + Math.random() * 89999999),
        title,
        description,
        type: 'industrial-attachment',
        category: field,
        location: loc + ', Kenya',
        duration: `${3 + Math.floor(Math.random() * 6)} months`,
        requirements: ['Enrolled in a recognised institution', 'Relevant coursework', 'Good communication skills'],
        benefits: ['Stipend', 'Certificate of completion', 'Reference letter'],
        availableSlots: 1 + Math.floor(Math.random() * 5),
        applicationDeadline: new Date(Date.now() + (7 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
        status: 'open',
        postedBy: companyUser._id
      };

      // Upsert based on title + company + location
      const op = await Opportunity.findOneAndUpdate(
        { title: data.title, companyName: data.companyName, location: data.location },
        { $set: data },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      created.push(op);
    }
  }

  console.log(`Upserted ${created.length} opportunities across Kenya.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding error', err);
  process.exit(1);
});
