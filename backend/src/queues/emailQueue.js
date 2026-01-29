const Queue = require('bull');
const config = require('../config/config');

// Use REDIS_URL from env or fallback
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Create queue (Bull accepts a connection string)
const emailQueue = new Queue('emailQueue', redisUrl);

// Processor: attempts will be handled by Bull job options (attempts + backoff)
emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  const nodemailer = require('nodemailer');

  if (!config.email.host || !config.email.user || !config.email.password) {
    throw new Error('SMTP credentials not configured');
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });

  // sendMail will throw on failure which lets Bull retry according to job options
  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html
  });

  return info;
});

// Helper to add an email job with sensible retry/backoff
function enqueueEmail(to, subject, html) {
  return emailQueue.add(
    { to, subject, html },
    {
      attempts: 5,
      backoff: { type: 'exponential', delay: 60000 },
      removeOnComplete: true,
      removeOnFail: false
    }
  );
}

module.exports = {
  enqueueEmail,
  emailQueue
};
