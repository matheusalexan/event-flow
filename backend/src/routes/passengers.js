const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /passengers:
 *   get:
 *     summary: Obter dados do passageiro logado
 *     tags: [Passengers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do passageiro
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint de passageiros - implementar lógica'
  });
});

module.exports = router; 