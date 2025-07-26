const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'Número da CNH é obrigatório'],
    unique: true,
    trim: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'Data de validade da CNH é obrigatória']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline', 'suspended'],
    default: 'offline'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    today: {
      type: Number,
      default: 0
    },
    thisWeek: {
      type: Number,
      default: 0
    },
    thisMonth: {
      type: Number,
      default: 0
    }
  },
  documents: {
    cnh: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    },
    vehicleRegistration: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    },
    insurance: {
      url: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    }
  },
  preferences: {
    maxDistance: {
      type: Number,
      default: 50, // km
      min: 1,
      max: 100
    },
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '18:00' }
    },
    autoAccept: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    totalRides: { type: Number, default: 0 },
    completedRides: { type: Number, default: 0 },
    cancelledRides: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 }, // km
    totalTime: { type: Number, default: 0 }, // minutes
    onlineTime: { type: Number, default: 0 } // minutes
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
driverSchema.index({ currentLocation: '2dsphere' });

// Index for status queries
driverSchema.index({ status: 1, isActive: 1 });

// Virtual for formatted rating
driverSchema.virtual('formattedRating').get(function() {
  return this.rating.average.toFixed(1);
});

// Virtual for earnings per ride
driverSchema.virtual('earningsPerRide').get(function() {
  return this.statistics.completedRides > 0 
    ? (this.earnings.total / this.statistics.completedRides).toFixed(2)
    : 0;
});

// Method to update rating
driverSchema.methods.updateRating = function(newRating) {
  this.rating.total += newRating;
  this.rating.count += 1;
  this.rating.average = this.rating.total / this.rating.count;
  return this.save();
};

// Method to update location
driverSchema.methods.updateLocation = function(latitude, longitude) {
  this.currentLocation.coordinates = [longitude, latitude];
  this.lastActive = new Date();
  return this.save();
};

// Method to update earnings
driverSchema.methods.updateEarnings = function(amount) {
  this.earnings.total += amount;
  this.earnings.today += amount;
  this.earnings.thisWeek += amount;
  this.earnings.thisMonth += amount;
  return this.save();
};

// Method to update statistics
driverSchema.methods.updateStatistics = function(distance, duration) {
  this.statistics.totalRides += 1;
  this.statistics.completedRides += 1;
  this.statistics.totalDistance += distance;
  this.statistics.totalTime += duration;
  return this.save();
};

// Static method to find nearby drivers
driverSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    status: 'available',
    isActive: true,
    isVerified: true
  }).populate('user', 'name avatar rating').populate('vehicle', 'model color plate');
};

// Static method to get driver statistics
driverSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalDrivers: { $sum: 1 },
        activeDrivers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        onlineDrivers: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        averageRating: { $avg: '$rating.average' },
        totalEarnings: { $sum: '$earnings.total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Driver', driverSchema); 