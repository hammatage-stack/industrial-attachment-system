const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/auth');
const opportunityRoutes = require('./routes/opportunities');
const applicationRoutes = require('./routes/applications');
const uploadRoutes = require('./routes/upload');
const institutionRoutes = require('./routes/institutions');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const messagesRoutes = require('./routes/messages');
const scheduleRoutes = require('./routes/schedules');
const searchRoutes = require('./routes/search');
const companyPortalRoutes = require('./routes/companyPortal');
const twoFactorRoutes = require('./routes/twoFactor');

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/company-portal', companyPortalRoutes);
app.use('/api/two-factor', twoFactorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: config.nodeEnv === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Initialize Socket.IO for real-time notifications
try {
  const socketUtil = require('./utils/socket');
  const io = socketUtil.init(server);
  app.set('io', io);
} catch (e) {
  console.error('Socket init failed', e);
}

// Start periodic opportunity manager: auto-close expired/full opportunities
try {
  const { autoUpdateOpportunities } = require('./utils/opportunityManager');
  // Run once at startup
  autoUpdateOpportunities().catch((e) => console.error('Initial opportunity update failed', e));
  // Then run every hour
  setInterval(() => {
    autoUpdateOpportunities().catch((e) => console.error('Scheduled opportunity update failed', e));
  }, 60 * 60 * 1000);
} catch (e) {
  console.error('Opportunity manager failed to start', e);
}

module.exports = app;
