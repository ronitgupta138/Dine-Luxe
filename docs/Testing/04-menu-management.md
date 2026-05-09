# Group 04 — Menu Management Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Owner + Manager (write), Public (read)
> **Purpose:** Create categories, items, addons, bulk updates, availability windows

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export OWNER_TOKEN="<owner accessToken>"
export MANAGER_TOKEN="<manager accessToken>"
export BRANCH_ID="<branch UUID>"
```

---

## ── CATEGORIES ────────────────────────────────────────────────────

## STEP 1 — Create Categories

```bash
# Starters
curl -X POST $BASE/menu/categories \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Starters",
    "description": "Crispy and delicious starters",
    "display_order": 1,
    "is_active": true
  }'

# Main Course
curl -X POST $BASE/menu/categories \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Course",
    "description": "Rich and flavourful mains",
    "display_order": 2,
    "is_active": true
  }'

# Breads
curl -X POST $BASE/menu/categories \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Breads",
    "description": "Fresh from the tandoor",
    "display_order": 3,
    "is_active": true
  }'

# Desserts
curl -X POST $BASE/menu/categories \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desserts",
    "display_order": 4,
    "is_active": true
  }'

# Beverages
curl -X POST $BASE/menu/categories \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beverages",
    "display_order": 5,
    "is_active": true
  }'
```

> Save IDs:
```bash
export CAT_STARTERS="<starters id>"
export CAT_MAINS="<main course id>"
export CAT_BREADS="<breads id>"
export CAT_DESSERTS="<desserts id>"
export CAT_BEVERAGES="<beverages id>"
```

**Expected:** `201` for each

---

## STEP 2 — Get All Categories (Manager View)

```bash
curl $BASE/menu/branch/$BRANCH_ID/categories \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected:** `200` — array of 5 categories

---

## STEP 3 — Update a Category

```bash
curl -X PATCH $BASE/menu/categories/$CAT_STARTERS \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Appetizers & Starters",
    "description": "Perfect starters to kick off your meal"
  }'
```

**Expected:** `200`

---

## STEP 4 — Reorder Categories

```bash
curl -X PATCH $BASE/menu/categories/reorder \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ordered_ids": [
      "'$CAT_BEVERAGES'",
      "'$CAT_STARTERS'",
      "'$CAT_MAINS'",
      "'$CAT_BREADS'",
      "'$CAT_DESSERTS'"
    ]
  }'
```

**Expected:** `200` — categories reordered

---

## ── MENU ITEMS ────────────────────────────────────────────────────

## STEP 5 — Create Menu Items

```bash
# Paneer Tikka (Starter, Veg)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'$CAT_STARTERS'",
    "name": "Paneer Tikka",
    "description": "Char-grilled cottage cheese with spices",
    "price": 299,
    "compare_price": 349,
    "is_veg": true,
    "is_vegan": false,
    "contains_alcohol": false,
    "allergens": ["dairy"],
    "calories": 320,
    "display_order": 1,
    "status": "available",
    "addons": [
      {"name": "Extra Chutney", "price": 30, "is_required": false, "max_quantity": 2},
      {"name": "Extra Onions",  "price": 20, "is_required": false, "max_quantity": 1}
    ]
  }'

# Chicken Tikka (Starter, Non-Veg)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'$CAT_STARTERS'",
    "name": "Chicken Tikka",
    "description": "Tender chicken marinated in yogurt and spices",
    "price": 349,
    "is_veg": false,
    "is_vegan": false,
    "contains_alcohol": false,
    "allergens": [],
    "calories": 420,
    "display_order": 2,
    "status": "available"
  }'

# Dal Makhani (Main, Veg)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'$CAT_MAINS'",
    "name": "Dal Makhani",
    "description": "Slow-cooked black lentils in buttery tomato gravy",
    "price": 249,
    "is_veg": true,
    "is_vegan": false,
    "calories": 380,
    "display_order": 1,
    "status": "available"
  }'

# Butter Chicken (Main, Non-Veg)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'$CAT_MAINS'",
    "name": "Butter Chicken",
    "description": "Classic creamy tomato-based chicken curry",
    "price": 379,
    "compare_price": 420,
    "is_veg": false,
    "calories": 520,
    "display_order": 2,
    "status": "available",
    "addons": [
      {"name": "Extra Gravy", "price": 50, "is_required": false, "max_quantity": 1}
    ]
  }'

# Garlic Naan (Bread, Veg)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'$CAT_BREADS'",
    "name": "Garlic Naan",
    "description": "Soft leavened bread with garlic butter",
    "price": 60,
    "is_veg": true,
    "calories": 180,
    "display_order": 1,
    "status": "available"
  }'

# Gulab Jamun (Dessert, Veg — limited hours)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'$CAT_DESSERTS'",
    "name": "Gulab Jamun",
    "description": "Soft milk dumplings soaked in rose sugar syrup",
    "price": 149,
    "is_veg": true,
    "calories": 280,
    "display_order": 1,
    "status": "available",
    "availability_windows": [
      {
        "days": ["mon","tue","wed","thu","fri","sat","sun"],
        "start_time": "12:00",
        "end_time": "22:00"
      }
    ]
  }'

# Mango Lassi (Beverage, Veg)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "'$CAT_BEVERAGES'",
    "name": "Mango Lassi",
    "description": "Chilled sweet mango yogurt drink",
    "price": 119,
    "is_veg": true,
    "is_vegan": false,
    "allergens": ["dairy"],
    "calories": 210,
    "display_order": 1,
    "status": "available"
  }'
```

