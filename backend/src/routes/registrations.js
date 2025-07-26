const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/registrations:
 *   get:
 *     summary: Get user registrations
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registrations retrieved successfully
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Registrations routes - to be implemented'
  });
});

module.exports = router; 