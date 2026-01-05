import express from 'express';
import {
  createReservation,
  getUserReservations,
  cancelReservation,
  getBookReservations
} from '../controllers/reservationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/user/:userId', protect, getUserReservations);
router.put('/:id/cancel', protect, cancelReservation);
router.get('/book/:bookId', protect, authorize('admin', 'librarian'), getBookReservations);

export default router;

