# Redis Sub-Millisecond Table Cache Invalidation & Real-Time Sync

## 1. Caching Strategy
- Restaurant floor availability cached in Redis as a bitset representation (`restaurant:{id}:date:{YYYYMMDD}:slots`).
- Read path checks Redis memory buffer first (< 0.8ms latency).

## 2. Real-Time Pub/Sub Invalidation
- When a reservation is confirmed, the server mutates the PostgreSQL ledger and broadcasts a `slot:reserved` event via Redis Pub/Sub.
- Connected WebSocket edge gateways instantly push updated seat state to all active client browsers without page refreshes.
