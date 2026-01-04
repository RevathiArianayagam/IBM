import express from 'express';
import {
  getUsers,
  getUser,
  getCurrentUserProfile,
  updateUser,
  deleteUser,
  getBorrowingHistory
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile/me', protect, getCurrentUserProfile);
router.get('/', protect, authorize('admin', 'librarian'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.get('/:id/borrowing-history', protect, getBorrowingHistory);

export default router;

