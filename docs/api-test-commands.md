# API Test Commands — Full Endpoint Coverage

> **Base URL:** `http://localhost:3000/api/v1`  
> Replace `YOUR_TOKEN` with a valid JWT from login. Replace IDs with real UUIDs from your DB.

```bash
BASE="http://localhost:5001/api/v1"
TOKEN="YOUR_TOKEN"
```

---

## Health Check (No Auth)

```bash
# Server health
curl http://localhost:3000/health

# Admin public health
curl $BASE/admin/health
```

---

## Auth — `/api/v1/auth`

```bash
# Check if email is taken
curl "$BASE/auth/check-email?email=test@example.com"

# Sign up
curl -X POST $BASE/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123!","role":"customer"}'

# Verify OTP
curl -X POST $BASE/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# Login
curl -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Refresh token
curl -X POST $BASE/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# Forgot password
curl -X POST $BASE/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Reset password
curl -X POST $BASE/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"RESET_TOKEN","password":"NewPassword123!"}'

# Logout (auth required)
curl -X POST $BASE/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Users — `/api/v1/users`

```bash
# Check email (public)
curl "$BASE/users/check-email?email=test@example.com"

# Get own profile
curl $BASE/users/me \
  -H "Authorization: Bearer $TOKEN"

# Update own profile
curl -X PATCH $BASE/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","phone":"+91999999999"}'

# Get user by ID (manager/owner/admin)
curl $BASE/users/USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Restaurants — `/api/v1/restaurants`

```bash
# Register a restaurant (public)
curl -X POST $BASE/restaurants/register \
  -H "Content-Type: application/json" \
  -d '{"name":"My Restaurant","email":"owner@rest.com","password":"Pass123!","phone":"+91999999999","address":"123 Main St","city":"Mumbai","cuisine":["Indian"]}'

# Get nearby restaurants (public)
curl "$BASE/restaurants/nearby?lat=19.076&lon=72.877&radius=5"

# Get restaurant by ID (public)
curl $BASE/restaurants/RESTAURANT_ID

# Get restaurant live status (public)
curl $BASE/restaurants/RESTAURANT_ID/live-status

# Get all restaurants (admin only)
curl $BASE/restaurants \
  -H "Authorization: Bearer $TOKEN"

# Update restaurant (owner)
curl -X PATCH $BASE/restaurants/RESTAURANT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","phone":"+91888888888"}'

# Update restaurant status (admin)
curl -X PATCH $BASE/restaurants/RESTAURANT_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

---

## Branding — `/api/v1/restaurants/:id/branding`

```bash
# Get branding (public)
curl $BASE/restaurants/RESTAURANT_ID/branding

# Update branding (owner)
curl -X PATCH $BASE/restaurants/RESTAURANT_ID/branding \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"primaryColor":"#FF5733","tagline":"Best Food Ever"}'

# Get presigned upload URL for logo/banner (owner)
curl -X POST $BASE/restaurants/RESTAURANT_ID/branding/upload-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"logo","mimeType":"image/png"}'
```

---

## Branches — `/api/v1/branches`

```bash
# Get all branches (owner/admin)
curl $BASE/branches \
  -H "Authorization: Bearer $TOKEN"

# Create branch (owner)
curl -X POST $BASE/branches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Branch","address":"456 Road","city":"Delhi","phone":"+91777777777","openTime":"09:00","closeTime":"22:00"}'

# Get branch by ID (owner/manager/admin)
curl $BASE/branches/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Update branch (owner/manager)
curl -X PATCH $BASE/branches/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Branch","phone":"+91666666666"}'

# Toggle branch status (owner)
curl -X PATCH $BASE/branches/BRANCH_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# Get branch live stats (owner/manager/admin)
curl $BASE/branches/BRANCH_ID/live-stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Tables — `/api/v1/tables`

