const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const scheduleController = require('../controllers/scheduleController');

/**
 * @swagger
 * /api/schedules/interview:
 *   post:
 *     summary: Schedule an interview
 *     tags: [Interviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               applicationId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [phone, video, in-person]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Interview scheduled successfully
 */
router.post('/interview', protect, authorize('admin', 'company'), scheduleController.scheduleInterview);

/**
 * @swagger
 * /api/schedules/my-interviews:
 *   get:
 *     summary: Get my interviews
 *     tags: [Interviews]
 *     responses:
 *       200:
 *         description: List of interviews
 */
router.get('/my-interviews', protect, scheduleController.getMyInterviews);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   get:
 *     summary: Get interview details
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *     responses:
 *       200:
 *         description: Interview details
 */
router.get('/:scheduleId', protect, scheduleController.getInterviewDetails);

/**
 * @swagger
 * /api/schedules/{scheduleId}/reschedule:
 *   patch:
 *     summary: Reschedule interview
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newDate:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interview rescheduled
 */
router.patch('/:scheduleId/reschedule', protect, scheduleController.rescheduleInterview);

/**
 * @swagger
 * /api/schedules/{scheduleId}/complete:
 *   patch:
 *     summary: Complete interview
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *     responses:
 *       200:
 *         description: Interview completed
 */
router.patch('/:scheduleId/complete', protect, authorize('admin', 'company'), scheduleController.completeInterview);

/**
 * @swagger
 * /api/schedules/{scheduleId}/cancel:
 *   patch:
 *     summary: Cancel interview
 *     tags: [Interviews]
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *     responses:
 *       200:
 *         description: Interview cancelled
 */
router.patch('/:scheduleId/cancel', protect, scheduleController.cancelInterview);

module.exports = router;
