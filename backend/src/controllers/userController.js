const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await User.countDocuments();

  let query = User.find();

  // Filter by role
  if (req.query.role) {
    query = query.where('role', req.query.role);
  }

  // Search by name or email
  if (req.query.search) {
    query = query.or([
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ]);
  }

  const users = await query
    .select('-password')
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt');

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
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
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }

  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    role: req.body.role,
    isActive: req.body.isActive
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: updatedUser
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Usuário não encontrado'
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Usuário deletado com sucesso'
  });
});

// @desc    Upload user avatar
// @route   POST /api/v1/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  // This would be implemented with multer for file upload
  res.status(200).json({
    success: true,
    message: 'Upload de avatar - implementar com multer'
  });
});

// @desc    Get user statistics
// @route   GET /api/v1/users/stats/overview
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      byRole: usersByRole,
      recent: recentUsers
    }
  });
});

// @desc    Export users data
// @route   GET /api/v1/users/export/data
// @access  Private/Admin
const exportUsers = asyncHandler(async (req, res) => {
  const format = req.query.format || 'csv';
  
  const users = await User.find().select('-password');

  if (format === 'json') {
    return res.status(200).json({
      success: true,
      data: users
    });
  }

  // CSV format would be implemented here
  res.status(200).json({
    success: true,
    message: 'Exportação CSV - implementar lógica'
  });
});

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