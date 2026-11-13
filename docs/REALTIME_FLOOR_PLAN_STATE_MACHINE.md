# Real-Time Floor Plan Table State Machine & WebSocket Dissemination

## 1. Table Finite State Machine
Dining table lifecycle transitions through 6 distinct states:
`VACANT` $\to$ `HOLD_PENDING` $\to$ `RESERVED` $\to$ `SEATED` $\to$ `DINING` $\to$ `CLEANING` $\to$ `VACANT`

## 2. WebSocket Event Broadcast
State updates publish to Supabase Realtime / WebSocket channels:
```json
{
  "event": "table_state_changed",
  "table_id": "tbl_402",
  "new_state": "SEATED",
  "occupied_since": 1794498000,
  "guest_count": 4
}
```

## 3. Floor Host HUD Synchronization
Guarantees host staff visual floor plan repaints within sub-50ms across iPad and desktop terminals.
