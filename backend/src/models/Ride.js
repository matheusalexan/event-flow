const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  pickup: {
    address: {
      type: String,
      required: [true, 'Endereço de origem é obrigatório']
    },
    location: {
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
    instructions: {
      type: String,
      maxlength: [200, 'Instruções não podem ter mais que 200 caracteres']
    }
  },
  destination: {
    address: {
      type: String,
      required: [true, 'Endereço de destino é obrigatório']
    },
    location: {
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
    instructions: {
      type: String,
      maxlength: [200, 'Instruções não podem ter mais que 200 caracteres']
    }
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled'],
    default: 'requested'
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    distancePrice: {
      type: Number,
      required: true,
      min: 0
    },
    timePrice: {
      type: Number,
      required: true,
      min: 0
    },
    surgePrice: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'BRL'
    }
  },
  distance: {
    estimated: {
      type: Number, // km
      required: true,
      min: 0
    },
    actual: {
      type: Number, // km
      min: 0
    }
  },
  duration: {
    estimated: {
      type: Number, // minutes
      required: true,
      min: 0
    },
    actual: {
      type: Number, // minutes
      min: 0
    }
  },
  timing: {
    requestedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'pix', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  rating: {
    passengerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [500, 'Comentário não pode ter mais que 500 caracteres']
      },
      ratedAt: Date
    },
    driverRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [500, 'Comentário não pode ter mais que 500 caracteres']
      },
      ratedAt: Date
    }
  },
  cancellation: {
    reason: {
      type: String,
      enum: ['passenger_cancelled', 'driver_cancelled', 'no_driver_available', 'system_cancelled'],
      required: function() { return this.status === 'cancelled'; }
    },
    cancelledBy: {
      type: String,
      enum: ['passenger', 'driver', 'system'],
      required: function() { return this.status === 'cancelled'; }
    },
    refundAmount: {
      type: Number,
      min: 0
    }
  },
  route: {
    polyline: String, // Google Maps polyline
    waypoints: [{
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number]
      },
      address: String,
      type: {
        type: String,
        enum: ['pickup', 'waypoint', 'destination']
      }
    }]
  },
  specialRequests: [{
    type: String,
    enum: ['wheelchair', 'child_seat', 'pet_friendly', 'quiet_ride', 'music_off']
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notas não podem ter mais que 500 caracteres']
  }
}, {
  timestamps: true
});

// Indexes
rideSchema.index({ passenger: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ 'pickup.location': '2dsphere' });
rideSchema.index({ 'destination.location': '2dsphere' });

// Virtual for ride duration
rideSchema.virtual('rideDuration').get(function() {
  if (this.timing.startedAt && this.timing.completedAt) {
    return Math.round((this.timing.completedAt - this.timing.startedAt) / 1000 / 60); // minutes
  }
  return null;
});

// Virtual for wait time
rideSchema.virtual('waitTime').get(function() {
  if (this.timing.requestedAt && this.timing.acceptedAt) {
    return Math.round((this.timing.acceptedAt - this.timing.requestedAt) / 1000 / 60); // minutes
  }
  return null;
});

// Virtual for formatted price
rideSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: this.pricing.currency
  }).format(this.pricing.totalPrice);
});

// Method to update status
rideSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'accepted':
      this.timing.acceptedAt = new Date();
      break;
    case 'arrived':
      this.timing.arrivedAt = new Date();
      break;
    case 'started':
      this.timing.startedAt = new Date();
      break;
    case 'completed':
      this.timing.completedAt = new Date();
      break;
    case 'cancelled':
      this.timing.cancelledAt = new Date();
      break;
  }
  
  return this.save();
};

// Method to cancel ride
rideSchema.methods.cancelRide = function(reason, cancelledBy, refundAmount = 0) {
  this.status = 'cancelled';
  this.timing.cancelledAt = new Date();
  this.cancellation = {
    reason,
    cancelledBy,
    refundAmount
  };
  return this.save();
};

// Method to complete payment
rideSchema.methods.completePayment = function(transactionId) {
  this.payment.status = 'completed';
  this.payment.transactionId = transactionId;
  this.payment.paidAt = new Date();
  return this.save();
};

// Method to rate ride
rideSchema.methods.rateRide = function(rating, comment, ratedBy) {
  if (ratedBy === 'passenger') {
    this.rating.driverRating = {
      rating,
      comment,
      ratedAt: new Date()
    };
  } else if (ratedBy === 'driver') {
    this.rating.passengerRating = {
      rating,
      comment,
      ratedAt: new Date()
    };
  }
  return this.save();
};

// Static method to get ride statistics
rideSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalRides: { $sum: 1 },
        completedRides: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelledRides: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.totalPrice', 0] } },
        averageRating: { $avg: '$rating.driverRating.rating' }
      }
    }
  ]);
};

// Static method to get rides by date range
rideSchema.statics.getRidesByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('passenger', 'name email').populate('driver', 'user').populate('vehicle', 'brand model plate');
};

module.exports = mongoose.model('Ride', rideSchema); 