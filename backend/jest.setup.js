// jest.setup.js - Jest configuration before tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGO_URI = 'mongodb://localhost:27017/industrial-attachment-test';

// Increase timeout for integration tests
jest.setTimeout(30000);
