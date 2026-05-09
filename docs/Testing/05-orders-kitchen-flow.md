# Group 05 — Orders & Kitchen Flow Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Waiter → Chef → Waiter → Cashier
> **Purpose:** Full order lifecycle — create → kitchen → serve → complete




---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export WAITER_TOKEN="<waiter accessToken>"
export CHEF_TOKEN="<chef accessToken>"
export MANAGER_TOKEN="<manager accessToken>"
export OWNER_TOKEN="<owner accessToken>"
export CASHIER_TOKEN="<cashier accessToken>"
export TABLE_1_ID="<table UUID>"
export BRANCH_ID="<branch UUID>"
export ITEM_PANEER_TIKKA="<menu item UUID>"
export ITEM_BUTTER_CHICKEN="<menu item UUID>"
export ITEM_DAL_MAKHANI="<menu item UUID>"
export ITEM_GARLIC_NAAN="<menu item UUID>"
```


BASE="http://localhost:5001/api/v1"

## OWNER
```bash
export OWNER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"priya.mehta1@restaurant.com","password":"Owner@1234"}' \
  | jq -r '.data.accessToken')
echo "OWNER: $OWNER_TOKEN"
```
## MANAGER

```bash
export MANAGER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"arjun.manager@spicegarden.com","password":"15051988"}' \
  | jq -r '.data.accessToken')
echo "MANAGER: $MANAGER_TOKEN"
```

## WAITER

```bash
export WAITER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"ravi.waiter@spicegarden.com","password":"20081999"}' \
  | jq -r '.data.accessToken')
echo "WAITER: $WAITER_TOKEN"
```
## CHEF
```bash
export CHEF_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"sanjay.chef@spicegarden.com","password":"10031985"}' \
  | jq -r '.data.accessToken')
echo "CHEF: $CHEF_TOKEN"
```

## CASHIER

```bash
export CASHIER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"sneha.cashier@spicegarden.com","password":"25111995"}' \
  | jq -r '.data.accessToken')
echo "CASHIER: $CASHIER_TOKEN"
```
## HOST
```bash
export HOST_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"pooja.host@spicegarden.com","password":"04072000"}' \
  | jq -r '.data.accessToken')
echo "HOST: $HOST_TOKEN"
```

## CUSTOMER
```bash
export CUSTOMER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"rahul.sharma@gmail.com","password":"Customer@123"}' \
  | jq -r '.data.accessToken')
echo "CUSTOMER: $CUSTOMER_TOKEN"
```
## ADMIN
```bash
export ADMIN_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin@platform.com","password":"Admin@Secure123"}' \
  | jq -r '.data.accessToken')
echo "ADMIN: $ADMIN_TOKEN"
```




---

## ── ORDER CREATION ────────────────────────────────────────────────

## STEP 1 — Waiter Creates a Dine-In Order

```bash
curl -X POST $BASE/orders \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": "'$TABLE_1_ID'",
    "order_type": "dine_in",
    "items": [
      {
        "menu_item_id": "'$ITEM_PANEER_TIKKA'",
        "quantity": 1,
        "notes": "Less spicy please"
      },
      {
        "menu_item_id": "'$ITEM_BUTTER_CHICKEN'",
        "quantity": 2,
        "addons": [
          {"addon_id": "<extra_gravy_addon_id>", "quantity": 1}
        ]
      },
      {
        "menu_item_id": "'$ITEM_GARLIC_NAAN'",
        "quantity": 3
      }
    ],
    "special_instructions": "Guest is allergic to nuts"
  }'
```

> Save: `export ORDER_ID="<order id>"`

**Expected:** `201` — order created with status `pending`, KDS ticket generated

---

## STEP 2 — Get Order by ID

```bash
curl $BASE/orders/$ORDER_ID \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Expected:** `200` — full order with items, status, totals

---

## STEP 3 — Get Orders by Table

```bash
curl $BASE/orders/table/$TABLE_1_ID \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Expected:** `200` — array with the order we just created

---

## STEP 4 — Get Active Branch Orders (Manager View)

```bash
curl $BASE/orders/branch/$BRANCH_ID/active \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — all active orders for the branch

---

## ── ORDER ITEMS ───────────────────────────────────────────────────

## STEP 5 — Get Items for the Order

