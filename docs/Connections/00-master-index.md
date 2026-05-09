# Backend Testing — Master Index

> **Base URL:** `http://localhost:5001/api/v1`
> **Total Groups:** 11 | **Total Test Steps:** 150+

---

## Testing Order (Run in Sequence)

Groups must be run in order — each group depends on data created in earlier ones.

| # | File | What It Tests | Roles Involved | Depends On |
|---|------|--------------|----------------|------------|
| 01 | `01-restaurant-branch-setup.md` | Restaurant registration, admin activation, branch CRUD | Admin, Owner | — |
| 02 | `02-staff-branding.md` | All staff roles creation, access toggle, branding config | Owner, Manager | 01 |
| 03 | `03-tables-floor-layout.md` | Table creation, status machine, merge, floor layout publish | Owner, Manager, Host, Waiter | 01, 02 |
| 04 | `04-menu-management.md` | Categories, items, addons, bulk price update, availability | Owner, Manager | 01, 02 |
| 05 | `05-orders-kitchen-flow.md` | Full order lifecycle: create → KDS → serve | Waiter, Chef, Manager, Cashier | 03, 04 |
| 06 | `06-payments.md` | Cash, UPI, card, split bill, webhook, receipt | Cashier, Customer, Manager | 05 |
| 07 | `07-bookings-queue.md` | Reservations, arrived, seated, no-show, walk-in queue | Customer, Host, Manager | 01, 03 |
| 08 | `08-delivery.md` | Assign partner, status flow, GPS tracking, earnings | Manager, Delivery Partner | 05 |
| 09 | `09-inventory.md` | Stock management, deductions, waste log, low-stock alerts | Owner, Manager | 01, 02 |
| 10 | `10-loyalty-reviews-notifications-support.md` | Points earn/redeem, reviews, push tokens, support tickets | Customer, Admin | 06 |
| 11 | `11-analytics-reports-admin.md` | Business analytics, CSV/PDF exports, admin panel | Owner, Manager, Admin | 05–10 |

---

## Token Reference (Set Once, Reuse Everywhere)

```bash
BASE="http://localhost:5001/api/v1"

# Admin
export ADMIN_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin@platform.com","password":"Admin@Secure123"}' \
  | jq -r '.data.accessToken')

# Owner
export OWNER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"priya.mehta@restaurant.com","password":"Owner@1234"}' \
  | jq -r '.data.accessToken')

# Manager (after Group 02)
export MANAGER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"arjun.manager@spicegarden.com","password":"15051988"}' \
  | jq -r '.data.accessToken')

# Waiter
export WAITER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"ravi.waiter@spicegarden.com","password":"20081999"}' \
  | jq -r '.data.accessToken')

# Chef
export CHEF_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"sanjay.chef@spicegarden.com","password":"10031985"}' \
  | jq -r '.data.accessToken')

# Cashier
export CASHIER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"sneha.cashier@spicegarden.com","password":"25111995"}' \
  | jq -r '.data.accessToken')

# Host
export HOST_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"pooja.host@spicegarden.com","password":"04072000"}' \
  | jq -r '.data.accessToken')

# Customer
export CUSTOMER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"rahul.sharma@gmail.com","password":"Customer@123"}' \
  | jq -r '.data.accessToken')

# Delivery Partner (after Group 08)
export DELIVERY_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"vikram.delivery@spicegarden.com","password":"12061997"}' \
  | jq -r '.data.accessToken')

echo "All tokens set."
```

---

## What Each Test Covers

### Group 01 — Restaurant & Branch Setup
- Register restaurant (owner + restaurant + branch in one call)
- Admin approves / suspends restaurant
- Branch CRUD, operating hours, live stats, status toggle

### Group 02 — Staff & Branding
- Create all 5 staff roles (manager, waiter, chef, cashier, host)
- Toggle access, performance stats
- Branding colors, logo/banner upload URLs

### Group 03 — Tables & Floor Layout
- Create tables with zones, shapes, floors
- State machine: free → reserved → occupied → cleaning → free
- Maintenance mode, merge tables
- Save draft layout, publish, get live layout

### Group 04 — Menu Management
- Category creation, reorder, update
- Item creation with addons, allergens, calories, availability windows
- Sold-out, hidden status
- Bulk price adjustment (percent & fixed)

### Group 05 — Orders & Kitchen Flow
- Dine-in, takeaway, delivery order creation
- Chef KDS: pending → preparing → ready
- Item-level status tracking
- Waiter serves items, manager cancels

### Group 06 — Payments
- Cash, UPI, card payment initiation + verification
- UPI QR generation + status polling
- Split bill (3-way)
- Gateway webhook simulation
- Receipt retrieval

### Group 07 — Bookings & Queue
- Customer creates / cancels booking
- Host: arrived → seated → no-show
- Walk-in queue: join, position check, assign table, remove
- Geo arrival check

### Group 08 — Delivery
- Create delivery partner account
- Manager assigns partner to order
- Status flow: assigned → picked_up → out_for_delivery → delivered
- Live GPS location updates
- Partner earnings

### Group 09 — Inventory
- Create stock items with units and thresholds
- Restock, deduct after orders
- Waste logging
- Low-stock alerts, alert resolution

### Group 10 — Loyalty, Reviews, Notifications & Support
- Earn points from paid order, redeem on new order
- Post-order reviews with ratings
- Push notification device registration
- Support ticket lifecycle with messaging thread

### Group 11 — Analytics, Reports & Admin Panel
- Menu suggestions, demand forecast, bundle opportunities, staffing
- Sales, menu performance, kitchen performance, customer insights reports
- CSV & PDF export
- Admin dashboard, platform stats, restaurant/customer management

---

## Common HTTP Status Codes to Expect

| Code | Meaning |
|------|---------|
| `200` | Success — GET / PATCH / DELETE |
| `201` | Created — POST |
| `202` | Accepted (async, e.g. OTP sent) |
| `400` | Bad Request — validation failed |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — wrong role |
| `404` | Not Found |
| `409` | Conflict — duplicate resource |
| `410` | Gone — session expired (Redis TTL) |
| `429` | Too Many Requests — rate limit hit |
