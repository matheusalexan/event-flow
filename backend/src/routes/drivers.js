const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getNearbyDrivers,
  getDriver,
  createDriver,
  updateDriver,
  updateDriverLocation,
  updateDriverStatus,
  getDriverStats,
  deleteDriver
} = require('../controllers/driverController');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware
const validateDriverData = [
  body('licenseNumber').notEmpty().withMessage('Número da licença é obrigatório'),
  body('licenseExpiry').isISO8601().withMessage('Data de expiração da licença é obrigatória'),
];

/**
 * @swagger
 * /api/v1/drivers:
 *   get:
 *     summary: Get nearby drivers
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude of the user's location
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude of the user's location
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in meters (default 5000)
 *     responses:
 *       200:
 *         description: List of nearby drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Driver'
 *   post:
 *     summary: Create driver profile
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licenseNumber
 *               - licenseExpiry
 *             properties:
 *               licenseNumber:
 *                 type: string
 *               licenseExpiry:
 *                 type: string
 *                 format: date
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       201:
 *         description: Driver profile created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 */
router.get('/', protect, getNearbyDrivers);
router.post('/', protect, validateDriverData, createDriver);

/**
 * @swagger
 * /api/v1/drivers/{id}:
 *   get:
 *     summary: Get driver by ID
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *   put:
 *     summary: Update driver profile
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               licenseNumber:
 *                 type: string
 *               licenseExpiry:
 *                 type: string
 *                 format: date
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferences:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Driver profile updated
 *   delete:
 *     summary: Delete driver profile
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver profile deleted
 */
router.get('/:id', protect, getDriver);
router.put('/:id', protect, validateDriverData, updateDriver);
router.delete('/:id', protect, deleteDriver);

/**
 * @swagger
 * /api/v1/drivers/{id}/location:
 *   put:
 *     summary: Update driver location
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Driver location updated
 */
router.put('/:id/location', protect, updateDriverLocation);

/**
 * @swagger
 * /api/v1/drivers/{id}/status:
 *   put:
 *     summary: Update driver status
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, busy, offline]
 *     responses:
 *       200:
 *         description: Driver status updated
 */
router.put('/:id/status', protect, updateDriverStatus);

/**
 * @swagger
 * /api/v1/drivers/{id}/stats:
 *   get:
 *     summary: Get driver statistics
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver statistics
 */
router.get('/:id/stats', protect, getDriverStats);

module.exports = router; 