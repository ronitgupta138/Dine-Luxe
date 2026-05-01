import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  postMessage,
  getMessages,
} from './support.controller';
import { createTicketSchema, updateTicketStatusSchema, postMessageSchema } from './support.schema';

const router = Router();

router.use(authenticate);

// POST /support/tickets — customer
router.post('/tickets', validate(createTicketSchema), createTicket);

// GET /support/tickets — customer sees their own
router.get('/tickets', getTickets);

// GET /support/tickets/:id — customer or support agent
router.get('/tickets/:id', getTicketById);

// PATCH /support/tickets/:id/status — support agent only
router.patch(
  '/tickets/:id/status',
  requireRole('support', 'admin'),
  validate(updateTicketStatusSchema),
  updateTicketStatus
);

// POST /support/tickets/:id/messages — customer or agent
router.post('/tickets/:id/messages', validate(postMessageSchema), postMessage);

// GET /support/tickets/:id/messages — customer or agent
router.get('/tickets/:id/messages', getMessages);

export default router;
