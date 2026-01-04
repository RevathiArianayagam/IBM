import Book from '../models/Book.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const query = { isDeleted: false };

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { authors: { $in: [new RegExp(search, 'i')] } },
      { isbn: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by genre
  if (req.query.genre) {
    query.genre = { $in: [req.query.genre] };
  }

  // Filter by availability
  if (req.query.available === 'true') {
    query.availableCopies = { $gt: 0 };
  }

  // Filter by publication year
  if (req.query.yearFrom || req.query.yearTo) {
    query.publicationDate = {};
    if (req.query.yearFrom) {
      query.publicationDate.$gte = new Date(req.query.yearFrom, 0, 1);
    }
    if (req.query.yearTo) {
      query.publicationDate.$lte = new Date(req.query.yearTo, 11, 31);
    }
  }

  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const books = await Book.find(query)
    .populate('createdBy', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await Book.countDocuments(query);

  res.json({
    success: true,
    count: books.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: books
  });
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');

  if (!book || book.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  res.json({
    success: true,
    data: book
  });
});

// @desc    Create book
// @route   POST /api/books
// @access  Private/Librarian/Admin
export const createBook = asyncHandler(async (req, res) => {
  const bookData = {
    ...req.body,
    createdBy: req.user.id,
    availableCopies: req.body.totalCopies || req.body.availableCopies || 1
  };

  const book = await Book.create(bookData);

  res.status(201).json({
    success: true,
    data: book
  });
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Librarian/Admin
export const updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);

  if (!book || book.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Update available copies if total copies changed
  if (req.body.totalCopies && req.body.totalCopies !== book.totalCopies) {
    const diff = req.body.totalCopies - book.totalCopies;
    req.body.availableCopies = Math.max(0, book.availableCopies + diff);
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: book
  });
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Soft delete
  book.isDeleted = true;
  await book.save();

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
export const searchBooks = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const books = await Book.find({
    $text: { $search: q },
    isDeleted: false
  })
    .limit(20)
    .sort({ score: { $meta: 'textScore' } });

  res.json({
    success: true,
    count: books.length,
    data: books
  });
});

