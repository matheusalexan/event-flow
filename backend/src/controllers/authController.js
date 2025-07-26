const User = require('../models/User');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/emailService');
const { getRedisClient } = require('../config/redis');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'participant' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email já está em uso'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verifique seu email - EventFlow',
        template: 'emailVerification',
        data: {
          name: user.name,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
        }
      });
    } catch (emailError) {
      logger.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso. Verifique seu email para confirmar a conta.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar usuário'
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

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
        error: 'Conta desativada. Entre em contato com o suporte.'
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

    // Reset auth attempts
    try {
      const redisClient = getRedisClient();
      const key = `auth_attempts:${req.ip}`;
      await redisClient.del(key);
    } catch (redisError) {
      logger.warn('Could not reset auth attempts:', redisError);
    }

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer logout'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          company: user.company,
          position: user.position,
          website: user.website,
          socialMedia: user.socialMedia,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar perfil do usuário'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Redefinição de senha - EventFlow',
        template: 'passwordReset',
        data: {
          name: user.name,
          resetUrl,
          expiresIn: '10 minutos'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Email de redefinição de senha enviado'
      });
    } catch (emailError) {
      logger.error('Error sending password reset email:', emailError);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        error: 'Erro ao enviar email de redefinição de senha'
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar solicitação de redefinição de senha'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
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

    // Generate token
    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Senha redefinida com sucesso',
      data: {
        token: jwtToken
      }
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao redefinir senha'
    });
  }
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Get hashed token
    const emailVerificationToken = crypto
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
  } catch (error) {
    logger.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar email'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email já está verificado'
      });
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verifique seu email - EventFlow',
        template: 'emailVerification',
        data: {
          name: user.name,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
        }
      });

      res.status(200).json({
        success: true,
        message: 'Email de verificação reenviado'
      });
    } catch (emailError) {
      logger.error('Error sending verification email:', emailError);
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar email de verificação'
      });
    }
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao reenviar email de verificação'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token é obrigatório'
      });
    }

    // Verify refresh token (you might want to store refresh tokens in Redis)
    // For now, we'll just return an error
    res.status(401).json({
      success: false,
      error: 'Refresh token inválido'
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao renovar token'
    });
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual está incorreta'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao alterar senha'
    });
  }
};

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