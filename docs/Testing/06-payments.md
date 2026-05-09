# Group 06 — Payments Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Cashier + Customer + Manager
> **Purpose:** Full payment lifecycle — initiate → verify → receipt, split bill, UPI QR

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export CASHIER_TOKEN="<cashier accessToken>"
export CUSTOMER_TOKEN="<customer accessToken>"
export MANAGER_TOKEN="<manager accessToken>"
export ORDER_ID="<completed order UUID>"         # from Group 05 Step 1
export DELIVERY_ORDER_ID="<delivery order UUID>" # from Group 05 Step 14
```

---

## ── CASH PAYMENT ──────────────────────────────────────────────────

## STEP 1 — Initiate Cash Payment

```bash
curl -X POST $BASE/payments/initiate \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "'$ORDER_ID'",
    "payment_method": "cash"
  }'
```

> Save: `export PAYMENT_ID="<payment id>"`

**Expected:** `201` — payment record created, status `pending`

---

## STEP 2 — Verify Cash Payment

```bash
curl -X POST $BASE/payments/verify \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "'$PAYMENT_ID'",
    "status": "success"
  }'
```

**Expected:** `200` — payment status: `success`, order status: `completed`

---

## STEP 3 — Get Receipt

```bash
curl $BASE/payments/receipt/$ORDER_ID \
  -H "Authorization: Bearer $CASHIER_TOKEN"
```

**Expected:** `200` — receipt with order items, totals, payment method, timestamp

---

## ── UPI PAYMENT ───────────────────────────────────────────────────

## STEP 4 — Generate UPI QR Code

```bash
# New order needed — run Group 05 Step 1 again to get a fresh ORDER_ID
export UPI_ORDER_ID="<fresh order UUID>"

curl -X POST $BASE/payments/upi/generate-qr \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "'$UPI_ORDER_ID'"
  }'
```

> Save: `export UPI_REF="<upi reference id>"`

**Expected:** `200` — `{ qrCode: "data:image/png...", upiRef: "...", amount: ... }`

---

## STEP 5 — Poll UPI Payment Status

```bash
curl $BASE/payments/upi/status/$UPI_REF \
  -H "Authorization: Bearer $CASHIER_TOKEN"
```

**Expected:** `200` — `{ status: "pending" | "success" | "failed" }`

---

## STEP 6 — Initiate UPI Payment

```bash
curl -X POST $BASE/payments/initiate \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "'$UPI_ORDER_ID'",
    "payment_method": "upi"
  }'
```

> Save: `export UPI_PAYMENT_ID="<payment id>"`

---

## STEP 7 — Verify UPI Payment (Simulate Gateway Callback)

```bash
curl -X POST $BASE/payments/verify \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "'$UPI_PAYMENT_ID'",
    "gateway_payment_id": "RAZORPAY_PAY_TEST_001",
    "status": "success",
    "gateway_signature": "test_sig_abc123"
  }'
```

**Expected:** `200`

---

## ── CARD PAYMENT ──────────────────────────────────────────────────

## STEP 8 — Initiate Card Payment

```bash
# Use another fresh order
export CARD_ORDER_ID="<fresh order UUID>"

curl -X POST $BASE/payments/initiate \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "'$CARD_ORDER_ID'",
    "payment_method": "card"
  }'
```

> Save: `export CARD_PAYMENT_ID="<payment id>"`

---

## STEP 9 — Verify Card Payment

```bash
curl -X POST $BASE/payments/verify \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "'$CARD_PAYMENT_ID'",
    "gateway_payment_id": "GATEWAY_CARD_001",
    "status": "success"
  }'
```

**Expected:** `200`

---

## ── SPLIT BILL ────────────────────────────────────────────────────

## STEP 10 — Split Bill Between 3 People

```bash
# Fresh order for split test
export SPLIT_ORDER_ID="<fresh order UUID>"

curl -X POST $BASE/payments/split \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "'$SPLIT_ORDER_ID'",
    "splits": [
      {"label": "Person 1", "amount": 300, "payment_method": "upi"},
      {"label": "Person 2", "amount": 300, "payment_method": "card"},
      {"label": "Person 3", "amount": 247, "payment_method": "cash"}
    ]
  }'
```

**Expected:** `200` — 3 payment records created

---

## STEP 11 — Partial UPI Amount (Split Override)

```bash
curl -X POST $BASE/payments/upi/generate-qr \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "'$SPLIT_ORDER_ID'",
    "amount": 300
  }'
```

**Expected:** `200` — QR for ₹300 (not full order amount)

---

## ── GATEWAY WEBHOOK ───────────────────────────────────────────────

## STEP 12 — Simulate Gateway Webhook (Public Endpoint)

```bash
curl -X POST $BASE/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.success",
    "payment_id": "WEBHOOK_PAY_001",
    "order_id": "'$ORDER_ID'",
    "status": "success",
    "amount": 850,
    "gateway_signature": "sha256_signature_here"
  }'
```

**Expected:** `200` — webhook processed

---

## STEP 13 — Customer Gets Their Receipt

```bash
curl $BASE/payments/receipt/$ORDER_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

**Expected:** `200` — same receipt (customer can access their own orders)

---

## STEP 14 — Waiter Gets Receipt (Allowed)

```bash
curl $BASE/payments/receipt/$ORDER_ID \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Expected:** `200`

---

## ❌ Negative Tests

```bash
# Initiate payment for already-paid order → 409
curl -X POST $BASE/payments/initiate \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"'$ORDER_ID'","payment_method":"cash"}'

# Split with only 1 person → 400 (min 2 splits)
curl -X POST $BASE/payments/split \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"'$SPLIT_ORDER_ID'","splits":[{"label":"Solo","amount":500,"payment_method":"cash"}]}'

# Customer initiating split bill → 403
curl -X POST $BASE/payments/split \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"'$SPLIT_ORDER_ID'","splits":[{"label":"P1","amount":250,"payment_method":"cash"},{"label":"P2","amount":250,"payment_method":"upi"}]}'

# Verify with invalid status → 400
curl -X POST $BASE/payments/verify \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_id":"'$PAYMENT_ID'","status":"refunded"}'

# No auth on receipt → 401
curl $BASE/payments/receipt/$ORDER_ID
```
