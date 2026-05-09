# Group 01 — Restaurant & Branch Setup Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Admin + Owner
> **Purpose:** Verify the full restaurant onboarding lifecycle — register → activate → manage branches

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"

# Login as Admin first
export ADMIN_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin@platform.com","password":"Admin@Secure123"}' \
  | jq -r '.data.accessToken')
echo "Admin Token: $ADMIN_TOKEN"
```

---

## STEP 1 — Register Restaurant (Public — No Token Needed)

```bash
curl -X POST $BASE/restaurants/register \
  -H "Content-Type: application/json" \
  -d '{
    "owner": {
      "first_name": "Priya",
      "last_name": "Mehta",
      "email": "priya.mehta1@restaurant.com",
      "phone": "9876543211",
      "dob": "1990-05-15",
      "password": "Owner@1234"
    },
    "restaurant": {
      "name": "Spice Garden",
      "cuisine_types": ["Indian", "Mughlai"],
      "description": "Authentic North Indian cuisine",
      "gst_number": "27AAPFU0939F1ZV",
      "contact_email": "contact@spicegarden.com",
      "contact_phone": "9876543211"
    },
    "branch": {
      "name": "Spice Garden - Main Branch",
      "address_line1": "123, MG Road",
      "address_line2": "Near Central Mall",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "phone": "9876543211",
      "seating_capacity": 60
    }
  }'
```

> Save from response:
```bash
export RESTAURANT_ID="<restaurant.id>"
export BRANCH_ID="<branch.id>"
```

**Expected:** `201` — restaurant created with status `pending`

---

## STEP 2 — Admin Activates Restaurant

```bash
curl -X PATCH $BASE/restaurants/$RESTAURANT_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active","reason":"Documents verified"}'
```

**Expected:** `200` — status changed to `active`

---

## STEP 3 — Login as Owner

```bash
export OWNER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"priya.mehta@restaurant.com","password":"Owner@1234"}' \
  | jq -r '.data.accessToken')
echo "Owner Token: $OWNER_TOKEN"
```

---

## STEP 4 — Get All Branches (Owner)

```bash
curl $BASE/branches \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — array with at least 1 branch (created during registration)

---

## STEP 5 — Get Single Branch by ID

```bash
curl $BASE/branches/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — full branch detail

---

## STEP 6 — Update Branch Info (Owner/Manager)

```bash
curl -X PATCH $BASE/branches/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spice Garden - MG Road",
    "seating_capacity": 80,
    "operating_hours": {
      "monday":    {"closed": false, "open": "09:00", "close": "22:00"},
      "tuesday":   {"closed": false, "open": "09:00", "close": "22:00"},
      "wednesday": {"closed": false, "open": "09:00", "close": "22:00"},
      "thursday":  {"closed": false, "open": "09:00", "close": "22:00"},
      "friday":    {"closed": false, "open": "09:00", "close": "23:00"},
      "saturday":  {"closed": false, "open": "10:00", "close": "23:00"},
      "sunday":    {"closed": true}
    }
  }'
```

**Expected:** `200` — branch updated

---

## STEP 7 — Get Branch Live Stats

```bash
curl $BASE/branches/$BRANCH_ID/live-stats \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — active orders count, tables occupied, revenue today

---

## STEP 8 — Toggle Branch Status (Temporarily Close)

```bash
curl -X PATCH $BASE/branches/$BRANCH_ID/status \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"temporarily_closed","reason":"Staff shortage today"}'
```

**Expected:** `200`

### Reopen it

```bash
curl -X PATCH $BASE/branches/$BRANCH_ID/status \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

---

## STEP 9 — Create a Second Branch

```bash
curl -X POST $BASE/branches \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spice Garden - Bandra",
    "address_line1": "55, Hill Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400050",
    "phone": "9876543299",
    "seating_capacity": 40
  }'
```

**Expected:** `201` — new branch created

---

## STEP 10 — Update Restaurant Info

```bash
curl -X PATCH $BASE/restaurants/$RESTAURANT_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Award-winning North Indian & Mughlai restaurant since 2010",
    "website": "https://spicegarden.in",
    "contact_email": "hello@spicegarden.in"
  }'
```

**Expected:** `200`

---

## STEP 11 — Get Restaurant by ID (Public)

```bash
curl $BASE/restaurants/$RESTAURANT_ID
```

**Expected:** `200` — public restaurant detail (no token needed)

---

## STEP 12 — Get Nearby Restaurants (Public)

```bash
curl "$BASE/restaurants/nearby?lat=19.076&lon=72.877&radius=10"
```

**Expected:** `200` — array of nearby restaurants

---

## STEP 13 — Get Restaurant Live Status (Public)

```bash
curl $BASE/restaurants/$RESTAURANT_ID/live-status
```

**Expected:** `200` — isOpen, currentWaitTime, tableAvailability

---

## STEP 14 — Admin: Get All Restaurants

```bash
curl "$BASE/restaurants?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:** `200` — paginated list

---

## STEP 15 — Admin: Suspend a Restaurant

```bash
curl -X PATCH $BASE/restaurants/$RESTAURANT_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"suspended","reason":"Policy violation reported"}'
```

**Expected:** `200`

### Reactivate

```bash
curl -X PATCH $BASE/restaurants/$RESTAURANT_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

---

## ❌ Negative Tests

```bash
# Register with duplicate email → 409
curl -X POST $BASE/restaurants/register \
  -H "Content-Type: application/json" \
  -d '{"owner":{"first_name":"X","last_name":"Y","email":"priya.mehta@restaurant.com","phone":"9876543200","dob":"1995-01-01","password":"Test@1234"},"restaurant":{"name":"Dup","cuisine_types":["Indian"]},"branch":{"name":"Dup Branch","address_line1":"123 Road","city":"Delhi","state":"Delhi","pincode":"110001","seating_capacity":10}}'

# Invalid pincode → 400
curl -X POST $BASE/branches \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bad Branch","address_line1":"1 Road","city":"Delhi","state":"Delhi","pincode":"123","seating_capacity":10}'

# Non-owner updating restaurant → 403
curl -X PATCH $BASE/restaurants/$RESTAURANT_ID \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hack"}'
```
