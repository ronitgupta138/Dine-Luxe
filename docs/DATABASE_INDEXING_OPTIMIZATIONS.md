# PostgreSQL Composite Indexing & Partial Index Optimization

## 1. Index Configurations
- **Slot Lookup Index:**
  `CREATE INDEX idx_slots_restaurant_time_status ON table_slots (restaurant_id, slot_time, status);`
- **Active Reservations Partial Index:**
  `CREATE INDEX idx_active_reservations ON reservations (guest_id, status) WHERE status IN ('CONFIRMED', 'SEATED');`
  Reduces index size by 85% by excluding archived, cancelled, or historical completed visits.
