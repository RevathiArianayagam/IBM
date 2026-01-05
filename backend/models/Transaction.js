import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued'
  },
  renewalCount: {
    type: Number,
    default: 0
  },
  condition: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for queries
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ bookId: 1 });
transactionSchema.index({ dueDate: 1, status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

