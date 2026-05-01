import { supabaseAdmin } from '../../config/supabase';

/**
 * TODO: Phase 2 — Implement loyalty points system
 *
 * DB Schema (to be created in Phase 2):
 *
 * CREATE TABLE loyalty_transactions (
 *   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id     UUID NOT NULL REFERENCES users(id),
 *   order_id    UUID REFERENCES orders(id),
 *   points      INTEGER NOT NULL,            -- positive = earn, negative = redeem
 *   type        TEXT NOT NULL,               -- 'earn' | 'redeem' | 'expire'
 *   description TEXT,
 *   created_at  TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE loyalty_settings (
 *   restaurant_id     UUID PRIMARY KEY REFERENCES restaurants(id),
 *   points_per_rupee  NUMERIC DEFAULT 0.1,   -- 1 point per ₹10
 *   min_redeem_points INTEGER DEFAULT 100,
 *   rupees_per_point  NUMERIC DEFAULT 0.1,   -- ₹1 per 10 points
 *   expiry_days       INTEGER DEFAULT 365
 * );
 */

// ─── Get loyalty balance ───────────────────────────────────────────────────────
// TODO: Phase 2 — Implement loyalty points system
export async function getBalance(userId: string): Promise<{ user_id: string; balance: number }> {
  // TODO: Phase 2 — SUM points FROM loyalty_transactions WHERE user_id = userId AND type IN ('earn', 'redeem')
  // Also filter out expired transactions using expiry_days from loyalty_settings
  return { user_id: userId, balance: 0 };
}

// ─── Earn points on order completion ──────────────────────────────────────────
// TODO: Phase 2 — Implement loyalty points system
export async function earn(
  userId: string,
  orderId: string,
  amountPaid: number
): Promise<{ points_earned: number; new_balance: number }> {
  // TODO: Phase 2
  // 1. Fetch loyalty_settings for restaurant: points_per_rupee (default 1 point per ₹10)
  // 2. Calculate points = floor(amountPaid * points_per_rupee)
  // 3. INSERT into loyalty_transactions { user_id, order_id, points, type: 'earn', description: `Earned from order ${orderId}` }
  // 4. Return updated balance
  void userId; void orderId; void amountPaid;
  return { points_earned: 0, new_balance: 0 };
}

// ─── Redeem points against an order ───────────────────────────────────────────
// TODO: Phase 2 — Implement loyalty points system
export async function redeem(
  userId: string,
  orderId: string,
  pointsToRedeem: number
): Promise<{ discount_amount: number; new_balance: number }> {
  // TODO: Phase 2
  // 1. Get current balance via getBalance()
  // 2. Validate: balance >= pointsToRedeem AND pointsToRedeem >= min_redeem_points
  // 3. Calculate discount = pointsToRedeem * rupees_per_point
  // 4. INSERT into loyalty_transactions { user_id, order_id, points: -pointsToRedeem, type: 'redeem' }
  // 5. Apply discount to order (update orders.discount_amount)
  // 6. Return discount amount and updated balance
  void userId; void orderId; void pointsToRedeem;
  return { discount_amount: 0, new_balance: 0 };
}

// ─── Get loyalty transaction history ──────────────────────────────────────────
// TODO: Phase 2 — Implement loyalty points system
export async function getHistory(
  userId: string,
  page: number,
  limit: number
): Promise<{ data: any[]; count: number }> {
  // TODO: Phase 2
  // SELECT * FROM loyalty_transactions WHERE user_id = userId ORDER BY created_at DESC LIMIT limit OFFSET (page-1)*limit
  void page; void limit;
  return { data: [], count: 0 };
}
