const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Evento é obrigatório']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'waitlist'],
    default: 'pending'
  },
  registrationType: {
    type: String,
    enum: ['regular', 'early_bird', 'vip', 'student', 'speaker'],
    default: 'regular'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: {
      type: Number,
      min: [0, 'Valor não pode ser negativo']
    },
    currency: {
      type: String,
      default: 'BRL'
    },
    method: {
      type: String,
      enum: ['credit_card', 'pix', 'bank_transfer', 'free'],
      default: 'free'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },
  customFields: [{
    name: String,
    value: String,
    type: String
  }],
  dietaryRestrictions: {
    type: String,
    maxlength: [200, 'Restrições alimentares não podem ter mais de 200 caracteres']
  },
  specialNeeds: {
    type: String,
    maxlength: [200, 'Necessidades especiais não podem ter mais de 200 caracteres']
  },
  attendance: {
    confirmed: {
      type: Boolean,
      default: false
    },
    attended: {
      type: Boolean,
      default: false
    },
    checkInTime: Date,
    checkOutTime: Date,
    sessions: [{
      sessionId: mongoose.Schema.Types.ObjectId,
      attended: {
        type: Boolean,
        default: false
      },
      checkInTime: Date,
      checkOutTime: Date,
      feedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comment: String
      }
    }]
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String,
    downloadUrl: String
  },
  notes: {
    organizer: String,
    participant: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for registration summary
registrationSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    eventId: this.event,
    userId: this.user,
    status: this.status,
    registrationType: this.registrationType,
    paymentStatus: this.payment.status,
    confirmed: this.attendance.confirmed,
    attended: this.attendance.attended,
    createdAt: this.createdAt
  };
});

// Indexes for better query performance
registrationSchema.index({ event: 1, user: 1 }, { unique: true });
registrationSchema.index({ user: 1 });
registrationSchema.index({ event: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ 'payment.status': 1 });
registrationSchema.index({ createdAt: -1 });
registrationSchema.index({ 'attendance.attended': 1 });

// Compound indexes
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ user: 1, status: 1 });
registrationSchema.index({ event: 1, 'payment.status': 1 });

// Pre-save middleware to validate unique registration
registrationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingRegistration = await this.constructor.findOne({
      event: this.event,
      user: this.user
    });
    
    if (existingRegistration) {
      return next(new Error('Usuário já está inscrito neste evento'));
    }
  }
  next();
});

// Static method to get registrations by event
registrationSchema.statics.getByEvent = function(eventId, options = {}) {
  const query = { event: eventId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });
};

// Static method to get registrations by user
registrationSchema.statics.getByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('event', 'title startDate endDate banner')
    .sort({ createdAt: -1 });
};

// Static method to get registration statistics
registrationSchema.statics.getStats = function(eventId) {
  return this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        waitlist: {
          $sum: { $cond: [{ $eq: ['$status', 'waitlist'] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        attended: {
          $sum: { $cond: ['$attendance.attended', 1, 0] }
        },
        paid: {
          $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance method to approve registration
registrationSchema.methods.approve = function() {
  this.status = 'approved';
  this.attendance.confirmed = true;
  return this.save();
};

// Instance method to reject registration
registrationSchema.methods.reject = function(reason) {
  this.status = 'rejected';
  this.notes.organizer = reason;
  return this.save();
};

// Instance method to cancel registration
registrationSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.notes.participant = reason;
  return this.save();
};

// Instance method to move to waitlist
registrationSchema.methods.moveToWaitlist = function() {
  this.status = 'waitlist';
  return this.save();
};

// Instance method to check in
registrationSchema.methods.checkIn = function() {
  this.attendance.attended = true;
  this.attendance.checkInTime = new Date();
  return this.save();
};

// Instance method to check out
registrationSchema.methods.checkOut = function() {
  this.attendance.checkOutTime = new Date();
  return this.save();
};

// Instance method to mark session attendance
registrationSchema.methods.markSessionAttendance = function(sessionId, attended = true) {
  const session = this.attendance.sessions.find(s => s.sessionId.equals(sessionId));
  
  if (session) {
    session.attended = attended;
    session.checkInTime = attended ? new Date() : null;
  } else {
    this.attendance.sessions.push({
      sessionId,
      attended,
      checkInTime: attended ? new Date() : null
    });
  }
  
  return this.save();
};

// Instance method to add session feedback
registrationSchema.methods.addSessionFeedback = function(sessionId, feedback) {
  const session = this.attendance.sessions.find(s => s.sessionId.equals(sessionId));
  
  if (session) {
    session.feedback = feedback;
  }
  
  return this.save();
};

module.exports = mongoose.model('Registration', registrationSchema); 