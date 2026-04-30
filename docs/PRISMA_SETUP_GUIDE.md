# 🗄️ Restaurant OS — Prisma Schema: Complete Setup Guide

> Stack: Next.js 14 · Express.js · PostgreSQL via Supabase · Prisma ORM  
> Author: Priyanshu Kumar Gupta & Ronit Gupta | Version 1.0

---

## 📁 WHERE TO PUT THE FILE

Your monorepo looks like this:

```
restaurant-os/
├── frontend/
├── backend/          ← Prisma lives HERE
│   ├── prisma/
│   │   └── schema.prisma   ✅ PUT IT HERE
│   ├── src/
│   └── package.json
├── shared/
└── supabase/
```

**Exact path:**
```
backend/prisma/schema.prisma
```

---

## 📦 STEP 1 — Install Prisma in the Backend

```bash
cd backend
npm install prisma @prisma/client
npx prisma init
```

`npx prisma init` will auto-create the `backend/prisma/` folder and a starter `schema.prisma`.  
**Replace that starter file with your `schema.prisma` file.**

---

## 🔑 STEP 2 — Set Up Environment Variables

Create/update `backend/.env` with these variables:

```env
# ─── Supabase Database ───────────────────────────────────────
# Get these from: Supabase Dashboard → Project Settings → Database

# Connection Pooling URL (used by Prisma Client at runtime)
DATABASE_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct URL (used only by Prisma Migrate — bypasses PgBouncer)
DIRECT_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# ─── Other backend vars ───────────────────────────────────────
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
JWT_SECRET="your-jwt-secret"
RESEND_API_KEY="re_..."
PORT=4000
```

> ⚠️ **IMPORTANT — Two URLs for Supabase:**
> - `DATABASE_URL` → uses port `6543` (PgBouncer pooler) — for app runtime queries
> - `DIRECT_URL` → uses port `5432` (direct connection) — for migrations ONLY

---

## ⚙️ STEP 3 — Configure `schema.prisma` (Already done for you)

Your `schema.prisma` already has the correct datasource block:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

The `directUrl` field is the key — without it, `prisma migrate` **fails on Supabase** because PgBouncer doesn't support migration SQL commands.

---

## 🚀 STEP 4 — Run the Migration (Creates All Tables)

```bash
cd backend

# Format the schema (optional but recommended)
npx prisma format

# Create and apply the first migration
npx prisma migrate dev --name init_restaurant_os
```

This command will:
1. Compare your schema against the current database
2. Generate SQL migration files in `backend/prisma/migrations/`
3. Apply the SQL to your Supabase database
4. Generate the Prisma Client

---

## 🔄 STEP 5 — Generate Prisma Client

After every schema change, regenerate the client:

```bash
cd backend
npx prisma generate
```

This creates the typed client at `node_modules/@prisma/client`.

---

## 🧪 STEP 6 — Open Prisma Studio (Visual DB Browser)

```bash
cd backend
npx prisma studio
```

Opens at `http://localhost:5555` — lets you browse, insert, and edit rows visually.

---

## 📂 Complete File Structure After Setup

```
backend/
├── prisma/
│   ├── schema.prisma          ← Your schema (28 models)
│   └── migrations/
│       ├── 20250101000000_init_restaurant_os/
│       │   └── migration.sql  ← Auto-generated SQL
│       └── migration_lock.toml
├── src/
│   ├── config/
│   │   └── prisma.ts          ← Prisma client singleton (see below)
│   └── ...
└── package.json
```

---

## 🔌 STEP 7 — Create the Prisma Client Singleton

Create `backend/src/config/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

// Prevent multiple Prisma instances in development (hot-reload issue)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

Then import it anywhere in your backend:

```typescript
import prisma from '../config/prisma'

