import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createReview,
  getByRestaurant,
  getByBranch,
  getByOrder,
  deleteReview,
} from './reviews.controller';
import { createReviewSchema } from './reviews.schema';

const router = Router();

// POST /reviews — customer only, after order
router.post('/', authenticate, validate(createReviewSchema), createReview);

// GET /reviews/restaurant/:id — public, paginated
router.get('/restaurant/:id', getByRestaurant);

// GET /reviews/branch/:id — public, paginated
router.get('/branch/:id', getByBranch);

// GET /reviews/order/:orderId — check if already reviewed
router.get('/order/:orderId', authenticate, getByOrder);

// DELETE /reviews/:id — admin only
router.delete('/:id', authenticate, requireRole('admin'), deleteReview);

export default router;