```bash
curl $BASE/order-items/order/$ORDER_ID \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Expected:** `200` — array of order items, all status `pending`

> Save item IDs:
```bash
export ORDER_ITEM_1="<paneer tikka order item id>"
export ORDER_ITEM_2="<butter chicken order item id>"
export ORDER_ITEM_3="<garlic naan order item id>"
```

---

## ── KITCHEN FLOW ──────────────────────────────────────────────────

## STEP 6 — Chef Gets KDS Tickets

```bash
curl $BASE/kitchen/branch/$BRANCH_ID/tickets \
  -H "Authorization: Bearer $CHEF_TOKEN"
```

**Expected:** `200` — active orders for kitchen to see

---

## STEP 7 — Chef: Order confirmed → preparing

```bash
curl -X PATCH $BASE/kitchen/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'
```

**Expected:** `200` — status: `preparing`

---

## STEP 8 — Chef: Item-level Status Update (pending → preparing)

```bash
curl -X PATCH $BASE/order-items/$ORDER_ITEM_1/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'

curl -X PATCH $BASE/order-items/$ORDER_ITEM_2/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'

curl -X PATCH $BASE/order-items/$ORDER_ITEM_3/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'
```

**Expected:** `200` each

---

## STEP 9 — Chef: Items Ready

```bash
curl -X PATCH $BASE/order-items/$ORDER_ITEM_1/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'

curl -X PATCH $BASE/order-items/$ORDER_ITEM_2/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'

curl -X PATCH $BASE/order-items/$ORDER_ITEM_3/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'
```

---

## STEP 10 — Chef: Order Ready

```bash
curl -X PATCH $BASE/kitchen/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'
```

**Expected:** `200` — order status: `ready`, waiter notified

---

## STEP 11 — Waiter: Serve Individual Items

```bash
curl -X PATCH $BASE/order-items/$ORDER_ITEM_1/serve \
  -H "Authorization: Bearer $WAITER_TOKEN"

curl -X PATCH $BASE/order-items/$ORDER_ITEM_2/serve \
  -H "Authorization: Bearer $WAITER_TOKEN"

curl -X PATCH $BASE/order-items/$ORDER_ITEM_3/serve \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Expected:** `200` each — item status: `served`

---

## STEP 12 — Check Overdue Orders (Chef/Manager)

```bash
curl $BASE/kitchen/branch/$BRANCH_ID/overdue \
  -H "Authorization: Bearer $CHEF_TOKEN"
```

**Expected:** `200` — empty array (our order is done), or overdue ones if any

---

## STEP 13 — Create a Takeaway Order

```bash
curl -X POST $BASE/orders \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": "'$TABLE_1_ID'",
    "order_type": "takeaway",
    "items": [
      {
        "menu_item_id": "'$ITEM_DAL_MAKHANI'",
        "quantity": 1
      }
    ]
  }'
```

> Save: `export TAKEAWAY_ORDER_ID="<id>"`

---

## STEP 14 — Create a Delivery Order

```bash
curl -X POST $BASE/orders \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": "'$TABLE_1_ID'",
    "order_type": "delivery",
    "items": [
      {
        "menu_item_id": "'$ITEM_PANEER_TIKKA'",
        "quantity": 2
      },
      {
        "menu_item_id": "'$ITEM_GARLIC_NAAN'",
        "quantity": 4
      }
    ]
  }'
```

> Save: `export DELIVERY_ORDER_ID="<id>"`

---

## STEP 15 — Cancel an Order (Manager)

```bash
curl -X PATCH $BASE/orders/$TAKEAWAY_ORDER_ID/cancel \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Customer changed mind"}'
```

**Expected:** `200` — order status: `cancelled`

---

## ❌ Negative Tests

```bash
# Create order with empty items array → 400
curl -X POST $BASE/orders \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table_id":"'$TABLE_1_ID'","order_type":"dine_in","items":[]}'

# Chef trying to go backwards: ready → preparing → 400
curl -X PATCH $BASE/kitchen/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $CHEF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'

# Waiter cancelling order (not allowed) → 403
curl -X PATCH $BASE/orders/$ORDER_ID/cancel \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"test"}'

# Invalid order_type → 400
curl -X POST $BASE/orders \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table_id":"'$TABLE_1_ID'","order_type":"pickup","items":[{"menu_item_id":"'$ITEM_PANEER_TIKKA'","quantity":1}]}'

# Get order that doesn't exist → 404
curl $BASE/orders/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $WAITER_TOKEN"
```
