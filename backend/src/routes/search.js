const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const searchController = require('../controllers/searchController');
const profileController = require('../controllers/profileController');

/**
 * @swagger
 * /api/search/advanced:
 *   get:
 *     summary: Advanced search for opportunities
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         type: string
 *       - in: query
 *         name: type
 *         type: string
 *       - in: query
 *         name: location
 *         type: string
 *       - in: query
 *         name: salary_min
 *         type: number
 *       - in: query
 *         name: salary_max
 *         type: number
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/advanced', searchController.advancedSearchOpportunities);

/**
 * @swagger
 * /api/search/facets:
 *   get:
 *     summary: Get search facets
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Available filter facets
 */
router.get('/facets', searchController.getSearchFacets);

/**
 * @swagger
 * /api/search/save-filter:
 *   post:
 *     summary: Save search filter
 *     tags: [Search]
 *     responses:
 *       201:
 *         description: Filter saved
 */
router.post('/save-filter', protect, searchController.saveSearchFilter);

/**
 * @swagger
 * /api/search/saved-filters:
 *   get:
 *     summary: Get saved filters
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: User's saved filters
 */
router.get('/saved-filters', protect, searchController.getSavedFilters);

// ==================== PROFILE ROUTES ====================

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', protect, profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', protect, profileController.updateProfile);

/**
 * @swagger
 * /api/profile/picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Picture uploaded
 */
router.post('/profile/picture', protect, upload.single('file'), profileController.uploadProfilePicture);

/**
 * @swagger
 * /api/profile/preferences:
 *   patch:
 *     summary: Update user preferences
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.patch('/profile/preferences', protect, profileController.updatePreferences);

/**
 * @swagger
 * /api/profile/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post('/profile/change-password', protect, profileController.changePassword);

/**
 * @swagger
 * /api/profile/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get('/profile/stats', protect, profileController.getUserStats);

/**
 * @swagger
 * /api/profile/delete:
 *   post:
 *     summary: Delete account
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.post('/profile/delete', protect, profileController.deleteAccount);

module.exports = router;