```bash
# Get tables for branch (host/manager/owner/waiter/chef/cashier)
curl $BASE/tables/branch/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Create table (manager/owner)
curl -X POST $BASE/tables \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branchId":"BRANCH_ID","tableNumber":"T1","capacity":4,"section":"Main"}'

# Update table status (host/manager/owner/waiter)
curl -X PATCH $BASE/tables/TABLE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"occupied"}'

# Merge tables (manager/owner/host)
curl -X POST $BASE/tables/merge \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableIds":["TABLE_ID_1","TABLE_ID_2"]}'

# Delete table (manager/owner)
curl -X DELETE $BASE/tables/TABLE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Floor Layout — `/api/v1/floor-layout`

```bash
# Get current layout (manager/owner)
curl $BASE/floor-layout/branch/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Save draft layout (manager/owner)
curl -X POST $BASE/floor-layout/branch/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"layout":{"tables":[{"id":"TABLE_ID","x":100,"y":200}]}}'

# Publish layout (manager/owner)
curl -X POST $BASE/floor-layout/branch/BRANCH_ID/publish \
  -H "Authorization: Bearer $TOKEN"

# Get live layout with table statuses (any authenticated staff)
curl $BASE/floor-layout/branch/BRANCH_ID/live \
  -H "Authorization: Bearer $TOKEN"
```

---

## Staff — `/api/v1/staff`

```bash
# Get staff for branch (manager/owner/admin)
curl $BASE/staff/branch/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Create staff member (manager/owner)
curl -X POST $BASE/staff/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@rest.com","role":"waiter","branchId":"BRANCH_ID","phone":"+91555555555"}'

# Get staff by ID (manager/owner/admin)
curl $BASE/staff/STAFF_ID \
  -H "Authorization: Bearer $TOKEN"

# Update staff (manager/owner)
curl -X PATCH $BASE/staff/STAFF_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","phone":"+91444444444"}'

# Toggle staff access (manager/owner)
curl -X PATCH $BASE/staff/STAFF_ID/toggle-access \
  -H "Authorization: Bearer $TOKEN"

# Get staff performance (manager/owner/admin)
curl $BASE/staff/STAFF_ID/performance \
  -H "Authorization: Bearer $TOKEN"
```

---

## Menu — `/api/v1/menu`

```bash
# Get public menu for branch (public)
curl $BASE/menu/branch/BRANCH_ID

# Get single item (public)
curl $BASE/menu/items/ITEM_ID

# Get categories (manager/owner)
curl $BASE/menu/branch/BRANCH_ID/categories \
  -H "Authorization: Bearer $TOKEN"

# Create category (manager/owner)
curl -X POST $BASE/menu/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Starters","branchId":"BRANCH_ID","sortOrder":1}'

# Reorder categories (manager/owner)
curl -X PATCH $BASE/menu/categories/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categories":[{"id":"CAT_ID_1","sortOrder":1},{"id":"CAT_ID_2","sortOrder":2}]}'

# Update category (manager/owner)
curl -X PATCH $BASE/menu/categories/CAT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Appetizers"}'

# Delete category (manager/owner)
curl -X DELETE $BASE/menu/categories/CAT_ID \
  -H "Authorization: Bearer $TOKEN"

# Create menu item (manager/owner)
curl -X POST $BASE/menu/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Paneer Tikka","categoryId":"CAT_ID","price":299,"description":"Grilled paneer","isVeg":true}'

# Bulk price update (manager/owner)
curl -X PATCH $BASE/menu/items/bulk-price-update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"ITEM_ID","price":349}]}'

# Update item status (manager/owner)
curl -X PATCH $BASE/menu/items/ITEM_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isAvailable":false}'

# Update item (manager/owner)
curl -X PATCH $BASE/menu/items/ITEM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Paneer Tikka Special","price":349}'

# Delete item (manager/owner)
curl -X DELETE $BASE/menu/items/ITEM_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Orders — `/api/v1/orders`

```bash
# Create order (waiter/customer/manager/owner/cashier)
curl -X POST $BASE/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branchId":"BRANCH_ID","tableId":"TABLE_ID","items":[{"menuItemId":"ITEM_ID","quantity":2}],"type":"dine_in"}'

# Get order by ID (any authenticated)
curl $BASE/orders/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# Get orders by table (waiter/cashier/manager/owner)
curl $BASE/orders/table/TABLE_ID \
  -H "Authorization: Bearer $TOKEN"

# Get active branch orders (manager/owner/cashier)
curl $BASE/orders/branch/BRANCH_ID/active \
  -H "Authorization: Bearer $TOKEN"

# Cancel order (manager/owner)
curl -X PATCH $BASE/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Customer request"}'
```

