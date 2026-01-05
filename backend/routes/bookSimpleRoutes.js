import express from 'express';
import {
  getAllBooks,
  getBooksByCategory,
  getBooksAfterYear,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  increaseCopies,
  decreaseCopies
} from '../controllers/bookSimpleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Read operations (Public)
router.get('/', getAllBooks);
router.get('/category/:category', getBooksByCategory);
router.get('/after-year/:year', getBooksAfterYear);
router.get('/after-year', getBooksAfterYear); // Default to 2015
router.get('/:id', getBookById);

// Create operation (Protected)
router.post('/', protect, authorize('admin', 'librarian'), createBook);

// Update operations (Protected)
router.put('/:id', protect, authorize('admin', 'librarian'), updateBook);
router.patch('/:id/increase', protect, authorize('admin', 'librarian'), increaseCopies);
router.patch('/:id/decrease', protect, authorize('admin', 'librarian'), decreaseCopies);

// Delete operation (Protected - Admin only)
router.delete('/:id', protect, authorize('admin'), deleteBook);

export default router;

