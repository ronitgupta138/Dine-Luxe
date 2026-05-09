# Group 03 — Tables & Floor Layout Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Owner + Manager + Host + Waiter + Chef
> **Purpose:** Create tables, manage status transitions, design floor layout

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export OWNER_TOKEN="<owner accessToken>"
export MANAGER_TOKEN="<manager accessToken>"
export HOST_TOKEN="<host accessToken>"
export WAITER_TOKEN="<waiter accessToken>"
export BRANCH_ID="<branch UUID>"
```

---

## ── TABLES ────────────────────────────────────────────────────────

## STEP 1 — Create Tables (Owner/Manager)

```bash
# Table T1
curl -X POST $BASE/tables \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "label": "T1",
    "capacity": 4,
    "floor_number": 0,
    "shape": "square",
    "zone": "indoor"
  }'

# Table T2
curl -X POST $BASE/tables \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "label": "T2",
    "capacity": 2,
    "floor_number": 0,
    "shape": "round",
    "zone": "outdoor"
  }'

# Table T3
curl -X POST $BASE/tables \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "label": "T3",
    "capacity": 6,
    "floor_number": 1,
    "shape": "rectangle",
    "zone": "indoor"
  }'

# Table T4 (for merge test)
curl -X POST $BASE/tables \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "label": "T4",
    "capacity": 4,
    "floor_number": 0,
    "shape": "square",
    "zone": "indoor"
  }'
```

> Save table IDs:
```bash
export TABLE_1_ID="<T1 id>"
export TABLE_2_ID="<T2 id>"
export TABLE_3_ID="<T3 id>"
export TABLE_4_ID="<T4 id>"
```

**Expected:** `201` for each

---

## STEP 2 — Get All Tables for Branch

```bash
curl $BASE/tables/branch/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — array of 4 tables, all status `free`

---

## STEP 3 — Table Status Transitions (Valid Flow)

```bash
# free → reserved (host seating a booking)
curl -X PATCH $BASE/tables/$TABLE_1_ID/status \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"reserved","reason":"Booking #123"}'

# reserved → occupied (guest arrived, seated)
curl -X PATCH $BASE/tables/$TABLE_1_ID/status \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"occupied"}'

# occupied → cleaning (guest left)
curl -X PATCH $BASE/tables/$TABLE_1_ID/status \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"cleaning"}'

# cleaning → free (table ready again)
curl -X PATCH $BASE/tables/$TABLE_1_ID/status \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"free"}'
```

**Expected:** `200` each step

---

## STEP 4 — Manager Override: occupied → free (Emergency Clear)

```bash
# Put table in occupied state
curl -X PATCH $BASE/tables/$TABLE_2_ID/status \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"occupied"}'

# Manager direct reset (skip cleaning)
curl -X PATCH $BASE/tables/$TABLE_2_ID/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"free","reason":"Walk-out emergency reset"}'
```

**Expected:** `200`

---

## STEP 5 — Put Table into Maintenance

```bash
curl -X PATCH $BASE/tables/$TABLE_3_ID/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"maintenance","reason":"Broken chair leg"}'
```

**Expected:** `200` — status: maintenance

### Bring back to free

```bash
curl -X PATCH $BASE/tables/$TABLE_3_ID/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"free","reason":"Repaired"}'
```

---

## STEP 6 — Merge Two Tables (Host/Manager/Owner)

```bash
curl -X POST $BASE/tables/merge \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id_1": "'$TABLE_1_ID'",
    "table_id_2": "'$TABLE_4_ID'"
  }'
```

**Expected:** `200` — merged table returned

---

## STEP 7 — Delete a Table

```bash
curl -X DELETE $BASE/tables/$TABLE_4_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — table deleted

---

## ── FLOOR LAYOUT ──────────────────────────────────────────────────

## STEP 8 — Save Draft Layout

```bash
curl -X POST $BASE/floor-layout/branch/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "layout": {
      "canvas_width": 1200,
      "canvas_height": 800,
      "tables": [
        {"table_id": "'$TABLE_1_ID'", "x": 100, "y": 100, "rotation": 0},
        {"table_id": "'$TABLE_2_ID'", "x": 300, "y": 100, "rotation": 0},
        {"table_id": "'$TABLE_3_ID'", "x": 500, "y": 200, "rotation": 90}
      ],
      "walls": [],
      "decorations": []
    }
  }'
```

**Expected:** `200` — draft saved

---

## STEP 9 — Get Current Layout

```bash
curl $BASE/floor-layout/branch/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — draft layout returned

---

## STEP 10 — Publish Layout (Make Live)

```bash
curl -X POST $BASE/floor-layout/branch/$BRANCH_ID/publish \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — layout status: `active`

---

## STEP 11 — Get Live Layout (Any Staff)

```bash
curl $BASE/floor-layout/branch/$BRANCH_ID/live \
  -H "Authorization: Bearer $WAITER_TOKEN"
```

**Expected:** `200` — layout with real-time table statuses embedded

---

## ❌ Negative Tests

```bash
# Invalid table status transition: free → cleaning (not in state machine) → 400
curl -X PATCH $BASE/tables/$TABLE_1_ID/status \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"cleaning"}'

# Merge table with itself → 400
curl -X POST $BASE/tables/merge \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table_id_1":"'$TABLE_1_ID'","table_id_2":"'$TABLE_1_ID'"}'

# Cashier trying to create table → 403
curl -X POST $BASE/tables \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branch_id":"'$BRANCH_ID'","label":"T9","capacity":2,"floor_number":0,"shape":"round","zone":"indoor"}'

# Capacity > 20 → 400
curl -X POST $BASE/tables \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branch_id":"'$BRANCH_ID'","label":"T99","capacity":99,"floor_number":0,"shape":"square","zone":"indoor"}'
```
