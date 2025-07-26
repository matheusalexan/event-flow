const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Validation middleware
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Biografia não pode ter mais de 500 caracteres'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Telefone inválido'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Empresa não pode ter mais de 100 caracteres'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cargo não pode ter mais de 100 caracteres'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website deve ser uma URL válida'),
  body('preferences.language')
    .optional()
    .isIn(['pt-BR', 'en-US', 'es-ES'])
    .withMessage('Idioma inválido'),
  body('preferences.timezone')
    .optional()
    .isString()
    .withMessage('Timezone inválido')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, organizer, speaker, participant]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Access forbidden
 */
router.get('/', protect, authorize('admin'), userController.getUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', protect, userController.getUser);

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update current user profile
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
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *               website:
 *                 type: string
 *               socialMedia:
 *                 type: object
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/profile', protect, validateUserUpdate, handleValidationErrors, userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
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
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Access forbidden
 */
router.put('/:id', protect, authorize('admin'), userController.updateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
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
 *         description: User deleted successfully
 *       403:
 *         description: Access forbidden
 */
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

/**
 * @swagger
 * /api/v1/users/{id}/avatar:
 *   post:
 *     summary: Upload user avatar
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file
 */
router.post('/:id/avatar', protect, userController.uploadAvatar);

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       403:
 *         description: Access forbidden
 */
router.get('/stats/overview', protect, authorize('admin'), userController.getUserStats);

/**
 * @swagger
 * /api/v1/users/export:
 *   get:
 *     summary: Export users data (Admin only)
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
 *     responses:
 *       200:
 *         description: Users data exported successfully
 *       403:
 *         description: Access forbidden
 */
router.get('/export/data', protect, authorize('admin'), userController.exportUsers);

module.exports = router; 