import express from 'express';
import {
  issueBook,
  returnBook,
  renewBook,
  getTransactions,
  getUserTransactions,
  getOverdueBooks
} from '../controllers/transactionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/issue', protect, authorize('admin', 'librarian'), issueBook);
router.post('/return/:id', protect, authorize('admin', 'librarian'), returnBook);
router.post('/renew/:id', protect, authorize('admin', 'librarian'), renewBook);
router.get('/overdue', protect, authorize('admin', 'librarian'), getOverdueBooks);
router.get('/user/:userId', protect, getUserTransactions);
router.get('/', protect, authorize('admin', 'librarian'), getTransactions);

export default router;

