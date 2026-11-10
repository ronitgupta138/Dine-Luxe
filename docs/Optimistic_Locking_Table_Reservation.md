# Optimistic Concurrency Control for High-Demand Table Reservations

## 1. Problem Definition
During peak dining hours or seasonal event bookings, multiple guests frequently attempt to reserve the same table slot within milliseconds of each other. Standard read-then-write logic causes double-booking errors.

## 2. Versioned Optimistic Locking
- The `TableSlot` schema maintains a monotonically increasing integer `version` attribute.
- Reservation update statements assert version matching:
  ```sql
  UPDATE table_slots 
  SET status = 'RESERVED', version = version + 1 
  WHERE id = :slotId AND version = :expectedVersion;
  ```
- If rows affected == 0, transaction aborts immediately and client receives HTTP 409 Conflict with suggested alternative time slots.
