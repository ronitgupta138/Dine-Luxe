# Create All Account Types — Step-by-Step Commands

> **Base URL:** `http://localhost:5001/api/v1`  
> All accounts are real, fully working curl commands based on your actual schemas.

---

## Account Types in Your System

| Role | How Created | Auth Required |
|------|------------|---------------|
| `customer` | Self-signup via OTP | No |
| `owner` | Restaurant registration | No |
| `manager` | By owner via Staff API | Owner token |
| `host` | By owner/manager via Staff API | Owner/Manager token |
| `waiter` | By owner/manager via Staff API | Owner/Manager token |
| `chef` | By owner/manager via Staff API | Owner/Manager token |
| `cashier` | By owner/manager via Staff API | Owner/Manager token |
| `admin` | Manually in DB (no public API) | — |

---

## 1. CUSTOMER Account (Self-Signup — 2 Steps)

### Step 1 — Register (triggers OTP to email)
```bash
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Rahul",
    "lastName": "Sharma",
    "email": "rahul.sharma@gmail.com",
    "phone": "+919876543210",
    "password": "Customer@123"
  }'
```

> Check your server logs for: `[DEV] OTP for rahul.sharma@gmail.com: 123456`

### Step 2 — Verify OTP (creates account + returns tokens)
```bash
curl -X POST http://localhost:5001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul.sharma@gmail.com",
    "otp": "123456"
  }'
```

**Response contains:** `accessToken` + `refreshToken`  
**Role assigned automatically:** `customer`

---

## 2. OWNER Account (via Restaurant Registration)

> This creates: 1 Owner account + 1 Restaurant + 1 Branch in one call.

```bash
curl -X POST http://localhost:5001/api/v1/restaurants/register \
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

**Response contains:** `restaurant.id` and `branch.id` — **save these, you need them for staff creation.**

> **Note:** Restaurant status starts as `pending`. An admin must activate it to `active` before it appears publicly.

### Then login as Owner
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "priya.mehta1@restaurant.com",
    "password": "Owner@1234"
  }'
```

Save the token:
```bash
export OWNER_TOKEN="<accessToken from response>"
export BRANCH_ID="<branch.id from register response>"
```

---

## 3. MANAGER Account (Created by Owner)

> **Requires:** Owner or Admin token + a valid `branch_id`  
> **Default password** = DOB in `DDMMYYYY` format → `15051988`  
> Staff must change it on first login (`force_password_change: true`)

```bash
curl -X POST http://localhost:5001/api/v1/staff/create \
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

**Response contains:** `temp_password` (= `15051988`) and `employee_id` (auto-generated like `EMP-SPG-001`)

### Login as Manager
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "arjun.manager@spicegarden.com",
    "password": "15051988"
  }'
```

```bash
export MANAGER_TOKEN="<accessToken from response>"
```

---

## 4. WAITER Account (Created by Owner or Manager)

```bash
curl -X POST http://localhost:5001/api/v1/staff/create \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ravi",
    "last_name": "Kumar",
    "email": "ravi.waiter1@spicegarden.com",
    "phone": "9876543213",
    "dob": "1999-08-20",
    "gender": "male",
    "role": "waiter",
    "branch_id": "'$BRANCH_ID'"
  }'
```

**Default password:** `20081999`

### Login as Waiter
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "ravi.waiter1@spicegarden.com",
    "password": "20081999"
  }'
```

---

## 5. CHEF Account (Created by Owner or Manager)

```bash
curl -X POST http://localhost:5001/api/v1/staff/create \
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

**Default password:** `10031985`

### Login as Chef
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "sanjay.chef@spicegarden.com",
    "password": "10031985"
  }'
```

---

## 6. CASHIER Account (Created by Owner or Manager)

```bash
curl -X POST http://localhost:5001/api/v1/staff/create \
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

**Default password:** `25111995`

### Login as Cashier
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "sneha.cashier@spicegarden.com",
    "password": "25111995"
  }'
```

---

## 7. HOST Account (Created by Owner or Manager)

```bash
curl -X POST http://localhost:5001/api/v1/staff/create \
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

**Default password:** `04072000`

### Login as Host
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "pooja.host@spicegarden.com",
    "password": "04072000"
  }'
```

---

## 8. ADMIN Account

> Super admin can now create admin accounts through the backend API.

### Create an admin account as super admin
```bash
curl -X POST http://localhost:5001/api/v1/admin/create-admin \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@platform.com",
    "password": "Admin@Secure123",
    "first_name": "Super",
    "last_name": "Admin",
    "phone": "9876543210"
  }'
```

**Response contains:** `id`, `email`, `name`, and `role`.

### Login as Admin
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "admin@platform.com",
    "password": "Admin@Secure123"
  }'
```

---

## Quick Reference — All Default Passwords

| Role | Account | Default Password |
|------|---------|-----------------|
| customer | rahul.sharma@gmail.com | `Customer@123` |
| owner | priya.mehta@restaurant.com | `Owner@1234` |
| manager | arjun.manager@spicegarden.com | `15051988` (DOB) |
| waiter | ravi.waiter@spicegarden.com | `20081999` (DOB) |
| chef | sanjay.chef@spicegarden.com | `10031985` (DOB) |
| cashier | sneha.cashier@spicegarden.com | `25111995` (DOB) |
| host | pooja.host@spicegarden.com | `04072000` (DOB) |
| admin | admin@platform.com | `Admin@Secure123` |

> Staff (manager/waiter/chef/cashier/host) **must change their password on first login** — `force_password_change: true` is set automatically by the system.

---

## Password Rules (from your auth schema)

- Minimum **8 characters**
- At least one **uppercase letter** (A-Z)
- At least one **number** (0-9)
- At least one **special character** (!@#$%^&* etc.)

---

## Phone Number Format

- **Signup (customer):** E.164 format → `+919876543210`
- **Staff creation & restaurant register:** Indian 10-digit → `9876543210` (no country code, must start with 6–9)