---

## Order Items — `/api/v1/order-items`

```bash
# Get items for an order (waiter/cashier/manager/owner)
curl $BASE/order-items/order/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# Mark item as served (waiter/manager/owner)
curl -X PATCH $BASE/order-items/ITEM_ID/serve \
  -H "Authorization: Bearer $TOKEN"

# Update item status (chef/manager/owner/waiter)
curl -X PATCH $BASE/order-items/ITEM_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready"}'
```

---

## Kitchen — `/api/v1/kitchen`

```bash
# Get active KDS tickets (chef/manager/owner)
curl $BASE/kitchen/branch/BRANCH_ID/tickets \
  -H "Authorization: Bearer $TOKEN"

# Update order status (chef only: confirmed→preparing→ready)
curl -X PATCH $BASE/kitchen/orders/ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'

# Get overdue orders (chef/manager/owner)
curl $BASE/kitchen/branch/BRANCH_ID/overdue \
  -H "Authorization: Bearer $TOKEN"
```

---

## Payments — `/api/v1/payments`

```bash
# Gateway webhook (public — called by payment gateway)
curl -X POST $BASE/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.success","orderId":"ORDER_ID","amount":299}'

# Initiate payment (cashier/customer/manager/owner)
curl -X POST $BASE/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID","method":"upi","amount":299}'

# Verify payment (cashier/manager/owner)
curl -X POST $BASE/payments/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"PAY_ID","orderId":"ORDER_ID"}'

# Generate UPI QR (cashier/customer/manager/owner)
curl -X POST $BASE/payments/upi/generate-qr \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID","amount":299}'

# Poll UPI payment status (cashier/customer/manager/owner)
curl "$BASE/payments/upi/status/UPI_REF_ID" \
  -H "Authorization: Bearer $TOKEN"

# Split bill (cashier/manager/owner)
curl -X POST $BASE/payments/split \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID","splits":[{"amount":150,"method":"upi"},{"amount":149,"method":"cash"}]}'

# Get receipt (customer/cashier/manager/owner/waiter)
curl $BASE/payments/receipt/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Bookings — `/api/v1/bookings`

```bash
# Create booking (customer)
curl -X POST $BASE/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branchId":"BRANCH_ID","date":"2026-05-10","time":"19:00","partySize":4,"notes":"Window seat please"}'

# Get my bookings (customer)
curl $BASE/bookings/user/me \
  -H "Authorization: Bearer $TOKEN"

# Get branch bookings today (host/manager/owner)
curl $BASE/bookings/branch/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Get booking by ID (any authenticated)
curl $BASE/bookings/BOOKING_ID \
  -H "Authorization: Bearer $TOKEN"

# Cancel booking (customer/manager)
curl -X PATCH $BASE/bookings/BOOKING_ID/cancel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Change of plans"}'

# Mark arrived (host/customer)
curl -X PATCH $BASE/bookings/BOOKING_ID/arrived \
  -H "Authorization: Bearer $TOKEN"

# Mark seated (host/manager)
curl -X PATCH $BASE/bookings/BOOKING_ID/seat \
  -H "Authorization: Bearer $TOKEN"

# Mark no-show (host/manager)
curl -X PATCH $BASE/bookings/BOOKING_ID/no-show \
  -H "Authorization: Bearer $TOKEN"
```

---

## Queue — `/api/v1/queue`

```bash
# Join queue (public — no auth required)
curl -X POST $BASE/queue/join \
  -H "Content-Type: application/json" \
  -d '{"branchId":"BRANCH_ID","partySize":3,"name":"Raj","phone":"+91999000000"}'

# Get branch queue (host/manager/owner)
curl $BASE/queue/branch/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Get queue position (authenticated)
curl $BASE/queue/position/QUEUE_ID \
  -H "Authorization: Bearer $TOKEN"

# Mark arrived (host/manager/owner/waiter/customer)
curl -X PATCH $BASE/queue/QUEUE_ID/arrive \
  -H "Authorization: Bearer $TOKEN"

# Assign table (host/manager/owner)
curl -X PATCH $BASE/queue/QUEUE_ID/assign-table \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"TABLE_ID"}'

