const mongoose = require('mongoose');

const marathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  startRegistrationDate: {
    type: Date,
    required: true,
  },
  endRegistrationDate: {
    type: Date,
    required: true,
  },
  marathonStartDate: {
    type: Date,
    required: true,
  },
  runningDistance: {
    type: String,
    required: true,
  },
  totalRegistrations: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 0;
      },
      message: 'Total registrations must be a non-negative integer'
    }
  },
  organizer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to ensure totalRegistrations is never negative
marathonSchema.pre('save', function(next) {
  if (this.totalRegistrations < 0) {
    this.totalRegistrations = 0;
  }
  next();
});

// Pre-findOneAndUpdate middleware to ensure totalRegistrations is never negative
marathonSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update && update.totalRegistrations < 0) {
    update.totalRegistrations = 0;
  }
  next();
});

const Marathon = mongoose.model('Marathon', marathonSchema);
module.exports = Marathon; 