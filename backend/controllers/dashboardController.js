import Book from '../models/Book.js';
import BookSimple from '../models/BookSimple.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Fine from '../models/Fine.js';
import Reservation from '../models/Reservation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin/Librarian
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get books from both models (original and simplified)
  const totalBooksOriginal = await Book.countDocuments({ isDeleted: false });
  const totalBooksSimple = await BookSimple.countDocuments({});
  const totalBooks = totalBooksOriginal + totalBooksSimple;

  // Available books from original model
  const availableBooksOriginal = await Book.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: null, total: { $sum: '$availableCopies' } } }
  ]);
  
  // Available books from simplified model
  const availableBooksSimple = await BookSimple.aggregate([
    { $group: { _id: null, total: { $sum: '$availableCopies' } } }
  ]);
  
  const availableBooks = (availableBooksOriginal[0]?.total || 0) + (availableBooksSimple[0]?.total || 0);

  // Borrowed books from original model (totalCopies - availableCopies)
  const borrowedBooksOriginal = await Book.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalCopies' },
        available: { $sum: '$availableCopies' }
      }
    }
  ]);
  
  const borrowedOriginal = borrowedBooksOriginal[0] ? borrowedBooksOriginal[0].total - borrowedBooksOriginal[0].available : 0;
  // Simplified model doesn't track borrowed copies separately, so borrowed = 0
  const borrowed = borrowedOriginal;

  const totalMembers = await User.countDocuments({ role: 'member' });
  const activeMembers = await User.countDocuments({
    role: 'member',
    membershipStatus: 'active'
  });

  const overdueCount = await Transaction.countDocuments({
    status: 'issued',
    dueDate: { $lt: new Date() }
  });

  const totalFines = await Fine.aggregate([
    { $match: { status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const paidFines = await Fine.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$paidAmount' } } }
  ]);

  const recentTransactions = await Transaction.find()
    .populate('bookId', 'title authors')
    .populate('userId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10);

  const stats = {
    books: {
      total: totalBooks,
      available: availableBooks,
      borrowed: borrowed
    },
    members: {
      total: totalMembers,
      active: activeMembers
    },
    transactions: {
      overdue: overdueCount
    },
    fines: {
      pending: totalFines[0]?.total || 0,
      collected: paidFines[0]?.total || 0
    },
    recentTransactions
  };

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Get analytics data
// @route   GET /api/dashboard/analytics
// @access  Private/Admin/Librarian
export const getAnalytics = asyncHandler(async (req, res) => {
  // Books borrowed over time (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyBorrows = await Transaction.aggregate([
    {
      $match: {
        issueDate: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$issueDate' },
          month: { $month: '$issueDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Most popular genres
  const popularGenres = await Transaction.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'bookId',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' },
    { $unwind: '$book.genre' },
    {
      $group: {
        _id: '$book.genre',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Most borrowed books
  const popularBooks = await Transaction.aggregate([
    {
      $group: {
        _id: '$bookId',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' },
    {
      $project: {
        book: {
          title: '$book.title',
          authors: '$book.authors',
          coverImage: '$book.coverImage'
        },
        count: 1
      }
    }
  ]);

  // Member activity (new members over time)
  const newMembers = await User.aggregate([
    {
      $match: {
        role: 'member',
        joinDate: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$joinDate' },
          month: { $month: '$joinDate' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      monthlyBorrows,
      popularGenres,
      popularBooks,
      newMembers
    }
  });
});

