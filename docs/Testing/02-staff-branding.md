# Group 02 — Staff Management & Branding Testing

> **Base:** `http://localhost:5001/api/v1`
> **Who runs this:** Owner + Manager
> **Purpose:** Create all staff roles, manage access, verify branding config

---

## Prerequisites

```bash
BASE="http://localhost:5001/api/v1"
export OWNER_TOKEN="<owner accessToken>"
export BRANCH_ID="<branch UUID>"
export RESTAURANT_ID="<restaurant UUID>"
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

## ── STAFF MANAGEMENT ──────────────────────────────────────────────

## STEP 1 — Create Manager(WORKING)

```bash
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Arjun",
    "last_name": "Nair",
    "email": "arjun.manager@spicegarden.com",
    "phone": "9876543212",
    "dob": "1988-05-15",
    "gender": "male",
    "role": "manager",
    "branch_id": "'$BRANCH_ID'"
  }'
```

> Default password = `15051988` (DDMMYYYY)
> Save: `export MANAGER_ID="<id>"`

**Expected:** `201` — staff created, `force_password_change: true`

---

## STEP 2 — Create Waiter(WORKING)

```bash
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ravi",
    "last_name": "Kumar",
    "email": "ravi.waiter@spicegarden.com",
    "phone": "9876543213",
    "dob": "1999-08-20",
    "gender": "male",
    "role": "waiter",
    "branch_id": "'$BRANCH_ID'"
  }'
```

> Default password = `20081999`
> Save: `export WAITER_ID="<id>"`

---

## STEP 3 — Create Chef(WORKING)

```bash
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Sanjay",
    "last_name": "Pillai",
    "email": "sanjay.chef@spicegarden.com",
    "phone": "9876543214",
    "dob": "1985-03-10",
    "gender": "male",
    "role": "chef",
    "branch_id": "'$BRANCH_ID'"
  }'
```

> Default password = `10031985`

---

## STEP 4 — Create Cashier(WORKING)

```bash
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Sneha",
    "last_name": "Patel",
    "email": "sneha.cashier@spicegarden.com",
    "phone": "9876543215",
    "dob": "1995-11-25",
    "gender": "female",
    "role": "cashier",
    "branch_id": "'$BRANCH_ID'"
  }'
```

> Default password = `25111995`

---

## STEP 5 — Create Host(WORKING)

```bash
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Pooja",
    "last_name": "Rao",
    "email": "pooja.host@spicegarden.com",
    "phone": "9876543216",
    "dob": "2000-07-04",
    "gender": "female",
    "role": "host",
    "branch_id": "'$BRANCH_ID'"
  }'
```

> Default password = `04072000`

---

## STEP 6 — Get All Staff for Branch(WORKING)

```bash
curl $BASE/staff/branch/$BRANCH_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — array of all staff members

---

## STEP 7 — Get Single Staff Member(WORKING)

```bash
curl $BASE/staff/$MANAGER_ID \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — full staff profile + employee_id

---

## STEP 8 — Update Staff Info(WORKING)

```bash
curl -X PATCH $BASE/staff/$MANAGER_ID \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Arjun",
    "last_name": "Kumar Nair",
    "phone": "9876543219"
  }'
```

**Expected:** `200`

---

## STEP 9 — Toggle Staff Access (Disable)(WORKING)

```bash
curl -X PATCH $BASE/staff/$WAITER_ID/toggle-access \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — `is_active: false`

### Re-enable

```bash
curl -X PATCH $BASE/staff/$WAITER_ID/toggle-access \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — `is_active: true`

---

## STEP 10 — Login as Disabled Staff (Should Fail)(WORKING)
```bash
# First disable the waiter
curl -X PATCH $BASE/staff/$WAITER_ID/toggle-access \
  -H "Authorization: Bearer $OWNER_TOKEN"

# Try login — should be rejected
curl -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"ravi.waiter@spicegarden.com","password":"20081999"}'
```

**Expected:** `403` — account disabled

---

## STEP 11 — Get Staff Performance

```bash
curl $BASE/staff/$MANAGER_ID/performance \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected:** `200` — orders served, avg rating, hours worked

---

## STEP 12 — Manager Creates Staff (Manager Token)(WORKING)

```bash
export MANAGER_TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"arjun.manager@spicegarden.com","password":"15051988"}' \
  | jq -r '.data.accessToken')

curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Amit",
    "last_name": "Singh",
    "email": "amit.waiter2@spicegarden.com",
    "phone": "9876543217",
    "dob": "2001-01-15",
    "gender": "male",
    "role": "waiter",
    "branch_id": "'$BRANCH_ID'"
  }'
```

**Expected:** `201` — manager can create staff

---

## ── BRANDING ──────────────────────────────────────────────────────

## STEP 13 — Get Branding (Public)(WORKING)

```bash
curl $BASE/restaurants/$RESTAURANT_ID/branding
```

**Expected:** `200` — branding object (colors, logo, theme etc.)

---

## STEP 14 — Update Branding (Owner Only)(WORKING)

```bash
curl -X PATCH $BASE/restaurants/$RESTAURANT_ID/branding \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "Spice Garden",
    "tagline": "Taste the Tradition",
    "primary_color": "#E85D04",
    "secondary_color": "#FAA307",
    "accent_color": "#FFBA08",
    "font_family": "Poppins",
    "theme_mode": "light"
  }'
```

**Expected:** `200` — branding updated

---

## STEP 15 — Get Presigned Upload URL for Logo (WORKING)

```bash
curl -X POST $BASE/restaurants/$RESTAURANT_ID/branding/upload-url \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_type": "logo",
    "content_type": "image/png"
  }'
```

**Expected:** `200` — `{ uploadUrl: "https://...", publicUrl: "https://..." }`

---

## STEP 16 — Get Presigned Upload URL for Banner (WORKING)

```bash
curl -X POST $BASE/restaurants/$RESTAURANT_ID/branding/upload-url \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_type": "banner",
    "content_type": "image/jpeg"
  }'
```

---

## ❌ Negative Tests

```bash
# Create staff with underage DOB → 400
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Teen","last_name":"Staff","email":"teen@test.com","phone":"9876543218","dob":"2015-01-01","gender":"male","role":"waiter","branch_id":"'$BRANCH_ID'"}'

# Create staff with invalid role → 400
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Bad","last_name":"Role","email":"bad@test.com","phone":"9876543218","dob":"1995-01-01","gender":"male","role":"admin","branch_id":"'$BRANCH_ID'"}'

# Waiter trying to create staff → 403
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"X","last_name":"Y","email":"x@test.com","phone":"9876543218","dob":"1995-01-01","gender":"male","role":"waiter","branch_id":"'$BRANCH_ID'"}'

# Invalid hex color in branding → 400
curl -X PATCH $BASE/restaurants/$RESTAURANT_ID/branding \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"primary_color":"notacolor"}'
```
