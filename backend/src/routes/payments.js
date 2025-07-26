const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payments routes - to be implemented'
  });
});

module.exports = router; 