// Example: Get all active tables for a branch
const tables = await prisma.table.findMany({
  where: {
    branch_id: branchId,
    status: 'free',
  },
  orderBy: { label: 'asc' },
})
```

---

## 📋 ALL MODELS AT A GLANCE

| Model | Table Name | Description |
|---|---|---|
| `User` | `users` | All users: customer, staff, owner, admin, delivery |
| `Restaurant` | `restaurants` | Restaurant chains |
| `Branch` | `branches` | Physical locations per restaurant |
| `RestaurantBranding` | `restaurant_branding` | White-label colors, logo, tagline |
| `FloorLayout` | `floor_layouts` | Saved floor plan JSONs (draft/active/archived) |
| `Table` | `tables` | Physical tables with live status |
| `MenuCategory` | `menu_categories` | Starters, Mains, Desserts etc. |
| `MenuItem` | `menu_items` | Full menu item with addons, allergens, availability |
| `Booking` | `bookings` | Advance table reservations |
| `QueueEntry` | `queue_entries` | Walk-in and digital queue |
| `Order` | `orders` | Dine-in / delivery / takeaway orders |
| `OrderItem` | `order_items` | Individual items within an order |
| `Payment` | `payments` | Payment records per order |
| `Coupon` | `coupons` | Discount codes |
| `DeliveryPartner` | `delivery_partners` | Delivery partner profile & live location |
| `DeliveryAssignment` | `delivery_assignments` | Per-order delivery job |
| `Review` | `reviews` | Item-level customer ratings |
| `InventoryItem` | `inventory_items` | Ingredient stock levels |
| `RecipeIngredient` | `recipe_ingredients` | Menu item → ingredient mapping |
| `InventoryWasteLog` | `inventory_waste_logs` | Wastage tracking |
| `Notification` | `notifications` | In-app notifications per user |
| `BranchAlert` | `branch_alerts` | Manager alerts: overdue, low stock |
| `StaffFeedback` | `staff_feedback` | Anonymous staff workplace feedback |
| `CustomerPreference` | `customer_preferences` | Remembered table preferences |
| `UserDietaryProfile` | `user_dietary_profiles` | Dietary needs & allergies |
| `LoyaltyAccount` | `loyalty_accounts` | Points balance per user per restaurant |
| `LoyaltyTransaction` | `loyalty_transactions` | Points earned/redeemed history |
| `SupportTicket` | `support_tickets` | Customer support chat + escalations |
| `AuditLog` | `audit_logs` | Full trail of every staff/admin action |

---

## 🔁 COMMON COMMANDS CHEAT SHEET

```bash
# First-time setup
npx prisma migrate dev --name init_restaurant_os

# After changing schema.prisma — create a new migration
npx prisma migrate dev --name add_loyalty_table

# Apply migrations to production (Supabase)
npx prisma migrate deploy

# Regenerate Prisma Client after schema changes
npx prisma generate

# View DB in browser
npx prisma studio

# Pull existing DB schema into schema.prisma (reverse engineer)
npx prisma db pull

# Push schema directly WITHOUT creating migration files (for rapid prototyping)
npx prisma db push

# Reset dev DB (DELETES ALL DATA — dev only!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Format schema.prisma file
npx prisma format
```

---

## ⚡ USAGE EXAMPLES IN YOUR EXPRESS SERVICES

### Place an Order (`orders.service.ts`)
```typescript
import prisma from '../../config/prisma'

export async function placeOrder(data: {
  table_id: string
  customer_id: string
  waiter_id: string
  branch_id: string
  items: { menu_item_id: string; quantity: number; notes?: string }[]
}) {
  return await prisma.order.create({
    data: {
      table_id: data.table_id,
      customer_id: data.customer_id,
      waiter_id: data.waiter_id,
      branch_id: data.branch_id,
      order_type: 'dine_in',
      status: 'created',
      order_items: {
        create: data.items.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          notes: item.notes,
          unit_price: 0, // fetch real price in service before this
        })),
      },
    },
    include: {
      order_items: { include: { menu_item: true } },
      table: true,
      waiter: true,
    },
  })
}
```

### Get Live Tables for a Branch (`tables.service.ts`)
```typescript
export async function getLiveTables(branchId: string) {
  return await prisma.table.findMany({
    where: { branch_id: branchId },
    orderBy: [{ floor_number: 'asc' }, { label: 'asc' }],
  })
}
```

### Smart Waiter Assignment (`waiter-assign.ts`)
```typescript
export async function assignBestWaiter(branchId: string) {
  const waiters = await prisma.user.findMany({
    where: { branch_id: branchId, role: 'waiter', is_active: true },
    include: {
      orders_as_waiter: {
        where: { status: { in: ['confirmed', 'preparing', 'ready'] } },
      },
    },
  })

  // Sort by active order count (load balancing)
  waiters.sort((a, b) => a.orders_as_waiter.length - b.orders_as_waiter.length)
  return waiters[0] ?? null
}
```

### Update Table Status (`tables.service.ts`)
```typescript
export async function updateTableStatus(tableId: string, status: TableStatus) {
  return await prisma.table.update({
    where: { id: tableId },
    data: { status },
  })
}
```

---

## 🔒 ROW-LEVEL SECURITY (RLS) NOTE

Prisma itself does NOT enforce RLS — that is handled in Supabase directly via SQL policies (your `supabase/migrations/002_rls_policies.sql`).

However, **always filter by `restaurant_id` or `branch_id` from the JWT** in your Prisma queries, as an application-level guard:

```typescript
// ✅ Correct — always scope to the tenant from JWT
const orders = await prisma.order.findMany({
  where: {
    branch_id: req.user.branch_id,  // from JWT — never trust client
    status: 'created',
  },
})

