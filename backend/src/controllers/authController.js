const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/emailService');
const { getRedisClient } = require('../config/redis');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { name, email, password, phone, role = 'passenger' } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({
      success: false,
      error: 'Usuário já existe com este email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role
  });

  // Generate verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Verifique seu email - Transport App',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`
      }
    });
  } catch (error) {
    logger.error('Error sending verification email:', error);
  }

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar
    }
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Conta desativada'
    });
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar
    }
  });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset de Senha - Transport App',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetUrl
      }
    });

    res.status(200).json({
      success: true,
      message: 'Email de reset enviado'
    });
  } catch (error) {
    logger.error('Error sending reset email:', error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar email de reset'
    });
  }
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { password } = req.body;
  const { token } = req.params;

  // Get hashed token
  const resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
});

// @desc    Verify email
// @route   POST /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Get hashed token
  const emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }

  // Verify email
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verificado com sucesso'
  });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.isVerified) {
    return res.status(400).json({
      success: false,
      error: 'Email já verificado'
    });
  }

  // Generate new verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verifique seu email - Transport App',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Email de verificação reenviado'
    });
  } catch (error) {
    logger.error('Error sending verification email:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar email de verificação'
    });
  }
});

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Private
const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  });
});

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: 'Senha atual incorreta'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
});

module.exports = {
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
}; 