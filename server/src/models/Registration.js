const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  marathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Marathon',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  contactNo: {
    type: String,
    required: true,
  },
  additionalInfo: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
  },
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration; 