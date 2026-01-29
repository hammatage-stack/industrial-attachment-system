const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/industrial-attachment',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // M-Pesa/Payment Configuration
  mpesa: {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    businessShortCode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
    apiUrl: process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke'
  },
  
  // File Upload Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  
  // Email Configuration
  email: {  
    // Provider selection: 'gmail' | 'zoho' | 'sendgrid' | 'custom'
    provider: process.env.EMAIL_PROVIDER || 'gmail',
    
    // Generic SMTP Settings
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'industrialattachementsystem@gmail.com',
    adminEmail: process.env.ADMIN_EMAIL || 'industrialattachementsystem@gmail.com',
    
    // Provider-specific credentials (optional if using SMTP)
    gmail: {
      appPassword: process.env.GMAIL_APP_PASSWORD // Use App Password for Gmail
    },
    zoho: {
      region: process.env.ZOHO_REGION || 'com' // zoho.com, zoho.in, etc.
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY
    }
  },
  
  // Application Fee
  applicationFee: 500,
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development'
};
