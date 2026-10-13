# ⚡ Dine Luxe — Real-Time WebSocket & Event Architecture

> Real-time event propagation for Kitchen Display Systems (KDS), floor table updates, and order tracking.

---

## 📡 Event Architecture Overview

Dine Luxe utilizes Supabase Realtime (PostgreSQL CDC / logical decoding) paired with Redis Pub/Sub channels to broadcast state changes instantly to connected clients with sub-50ms latency.

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ State Mutation  ├──────►│ PostgreSQL WAL  ├──────►│ Realtime Engine │
│ (Express API)   │       │ (Logical CDC)   │       │ (WebSocket Hub) │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
                  ┌──────────────────────────────────────────┴────────────────────────┐
                  ▼                                                                   ▼
       ┌─────────────────────┐                                             ┌─────────────────────┐
       │   Kitchen Display   │                                             │   Floor Plan / Host │
       │     (Chef KDS)      │                                             │    (Live Seating)   │
       └─────────────────────┘                                             └─────────────────────┘
```

---

## 🔔 Subscribed Channels & Event Topics

### 1. `kds:branch:{branchId}` — Kitchen Display Stream
* **Event:** `order:created`
  * **Payload:** `{ orderId, tableLabel, items, specialRequests, createdAt }`
* **Event:** `order:item_status_updated`
  * **Payload:** `{ orderId, orderItemId, newStatus: 'preparing' | 'ready' }`

### 2. `floor:branch:{branchId}` — Dynamic Floor Layout
* **Event:** `table:status_changed`
  * **Payload:** `{ tableId, label, previousStatus, currentStatus, currentOrderId }`
* **Event:** `table:merged`
  * **Payload:** `{ primaryTableId, mergedTableIds, activeCapacity }`

### 3. `orders:user:{userId}` — Customer Order Tracker
* **Event:** `order:status_progressed`
  * **Payload:** `{ orderId, currentStatus: 'accepted' | 'preparing' | 'served' | 'paid' }`

---

## 🛡️ Security & Channel Authorization

Clients must authenticate via WebSocket handshake by transmitting a valid JWT Bearer token. RLS (Row Level Security) filters guarantee that customers only receive events for their own orders, while staff only receive events within their assigned `branchId`.
