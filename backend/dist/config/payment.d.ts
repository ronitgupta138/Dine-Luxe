/**
 * Payment Gateway Configuration
 *
 * TODO: Uncomment and configure the payment gateway of your choice.
 * Recommended: Razorpay for INR payments (India), Stripe for international.
 *
 * Install: npm install razorpay   (for Razorpay)
 *          npm install stripe      (for Stripe)
 */
export declare const paymentGateway: null;
/**
 * Verify Razorpay webhook signature
 * TODO: Call this in payments.service.ts handleGatewayWebhook before processing
 */
export declare function verifyRazorpaySignature(_body: string, _signature: string): boolean;
/**
 * Verify Stripe webhook signature
 * TODO: Call this in payments.service.ts handleGatewayWebhook before processing
 */
export declare function verifyStripeSignature(_rawBody: Buffer, _signature: string): boolean;
//# sourceMappingURL=payment.d.ts.map