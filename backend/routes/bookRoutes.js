import express from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  searchBooks
} from '../controllers/bookController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchBooks);
router.get('/', getBooks);
router.get('/:id', getBook);
router.post('/', protect, authorize('admin', 'librarian'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

export default router;

