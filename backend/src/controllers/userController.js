const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar usuários'
    });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar usuário'
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      phone: req.body.phone,
      company: req.body.company,
      position: req.body.position,
      website: req.body.website,
      socialMedia: req.body.socialMedia,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: { user }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar perfil'
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      isActive: req.body.isActive
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: { user }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar usuário'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Don't allow admin to delete themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar sua própria conta'
      });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar usuário'
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/v1/users/:id/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    // This will be implemented with multer middleware
    res.status(200).json({
      success: true,
      message: 'Avatar upload - to be implemented'
    });
  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload do avatar'
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/v1/users/stats/overview
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      recent: recentUsers,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
};

// @desc    Export users data (Admin only)
// @route   GET /api/v1/users/export/data
// @access  Private/Admin
const exportUsers = async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    
    const users = await User.find({}).select('-password -resetPasswordToken -emailVerificationToken');

    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: { users }
      });
    } else {
      // CSV format
      const csvHeader = 'ID,Nome,Email,Role,Verificado,Ativo,Empresa,Cargo,Data de Criação\n';
      const csvData = users.map(user => 
        `${user._id},"${user.name}","${user.email}","${user.role}","${user.isVerified}","${user.isActive}","${user.company || ''}","${user.position || ''}","${user.createdAt}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.status(200).send(csvHeader + csvData);
    }
  } catch (error) {
    logger.error('Export users error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao exportar dados'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateProfile,
  updateUser,
  deleteUser,
  uploadAvatar,
  getUserStats,
  exportUsers
}; 