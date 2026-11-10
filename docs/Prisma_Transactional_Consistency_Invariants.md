# Prisma Interactive Transaction Consistency Invariants

## 1. Multi-Step Reservation Workflow
Booking a dining experience requires 3 dependent operations:
1. Deducting seat availability on the targeted `TableSlot`.
2. Creating an immutable `Reservation` record with guest metadata and dietary preferences.
3. Generating an initial `PaymentLedger` escrow hold entry.

## 2. Transactional Guarantees
- Executed inside `prisma.$transaction(async (tx) => { ... })` with strict Repeatable Read isolation.
- Automatic rollback triggered if any step throws an error or exceeds 5,000ms execution timeout, preventing orphaned billing holds without bookings.
