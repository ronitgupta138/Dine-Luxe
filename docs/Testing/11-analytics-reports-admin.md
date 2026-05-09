# Group 11 — Analytics, Reports & Admin Panel Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Owner + Manager + Admin
> **Purpose:** Business insights, sales reports, kitchen performance, platform-level admin

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export OWNER_TOKEN="<owner accessToken>"
export MANAGER_TOKEN="<manager accessToken>"
export ADMIN_TOKEN="<admin accessToken>"
export BRANCH_ID="<branch UUID>"
export RESTAURANT_ID="<restaurant UUID>"
```

> **Note:** Reports are most useful after Groups 05–10 have run (orders, payments, reviews etc. must exist)

---

## ── ANALYTICS ─────────────────────────────────────────────────────

## STEP 1 — Menu Suggestions (AI-based)

```bash
curl $BASE/analytics/menu-suggestions/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — top-performing items, slow-moving items, suggested additions

---

## STEP 2 — Demand Forecast

```bash
curl $BASE/analytics/demand-forecast/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — predicted orders by hour/day, peak time analysis

---

## STEP 3 — Bundle Opportunities

```bash
curl $BASE/analytics/bundle-opportunities/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — pairs of items frequently ordered together (e.g. Butter Chicken + Garlic Naan)

---

## STEP 4 — Staffing Recommendation

```bash
curl $BASE/analytics/staffing-recommendation/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — recommended staff per shift based on predicted demand

---

## STEP 5 — Manager Gets Analytics (Same Endpoints)

```bash
curl $BASE/analytics/menu-suggestions/$BRANCH_ID \
  -H "Authorization: Bearer $MANAGER_TOKEN"

curl $BASE/analytics/demand-forecast/$BRANCH_ID \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — manager has same analytics access

---

## ── REPORTS ───────────────────────────────────────────────────────

## STEP 6 — Sales Report (Date Range)

```bash
curl "$BASE/reports/sales?branch_id=$BRANCH_ID&from=2026-05-01&to=2026-05-08" \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — total revenue, order count, avg order value, breakdown by day

---

## STEP 7 — Sales Report (Today Only)

```bash
TODAY=$(date +%Y-%m-%d)
curl "$BASE/reports/sales?branch_id=$BRANCH_ID&from=$TODAY&to=$TODAY" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200`

---

## STEP 8 — Menu Performance Report

```bash
curl "$BASE/reports/menu-performance?branch_id=$BRANCH_ID" \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — top items by revenue, quantity sold, profit margin per item

---

## STEP 9 — Kitchen Performance Report

```bash
curl "$BASE/reports/kitchen-performance?branch_id=$BRANCH_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — avg preparation time, orders completed on time, overdue count

---

## STEP 10 — Customer Insights Report (Owner Only)

```bash
curl "$BASE/reports/customer-insights?branch_id=$BRANCH_ID" \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — new vs returning customers, avg spend, loyalty tier breakdown

---

## STEP 11 — Try Customer Insights as Manager (Should Fail)

```bash
curl "$BASE/reports/customer-insights?branch_id=$BRANCH_ID" \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `403` — owner-only endpoint

---

## STEP 12 — Export Sales Report as CSV

```bash
curl -X POST $BASE/reports/export \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "sales",
    "branch_id": "'$BRANCH_ID'",
    "from": "2026-05-01",
    "to": "2026-05-08",
    "format": "csv"
  }'
```

**Expected:** `200` — `{ download_url: "https://...", expires_at: "..." }`

---

## STEP 13 — Export Menu Performance as PDF

```bash
curl -X POST $BASE/reports/export \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "menu_performance",
    "branch_id": "'$BRANCH_ID'",
    "format": "pdf"
  }'
```

**Expected:** `200` — download URL

---

## ── ADMIN PANEL ───────────────────────────────────────────────────

## STEP 14 — Public Admin Health Check

```bash
curl $BASE/admin/health
```

**Expected:** `200` — `{ status: "ok" }`

---

## STEP 15 — Detailed Health Check (Admin)

```bash
curl $BASE/admin/health/detailed \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — DB connection, Redis connection, queue length, memory usage

---

## STEP 16 — Admin Dashboard Overview

```bash
curl $BASE/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — total restaurants, active branches, orders today, revenue today, new signups

---

## STEP 17 — Platform-Wide Stats

```bash
curl $BASE/admin/platform-stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — MoM growth, total GMV, active users, churn rate

---

## STEP 18 — Admin: Get All Restaurants

```bash
curl "$BASE/admin/restaurants?page=1&limit=20&status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — paginated list of all restaurants

---

## STEP 19 — Admin: Get All Customers

```bash
curl "$BASE/admin/customers?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — all registered customers

---

## STEP 20 — Admin: Update Customer Status (Ban)

```bash
# Get a customer ID from Step 19
export CUSTOMER_USER_ID="<customer user id>"

curl -X PATCH $BASE/admin/customers/$CUSTOMER_USER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "banned", "reason": "Fraudulent chargebacks"}'
```

**Expected:** `200`

### Banned customer tries to login → 403

```bash
curl -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"rahul.sharma@gmail.com","password":"Customer@123"}'
```

**Expected:** `403` — account banned

---

## STEP 21 — Admin: Reinstate Customer

```bash
curl -X PATCH $BASE/admin/customers/$CUSTOMER_USER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**Expected:** `200`

---

## STEP 22 — Admin: Get All Feedback/Reviews

```bash
curl "$BASE/admin/feedback?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — platform-wide reviews for moderation

---

## STEP 23 — Admin: Platform-Level Report

```bash
curl $BASE/reports/admin/platform \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — cross-restaurant aggregated stats

---

## STEP 24 — Admin: Trends Report

```bash
curl $BASE/reports/admin/trends \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — growth trends, popular cuisines, peak hours platform-wide

---

## ❌ Negative Tests

```bash
# Owner accessing admin dashboard → 403
curl $BASE/admin/dashboard \
  -H "Authorization: Bearer $OWNER_TOKEN"

# Manager accessing admin platform stats → 403
curl $BASE/admin/platform-stats \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# Report without branch_id → 400
curl "$BASE/reports/sales?from=2026-05-01&to=2026-05-08" \
  -H "Authorization: Bearer $OWNER_TOKEN"

# Report with from > to → 400
curl "$BASE/reports/sales?branch_id=$BRANCH_ID&from=2026-05-08&to=2026-05-01" \
  -H "Authorization: Bearer $OWNER_TOKEN"

# Analytics on another owner's branch → 403
curl $BASE/analytics/menu-suggestions/$BRANCH_ID \
  -H "Authorization: Bearer $OTHER_OWNER_TOKEN"

# Export with invalid format → 400
curl -X POST $BASE/reports/export \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"report_type":"sales","branch_id":"'$BRANCH_ID'","format":"xlsx"}'
```
