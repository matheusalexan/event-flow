const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 */
router.get('/', optionalAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Events routes - to be implemented'
  });
});

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *               - endDate
 *               - category
 *               - capacity
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, authorize('admin', 'organizer'), (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create event - to be implemented'
  });
});

module.exports = router; 