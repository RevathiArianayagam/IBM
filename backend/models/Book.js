import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  authors: [{
    type: String,
    trim: true
  }],
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationDate: {
    type: Date
  },
  edition: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English'
  },
  genre: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: 1
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: 0
  },
  coverImage: {
    type: String
  },
  shelfLocation: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
bookSchema.index({ title: 'text', authors: 'text', isbn: 'text', description: 'text' });

const Book = mongoose.model('Book', bookSchema);

export default Book;