# Mark no-show (host/manager/owner)
curl -X PATCH $BASE/queue/QUEUE_ID/no-show \
  -H "Authorization: Bearer $TOKEN"

# Remove from queue (host/manager/owner)
curl -X DELETE $BASE/queue/QUEUE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Delivery — `/api/v1/delivery`

```bash
# Assign delivery partner to order (manager/owner)
curl -X POST $BASE/delivery/orders/ORDER_ID/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"partnerId":"PARTNER_USER_ID"}'

# Get partner's active delivery (delivery_partner)
curl $BASE/delivery/partner/active \
  -H "Authorization: Bearer $TOKEN"

# Get partner earnings (delivery_partner)
curl $BASE/delivery/partner/earnings \
  -H "Authorization: Bearer $TOKEN"

# Update GPS location (delivery_partner)
curl -X POST $BASE/delivery/location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":19.076,"lon":72.877,"delivery_id":"DELIVERY_ID"}'

# Get delivery by ID (delivery_partner/manager/owner)
curl $BASE/delivery/DELIVERY_ID \
  -H "Authorization: Bearer $TOKEN"

# Update delivery status (delivery_partner)
curl -X PATCH $BASE/delivery/DELIVERY_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"picked_up"}'
```

---

## Inventory — `/api/v1/inventory`

```bash
# Get inventory for branch (manager/owner)
curl $BASE/inventory/branch/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Update inventory item (manager/owner)
curl -X PATCH $BASE/inventory/INVENTORY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":50,"unit":"kg","minThreshold":5}'

# Deduct inventory (internal/system)
curl -X POST $BASE/inventory/deduct \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"inventoryId":"INV_ID","quantity":2}]}'

# Log waste (manager/staff)
curl -X POST $BASE/inventory/waste-log \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inventoryId":"INV_ID","quantity":1,"reason":"Expired"}'

# Get inventory alerts (manager/owner)
curl $BASE/inventory/branch/BRANCH_ID/alerts \
  -H "Authorization: Bearer $TOKEN"
```

---

## Loyalty — `/api/v1/loyalty`

```bash
# Get loyalty balance (authenticated user)
curl $BASE/loyalty/balance \
  -H "Authorization: Bearer $TOKEN"

# Earn points
curl -X POST $BASE/loyalty/earn \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID"}'

# Redeem points
curl -X POST $BASE/loyalty/redeem \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"points":100,"orderId":"ORDER_ID"}'

# Get points history (authenticated user)
curl $BASE/loyalty/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## Reviews — `/api/v1/reviews`

```bash
# Create review (customer, after order)
curl -X POST $BASE/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID","rating":5,"comment":"Excellent food!","restaurantId":"RESTAURANT_ID"}'

# Get reviews for restaurant (public)
curl "$BASE/reviews/restaurant/RESTAURANT_ID?page=1&limit=10"

# Get reviews for branch (public)
curl "$BASE/reviews/branch/BRANCH_ID?page=1&limit=10"

# Check if order already reviewed (authenticated)
curl $BASE/reviews/order/ORDER_ID \
  -H "Authorization: Bearer $TOKEN"

# Delete review (admin only)
curl -X DELETE $BASE/reviews/REVIEW_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notifications — `/api/v1/notifications`

```bash
# Get notifications (authenticated)
curl $BASE/notifications \
  -H "Authorization: Bearer $TOKEN"

# Mark all read (authenticated)
curl -X PATCH $BASE/notifications/read-all \
  -H "Authorization: Bearer $TOKEN"

# Mark one as read (authenticated)
curl -X PATCH $BASE/notifications/NOTIF_ID/read \
  -H "Authorization: Bearer $TOKEN"

# Register device for push notifications (authenticated)
curl -X POST $BASE/notifications/register-device \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"FCM_DEVICE_TOKEN","platform":"android"}'

# Remove device token (authenticated)
curl -X DELETE $BASE/notifications/device/FCM_DEVICE_TOKEN \
  -H "Authorization: Bearer $TOKEN"
```

---

## Support — `/api/v1/support`

