<div align="center">

```text
██████╗ ██╗███╗   ██╗███████╗    ██╗     ██╗   ██╗██╗  ██╗███████╗
██╔══██╗██║████╗  ██║██╔════╝    ██║     ██║   ██║╚██╗██╔╝██╔════╝
██║  ██║██║██╔██╗ ██║█████╗      ██║     ██║   ██║ ╚███╔╝ █████╗  
██║  ██║██║██║╚██╗██║██╔══╝      ██║     ██║   ██║ ██╔██╗ ██╔══╝  
██████╔╝██║██║ ╚████║███████╗    ███████╗╚██████╔╝██╔╝ ██╗███████╗
╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝    ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
```

### **Dine Luxe — Full-Stack Restaurant Operating System & Real-Time Booking Platform**
#### *With Redis Distributed Mutex Locking & PostgreSQL Concurrency Defense*

[![Node.js](https://img.shields.io/badge/Node.js-20+-0891b2?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-0891b2?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-0891b2?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-0891b2?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-0891b2?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7_ioredis-0891b2?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS3-0891b2?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-0891b2?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/ronitgupta138/dine-luxe/actions)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Interactive_Preview-0891b2?style=flat-square&logo=googlechrome&logoColor=white)](https://ronitgupta138.github.io/dine-luxe/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0891b2?style=flat-square)](LICENSE)

</div>

---

## 📌 Architectural Highlights

* **Distributed Mutex Concurrency Protection:** High-velocity table reservation endpoints are guarded by Redis distributed key locks (`SET lock:table:{id}:{slot} token NX EX 10`) paired with atomic Lua scripts, eliminating race-condition double-bookings during peak dining rushes.
* **Dual-Tier Concurrency Defense:** Enforces PostgreSQL row-level locks (`SELECT FOR UPDATE`) and composite unique constraints on `(table_id, time_slot)` to guarantee zero double-allocations even during cache failover or network partitions.
* **Full-Stack Monorepo Architecture:** Clean separation of concerns across Express.js backend services, shared TypeScript domain types, and a Next.js 14 App Router customer portal and staff Kitchen Display System (KDS).
* **25 Production Business Modules:** Complete lifecycle coverage including `bookings`, `tables`, `floor-layout`, `kitchen`, `orders`, `menu`, `inventory`, `delivery`, `payments`, `analytics`, and `staff`.
* **Resilient Cache Failover:** Custom `ResilientRedis` client featuring automatic in-memory fallback stores to guarantee zero API process crashes during transient network disconnects or Redis maintenance.
* **Zod-Powered Schema Validation:** Strict payload sanitation and type safety on all reservation times, party sizes (1–20), item selections, and status transitions before touching persistence layers.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / USER PORTALS                           │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │ Customer Web & POS UI │              │ Kitchen Display / Waiters │  │
│  │   (Next.js 14 App)    │              │   (Real-Time Order View)  │  │
│  └───────────┬───────────┘              └─────────────┬─────────────┘  │
└──────────────┼────────────────────────────────────────┼────────────────┘
               │ HTTP / JSON API                        │
               ▼                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DINE LUXE REST API GATEWAY (Express)                 │
│                                                                        │
│   ┌────────────────────┐   ┌────────────────────┐   ┌──────────────┐   │
│   │   Auth & RBAC      │   │ Payload Validation │   │ Rate Limiter │   │
│   │ (JWT / Bearer)     │   │     (Zod / CJS)    │   │ (Redis-backed│   │
│   └─────────┬──────────┘   └─────────┬──────────┘   └──────┬───────┘   │
│             │                        │                     │           │
│   ┌─────────▼────────────────────────▼─────────────────────▼───────┐   │
│   │                        BUSINESS CONTROLLERS                    │   │
│   │  • Bookings / Table Allocator   • Orders & KDS Dispatcher      │   │
│   │  • Menu & Dynamic Pricing       • Inventory & Stock Depletion  │   │
│   └─────────┬──────────────────────────────────────────────┬───────┘   │
└─────────────┼──────────────────────────────────────────────┼───────────┘
              │                                              │
              ▼ [SET NX EX 10 / Lua Release]                 ▼ [SQL / Prisma]
┌───────────────────────────────┐              ┌─────────────────────────┐
│     REDIS DISTRIBUTED LOCK    │              │  POSTGRESQL 16 DATABASE │
│   • Mutex key per table/slot  │              │  • Row-lock FOR UPDATE  │
│   • Sorted-set reminders      │              │  • Relational integrity │
│   • In-memory safe fallback   │              │  • B-Tree index lookups │
└───────────────────────────────┘              └─────────────────────────┘
```

---

## 🔒 Concurrency & Double-Booking Prevention

During peak reservation windows (e.g., Valentine's Day or Friday evening dining), simultaneous requests for the same table at the identical time slot must never result in an overbooked table.

### 1. Redis Mutual Exclusion (`SET NX EX`)
Before executing any database write, the service attempts to acquire an exclusive lock:
```typescript
const lockKey = `lock:table:${tableId}:${slot}`;
const lockAcquired = await redis.set(lockKey, token, 'PX', 10000, 'NX');

if (!lockAcquired) {
  throw { statusCode: 409, message: 'Table is currently being reserved by another guest' };
}
```

### 2. Atomic Lua Unlock Script
Releasing the lock requires cryptographic token verification to prevent a slow transaction from accidentally deleting a lock re-acquired by another client:
```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

### 3. Database Pessimistic Row Lock (`SELECT FOR UPDATE`)
```sql
SELECT id, status, capacity 
FROM tables 
WHERE id = p_table_id 
FOR UPDATE;
```

---

## 🗄️ Relational Data Model (PostgreSQL)

The system is normalized across 8 core relational entities:

| Table | Primary Key | Key Foreign Keys & Indexes | Description |
| :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | `email (UNIQUE)` | Customer and staff profiles with hashed credentials |
| `tables` | `id` (UUID) | `branch_id`, `status`, `capacity` | Floor tables with seating capacity and physical status |
| `menu_items` | `id` (UUID) | `category_id`, `is_available` | Menu catalog with item descriptions and pricing |
| `orders` | `id` (UUID) | `table_id`, `user_id`, `status` | Active dining orders and payment totals |
| `order_items` | `id` (UUID) | `order_id`, `menu_item_id` | Individual order line items with customization notes |
| `reservations`| `id` (UUID) | `(table_id, time_slot) UNIQUE`, `user_id` | Booked dining slots with state tracking |
| `payments` | `id` (UUID) | `order_id`, `transaction_ref` | Payment records, payment method, and receipts |
| `audit_logs` | `id` (UUID) | `user_id`, `action`, `created_at` | Immutable security audit trail of staff actions |

---

## 🚀 REST API Reference

### Reservations (`/api/reservations`)
* `POST /api/reservations` — Create a table booking (guarded by Redis distributed lock).
* `GET /api/reservations` — List reservations with pagination and status filters.
* `GET /api/reservations/:id` — Retrieve reservation status and assigned table details.
* `DELETE /api/reservations/:id` — Cancel a confirmed booking and release the table.

### Orders & Kitchen (`/api/orders`)
* `POST /api/orders` — Create a customer order for an occupied table.
* `GET /api/orders/:id` — Get full order receipt and kitchen preparation progress.
* `PATCH /api/orders/:id/status` — Advance KDS workflow (`PENDING` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`).

### Menu & Catalog (`/api/menu`)
* `GET /api/menu` — Retrieve full menu items filtered by category and dietary flags.
* `POST /api/menu` — Add a new menu item (admin / manager only).

---

## 🧪 Automated Testing

Dine Luxe includes automated unit and integration tests covering reservation locking, schema validation, conflicting slot detection, and status workflows:

```bash
# Run the test suite
npm test
```

### Test Execution Output:
```text
▶ Dine Luxe API Test Suite
  ✔ 1. Valid reservation creation succeeds with 201 Created (18.3ms)
  ✔ 2. Reservation with invalid party size returns 400 Bad Request (2.8ms)
  ✔ 3. Reservation with missing customerName returns 400 Bad Request (2.6ms)
  ✔ 4. Duplicate reservation for identical table and timeSlot returns 409 Conflict (3.4ms)
  ✔ 5. Redis Lock: client cannot release lock owned by different token (0.5ms)
  ✔ 6. Reservation cancellation updates status to CANCELLED (3.5ms)
  ✔ 7. Menu listing and category filtering works (3.7ms)
  ✔ 8. Order creation and Kitchen Display status updates succeed (3.4ms)
✔ Dine Luxe API Test Suite (42.3ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **pnpm** or **npm**
* **PostgreSQL 16** (or Supabase project)
* **Redis** (optional; in-memory fallback enabled automatically if offline)

### 1. Clone & Install
```bash
git clone https://github.com/ronitgupta138/dine-luxe.git
cd dine-luxe
pnpm install # or npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 3. Run Development Servers
```bash
# Start backend and frontend simultaneously via Turborepo
npm run dev

# Or run tests
npm test
```

---

## 🌐 Live Demo & Cloud Deployment

### 1. Interactive Web Demo (Live Now)
Experience the real-time table reservation, Redis concurrency mutex simulation, menu browsing, and Kitchen Display System directly in your browser:  
👉 **[https://ronitgupta138.github.io/dine-luxe/](https://ronitgupta138.github.io/dine-luxe/)**

### 2. 1-Click Deploy to Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fronitgupta138%2Fdine-luxe&root-directory=frontend)

---

## ⚖️ License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.

---

<div align="center">

Crafted with precision by **[Ronit Gupta](https://github.com/ronitgupta138)**  
*Computer Science & Business Systems Undergraduate • SDE-1 / Backend Engineer*

</div>
