# PostgreSQL Application-Level Advisory Locks for Multi-Table Banquets

## 1. Problem Statement
Banquet reservations require reserving 5 to 20 adjacent dining tables simultaneously. Standard row-level locking (`SELECT ... FOR UPDATE`) risks deadlocks when concurrent transactions acquire overlapping tables in different orders.

## 2. Transaction-Level Advisory Locks
Uses PostgreSQL 64-bit advisory xact locks:
```sql
SELECT pg_advisory_xact_lock(hashtext('banquet_lock_' || branch_id));
```

## 3. Deadlock Prevention
Serializes banquet table allocation per restaurant branch, ensuring atomic multi-table acquisition with immediate release upon transaction commit.