> Save key IDs:
```bash
export ITEM_PANEER_TIKKA="<paneer tikka id>"
export ITEM_BUTTER_CHICKEN="<butter chicken id>"
export ITEM_DAL_MAKHANI="<dal makhani id>"
export ITEM_GARLIC_NAAN="<garlic naan id>"
```

**Expected:** `201` for each

---

## STEP 6 — Get Public Menu for Branch (No Auth)

```bash
curl $BASE/menu/branch/$BRANCH_ID
```

**Expected:** `200` — full menu grouped by category, only `available` items shown

---

## STEP 7 — Get Single Item (Public)

```bash
curl $BASE/menu/items/$ITEM_PANEER_TIKKA
```

**Expected:** `200` — item with addons array

---

## STEP 8 — Update a Menu Item

```bash
curl -X PATCH $BASE/menu/items/$ITEM_PANEER_TIKKA \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 319,
    "description": "Char-grilled cottage cheese marinated overnight in spices",
    "calories": 330
  }'
```

**Expected:** `200`

---

## STEP 9 — Mark Item as Sold Out

```bash
curl -X PATCH $BASE/menu/items/$ITEM_DAL_MAKHANI/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"sold_out"}'
```

**Expected:** `200`

### Verify it doesn't show in public menu

```bash
curl $BASE/menu/branch/$BRANCH_ID | jq '.data.categories[].items[] | select(.name=="Dal Makhani")'
```

**Expected:** `sold_out` status visible or item hidden (depends on your service logic)

---

## STEP 10 — Mark Item as Hidden

```bash
curl -X PATCH $BASE/menu/items/$ITEM_BUTTER_CHICKEN/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"hidden"}'
```

**Expected:** `200` — item hidden from public menu

### Restore to available

```bash
curl -X PATCH $BASE/menu/items/$ITEM_BUTTER_CHICKEN/status \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"available"}'
```

---

## STEP 11 — Bulk Price Update (Percentage Increase)

```bash
curl -X PATCH $BASE/menu/items/bulk-price-update \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_ids": [
      "'$ITEM_PANEER_TIKKA'",
      "'$ITEM_BUTTER_CHICKEN'",
      "'$ITEM_DAL_MAKHANI'"
    ],
    "adjustment_type": "percent",
    "value": 10
  }'
```

**Expected:** `200` — all 3 prices increased by 10%

---

## STEP 12 — Bulk Price Update (Fixed Decrease)

```bash
curl -X PATCH $BASE/menu/items/bulk-price-update \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_ids": ["'$ITEM_PANEER_TIKKA'","'$ITEM_BUTTER_CHICKEN'"],
    "adjustment_type": "fixed",
    "value": -20
  }'
```

**Expected:** `200` — prices decreased by ₹20

---

## STEP 13 — Delete a Category (with no items)

```bash
# First delete items from the category or use an empty category
curl -X DELETE $BASE/menu/categories/$CAT_DESSERTS \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — category deleted

---

## STEP 14 — Delete a Menu Item

```bash
curl -X DELETE $BASE/menu/items/$ITEM_GARLIC_NAAN \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — item deleted

---

## ❌ Negative Tests

```bash
# Create item with negative price → 400
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category_id":"'$CAT_STARTERS'","name":"Bad Item","price":-10,"is_veg":true}'

# Reorder with invalid UUID → 400
curl -X PATCH $BASE/menu/categories/reorder \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ordered_ids":["not-a-uuid"]}'

# Waiter updating item → 403
curl -X PATCH $BASE/menu/items/$ITEM_PANEER_TIKKA \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":100}'

# Get non-existent item → 404
curl $BASE/menu/items/00000000-0000-0000-0000-000000000000

# Public menu for non-existent branch → 404
curl $BASE/menu/branch/00000000-0000-0000-0000-000000000000
```
