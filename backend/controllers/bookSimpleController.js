import BookSimple from '../models/BookSimple.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getAllBooks = asyncHandler(async (req, res) => {
  const books = await BookSimple.find({}).sort({ title: 1 });
  
  res.json({
    success: true,
    count: books.length,
    data: books
  });
});

// @desc    Get books by category
// @route   GET /api/books/category/:category
// @access  Public
export const getBooksByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required'
    });
  }

  const books = await BookSimple.find({ category: { $regex: category, $options: 'i' } })
    .sort({ title: 1 });

  res.json({
    success: true,
    count: books.length,
    category,
    data: books
  });
});

// @desc    Get books after year 2015
// @route   GET /api/books/after-year/:year
// @access  Public
export const getBooksAfterYear = asyncHandler(async (req, res) => {
  const year = parseInt(req.params.year) || 2015;
  
  if (isNaN(year)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid year provided'
    });
  }

  const books = await BookSimple.find({ 
    publishedYear: { $gt: year } 
  }).sort({ publishedYear: -1 });

  res.json({
    success: true,
    count: books.length,
    year,
    data: books
  });
});

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = asyncHandler(async (req, res) => {
  const book = await BookSimple.findById(req.params.id);

  if (!book) {
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

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Librarian/Admin
export const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, publishedYear, availableCopies } = req.body;

  // Validation
  if (!title || !author || !category || !publishedYear || availableCopies === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: title, author, category, publishedYear, availableCopies'
    });
  }

  // Prevent negative stock
  if (availableCopies < 0) {
    return res.status(400).json({
      success: false,
      message: 'Available copies cannot be negative'
    });
  }

  // Validate year
  const currentYear = new Date().getFullYear();
  if (publishedYear < 1000 || publishedYear > currentYear + 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid published year'
    });
  }

  const book = await BookSimple.create({
    title,
    author,
    category,
    publishedYear,
    availableCopies
  });

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: book
  });
});

// @desc    Update book - increase/decrease copies or change category
// @route   PUT /api/books/:id
// @access  Private/Librarian/Admin
export const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availableCopies, category, title, author, publishedYear } = req.body;

  // Check if book exists
  const book = await BookSimple.findById(id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Handle available copies update
  if (availableCopies !== undefined) {
    // Prevent negative stock
    if (availableCopies < 0) {
      return res.status(400).json({
        success: false,
        message: 'Available copies cannot be negative'
      });
    }

    // Calculate difference for increase/decrease
    const difference = availableCopies - book.availableCopies;
    
    if (difference > 0) {
      book.availableCopies = availableCopies;
    } else if (difference < 0) {
      // Decrease copies
      if (book.availableCopies + difference < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot decrease copies below 0'
        });
      }
      book.availableCopies = availableCopies;
    }
  }

  // Update category if provided
  if (category) {
    book.category = category;
  }

  // Update other fields if provided
  if (title) book.title = title;
  if (author) book.author = author;
  if (publishedYear) {
    const currentYear = new Date().getFullYear();
    if (publishedYear < 1000 || publishedYear > currentYear + 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid published year'
      });
    }
    book.publishedYear = publishedYear;
  }

  await book.save();

  res.json({
    success: true,
    message: 'Book updated successfully',
    data: book
  });
});

// @desc    Delete book (only if copies = 0)
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await BookSimple.findById(id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  // Only delete if available copies = 0
  if (book.availableCopies !== 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete book. There are ${book.availableCopies} available copies. Books can only be deleted when available copies = 0.`
    });
  }

  await BookSimple.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Book deleted successfully',
    data: {}
  });
});

// @desc    Increase book copies
// @route   PATCH /api/books/:id/increase
// @access  Private/Librarian/Admin
export const increaseCopies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount = 1 } = req.body;

  const book = await BookSimple.findById(id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Increase amount must be greater than 0'
    });
  }

  book.availableCopies += amount;
  await book.save();

  res.json({
    success: true,
    message: `Increased copies by ${amount}`,
    data: book
  });
});

// @desc    Decrease book copies
// @route   PATCH /api/books/:id/decrease
// @access  Private/Librarian/Admin
export const decreaseCopies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount = 1 } = req.body;

  const book = await BookSimple.findById(id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Decrease amount must be greater than 0'
    });
  }

  // Prevent negative stock
  if (book.availableCopies - amount < 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot decrease copies. Available copies (${book.availableCopies}) would become negative.`
    });
  }

  book.availableCopies -= amount;
  await book.save();

  res.json({
    success: true,
    message: `Decreased copies by ${amount}`,
    data: book
  });
});

