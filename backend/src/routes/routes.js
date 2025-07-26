const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Obter rotas disponíveis
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rotas
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint de rotas - implementar lógica'
  });
});

module.exports = router; 