import { z } from 'zod';

export const initiateSchema = z.object({
  order_id: z.string().uuid(),
  payment_method: z.enum(['upi', 'card', 'cash', 'wallet']),
  split_with: z.array(z.string().uuid()).optional(), // user IDs for split bill
});

export const verifySchema = z.object({
  payment_id: z.string().uuid(),
  gateway_payment_id: z.string().optional(),
  status: z.enum(['success', 'failed', 'pending']),
  gateway_signature: z.string().optional(),
});

export const splitSchema = z.object({
  order_id: z.string().uuid(),
  splits: z.array(
    z.object({
      label: z.string().min(1).max(100), // e.g. "Person 1"
      amount: z.number().positive(),
      payment_method: z.enum(['upi', 'card', 'cash', 'wallet']),
    })
  ).min(2),
});

export const upiQRSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive().optional(), // override for partial/split
});

export const webhookSchema = z.object({
  event: z.string(),
  payment_id: z.string(),
  order_id: z.string().optional(),
  status: z.string(),
  amount: z.number().optional(),
  gateway_signature: z.string().optional(),
});

export type InitiateInput = z.infer<typeof initiateSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type SplitInput = z.infer<typeof splitSchema>;
export type UPIQRInput = z.infer<typeof upiQRSchema>;