// ❌ WRONG — never do this
const orders = await prisma.order.findMany({ where: { id: req.params.id } })
```

---

## 🗺️ HOW MODELS MAP TO YOUR FILE STRUCTURE

```
backend/src/modules/
├── auth/        → uses: User
├── users/       → uses: User, UserDietaryProfile
├── restaurants/ → uses: Restaurant, RestaurantBranding
├── branches/    → uses: Branch
├── branding/    → uses: RestaurantBranding
├── staff/       → uses: User (role filter)
├── tables/      → uses: Table, FloorLayout
├── floor-layout/→ uses: FloorLayout, Table
├── bookings/    → uses: Booking, Table (with SELECT FOR UPDATE lock)
├── queue/       → uses: QueueEntry
├── menu/        → uses: MenuCategory, MenuItem
├── orders/      → uses: Order, OrderItem, MenuItem
├── order-items/ → uses: OrderItem
├── kitchen/     → uses: Order, OrderItem
├── payments/    → uses: Payment, Coupon, LoyaltyAccount
├── delivery/    → uses: DeliveryPartner, DeliveryAssignment
├── inventory/   → uses: InventoryItem, RecipeIngredient, InventoryWasteLog
├── reviews/     → uses: Review
├── notifications/→ uses: Notification, BranchAlert
├── reports/     → uses: Order, Payment, MenuItem (aggregations)
├── admin/       → uses: all models (platform-wide)
└── support/     → uses: SupportTicket
```

---

## 🚨 IMPORTANT GOTCHAS

### 1. Supabase Auth vs Prisma Users
Your `users` table in Prisma is your **app-level user profile**. Supabase Auth manages the actual login session. Link them by using the Supabase Auth `user.id` as the `id` in your `users` table.

```typescript
// In auth.service.ts after Supabase signup:
const { data: authUser } = await supabase.auth.signUp({ email, password })

// Then create the profile row in your users table:
await prisma.user.create({
  data: {
    id: authUser.user.id,  // ← Same UUID as Supabase Auth
    name,
    email,
    role: 'customer',
  }
})
```

### 2. `prisma migrate dev` vs `prisma db push`
- Use `migrate dev` → when you want proper migration history (production-ready)
- Use `db push` → when prototyping rapidly and don't care about migration files yet

### 3. Never Use `prisma migrate reset` in Production
It **drops and recreates** the entire database. Only use in local dev.

### 4. JSON fields (`Json` type)
Fields like `operating_hours`, `layout_data`, `addons`, `availability` are stored as `jsonb` in PostgreSQL. You can query them but Prisma won't type them — cast manually in your service layer.

---

## ✅ RECOMMENDED BUILD ORDER (Schema-First)

Follow this sequence to avoid foreign key dependency errors:

1. `users` + `restaurants` + `branches` (core entities)
2. `restaurant_branding` (depends on restaurants)
3. `tables` + `floor_layouts` (depends on branches)
4. `menu_categories` + `menu_items` (depends on branches)
5. `bookings` + `queue_entries` (depends on users, branches, tables)
6. `orders` + `order_items` (depends on tables, users, menu_items)
7. `payments` + `coupons` (depends on orders)
8. `delivery_partners` + `delivery_assignments` (depends on orders, users)
9. `reviews` (depends on orders, restaurants)
10. `inventory_items` + `recipe_ingredients` (depends on branches, menu_items)
11. Everything else (notifications, alerts, loyalty, support, audit)

This matches your `supabase/migrations/001_core_tables.sql` file.