```bash
# Create support ticket (authenticated)
curl -X POST $BASE/support/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Order not received","description":"My order #1234 never arrived","category":"order"}'

# Get tickets (customer sees own; admin sees all)
curl $BASE/support/tickets \
  -H "Authorization: Bearer $TOKEN"

# Get ticket by ID (customer or support agent)
curl $BASE/support/tickets/TICKET_ID \
  -H "Authorization: Bearer $TOKEN"

# Update ticket status (support/admin only)
curl -X PATCH $BASE/support/tickets/TICKET_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved"}'

# Post message to ticket (customer or agent)
curl -X POST $BASE/support/tickets/TICKET_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Please check your delivery address."}'

# Get messages for ticket (customer or agent)
curl $BASE/support/tickets/TICKET_ID/messages \
  -H "Authorization: Bearer $TOKEN"
```

---

## Geo — `/api/v1/geo`

```bash
# Check if customer has arrived at restaurant (customer)
curl -X POST $BASE/geo/arrival-check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":19.076,"lon":72.877,"bookingId":"BOOKING_ID"}'
```

---

## Analytics — `/api/v1/analytics` (owner/manager)

```bash
# Menu suggestions
curl $BASE/analytics/menu-suggestions/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Demand forecast
curl $BASE/analytics/demand-forecast/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Bundle opportunities
curl $BASE/analytics/bundle-opportunities/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"

# Staffing recommendation
curl $BASE/analytics/staffing-recommendation/BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Reports — `/api/v1/reports` (owner/manager)

```bash
# Sales report
curl "$BASE/reports/sales?branchId=BRANCH_ID&from=2026-05-01&to=2026-05-04" \
  -H "Authorization: Bearer $TOKEN"

# Menu performance
curl "$BASE/reports/menu-performance?branchId=BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN"

# Kitchen performance
curl "$BASE/reports/kitchen-performance?branchId=BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN"

# Customer insights (owner only)
curl "$BASE/reports/customer-insights?branchId=BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN"

# Admin platform report (admin only)
curl $BASE/reports/admin/platform \
  -H "Authorization: Bearer $TOKEN"

# Admin trends (admin only)
curl $BASE/reports/admin/trends \
  -H "Authorization: Bearer $TOKEN"

# Export report (owner/admin)
curl -X POST $BASE/reports/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"sales","branchId":"BRANCH_ID","from":"2026-05-01","to":"2026-05-04","format":"csv"}'
```

---

## Admin — `/api/v1/admin` (admin role required, except `/health`)

```bash
# Public admin health
curl $BASE/admin/health

# Dashboard (admin)
curl $BASE/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Platform stats (admin)
curl $BASE/admin/platform-stats \
  -H "Authorization: Bearer $TOKEN"

# Detailed health (admin)
curl $BASE/admin/health/detailed \
  -H "Authorization: Bearer $TOKEN"

# List all restaurants (admin)
curl $BASE/admin/restaurants \
  -H "Authorization: Bearer $TOKEN"

# Update restaurant status (admin)
curl -X PATCH $BASE/admin/restaurants/RESTAURANT_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"suspended"}'

# List all customers (admin)
curl $BASE/admin/customers \
  -H "Authorization: Bearer $TOKEN"

# Update customer status (admin)
curl -X PATCH $BASE/admin/customers/USER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"banned"}'

# Get feedback/reviews (admin)
curl $BASE/admin/feedback \
  -H "Authorization: Bearer $TOKEN"
```

---

## Quick Login Helper

Save a token quickly:
```bash
export TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}' \
  | jq -r '.data.accessToken')
