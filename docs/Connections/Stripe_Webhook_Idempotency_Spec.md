# Stripe Webhook Signature Verification and Idempotency

## 1. Replay Attack Prevention
- Computes HMAC-SHA256 over timestamp + payload with Stripe endpoint secret.
- Stores processed event IDs in Redis with 24-hour TTL; duplicate deliveries return immediate HTTP 200 without re-processing.
