# 🗄️ Dine Luxe — Database Schema & Data Models

> Complete PostgreSQL entity-relationship specification, indexing strategy, and constraint architecture.

---

## 🏛️ Entity-Relationship Topology

```text
┌──────────────┐          ┌───────────────────┐          ┌──────────────┐
│  RESTAURANT  │◄────┬────┤      BRANCH       ├─────────►│ FLOOR_LAYOUT │
└──────────────┘     │    └─────────┬─────────┘          └──────────────┘
                     │              │
                     │    ┌─────────▼─────────┐          ┌──────────────┐
                     ├────┤      TABLES       │◄─────────┤ RESERVATIONS │
                     │    └─────────┬─────────┘          └──────────────┘
                     │              │
┌──────────────┐     │    ┌─────────▼─────────┐          ┌──────────────┐
│    USERS     │◄────┴────┤      ORDERS       ├─────────►│   PAYMENTS   │
└──────────────┘          └─────────┬─────────┘          └──────────────┘
                                    │
                          ┌─────────▼─────────┐          ┌──────────────┐
                          │    ORDER_ITEMS    ├─────────►│  MENU_ITEMS  │
                          └───────────────────┘          └──────────────┘
```

---

## 📋 Core Entity Specifications

### 1. `users`
Core identity table storing customer, restaurant staff, and platform administrator accounts.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL CHECK (role IN ('customer', 'owner', 'manager', 'waiter', 'chef', 'cashier', 'host', 'delivery', 'admin')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `tables`
Physical floor table definitions with capacity limits and live operational states.
```sql
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    status VARCHAR(30) DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'cleaning', 'disabled')),
    current_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `reservations`
Guest table reservations protected by temporal unique constraints and Redis distributed mutex locks.
```sql
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    people_count INT NOT NULL CHECK (people_count BETWEEN 1 AND 20),
    arrival_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_table_arrival_time UNIQUE (table_id, arrival_time)
);
```

### 4. `orders` & `order_items`
Dining orders linked to active tables or delivery flows with line-item customization notes.
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_type VARCHAR(30) DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    status VARCHAR(30) DEFAULT 'placed' CHECK (status IN ('placed', 'accepted', 'preparing', 'ready', 'served', 'paid', 'closed')),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ⚡ Indexing & Optimization Strategy

1. **Foreign Key Performance:** All foreign keys (`branch_id`, `table_id`, `user_id`, `order_id`) feature B-Tree indexes to prevent table scans during relational joins.
2. **Active Status Queries:** Partial indexes on active table states:
   ```sql
   CREATE INDEX idx_tables_active_branch ON tables(branch_id, status) WHERE status = 'free';
   ```
3. **Double-Booking Prevention:** Composite uniqueness index:
   ```sql
   CREATE UNIQUE INDEX idx_reservations_exclusive_slot 
   ON reservations(table_id, arrival_time) 
   WHERE status IN ('confirmed', 'seated');
   ```
