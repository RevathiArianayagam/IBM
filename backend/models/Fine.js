import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'waived'],
    default: 'pending'
  },
  paidDate: {
    type: Date
  },
  paidAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

fineSchema.index({ userId: 1, status: 1 });
fineSchema.index({ transactionId: 1 });

const Fine = mongoose.model('Fine', fineSchema);

export default Fine;

