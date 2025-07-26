const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  updateProfile,
  updateUser,
  deleteUser,
  uploadAvatar,
  getUserStats,
  exportUsers
} = require('../controllers/userController');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obter todos os usuários (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, driver, passenger]
 *         description: Filtrar por role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou email
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', protect, getUser);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Atualizar perfil do usuário logado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       400:
 *         description: Dados inválidos
 */
router.put('/profile', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Telefone inválido')
], updateProfile);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualizar usuário (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, driver, passenger]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 */
router.put('/:id', [
  protect,
  authorize('admin'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Telefone inválido'),
  body('role')
    .optional()
    .isIn(['admin', 'driver', 'passenger'])
    .withMessage('Role inválido')
], updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deletar usuário (apenas admin)
 *     tags: [Users]
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
 *         description: Usuário deletado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Upload de avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar atualizado
 *       400:
 *         description: Arquivo inválido
 */
router.post('/avatar', protect, uploadAvatar);

/**
 * @swagger
 * /users/stats/overview:
 *   get:
 *     summary: Estatísticas de usuários (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos usuários
 *       403:
 *         description: Acesso negado
 */
router.get('/stats/overview', protect, authorize('admin'), getUserStats);

/**
 * @swagger
 * /users/export/data:
 *   get:
 *     summary: Exportar dados de usuários (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Formato de exportação
 *     responses:
 *       200:
 *         description: Dados exportados
 *       403:
 *         description: Acesso negado
 */
router.get('/export/data', protect, authorize('admin'), exportUsers);

module.exports = router; 