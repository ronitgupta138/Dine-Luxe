import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBookingSchema, cancelBookingSchema } from './bookings.schema';
import * as ctrl from './bookings.controller';

const router = Router();

// POST /bookings — customer
router.post('/', authenticate, requireRole('customer'), validate({ body: createBookingSchema }), ctrl.createBooking);

// GET /bookings/user/me — customer's own bookings (must come before /:id)
router.get('/user/me', authenticate, requireRole('customer'), ctrl.getMyBookings);

// GET /bookings/branch/:branchId — host/manager view of today's bookings
router.get('/branch/:branchId', authenticate, requireRole('host', 'manager', 'owner'), ctrl.getBranchBookings);

// GET /bookings/:id — customer or staff
router.get('/:id', authenticate, ctrl.getBookingById);

// PATCH /bookings/:id/cancel — customer or manager
router.patch('/:id/cancel', authenticate, validate({ body: cancelBookingSchema }), ctrl.cancelBooking);

// PATCH /bookings/:id/arrived — host or customer
router.patch('/:id/arrived', authenticate, ctrl.markArrived);

// PATCH /bookings/:id/seat — host only
router.patch('/:id/seat', authenticate, requireRole('host', 'manager'), ctrl.markSeated);

// PATCH /bookings/:id/no-show — host only
router.patch('/:id/no-show', authenticate, requireRole('host', 'manager'), ctrl.markNoShow);

export default router;
