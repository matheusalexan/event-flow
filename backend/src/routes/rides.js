const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /rides:
 *   get:
 *     summary: Obter corridas do usuário
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de corridas
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint de corridas - implementar lógica'
  });
});

/**
 * @swagger
 * /rides:
 *   post:
 *     summary: Solicitar nova corrida
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Corrida solicitada
 */
router.post('/', protect, (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Endpoint de solicitar corrida - implementar lógica'
  });
});

module.exports = router; 