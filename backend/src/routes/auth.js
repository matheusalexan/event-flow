const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const {
  protect,
  authRateLimit,
  resetAuthAttempts
} = require('../middleware/auth');

const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  changePassword
} = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário
 *         phone:
 *           type: string
 *           description: Telefone do usuário
 *         role:
 *           type: string
 *           enum: [admin, driver, passenger]
 *           default: passenger
 *           description: Papel do usuário no sistema
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já existe
 */
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Telefone inválido'),
  body('role')
    .optional()
    .isIn(['admin', 'driver', 'passenger'])
    .withMessage('Role inválido')
], register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 *       429:
 *         description: Muitas tentativas de login
 */
router.post('/login', [
  authRateLimit,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
], resetAuthAttempts, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Fazer logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       401:
 *         description: Não autorizado
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obter dados do usuário logado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de reset enviado
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
], forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Resetar senha
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de reset de senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
], resetPassword);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   post:
 *     summary: Verificar email
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificação de email
 *     responses:
 *       200:
 *         description: Email verificado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/verify-email/:token', verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenviar email de verificação
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email de verificação reenviado
 *       401:
 *         description: Não autorizado
 */
router.post('/resend-verification', protect, resendVerification);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Renovar token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Token inválido
 */
router.post('/refresh-token', protect, refreshToken);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Alterar senha
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Senha atual incorreta
 *       401:
 *         description: Não autorizado
 */
router.post('/change-password', [
  protect,
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
], changePassword);

module.exports = router; 