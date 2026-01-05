import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { membershipId: { $regex: search, $options: 'i' } }
    ];
  }

  if (req.query.role) {
    query.role = req.query.role;
  }

  if (req.query.membershipStatus) {
    query.membershipStatus = req.query.membershipStatus;
  }

  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Get current user profile
// @route   GET /api/users/profile/me
// @access  Private
export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    profileImage: req.body.profileImage
  };

  // Only admins can update role and membership status
  if (req.user.role === 'admin') {
    if (req.body.role) fieldsToUpdate.role = req.body.role;
    if (req.body.membershipStatus) fieldsToUpdate.membershipStatus = req.body.membershipStatus;
    if (req.body.membershipExpiry) fieldsToUpdate.membershipExpiry = req.body.membershipExpiry;
  }

  // Users can only update their own profile (unless admin)
  if (req.user.role !== 'admin' && req.params.id !== req.user.id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this user'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.deleteOne();

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Get user borrowing history
// @route   GET /api/users/:id/borrowing-history
// @access  Private
export const getBorrowingHistory = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Users can only view their own history (unless admin/librarian)
  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && req.user.id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this history'
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

