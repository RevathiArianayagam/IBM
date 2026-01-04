import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private
export const createReservation = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  const book = await Book.findById(bookId);
  if (!book || book.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Check if book is available
  if (book.availableCopies > 0) {
    return res.status(400).json({
      success: false,
      message: 'Book is currently available'
    });
  }

  // Check if user already has this book
  const existingReservation = await Reservation.findOne({
    bookId,
    userId: req.user.id,
    status: { $in: ['waiting', 'available'] }
  });

  if (existingReservation) {
    return res.status(400).json({
      success: false,
      message: 'You already have a reservation for this book'
    });
  }

  const reservation = await Reservation.create({
    bookId,
    userId: req.user.id,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  await reservation.populate('bookId', 'title authors isbn coverImage');
  await reservation.populate('userId', 'firstName lastName email');

  res.status(201).json({
    success: true,
    data: reservation
  });
});

// @desc    Get user reservations
// @route   GET /api/reservations/user/:userId
// @access  Private
export const getUserReservations = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && req.user.id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const reservations = await Reservation.find({ userId })
    .populate('bookId', 'title authors isbn coverImage')
    .sort({ reservationDate: -1 });

  res.json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});

// @desc    Cancel a reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
export const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && reservation.userId.toString() !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this reservation'
    });
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.json({
    success: true,
    data: reservation
  });
});

// @desc    Get reservations for a book
// @route   GET /api/reservations/book/:bookId
// @access  Private/Librarian/Admin
export const getBookReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({
    bookId: req.params.bookId,
    status: { $in: ['waiting', 'available'] }
  })
    .populate('userId', 'firstName lastName email membershipId')
    .sort({ reservationDate: 1 });

  res.json({
    success: true,
    count: reservations.length,
    data: reservations
  });
});

