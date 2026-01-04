import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
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
  reservationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['waiting', 'available', 'fulfilled', 'cancelled'],
    default: 'waiting'
  },
  notifiedDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

reservationSchema.index({ bookId: 1, status: 1 });
reservationSchema.index({ userId: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;

