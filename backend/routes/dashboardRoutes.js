import express from 'express';
import { getDashboardStats, getAnalytics } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'librarian'), getDashboardStats);
router.get('/analytics', protect, authorize('admin', 'librarian'), getAnalytics);

export default router;

