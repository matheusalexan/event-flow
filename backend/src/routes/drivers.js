const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: Obter motoristas próximos
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude da localização
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude da localização
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           default: 10
 *         description: Distância máxima em km
 *     responses:
 *       200:
 *         description: Lista de motoristas próximos
 */
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint de motoristas - implementar lógica'
  });
});

/**
 * @swagger
 * /drivers/{id}:
 *   get:
 *     summary: Obter motorista por ID
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do motorista
 */
router.get('/:id', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Endpoint de motorista específico - implementar lógica'
  });
});

module.exports = router; 