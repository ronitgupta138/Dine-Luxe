"use strict";
/**
 * Payment Gateway Configuration
 *
 * TODO: Uncomment and configure the payment gateway of your choice.
 * Recommended: Razorpay for INR payments (India), Stripe for international.
 *
 * Install: npm install razorpay   (for Razorpay)
 *          npm install stripe      (for Stripe)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentGateway = void 0;
exports.verifyRazorpaySignature = verifyRazorpaySignature;
exports.verifyStripeSignature = verifyStripeSignature;
// ─── Environment Variables Required ──────────────────────────────────────────
// RAZORPAY_KEY_ID=rzp_live_xxxx
// RAZORPAY_KEY_SECRET=xxxx
// RAZORPAY_WEBHOOK_SECRET=xxxx
//
// STRIPE_SECRET_KEY=sk_live_xxxx
// STRIPE_WEBHOOK_SECRET=whsec_xxxx
// ─── Razorpay (recommended for INR) ──────────────────────────────────────────
// TODO: Uncomment when Razorpay keys are ready
// import Razorpay from 'razorpay';
//
// if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//   throw new Error('[payment] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
// }
//
// export const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
//
// export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;
// ─── Stripe (international) ───────────────────────────────────────────────────
// TODO: Uncomment when Stripe keys are ready
// import Stripe from 'stripe';
//
// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('[payment] STRIPE_SECRET_KEY is required');
// }
//
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2023-10-16',
// });
//
// export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
// ─── Stub export (remove once gateway is configured) ─────────────────────────
exports.paymentGateway = null; // TODO: replace with razorpay or stripe instance
/**
 * Verify Razorpay webhook signature
 * TODO: Call this in payments.service.ts handleGatewayWebhook before processing
 */
function verifyRazorpaySignature(_body, _signature) {
    // TODO:
    // const crypto = require('crypto');
    // const expectedSig = crypto
    //   .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    //   .update(_body)
    //   .digest('hex');
    // return expectedSig === _signature;
    console.warn('[payment] TODO: implement verifyRazorpaySignature');
    return false;
}
/**
 * Verify Stripe webhook signature
 * TODO: Call this in payments.service.ts handleGatewayWebhook before processing
 */
function verifyStripeSignature(_rawBody, _signature) {
    // TODO:
    // const event = stripe.webhooks.constructEvent(_rawBody, _signature, STRIPE_WEBHOOK_SECRET);
    // return !!event;
    console.warn('[payment] TODO: implement verifyStripeSignature');
    return false;
}
//# sourceMappingURL=payment.js.map