echo "Token: $TOKEN"
```

> Requires `jq` installed. Install with: `sudo apt install jq` or `brew install jq`

---

## Backend Fix Prompt

Use the curl commands in this file to verify backend routes end to end. The backend currently needs fixes in route validation, database column mapping, tenant/auth middleware, and response formatting so the API can accept curl requests and persist data correctly.

### Detailed bug-fix prompt by module

- Auth (`/api/v1/auth`)
  - Fix email normalization and support lookup by `emailOrUsername`.
  - Ensure optional phone is handled consistently in signup and profile flows.
  - Correct refresh token payload and logout behavior.
  - Verify OTP and password reset flow works with redis-backed tokens.

- Users (`/api/v1/users`)
  - Ensure `restaurantId` is injected from tenant middleware for protected user calls.
  - Normalize email before checking or updating user records.
  - Return consistent error responses for missing or unauthorized access.

- Restaurants (`/api/v1/restaurants`) and Branding
  - Match request schema to actual DB columns such as `cuisine_type`, `gst_number`, `status`, and branding fields.
  - Fix branding update and upload URL handling so logo/banner changes persist correctly.
  - Verify nearby search, live status, and public restaurant fetch endpoints work with the correct columns.

- Branches (`/api/v1/branches`)
  - Use branch columns `address`, `lat`, `lon`, `is_active` instead of text-only or nonexistent columns.
  - Ensure branch create/update builds address correctly and geocodes when needed.
  - Fix live stats to compute revenue from `order_items`, not a nonexistent `orders.total_amount`.
  - Prevent closing a branch when active orders exist.

- Menu (`/api/v1/menu` and related routes)
  - Preserve public route ordering before protected middleware.
  - Fix dynamic route collisions such as `categories/reorder` and `items/bulk-price-update` versus `/:id` routes.
  - Validate branch/category ownership and handle sold-out items consistently.
  - Ensure item delete removes addons and does not break FK constraints.

- Orders (`/api/v1/orders`)
  - Insert only real `orders` columns and compute totals using order items.
  - Fix cancel flow to update order status only, rather than using nonexistent columns.
  - Enforce branch/restaurant scoping for active, table, and branch order lists.

- Order Items (`/api/v1/order-items`)
  - Correct realtime broadcast usage so updates do not fail silently.
  - Derive branch scope from the joined order record rather than assuming direct branch fields.
  - Ensure item status updates and service completion are authorized and scoped.

- Kitchen (`/api/v1/kitchen`)
  - Validate branchId and orderId before DB operations.
  - Improve error handling so broadcast failures do not crash the request.
  - Ensure kitchen ticket fetch and status updates work for the authenticated branch.

- Payments (`/api/v1/payments`)
  - Fix payment DB mapping; use the actual payment column names and compute order totals from `order_items`.
  - Confirm UPI flow, payment verification, split payments, and receipt generation use valid relations.
  - Implement webhook signature verification and handle missing or invalid webhook payloads gracefully.

- Bookings (`/api/v1/bookings`)
  - Fix cancel logic to update booking status only and validate required booking fields.
  - Ensure booking creation, arrival, seating, and no-show handling respect restaurant and branch scoping.

- Queue (`/api/v1/queue`)
  - Use `queue_entries` table semantics instead of any incorrect `queue` table references.
  - Implement soft-delete / removed status for queue entries, and prevent invalid operations on removed/no-show entries.
  - Validate people count and branch queue assignment properly.

- Delivery (`/api/v1/delivery`)
  - Fix branch coordinate lookup using `lat` / `lon` and table label mapping.
  - Ensure delivery agent assignment, active delivery list, earnings, location updates, and status transitions are valid.

- Inventory (`/api/v1/inventory`)
  - Align inventory endpoints with actual DB names like `inventory_items`, `last_updated`, and `inventory_waste_logs`.
  - Remove invalid RPC filters and ensure inventory updates/deductions persist correctly.

- Reviews (`/api/v1/reviews`)
  - Fix review branch filtering by joining orders, since reviews do not have a direct `branch_id` column.
  - Ensure review creation and list endpoints respect restaurant/branch permissions.

- Reports (`/api/v1/reports`)
  - Fix request schema shape for report filters and tenant auth values.
  - Ensure branch_id requirements are handled correctly for kitchen and menu performance reports.
  - Make CSV export endpoints handle empty result sets gracefully.

### Use this prompt with Claude

```text
Inspect the DineLuxe backend and fix the remaining route and database bugs so the documented curl commands work end to end.

For each module listed above, update the service, controller, schema, and route code so:
- request validation matches the documented curl payloads,
- database column names and relations match the actual schema,
- tenant and branch scoping use authenticated `restaurantId`/`branchId`,
- public menu routes stay public, and protected routes remain secure,
- status transitions and cancellations only update supported fields,
- realtime broadcasts and webhook handling do not crash the API.

After fixing, use the curl examples in this file to verify every endpoint and confirm that data is correctly written to and read from the database.
```
