import Fine from '../models/Fine.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get all fines
// @route   GET /api/fines
// @access  Private/Librarian/Admin
export const getFines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  const fines = await Fine.find(query)
    .populate('userId', 'firstName lastName email membershipId')
    .populate('transactionId')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Fine.countDocuments(query);

  res.json({
    success: true,
    count: fines.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: fines
  });
});

// @desc    Get user fines
// @route   GET /api/fines/user/:userId
// @access  Private
export const getUserFines = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && req.user.id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const fines = await Fine.find({ userId })
    .populate('transactionId')
    .sort({ createdAt: -1 });

  const totalPending = await Fine.aggregate([
    { $match: { userId: userId, status: 'pending' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json({
    success: true,
    count: fines.length,
    totalPending: totalPending[0]?.total || 0,
    data: fines
  });
});

// @desc    Pay a fine
// @route   POST /api/fines/pay/:id
// @access  Private
export const payFine = asyncHandler(async (req, res) => {
  const { paidAmount } = req.body;

  const fine = await Fine.findById(req.params.id);

  if (!fine) {
    return res.status(404).json({
      success: false,
      message: 'Fine not found'
    });
  }

  if (fine.status === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Fine already paid'
    });
  }

  const paymentAmount = paidAmount || fine.amount;

  if (paymentAmount > fine.amount) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount exceeds fine amount'
    });
  }

  fine.paidAmount = paymentAmount;
  fine.paidDate = new Date();
  fine.status = 'paid';
  await fine.save();

  res.json({
    success: true,
    data: fine
  });
});

// @desc    Waive a fine
// @route   POST /api/fines/waive/:id
// @access  Private/Admin
export const waiveFine = asyncHandler(async (req, res) => {
  const fine = await Fine.findById(req.params.id);

  if (!fine) {
    return res.status(404).json({
      success: false,
      message: 'Fine not found'
    });
  }

  fine.status = 'waived';
  await fine.save();

  res.json({
    success: true,
    data: fine
  });
});

