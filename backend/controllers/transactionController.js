import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Fine from '../models/Fine.js';
import Reservation from '../models/Reservation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Issue a book
// @route   POST /api/transactions/issue
// @access  Private/Librarian/Admin
export const issueBook = asyncHandler(async (req, res) => {
  const { bookId, userId, dueDate } = req.body;

  const book = await Book.findById(bookId);
  if (!book || book.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  if (book.availableCopies <= 0) {
    return res.status(400).json({
      success: false,
      message: 'No copies available'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if user already has this book
  const existingTransaction = await Transaction.findOne({
    bookId,
    userId,
    status: 'issued'
  });

  if (existingTransaction) {
    return res.status(400).json({
      success: false,
      message: 'User already has this book'
    });
  }

  // Calculate due date (default 14 days)
  const defaultDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const transaction = await Transaction.create({
    bookId,
    userId,
    issuedBy: req.user.id,
    dueDate: defaultDueDate
  });

  // Decrease available copies
  book.availableCopies -= 1;
  await book.save();

  // Check and update reservations
  const reservation = await Reservation.findOne({
    bookId,
    userId,
    status: 'waiting'
  });

  if (reservation) {
    reservation.status = 'fulfilled';
    await reservation.save();
  }

  await transaction.populate('bookId', 'title authors isbn coverImage');
  await transaction.populate('userId', 'firstName lastName email membershipId');
  await transaction.populate('issuedBy', 'firstName lastName');

  res.status(201).json({
    success: true,
    data: transaction
  });
});

// @desc    Return a book
// @route   POST /api/transactions/return/:id
// @access  Private/Librarian/Admin
export const returnBook = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('bookId')
    .populate('userId');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  if (transaction.status === 'returned') {
    return res.status(400).json({
      success: false,
      message: 'Book already returned'
    });
  }

  transaction.returnDate = new Date();
  transaction.status = 'returned';
  transaction.condition = req.body.condition || transaction.condition;
  transaction.notes = req.body.notes || transaction.notes;

  await transaction.save();

  // Increase available copies
  const book = await Book.findById(transaction.bookId._id);
  book.availableCopies += 1;
  await book.save();

  // Check if overdue and create fine
  if (transaction.returnDate > transaction.dueDate) {
    const daysOverdue = Math.ceil(
      (transaction.returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24)
    );
    const fineAmount = daysOverdue * 5; // $5 per day

    await Fine.create({
      userId: transaction.userId._id,
      transactionId: transaction._id,
      amount: fineAmount,
      reason: `Overdue by ${daysOverdue} day(s)`
    });
  }

  res.json({
    success: true,
    data: transaction
  });
});

// @desc    Renew a book loan
// @route   POST /api/transactions/renew/:id
// @access  Private/Librarian/Admin
export const renewBook = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('bookId');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  if (transaction.status !== 'issued') {
    return res.status(400).json({
      success: false,
      message: 'Only issued books can be renewed'
    });
  }

  if (transaction.renewalCount >= 2) {
    return res.status(400).json({
      success: false,
      message: 'Maximum renewal limit reached'
    });
  }

  // Check if book has reservations
  const hasReservations = await Reservation.exists({
    bookId: transaction.bookId._id,
    status: 'waiting'
  });

  if (hasReservations) {
    return res.status(400).json({
      success: false,
      message: 'Cannot renew: book has pending reservations'
    });
  }

  transaction.renewalCount += 1;
  transaction.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await transaction.save();

  res.json({
    success: true,
    data: transaction
  });
});

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Librarian/Admin
export const getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  const transactions = await Transaction.find(query)
    .populate('bookId', 'title authors isbn coverImage')
    .populate('userId', 'firstName lastName email membershipId')
    .populate('issuedBy', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ issueDate: -1 });

  const total = await Transaction.countDocuments(query);

  res.json({
    success: true,
    count: transactions.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

// @desc    Get user transactions
// @route   GET /api/transactions/user/:userId
// @access  Private
export const getUserTransactions = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && req.user.id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const transactions = await Transaction.find({ userId })
    .populate('bookId', 'title authors isbn coverImage')
    .populate('issuedBy', 'firstName lastName')
    .sort({ issueDate: -1 });

  res.json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    Get overdue books
// @route   GET /api/transactions/overdue
// @access  Private/Librarian/Admin
export const getOverdueBooks = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    status: 'issued',
    dueDate: { $lt: new Date() }
  })
    .populate('bookId', 'title authors isbn')
    .populate('userId', 'firstName lastName email membershipId')
    .sort({ dueDate: 1 });

  res.json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

