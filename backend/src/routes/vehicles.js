const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Obter veículos disponíveis
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de veículos
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint de veículos - implementar lógica'
  });
});

module.exports = router; 