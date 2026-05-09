# Group 08 — Delivery Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Manager + Delivery Partner
> **Purpose:** Assign delivery partner, update status, live location tracking, earnings

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export MANAGER_TOKEN="<manager accessToken>"
export OWNER_TOKEN="<owner accessToken>"
export DELIVERY_ORDER_ID="<delivery type order UUID>" # from Group 05 Step 14
```

---

## STEP 1 — Create a Delivery Partner Account

> Delivery partners are created as staff with role `delivery_partner`

```bash
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Vikram",
    "last_name": "Das",
    "email": "vikram.delivery@spicegarden.com",
    "phone": "9876543220",
    "dob": "1997-06-12",
    "gender": "male",
    "role": "delivery_partner",
    "branch_id": "'$BRANCH_ID'"
  }'
```

> Default password: `12061997`

---

## STEP 2 — Login as Delivery Partner

```bash
export DELIVERY_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"vikram.delivery@spicegarden.com","password":"12061997"}' \
  | jq -r '.data.accessToken')
echo "Delivery Token: $DELIVERY_TOKEN"
```

---

## STEP 3 — Manager Assigns Delivery Partner to Order

```bash
curl -X POST $BASE/delivery/orders/$DELIVERY_ORDER_ID/assign \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partner_id": "<delivery_partner_user_id>"
  }'
```

> Save: `export DELIVERY_ID="<delivery id from response>"`

**Expected:** `201` — delivery record created, status: `assigned`

---

## STEP 4 — Get Partner's Active Delivery

```bash
curl $BASE/delivery/partner/active \
  -H "Authorization: Bearer $DELIVERY_TOKEN"
```

**Expected:** `200` — active delivery with order details, customer address

---

## STEP 5 — Get Delivery by ID

```bash
curl $BASE/delivery/$DELIVERY_ID \
  -H "Authorization: Bearer $DELIVERY_TOKEN"
```

**Expected:** `200` — full delivery detail

---

## STEP 6 — Update Delivery Status: assigned → picked_up

```bash
curl -X PATCH $BASE/delivery/$DELIVERY_ID/status \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "picked_up"
  }'
```

**Expected:** `200` — status: `picked_up`

---

## STEP 7 — Send Live GPS Location

```bash
curl -X POST $BASE/delivery/location \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_id": "'$DELIVERY_ID'",
    "lat": 19.0760,
    "lon": 72.8777
  }'
```

**Expected:** `200` — location updated

### Send another location update (simulate movement)

```bash
curl -X POST $BASE/delivery/location \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_id": "'$DELIVERY_ID'",
    "lat": 19.0820,
    "lon": 72.8850
  }'
```

---

## STEP 8 — Update Delivery Status: picked_up → out_for_delivery

```bash
curl -X PATCH $BASE/delivery/$DELIVERY_ID/status \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "out_for_delivery"}'
```

**Expected:** `200`

---

## STEP 9 — Update Delivery Status: out_for_delivery → delivered

```bash
curl -X PATCH $BASE/delivery/$DELIVERY_ID/status \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

**Expected:** `200` — status: `delivered`, order marked complete

---

## STEP 10 — Get Partner Earnings

```bash
curl $BASE/delivery/partner/earnings \
  -H "Authorization: Bearer $DELIVERY_TOKEN"
```

**Expected:** `200` — `{ today: ..., this_week: ..., this_month: ..., total_deliveries: ... }`

---

## STEP 11 — Test Failed Delivery Flow

```bash
# Create a new delivery order first (repeat Group 05 Step 14)
export FAILED_ORDER_ID="<new delivery order UUID>"

# Assign partner
curl -X POST $BASE/delivery/orders/$FAILED_ORDER_ID/assign \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"partner_id":"<delivery_partner_user_id>"}'

# Save: export FAILED_DELIVERY_ID="<id>"

# picked_up
curl -X PATCH $BASE/delivery/$FAILED_DELIVERY_ID/status \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"picked_up"}'

# Mark as failed (e.g. customer not home)
curl -X PATCH $BASE/delivery/$FAILED_DELIVERY_ID/status \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "failed",
    "reason": "Customer unreachable at address"
  }'
```

**Expected:** `200` — status: `failed`

---

## ❌ Negative Tests

```bash
# Assign non-delivery-partner user → 400
curl -X POST $BASE/delivery/orders/$DELIVERY_ORDER_ID/assign \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"partner_id":"<waiter_user_id>"}'

# Update status backwards: delivered → picked_up → 400
curl -X PATCH $BASE/delivery/$DELIVERY_ID/status \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"picked_up"}'

# Manager updating delivery status (only partner can) → 403
curl -X PATCH $BASE/delivery/$DELIVERY_ID/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"delivered"}'

# Assign partner to a non-delivery order → 400
curl -X POST $BASE/delivery/orders/$ORDER_ID/assign \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"partner_id":"<delivery_partner_user_id>"}'

# Location update with invalid coordinates → 400
curl -X POST $BASE/delivery/location \
  -H "Authorization: Bearer $DELIVERY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"delivery_id":"'$DELIVERY_ID'","lat":999,"lon":999}'
```
