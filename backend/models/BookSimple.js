import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear() + 1, 'Published year cannot be in the future']
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: [0, 'Available copies cannot be negative']
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookSchema.index({ category: 1 });
bookSchema.index({ publishedYear: 1 });
bookSchema.index({ availableCopies: 1 });

// Use a different collection name to avoid conflicts with the full Book model
const BookSimple = mongoose.model('BookSimple', bookSchema, 'books_simple');

export default BookSimple;

