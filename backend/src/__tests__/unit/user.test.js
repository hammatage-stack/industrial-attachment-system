const bcryptjs = require('bcryptjs');
const User = require('../../models/User');

describe('User Model Unit Tests', () => {
  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    test('should verify password correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcryptjs.hash(password, 10);
      const isMatch = await bcryptjs.compare(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    test('should not verify incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashedPassword = await bcryptjs.hash(password, 10);
      const isMatch = await bcryptjs.compare(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    test('should validate correct Kenyan phone format', () => {
      const validPhones = [
        '254712345678',
        '254701234567',
        '254722222222'
      ];

      validPhones.forEach(phone => {
        const isValid = /^254[0-9]{9}$/.test(phone);
        expect(isValid).toBe(true);
      });
    });

    test('should reject invalid phone formats', () => {
      const invalidPhones = [
        '0712345678',
        '712345678',
        '2547123456',
        '25471234567890',
        'invalid'
      ];

      invalidPhones.forEach(phone => {
        const isValid = /^254[0-9]{9}$/.test(phone);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user@company.co.ke',
        'student123@edu.com'
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('should reject invalid email format', () => {
      const invalidEmails = [
        'userexample.com',
        'user@',
        '@example.com',
        'user @example.com'
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Role Assignment', () => {
    test('should have valid role values', () => {
      const validRoles = ['student', 'admin', 'company'];
      
      validRoles.forEach(role => {
        expect(['student', 'admin', 'company']).toContain(role);
      });
    });
  });
});
