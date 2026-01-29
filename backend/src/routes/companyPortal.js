const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const companyPortalController = require('../controllers/companyPortalController');

/**
 * @swagger
 * /api/company-portal/create:
 *   post:
 *     summary: Create company portal
 *     tags: [Company Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               institutionId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [hr_manager, recruiter, admin]
 *     responses:
 *       201:
 *         description: Portal created successfully
 */
router.post('/create', protect, authorize('company', 'admin'), companyPortalController.createCompanyPortal);

/**
 * @swagger
 * /api/company-portal/{portalId}:
 *   get:
 *     summary: Get company portal
 *     tags: [Company Portal]
 *     parameters:
 *       - in: path
 *         name: portalId
 *         required: true
 *     responses:
 *       200:
 *         description: Portal details
 */
router.get('/:portalId', protect, companyPortalController.getCompanyPortal);

/**
 * @swagger
 * /api/company-portal/{portalId}/stats:
 *   get:
 *     summary: Get portal statistics
 *     tags: [Company Portal]
 *     parameters:
 *       - in: path
 *         name: portalId
 *         required: true
 *     responses:
 *       200:
 *         description: Portal statistics
 */
router.get('/:portalId/stats', protect, companyPortalController.getPortalStats);

/**
 * @swagger
 * /api/company-portal/{portalId}/applications:
 *   get:
 *     summary: Get portal applications
 *     tags: [Company Portal]
 *     parameters:
 *       - in: path
 *         name: portalId
 *         required: true
 *       - in: query
 *         name: status
 *     responses:
 *       200:
 *         description: Applications list
 */
router.get('/:portalId/applications', protect, companyPortalController.getPortalApplications);

/**
 * @swagger
 * /api/company-portal/{portalId}/team:
 *   post:
 *     summary: Add team member
 *     tags: [Company Portal]
 *     parameters:
 *       - in: path
 *         name: portalId
 *         required: true
 *     responses:
 *       200:
 *         description: Team member added
 */
router.post('/:portalId/team', protect, authorize('admin'), companyPortalController.addTeamMember);

/**
 * @swagger
 * /api/company-portal/{portalId}/team/{memberId}:
 *   delete:
 *     summary: Remove team member
 *     tags: [Company Portal]
 *     parameters:
 *       - in: path
 *         name: portalId
 *         required: true
 *       - in: path
 *         name: memberId
 *         required: true
 *     responses:
 *       200:
 *         description: Team member removed
 */
router.delete('/:portalId/team/:memberId', protect, authorize('admin'), companyPortalController.removeTeamMember);

module.exports = router;
