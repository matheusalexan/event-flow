const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notifications routes - to be implemented'
  });
});

module.exports = router; 