# Group 09 — Inventory Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Owner + Manager
> **Purpose:** Stock management, deductions, waste logging, low-stock alerts

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export OWNER_TOKEN="<owner accessToken>"
export MANAGER_TOKEN="<manager accessToken>"
export BRANCH_ID="<branch UUID>"
```

---

## STEP 1 — Get Inventory for Branch

```bash
curl $BASE/inventory/branch/$BRANCH_ID \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — array of inventory items (may be empty initially)

---

## STEP 2 — Create Inventory Items

```bash
# Paneer (Dairy)
curl -X POST $BASE/inventory \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "name": "Paneer",
    "unit": "kg",
    "quantity": 10,
    "min_threshold": 2,
    "cost_per_unit": 320,
    "category": "dairy",
    "supplier": "Fresh Dairy Co."
  }'

# Chicken (Protein)
curl -X POST $BASE/inventory \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "name": "Chicken",
    "unit": "kg",
    "quantity": 15,
    "min_threshold": 3,
    "cost_per_unit": 180,
    "category": "protein",
    "supplier": "Fresh Meats Ltd."
  }'

# Tomatoes (Vegetable)
curl -X POST $BASE/inventory \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "name": "Tomatoes",
    "unit": "kg",
    "quantity": 8,
    "min_threshold": 2,
    "cost_per_unit": 40,
    "category": "vegetable",
    "supplier": "Local Market"
  }'

# Wheat Flour (Dry Good)
curl -X POST $BASE/inventory \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "name": "Wheat Flour",
    "unit": "kg",
    "quantity": 25,
    "min_threshold": 5,
    "cost_per_unit": 45,
    "category": "dry_goods",
    "supplier": "Grain Suppliers Inc."
  }'

# Butter (Dairy)
curl -X POST $BASE/inventory \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "name": "Butter",
    "unit": "kg",
    "quantity": 4,
    "min_threshold": 1,
    "cost_per_unit": 500,
    "category": "dairy",
    "supplier": "Fresh Dairy Co."
  }'

# Cooking Oil (Nearly empty — for alert test)
curl -X POST $BASE/inventory \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": "'$BRANCH_ID'",
    "name": "Cooking Oil",
    "unit": "l",
    "quantity": 1,
    "min_threshold": 3,
    "cost_per_unit": 160,
    "category": "oil",
    "supplier": "Oil Depot"
  }'
```

> Save IDs:
```bash
export INV_PANEER="<paneer inventory id>"
export INV_CHICKEN="<chicken inventory id>"
export INV_TOMATO="<tomatoes inventory id>"
export INV_FLOUR="<flour inventory id>"
export INV_OIL="<cooking oil inventory id>"
```

**Expected:** `201` for each

---

## STEP 3 — Update Inventory Item (Restock)

```bash
curl -X PATCH $BASE/inventory/$INV_PANEER \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 20,
    "min_threshold": 3,
    "cost_per_unit": 310,
    "notes": "Restocked — new supplier price"
  }'
```

**Expected:** `200`

---

## STEP 4 — Deduct Inventory (After Orders)

```bash
curl -X POST $BASE/inventory/deduct \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"inventory_id": "'$INV_PANEER'",  "quantity": 0.5},
      {"inventory_id": "'$INV_TOMATO'",  "quantity": 1.2},
      {"inventory_id": "'$INV_FLOUR'",   "quantity": 0.3}
    ],
    "reason": "Used for lunch service orders"
  }'
```

**Expected:** `200` — quantities deducted, updated stock levels returned

---

## STEP 5 — Log Waste

```bash
curl -X POST $BASE/inventory/waste-log \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": "'$INV_CHICKEN'",
    "quantity": 0.8,
    "reason": "Spoiled overnight — fridge issue",
    "logged_by": "'$MANAGER_ID'"
  }'
```

**Expected:** `201` — waste logged, inventory quantity reduced

---

## STEP 6 — Log Another Waste Entry

```bash
curl -X POST $BASE/inventory/waste-log \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": "'$INV_TOMATO'",
    "quantity": 0.5,
    "reason": "Overripe batch discarded"
  }'
```

---

## STEP 7 — Get Inventory Alerts (Low Stock)

```bash
curl $BASE/inventory/branch/$BRANCH_ID/alerts \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — `Cooking Oil` appears (quantity 1 < min_threshold 3)

---

## STEP 8 — Trigger More Alerts via Deduction

```bash
# Deplete butter below threshold
curl -X POST $BASE/inventory/deduct \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"inventory_id": "'$INV_FLOUR'", "quantity": 21}
    ],
    "reason": "Large banquet order"
  }'
```

### Check alerts again — should now include flour

```bash
curl $BASE/inventory/branch/$BRANCH_ID/alerts \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — at least 2 alerts now (oil + flour)

---

## STEP 9 — Restock Low Item (Alert Should Clear)

```bash
curl -X PATCH $BASE/inventory/$INV_OIL \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 10}'
```

### Re-check alerts

```bash
curl $BASE/inventory/branch/$BRANCH_ID/alerts \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** Oil no longer in alerts

---

## STEP 10 — Get Full Inventory List Again (Verify Numbers)

```bash
curl $BASE/inventory/branch/$BRANCH_ID \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — all items with updated quantities

---

## ❌ Negative Tests

```bash
# Deduct more than available → 400
curl -X POST $BASE/inventory/deduct \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"inventory_id":"'$INV_PANEER'","quantity":9999}],"reason":"Impossible deduction"}'

# Create inventory with negative quantity → 400
curl -X POST $BASE/inventory \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branch_id":"'$BRANCH_ID'","name":"Negative Item","unit":"kg","quantity":-5,"min_threshold":1,"cost_per_unit":100,"category":"dairy"}'

# Waiter accessing inventory → 403
curl $BASE/inventory/branch/$BRANCH_ID \
  -H "Authorization: Bearer $WAITER_TOKEN"

# Log waste for non-existent inventory → 404
curl -X POST $BASE/inventory/waste-log \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inventory_id":"00000000-0000-0000-0000-000000000000","quantity":1,"reason":"Test"}'
```
