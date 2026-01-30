const authController = require('../../controllers/authController');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('Frontend -> Backend Registration/Login Integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should create account without email verification and return token', async () => {
    const req = {
      body: {
        fullName: 'Test User',
        email: 'testuser@gmail.com',
        phoneNumber: '0712345678',
        password: 'Password123!'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock: no existing phone or email
    User.findOne.mockResolvedValue(null);
    // Mock create to return user object
    User.create.mockImplementation((data) => Promise.resolve({
      _id: '507f1f77bcf86cd799439011',
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role || 'student'
    }));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.token).toBeDefined();
    expect(payload.user).toHaveProperty('email', 'testuser@gmail.com');
  });

  test('should login with created account and return token', async () => {
    const req = {
      body: {
        email: 'testuser@gmail.com',
        password: 'Password123!'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock findOne to support chained .select('+password') used in controller
    const userObj = {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'Test User',
      email: 'testuser@gmail.com',
      phoneNumber: '254712345678',
      role: 'student',
      comparePassword: async (candidate) => candidate === 'Password123!'
    };

    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(userObj)
    }));

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.token).toBeDefined();
    expect(payload.user).toHaveProperty('email', 'testuser@gmail.com');
  });
});
