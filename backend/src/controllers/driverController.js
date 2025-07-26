const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Driver = require('../models/Driver');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get nearby drivers
// @route   GET /api/v1/drivers
// @access  Private
const getNearbyDrivers = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 5000 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude e longitude são obrigatórios'
    });
  }

  const drivers = await Driver.findNearby(
    parseFloat(latitude),
    parseFloat(longitude),
    parseFloat(radius)
  );

  res.status(200).json({
    success: true,
    count: drivers.length,
    data: drivers
  });
});

// @desc    Get single driver
// @route   GET /api/v1/drivers/:id
// @access  Private
const getDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('vehicle', 'brand model year color plate');

  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Motorista não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: driver
  });
});

// @desc    Create driver profile
// @route   POST /api/v1/drivers
// @access  Private
const createDriver = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  // Check if user already has a driver profile
  const existingDriver = await Driver.findOne({ user: req.user.id });
  if (existingDriver) {
    return res.status(400).json({
      success: false,
      error: 'Usuário já possui perfil de motorista'
    });
  }

  const driverData = {
    user: req.user.id,
    licenseNumber: req.body.licenseNumber,
    licenseExpiry: req.body.licenseExpiry,
    documents: req.body.documents || [],
    preferences: req.body.preferences || {}
  };

  const driver = await Driver.create(driverData);

  // Update user role to driver
  await User.findByIdAndUpdate(req.user.id, { role: 'driver' });

  res.status(201).json({
    success: true,
    data: driver
  });
});

// @desc    Update driver profile
// @route   PUT /api/v1/drivers/:id
// @access  Private
const updateDriver = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Motorista não encontrado'
    });
  }

  // Check if user owns this driver profile or is admin
  if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Não autorizado'
    });
  }

  const fieldsToUpdate = {
    licenseNumber: req.body.licenseNumber,
    licenseExpiry: req.body.licenseExpiry,
    documents: req.body.documents,
    preferences: req.body.preferences,
    isActive: req.body.isActive
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const updatedDriver = await Driver.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).populate('user', 'name email phone avatar');

  res.status(200).json({
    success: true,
    data: updatedDriver
  });
});

// @desc    Update driver location
// @route   PUT /api/v1/drivers/:id/location
// @access  Private
const updateDriverLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude e longitude são obrigatórios'
    });
  }

  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Motorista não encontrado'
    });
  }

  // Check if user owns this driver profile
  if (driver.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Não autorizado'
    });
  }

  const updatedDriver = await driver.updateLocation(latitude, longitude);

  res.status(200).json({
    success: true,
    data: updatedDriver
  });
});

// @desc    Update driver status
// @route   PUT /api/v1/drivers/:id/status
// @access  Private
const updateDriverStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['available', 'busy', 'offline'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Status inválido'
    });
  }

  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Motorista não encontrado'
    });
  }

  // Check if user owns this driver profile
  if (driver.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Não autorizado'
    });
  }

  driver.status = status;
  driver.lastActive = new Date();
  await driver.save();

  res.status(200).json({
    success: true,
    data: driver
  });
});

// @desc    Get driver statistics
// @route   GET /api/v1/drivers/:id/stats
// @access  Private
const getDriverStats = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Motorista não encontrado'
    });
  }

  // Check if user owns this driver profile or is admin
  if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Não autorizado'
    });
  }

  const stats = await Driver.getStatistics(req.params.id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Delete driver profile
// @route   DELETE /api/v1/drivers/:id
// @access  Private/Admin
const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return res.status(404).json({
      success: false,
      error: 'Motorista não encontrado'
    });
  }

  // Check if user owns this driver profile or is admin
  if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Não autorizado'
    });
  }

  await driver.deleteOne();

  // Update user role back to passenger if not admin
  if (req.user.role !== 'admin') {
    await User.findByIdAndUpdate(req.user.id, { role: 'passenger' });
  }

  res.status(200).json({
    success: true,
    message: 'Perfil de motorista deletado com sucesso'
  });
});

module.exports = {
  getNearbyDrivers,
  getDriver,
  createDriver,
  updateDriver,
  updateDriverLocation,
  updateDriverStatus,
  getDriverStats,
  deleteDriver
}; 