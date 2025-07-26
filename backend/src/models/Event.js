const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais de 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [2000, 'Descrição não pode ter mais de 2000 caracteres']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Descrição curta não pode ter mais de 300 caracteres']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizador é obrigatório']
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: [
      'technology',
      'business',
      'health',
      'education',
      'entertainment',
      'sports',
      'science',
      'arts',
      'finance',
      'marketing',
      'other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag não pode ter mais de 50 caracteres']
  }],
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória']
  },
  endDate: {
    type: Date,
    required: [true, 'Data de fim é obrigatória']
  },
  timezone: {
    type: String,
    default: 'America/Sao_Paulo'
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'physical', 'hybrid'],
      required: [true, 'Tipo de localização é obrigatório']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    venue: {
      name: String,
      capacity: Number,
      facilities: [String]
    },
    onlineUrl: String,
    meetingId: String,
    meetingPassword: String
  },
  capacity: {
    type: Number,
    required: [true, 'Capacidade é obrigatória'],
    min: [1, 'Capacidade deve ser pelo menos 1']
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  price: {
    type: {
      type: String,
      enum: ['free', 'paid', 'donation'],
      default: 'free'
    },
    amount: {
      type: Number,
      min: [0, 'Preço não pode ser negativo'],
      default: 0
    },
    currency: {
      type: String,
      default: 'BRL'
    },
    earlyBirdPrice: {
      type: Number,
      min: [0, 'Preço early bird não pode ser negativo']
    },
    earlyBirdEndDate: Date
  },
  banner: {
    type: String,
    default: null
  },
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  speakers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    bio: String,
    avatar: String,
    company: String,
    position: String,
    topics: [String]
  }],
  sessions: [{
    title: String,
    description: String,
    speaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    room: String,
    type: {
      type: String,
      enum: ['keynote', 'workshop', 'panel', 'presentation', 'networking'],
      default: 'presentation'
    },
    maxAttendees: Number,
    materials: [{
      title: String,
      url: String,
      type: String
    }]
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  registrationSettings: {
    startDate: Date,
    endDate: Date,
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowWaitlist: {
      type: Boolean,
      default: true
    },
    maxWaitlist: {
      type: Number,
      default: 50
    },
    requirePayment: {
      type: Boolean,
      default: false
    },
    customFields: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'email', 'phone', 'select', 'checkbox', 'textarea']
      },
      required: Boolean,
      options: [String],
      placeholder: String
    }]
  },
  features: {
    hasChat: {
      type: Boolean,
      default: true
    },
    hasQandA: {
      type: Boolean,
      default: true
    },
    hasPolls: {
      type: Boolean,
      default: false
    },
    hasRecordings: {
      type: Boolean,
      default: false
    },
    hasCertificates: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    attendance: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowSharing: {
      type: Boolean,
      default: true
    },
    requireLogin: {
      type: Boolean,
      default: false
    },
    autoApprove: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for event status
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date() && this.status === 'published';
});

eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === 'published';
});

eventSchema.virtual('isCompleted').get(function() {
  return this.endDate < new Date() || this.status === 'completed';
});

eventSchema.virtual('isFull').get(function() {
  return this.currentRegistrations >= this.capacity;
});

eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.capacity - this.currentRegistrations);
});

eventSchema.virtual('registrationPercentage').get(function() {
  return this.capacity > 0 ? Math.round((this.currentRegistrations / this.capacity) * 100) : 0;
});

// Indexes for better query performance
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ 'location.type': 1 });
eventSchema.index({ visibility: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ createdAt: -1 });

// Compound indexes
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ organizer: 1, status: 1 });

// Pre-save middleware to validate dates
eventSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Data de início deve ser anterior à data de fim'));
  }
  
  if (this.registrationSettings.startDate && this.registrationSettings.endDate) {
    if (this.registrationSettings.startDate >= this.registrationSettings.endDate) {
      return next(new Error('Data de início das inscrições deve ser anterior à data de fim'));
    }
    
    if (this.registrationSettings.endDate > this.startDate) {
      return next(new Error('Inscrições devem terminar antes do início do evento'));
    }
  }
  
  next();
});

// Static method to get upcoming events
eventSchema.statics.getUpcoming = function(limit = 10) {
  return this.find({
    status: 'published',
    startDate: { $gt: new Date() }
  })
  .sort({ startDate: 1 })
  .limit(limit)
  .populate('organizer', 'name avatar');
};

// Static method to get events by category
eventSchema.statics.getByCategory = function(category, limit = 20) {
  return this.find({
    status: 'published',
    category: category
  })
  .sort({ startDate: 1 })
  .limit(limit)
  .populate('organizer', 'name avatar');
};

// Static method to search events
eventSchema.statics.search = function(query, limit = 20) {
  return this.find({
    status: 'published',
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  })
  .sort({ startDate: 1 })
  .limit(limit)
  .populate('organizer', 'name avatar');
};

// Instance method to check if user can register
eventSchema.methods.canRegister = function(userId) {
  if (this.status !== 'published') return false;
  if (this.isFull) return false;
  if (this.registrationSettings.endDate && this.registrationSettings.endDate < new Date()) return false;
  return true;
};

// Instance method to increment registration count
eventSchema.methods.incrementRegistrations = function() {
  this.currentRegistrations += 1;
  return this.save();
};

// Instance method to decrement registration count
eventSchema.methods.decrementRegistrations = function() {
  this.currentRegistrations = Math.max(0, this.currentRegistrations - 1);
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema); 