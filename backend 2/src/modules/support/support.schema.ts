import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(5).max(200),
    description: z.string().min(10).max(2000),
    category: z.enum(['order', 'payment', 'delivery', 'account', 'other']),
    order_id: z.string().uuid().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
});

export const updateTicketStatusSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'escalated']),
    resolution_note: z.string().max(1000).optional(),
  }),
});

export const postMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(2000),
    attachments: z.array(z.string().url()).max(5).optional(),
  }),
});
