import express from 'express';
import {
  getFines,
  getUserFines,
  payFine,
  waiveFine
} from '../controllers/fineController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/user/:userId', protect, getUserFines);
router.get('/', protect, authorize('admin', 'librarian'), getFines);
router.post('/pay/:id', protect, payFine);
router.post('/waive/:id', protect, authorize('admin'), waiveFine);

export default router;

