const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plate: {
    type: String,
    required: [true, 'Placa é obrigatória'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/, 'Formato de placa inválido']
  },
  brand: {
    type: String,
    required: [true, 'Marca é obrigatória'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Modelo é obrigatório'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Ano é obrigatório'],
    min: [1900, 'Ano deve ser maior que 1900'],
    max: [new Date().getFullYear() + 1, 'Ano não pode ser no futuro']
  },
  color: {
    type: String,
    required: [true, 'Cor é obrigatória'],
    trim: true
  },
  type: {
    type: String,
    enum: ['sedan', 'hatchback', 'suv', 'van', 'motorcycle'],
    required: [true, 'Tipo de veículo é obrigatório']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacidade é obrigatória'],
    min: [1, 'Capacidade deve ser pelo menos 1'],
    max: [20, 'Capacidade não pode ser maior que 20']
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'ethanol', 'diesel', 'electric', 'hybrid'],
    required: [true, 'Tipo de combustível é obrigatório']
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: [true, 'Tipo de transmissão é obrigatório']
  },
  features: {
    airConditioning: { type: Boolean, default: false },
    bluetooth: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    wheelchairAccessible: { type: Boolean, default: false },
    childSeat: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false }
  },
  documents: {
    registration: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      expiryDate: Date
    },
    insurance: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      expiryDate: Date
    },
    inspection: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      expiryDate: Date
    }
  },
  photos: [{
    url: String,
    type: { type: String, enum: ['exterior', 'interior', 'document'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive', 'suspended'],
    default: 'inactive'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastInspection: {
    type: Date
  },
  mileage: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notas não podem ter mais que 500 caracteres']
  }
}, {
  timestamps: true
});

// Index for plate queries
vehicleSchema.index({ plate: 1 });

// Index for owner queries
vehicleSchema.index({ owner: 1 });

// Index for status queries
vehicleSchema.index({ status: 1, isVerified: 1 });

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} ${this.year}`;
});

// Virtual for formatted plate
vehicleSchema.virtual('formattedPlate').get(function() {
  return this.plate.replace(/([A-Z]{3})([0-9][0-9A-Z])([0-9]{2})/, '$1-$2-$3');
});

// Virtual for age
vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Method to check if documents are valid
vehicleSchema.methods.checkDocumentsValidity = function() {
  const now = new Date();
  const documents = this.documents;
  
  const isRegistrationValid = documents.registration.expiryDate && 
    documents.registration.expiryDate > now;
  
  const isInsuranceValid = documents.insurance.expiryDate && 
    documents.insurance.expiryDate > now;
  
  const isInspectionValid = documents.inspection.expiryDate && 
    documents.inspection.expiryDate > now;
  
  return {
    registration: isRegistrationValid,
    insurance: isInsuranceValid,
    inspection: isInspectionValid,
    allValid: isRegistrationValid && isInsuranceValid && isInspectionValid
  };
};

// Method to update mileage
vehicleSchema.methods.updateMileage = function(newMileage) {
  if (newMileage >= this.mileage) {
    this.mileage = newMileage;
    return this.save();
  }
  throw new Error('Nova quilometragem deve ser maior que a atual');
};

// Method to add photo
vehicleSchema.methods.addPhoto = function(url, type) {
  this.photos.push({ url, type });
  return this.save();
};

// Static method to find available vehicles
vehicleSchema.statics.findAvailable = function() {
  return this.find({
    status: 'active',
    isVerified: true
  }).populate('owner', 'name email phone');
};

// Static method to get vehicle statistics
vehicleSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        activeVehicles: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        verifiedVehicles: { $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] } },
        averageAge: { $avg: { $subtract: [new Date().getFullYear(), '$year'] } }
      }
    }
  ]);
};

// Static method to get vehicles by type
vehicleSchema.statics.getByType = function(type) {
  return this.find({ type, status: 'active', isVerified: true });
};

module.exports = mongoose.model('Vehicle', vehicleSchema); 