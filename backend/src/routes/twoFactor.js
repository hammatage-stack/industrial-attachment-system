const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const twoFactorController = require('../controllers/twoFactorController');

/**
 * @swagger
 * /api/2fa/generate:
 *   post:
 *     summary: Generate OTP for 2FA
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               method:
 *                 type: string
 *                 enum: [email, sms]
 *     responses:
 *       200:
 *         description: OTP generated successfully
 */
router.post('/generate', protect, twoFactorController.generateOTP);

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otpId:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify', protect, twoFactorController.verifyOTP);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [2FA]
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 */
router.post('/disable', protect, twoFactorController.disable2FA);

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Get 2FA status
 *     tags: [2FA]
 *     responses:
 *       200:
 *         description: 2FA status retrieved
 */
router.get('/status', protect, twoFactorController.get2FAStatus);

/**
 * @swagger
 * /api/2fa/backup-codes:
 *   post:
 *     summary: Generate backup codes
 *     tags: [2FA]
 *     responses:
 *       200:
 *         description: Backup codes generated
 */
router.post('/backup-codes', protect, twoFactorController.generateBackupCodes);

module.exports = router;
