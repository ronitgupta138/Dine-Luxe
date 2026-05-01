🍽️

# RESTAURANT OS

## COMPLETE PROMPT LIBRARY

### Every Frontend, Backend, Database, WebSocket, AI & UI/UX Prompt

🎨 Frontend   ⚙️ Backend   🗄️ Database   ⚡ WebSocket   🤖 AI / ML   🔒 Security
Priyanshu Kumar Gupta  &  Ronit Gupta
Version 1.0  —  2025  —  Confidential

## 📖 HOW TO USE THIS DOCUMENT

Read this before giving any prompt to your developer or AI tool

- 🎨 FRONTEND - Give to your React Native / UI developer or to an AI tool like v0.dev, Cursor, or ChatGPT when building screens and components.
- ⚙️ BACKEND - Give to your Node.js / API developer or AI tools when building server logic, REST APIs, and business rules.
- 🗄️ DATABASE - Give to your database architect when designing tables, indexes, and query optimization.
- ⚡ WEBSOCKET - Give to your real-time engineer when building Socket.io events, rooms, and live sync logic.
- 🤖 AI / ML - Give to your data scientist or AI integration developer for recommendation engines and smart features.
- 🔒 SECURITY - Give to any developer — these are non-negotiable security rules that apply to every module.

## 📋 TABLE OF CONTENTS

All modules and prompt counts

## 🔑 M1 — AUTHENTICATION & ONBOARDING

Login, Signup, OTP, Staff Onboarding, Restaurant Registration

#### 1.1 Customer Welcome / Splash Screen

### 🎨 FRONTEND PROMPT: Customer Welcome Splash Screen

Tags: #SplashScreen #Lottie #Animation #React Native
Build the app welcome/splash screen for Restaurant OS customer app.
Requirements:

- Use Lottie animation (food-themed: 2 people dining, steam from food)
- Duration: 2.5 seconds, then auto-navigate to Login
- Show restaurant logo + app name fading in after 0.8s
- If user already has a valid JWT token in AsyncStorage, skip login and navigate directly to Home (silent login)
- Add skip button that appears after 1 second
- Support white-label: dynamically load restaurant logo from AsyncStorage key 'restaurant_branding' if entering via deep link

Tech: React Native + Lottie + AsyncStorage + React Navigation

### 🎨 FRONTEND PROMPT: Customer Login Screen UI

Tags: #Login #Validation #UX
Build the Login screen for the customer-facing Restaurant OS app.
Fields:

- Username/Email input (accepts both, auto-detect format)
- Password input with show/hide toggle (eye icon inside input field)
- 'Sign In' button with loading spinner state
- 'Forgot Password' link → navigates to ForgotPassword screen
- 'Create Account' link → navigates to Signup Step 1

Validation behavior:

- On Sign In press: if both empty → auto-focus Username field
- If only password empty → auto-focus Password field
- Show inline error: 'Invalid email or password' on failed login
- Disable button and show spinner while API call is in progress

Design: Clean, centered card layout, brand primary color CTA button
Tech: React Native + React Hook Form + Axios

### 🎨 FRONTEND PROMPT: 3-Step Customer Signup Wizard

Tags: #Signup #MultiStep #FormWizard
Build a 3-step signup wizard with animated step transitions.
Step 1 — Basic Details:

- First Name, Last Name (side by side)
- Email (with real-time 'email taken' check via debounced API call)
- Phone Number (with country code picker)
- Profile Picture (optional) — camera or gallery picker

Step 2 — Personal Details:

- Date of Birth (date picker, no future dates)
- Gender (dropdown: Male / Female / Other / Prefer not to say)
- Address with Google Places autocomplete
- City and PIN Code (auto-filled from address if possible)

Step 3 — Security:

- Password with strength meter (red → yellow → green)
- Confirm Password with real-time match indicator
- Submit triggers email OTP verification before account creation

Progress: Animated dots at top showing current step
Navigation: Back button on steps 2 & 3, no data loss on back
Tech: React Native + React Hook Form + Yup + Google Places API

### ⚙️ BACKEND PROMPT: Customer Auth API — Signup, Login, OTP

Tags: #JWT #bcrypt #Redis #Rate Limiting
Build the complete authentication API for Restaurant OS customers.
POST /api/auth/signup

- Validate with express-validator (email format, phone, password strength)
- Check email uniqueness before processing
- Hash password: bcrypt with salt rounds 12
- Generate 6-digit OTP: crypto.randomInt(100000, 999999)
- Store OTP in Redis: key='otp:email:{email}', TTL=600 seconds
- Send OTP via SendGrid email template
- Return: { message: 'OTP sent', email } — do NOT create user yet

POST /api/auth/verify-otp

- Fetch OTP from Redis, compare
- If match: create user in DB, delete Redis key, return JWT pair
- Track attempts: key='otp_attempts:{email}', max 3, lockout 15min
- If mismatch: decrement attempts, return remaining attempts count

POST /api/auth/login

- Find user by email OR username (single query with OR condition)
- bcrypt.compare() — constant time comparison prevents timing attacks
- On success: generate access token (15min) + refresh token (7 days)
- Store refresh token hash in DB (not the token itself)
- Return generic 'Invalid credentials' for both wrong email and password

Rate limits: Login: 5 attempts/15min per IP. Signup OTP: 3/hour per email

### 🎨 FRONTEND PROMPT: Forgot Password — OTP Flow Screen

Tags: #ForgotPassword #OTP #UX
Build the Forgot Password flow with 3 screens:
Screen 1 — Enter Email:

- Single email input + 'Send OTP' button
- Show loading state while API call runs
- On success: auto-navigate to OTP screen

Screen 2 — Enter OTP:

- 6 individual digit input boxes (auto-focus-next on each digit typed)
- Auto-submit when all 6 digits are filled
- 'Resend OTP' button appears after 30-second countdown timer
- Show remaining attempts (e.g., '2 attempts remaining')
- Shake animation on wrong OTP entry

Screen 3 — New Password:

- New Password + Confirm Password fields
- Same strength meter as signup
- On success: show full-screen success animation → navigate to Login

Tech: React Native + Animated API + React Hook Form

### ⚙️ BACKEND PROMPT: Restaurant Owner Registration API

Tags: #Onboarding #Multi-Branch #Validation
Build the Restaurant Owner registration API for the web admin portal.
POST /api/restaurant/register — Multi-step, single submission:
Step 1 data — Owner Account:

- owners: [{ name, email, phone, dob, gender, role: 'owner'/'co-owner' }]
- Support multiple owners (partners) via array
- password, confirm_password — validated and hashed

Step 2 data — Restaurant Details:

- restaurant_name, cuisine_type, contact_phone, official_email
- gst_number — validate format

Step 3 data — Branch Setup:

- branches: [{ name, address, lat, lon, contact, operating_hours }]
- operating_hours: { mon: { open: '09:00', close: '22:00' }, ... }
- If single branch: still use array with one object

Step 4 data — Branding:

- logo_url, banner_url (S3 pre-signed upload URLs issued separately)
- primary_color, secondary_color (validate hex format)
- tagline (optional, max 200 chars)

On submission: create restaurant + branches + owner user accounts
Set restaurant status = 'pending' (awaiting admin approval)
Send welcome email to owner with login credentials
Notify Super Admin of new registration via push notification

### ⚙️ BACKEND PROMPT: Staff Account Creation & Management API

Tags: #RBAC #StaffLifecycle #Audit
Build the Staff account management API (restricted to Owner/Manager).
POST /api/staff/create (requires Owner or Manager JWT):

- Validate role: only Manager/Owner can create staff
- Manager can only create staff for their own branch
- Owner can create for any of their branches
- Required: name, email, phone, dob, gender, role, branch_id
- Auto-generate employee_id: 'EMP-{branch_code}-{sequence}'
- Default password: DDMMYYYY from dob field — hash with bcrypt
- Set force_password_change = true
- Send SMS to staff: 'Your account is ready. Temp password: DDMMYYYY'

PATCH /api/staff/:id/toggle-access:

- Toggle is_active boolean
- If deactivating: immediately revoke all active JWT tokens (store token blacklist in Redis with remaining TTL)
- Log action to audit_log: { actor_id, action, target_id, timestamp }
- Never delete staff records — soft deactivation only

GET /api/staff/branch/:branchId:

- Return paginated staff list (page, limit, role filter, status filter)
- Include: name, role, branch, is_active, last_login, employee_id
- Only accessible by Manager of that branch or Owner

### 🔒 SECURITY PROMPT: Authentication Security Layer

Tags: #JWT #Security #OWASP
Implement these security measures across ALL authentication endpoints:
JWT Implementation:

- Access token TTL: 15 minutes (short-lived for security)
- Refresh token TTL: 7 days (stored as hash in DB, not plain token)
- JWT payload: { user_id, role, restaurant_id, branch_id, iat, exp }
- Sign with RS256 (asymmetric) not HS256 for production
- Middleware: verify token on every protected route
- Middleware: inject req.user from token claims

Security Rules:

- Never return user enumeration errors (use 'Invalid credentials' always)
- Rate limit ALL auth endpoints with express-rate-limit + Redis store
- Log all failed login attempts to security_log table
- Auto-lock account after 10 failed logins in 1 hour
- All passwords minimum 8 chars: uppercase + number + special char
- Enforce HTTPS — reject HTTP requests in production
- CORS: whitelist only your app domains
- Helmet.js: set all security HTTP headers
- Input sanitization: sanitize-html on all string inputs

## 🎨 M2 — WHITE-LABEL BRANDING SYSTEM

Dynamic per-restaurant theming for both staff and customer app

### 🎨 FRONTEND PROMPT: Dynamic Theme Provider — White-Label System

Tags: #WhiteLabel #ThemeContext #Branding
Build a dynamic theme provider that makes each restaurant feel like
they have their own dedicated app.
Implementation:

- Create BrandingContext with: logo, primaryColor, secondaryColor, appName, tagline, bannerUrl, fontPreference, welcomeAnimation

On app launch:
1. Check AsyncStorage for cached 'restaurant_branding' key
2. If cache exists and < 1 hour old → use cache immediately
3. In background: fetch GET /api/restaurant/:id/branding
4. Update cache and re-render if branding changed
For Staff App:

- restaurant_id comes from the staff's JWT token claims
- Staff always sees their restaurant's branding

For Customer App:

- If entering via QR code / deep link: extract restaurant_id from URL
- Load that restaurant's branding
- If opening normally: show platform default branding

Apply branding to: StatusBar color, Header background, CTA buttons,
Tab bar active color, Logo in header, Splash screen
Tech: React Native + Context API + react-native-paper ThemeProvider

### ⚙️ BACKEND PROMPT: Branding Config API & Tenant Management

Tags: #MultiTenant #Redis #S3
Build the branding configuration API for multi-tenant restaurant system.
GET /api/restaurant/:id/branding:

- Check Redis cache first: key='branding:{restaurant_id}', TTL=1h
- Cache miss: fetch from restaurant_branding table, store in Redis
- Return full branding object: colors, logo_url, banner_url, fonts, etc.

PATCH /api/restaurant/:id/branding (Owner auth only):

- Validate hex color codes with regex /^#[0-9A-F]{6}$/i
- Validate image URLs are from your S3 bucket domain only
- Update DB, invalidate Redis cache for this restaurant_id
- Broadcast 'branding_updated' WebSocket event to all staff connected to this restaurant's rooms

POST /api/restaurant/:id/branding/upload-url:

- Generate S3 pre-signed upload URL (valid 10 minutes)
- Accept: logo, banner, or custom_animation as upload type
- Enforce: logo max 2MB (PNG/SVG), banner max 5MB (JPG/PNG)
- After upload, client calls PATCH to save the final URL

Multi-tenant isolation:

- ALL queries must include restaurant_id from JWT — never trust client
- Middleware: verify req.user.restaurant_id matches :id in URL

### 🎯 UI/UX PROMPT: Restaurant Branding Preview Mode

Tags: #Preview #LiveMockup #Onboarding
Build a live preview mode in the restaurant onboarding portal (web).
As the owner fills in branding (Step 4 of registration):

- Show a live phone mockup on the right side of the screen
- Phone mockup updates INSTANTLY as they change colors, upload logo
- Preview shows: Splash screen, Login screen, and Home page mockup

Mockup elements that should update live:

- Header background color (primary color input)
- CTA button color (secondary color input)
- Logo position in header (logo upload)
- App name display text (app_name_display input)
- Tagline under logo (tagline input)

Tech: React.js web app, CSS custom properties for instant color changes,
URL.createObjectURL() for instant logo preview before S3 upload
Add 'Share Preview' button that generates a link owners can send
to partners to approve the branding before going live.

### 🗄️ DATABASE PROMPT: Restaurant Branding & Multi-Tenant Schema

Tags: #Schema #MultiTenant #PostgreSQL
Design the multi-tenant branding database schema.
Table: restaurant_branding

- restaurant_id UUID PRIMARY KEY REFERENCES restaurants(id)
- primary_color VARCHAR(7) NOT NULL DEFAULT '#1A3C5E'
- secondary_color VARCHAR(7) NOT NULL DEFAULT '#E8A020'
- logo_url TEXT
- banner_url TEXT
- app_name_display VARCHAR(100)
- tagline VARCHAR(200)
- font_preference VARCHAR(50) DEFAULT 'Arial'
- welcome_animation VARCHAR(50) DEFAULT 'food_standard'
- receipt_footer TEXT
- updated_at TIMESTAMP DEFAULT NOW()

IMPORTANT — Row-Level Security (RLS):

- Enable RLS on ALL tables that contain restaurant data
- Policy: staff/owners can only SELECT rows WHERE restaurant_id matches their JWT claim
- Admin role bypasses RLS

Index: CREATE INDEX idx_branding_restaurant ON restaurant_branding(restaurant_id)

## 🏢 M3 — SUPER ADMIN PANEL

Platform-wide control, analytics, restaurant & customer management

### 🎨 FRONTEND PROMPT: Admin Dashboard — Platform Analytics UI

Tags: #Dashboard #Charts #Recharts
Build the Super Admin platform analytics dashboard (React.js web app).
Layout: Left sidebar (navigation) + Main content area
Row 1 — KPI Cards (4 cards, animated number counters on load):

- Total Active Restaurants | Total Customers | Orders Today | Revenue Today

Row 2 — Charts:

- Line chart: Daily orders for last 30 days (with restaurant filter dropdown)
- Bar chart: Top 10 restaurants by revenue this month

Row 3 — Advanced Analytics:

- Heat-map grid: 7 days × 24 hours — peak ordering times

Cell color intensity = order volume. Hover shows exact count.

- Doughnut chart: Order type split (Dine-in / Delivery / Takeaway)

Row 4 — Live Feed:

- Auto-refreshing table of last 20 orders (all restaurants)
- Shows: restaurant name, order total, type, status, time

Add date range picker (last 7/30/90 days + custom) that filters all charts
simultaneously. Use react-query with 5-minute auto-refetch interval.
Tech: React.js + Recharts + TanStack Query + date-fns

### ⚙️ BACKEND PROMPT: Admin Dashboard Aggregation APIs

Tags: #Analytics #PostgreSQL #Redis #Performance
Build high-performance aggregation APIs for the admin dashboard.
GET /api/admin/dashboard/stats:

- Use Promise.all() to fetch all metrics concurrently:
- Total restaurants (active/inactive/pending)
- Total customers, new this month
- Total orders today, revenue today
- Platform's top-rated dish
- Cache in Redis: key='admin:dashboard:stats', TTL=5 minutes

GET /api/admin/dashboard/orders-chart?range=30d&restaurant_id=all:

- GROUP BY DATE(created_at), COUNT, SUM(amount)
- If restaurant_id = all: aggregate across all restaurants

GET /api/admin/dashboard/peak-hours:

- SELECT EXTRACT(DOW) as day, EXTRACT(HOUR) as hour, COUNT(*)
- FROM orders WHERE created_at > NOW() - INTERVAL '90 days'
- GROUP BY day, hour — returns 7×24 matrix
- Cache TTL: 1 hour (slow-changing data)

GET /api/admin/top-restaurants?limit=10&sort=revenue&period=30d:

- JOIN restaurants + orders + payments
- Use PostgreSQL RANK() window function for efficient ranking
- Return: restaurant_id, name, logo_url, total_revenue, order_count

Optimization: Create materialized view 'mv_restaurant_stats'
Refresh with: REFRESH MATERIALIZED VIEW CONCURRENTLY every hour via cron

### 🎨 FRONTEND PROMPT: Admin Restaurant Management — Data Grid

Tags: #DataGrid #Filters #Pagination
Build the restaurant management page for Super Admin.
Main view: Server-side paginated data grid (AG Grid or TanStack Table)
Columns: Logo | Name | Owner | Branches | Status | Joined Date | Revenue | Actions
Features:

- Sort by any column (server-side)
- Filter panel: status dropdown, date range, cuisine type, city
- Search bar: searches name, owner name, email
- Row expand: shows all branches inline on row click

Restaurant Detail Panel (slide-in from right on row click):

- Full restaurant info: name, owners (with photos), contact, GST
- Branches tab: each branch with address, manager, active status
- Analytics tab: revenue chart, order count, top dishes
- Staff Review tab: anonymous feedback from this restaurant

Actions per restaurant row:

- View Details, Approve (if pending), Suspend, Contact Owner
- Multi-row selection: bulk approve or bulk suspend

Export button: exports current filtered view as CSV

### ⚙️ BACKEND PROMPT: Admin Reports & Trend Analysis API

Tags: #Reports #Trends #Export
Build the platform-wide reports and trend analysis APIs.
GET /api/admin/reports/food-trends?period=30d:

- COUNT orders grouped by cuisine_type and food category
- Compare with previous same period for trend arrows (up/down/stable)
- Return: trending cuisines, top items with % growth

GET /api/admin/reports/geographic?metric=customer_growth:

- GROUP customers by city/zone using address field
- Return GeoJSON for map visualization on frontend

GET /api/admin/reports/cancellations?period=30d:

- Join orders + cancellation_reasons
- GROUP BY reason, restaurant — identify patterns

GET /api/admin/reports/restaurant-performance:

- Rank all restaurants: avg prep time, avg rating, cancellation rate
- Flag underperforming restaurants (bottom 10%)

POST /api/admin/export/report (async):

- Validate report type and date range in request body
- Queue job in Bull with high priority
- Generate CSV/XLSX using exceljs library
- Upload to S3, return pre-signed download URL (valid 1 hour)
- Send email notification to admin when ready

### 🎨 FRONTEND PROMPT: Anonymous Staff Review System UI

Tags: #Feedback #Anonymity #Moderation
Build the anonymous staff review interface for Admin and Restaurant panels.
For Admin view:

- Filter by restaurant (dropdown) and branch
- Each review card shows:
- Branch name (e.g., 'Branch 2 — Connaught Place')
- Role label (e.g., 'A Waiter says...')
- Review text
- Timestamp
- Sentiment badge: 🟢 Positive / 🟡 Neutral / 🔴 Negative (AI-tagged)
- NEVER show staff name or any identifying information
- Admin can flag reviews for follow-up (adds a 'Flagged' badge)

For Restaurant Owner view:

- Same UI but filtered to their restaurant only
- Can see branch name but not which specific staff member

Branches with > 30% negative sentiment:

- Show a warning banner at top of that branch section
- 'High negative feedback detected — consider reviewing operations'

Pagination: Load 20 reviews per page, most recent first

### ⚙️ BACKEND PROMPT: Platform Health & Monitoring API

Tags: #Monitoring #Uptime #Alerts
Build the platform health monitoring endpoints.
GET /api/admin/health (public — for status page):

- Return: { status: 'ok' | 'degraded' | 'down', timestamp }
- Check: DB connection, Redis connection, WebSocket server

GET /api/admin/health/detailed (admin auth required):

- DB: average query time (last 100 queries)
- Redis: hit rate, memory usage, connected clients
- WebSocket: total connections, rooms count, events per minute
- API: average response time per endpoint (last 15 minutes)
- Queue: Bull job counts (active, waiting, failed)
- Active users: count of valid JWTs issued in last 1 hour

Automated alerts (send to admin email/push):

- DB response time > 500ms average over 5 minutes
- Error rate > 5% of requests in any 5-minute window
- Any Bull queue has > 100 failed jobs
- WebSocket server drops > 50 connections in 1 minute

Tech: Prom-client (metrics), winston (logging), Bull dashboard

## 🍽️ M4 — RESTAURANT OWNER PANEL

Owner dashboard, branch management, staff, reports, and customer data

### 🎨 FRONTEND PROMPT: Restaurant Owner Dashboard UI

Tags: #OwnerDashboard #Revenue #Analytics
Build the restaurant owner web dashboard (React.js).
Top Section — Revenue Summary:

- 3 cards: Today's Revenue | This Week | This Month
- Each card shows: amount, % change vs last period, up/down arrow
- Small sparkline chart in each card (last 7 data points)

Middle Section — Operations Overview:

- Order status ring: Completed / Pending / Cancelled (doughnut)
- Table occupancy bar: X/Y tables occupied right now (live via WS)
- Active staff count by role (live)

Bottom Section — Insights:

- Top 5 dishes by revenue (horizontal bar chart)
- Peak hours heatmap for THIS restaurant (same 7×24 grid)
- Customer satisfaction trend (avg rating last 30 days, line chart)

Right Sidebar (or top tab):

- Branch selector — switch between branches, data updates accordingly
- Quick alert feed: low inventory items, pending staff requests

Tech: React.js + Recharts + Socket.io client (for live occupancy updates)

### ⚙️ BACKEND PROMPT: Owner Dashboard API

Tags: #Aggregation #MultiTenant #Performance
Build the restaurant owner dashboard aggregation API.
GET /api/owner/dashboard?branch_id=all (or specific branch):

- Auth: JWT must have role='owner', extract restaurant_id from token
- If branch_id=all: aggregate across all their branches
- Use Promise.all() for concurrent data fetching:

Data points to return in single response:

- revenue: { today, this_week, this_month, prev_week, prev_month }
- orders: { completed, pending, cancelled, by_type: {dine_in, delivery} }
- tables: { total, occupied, reserved, free, cleaning }
- top_dishes: [{ item_id, name, revenue, order_count }] limit 5
- staff_active: { total, by_role: {waiter: N, chef: N, ...} }
- avg_rating: { current_month, last_month, total_reviews }

Cache strategy:

- Revenue stats: Redis TTL 10 minutes
- Real-time data (tables, active staff): NO cache, always live

Security: Verify restaurant_id in JWT matches the restaurant_id
of the requested branch — prevent cross-restaurant data access

### ⚙️ BACKEND PROMPT: Branch Management API — Full CRUD

Tags: #Branches #GeoLocation #OperatingHours
Build the branch management API for restaurant owners.
POST /api/owner/branches:

- Required: name, address, contact_phone, manager_id, operating_hours
- Auto-geocode address to lat/lon using Google Geocoding API
- operating_hours format: { mon: { open: '09:00', close: '23:00', closed: false } }
- Validate manager_id belongs to this restaurant and has role='manager'
- Create branch record, link to restaurant

PATCH /api/owner/branches/:id:

- Update name, address, contact, hours, status
- Re-geocode if address changed
- If manager changed: notify old and new manager via push notification

PATCH /api/owner/branches/:id/status:

- Toggle branch active/inactive
- If deactivating: check no active orders (reject if yes)
- Send notification to all branch staff
- Update customer-facing availability for this branch

GET /api/owner/branches:

- Return all branches with: staff count, today's revenue, current occupancy
- Sorted by branch name by default

### 🎨 FRONTEND PROMPT: Owner Branch Management UI

Tags: #BranchCards #OperatingHours #Maps
Build the Branch Management page in the owner's web portal.
Branch List View:

- Card grid: each branch card shows name, address, revenue today, occupancy (X/Y tables), manager name, active/inactive status badge
- Quick action buttons on card: Edit, View Reports, Toggle Status
- 'Add New Branch' button opens a multi-step form modal

Add/Edit Branch Form:

- Branch name, address (Google Maps autocomplete), contact phone
- Operating hours: visual weekly grid — click each day to set open/close or toggle 'Closed' for that day
- Manager assignment: searchable dropdown (shows available managers)

Branch Detail Page (on card click):

- Tabs: Overview | Staff | Floor Layout | Reports | Settings
- Overview: live occupancy map mini-view, today's stats, active alerts

Google Maps embed: show pin for each branch on a map
Click pin → highlight that branch card

### ⚙️ BACKEND PROMPT: Owner Reports API — Sales, Performance, Export

Tags: #Reports #Sales #CSV
Build the detailed reports API for restaurant owners.
GET /api/owner/reports/sales?branch=&from=&to=&granularity=daily:

- Granularity options: hourly, daily, weekly, monthly
- Split by order type: dine_in, delivery, takeaway
- Include: order count, revenue, avg order value, cancellation rate

GET /api/owner/reports/menu-performance?branch=&period=:

- Per menu item: order_count, revenue, return_rate, avg_rating
- Sort options: most_ordered, most_revenue, worst_rated, slow_movers
- Flag items with < 5 orders in last 30 days as 'Consider Removing'

GET /api/owner/reports/kitchen-performance?branch=:

- Average preparation time per item (from order confirmed to ready)
- Average preparation time per chef (anonymized by employee_id only)
- Hours with highest prep times (indicates understaffing)

GET /api/owner/reports/customer-insights?branch=:

- New vs returning customer ratio
- Average visits per customer (active customers)
- Average spend per customer by segment

POST /api/owner/reports/export:

- Accept: report_type, branch_id, date_range, format (pdf/xlsx)
- Queue in Bull, generate async, email download link when ready

### 🎨 FRONTEND PROMPT: Owner Reports Dashboard UI

Tags: #Reports #Charts #Export
Build the reports page for the restaurant owner portal.
Page layout: Filter bar at top + report content below
Filter Bar (sticky):

- Branch selector (all branches or specific)
- Date range picker (presets: Today, Last 7d, Last 30d, Custom)
- All charts below update simultaneously when filter changes

Sales Report Tab:

- Revenue area chart with dine-in vs delivery split (stacked)
- Summary stats: total revenue, avg order value, total orders, cancellations

Menu Performance Tab:

- Sortable table: item name, orders, revenue, rating, trend arrow
- Highlight top 3 in green, bottom 3 in light red
- 'Slow Movers' section: items with < 5 orders, suggest promotion or removal

Kitchen Performance Tab:

- Average prep time per category (bar chart)
- Heatmap: prep times by hour of day

Export button: opens dialog to choose format (PDF / Excel)
Shows 'Export queued — you will receive an email' on submit

### ⚙️ BACKEND PROMPT: Customer Data API for Restaurants

Tags: #CustomerData #CRM #Privacy
Build the customer data API scoped to restaurant owners.
GET /api/owner/customers?branch=&sort=visits&page=&search=:

- Returns customers who have visited THIS restaurant
- Fields: display_name, phone (masked: +91 ***** 12345), visit_count, last_visit, total_spent, favorite_items[3], account_type
- account_type: 'self_registered' or 'restaurant_created' (created_by_restaurant = true in users table)

POST /api/owner/customers/create-by-restaurant:

- Restaurant creates a lightweight customer record
- Required: name, phone (for order association)
- Create user with: no password, created_by_restaurant=true
- If phone already exists in users table: link to existing account
- This preserves order history if customer later self-registers

GET /api/owner/customers/:id/history:

- All visits, orders, spending, ratings left by this customer
- Scoped: only shows data for THIS restaurant (not other restaurants)

Privacy rules:

- Full phone/email only visible to Owner, masked for Manager/Staff
- Log every customer data access to compliance_log table

### 🎨 FRONTEND PROMPT: Staff Management UI — Owner & Manager Portal

Tags: #StaffManagement #Roles #Scheduling
Build the Staff Management page for owner/manager portal.
Staff List View:

- Filterable table: by role, branch, status (active/inactive)
- Each row: photo thumbnail, name, role badge, branch, last login, employee_id, active toggle switch
- Click row to open Staff Detail side panel

Staff Detail Panel:

- Profile section: photo, personal info, contact, DOB
- Role & Branch section: current role, branch assignment (editable)
- Performance section: orders handled today, avg customer rating, tables served this week
- Access Control: ON/OFF toggle (prominent, with confirmation dialog)
- Change Role button (owner only) — opens role selector dropdown

Add Staff Modal (button at top right):

- All fields from staff creation API
- Preview default password that will be sent (DDMMYYYY format)
- Confirm & Send Credentials button

Bulk Actions: select multiple staff → bulk toggle access or bulk reassign branch

### ⚙️ BACKEND PROMPT: Inventory Management API

Tags: #Inventory #Alerts #StockTracking
Build the inventory management API.
Table structure needed: inventory_items

- id, branch_id, ingredient_name, unit, current_quantity, reorder_threshold, last_updated, updated_by

GET /api/inventory/branch/:branchId:

- Return all items with current_quantity and reorder_threshold
- Flag items: NORMAL (above threshold) | LOW (at/below) | CRITICAL (< 20%)

PATCH /api/inventory/:itemId:

- Manager/Owner can update: current_quantity, reorder_threshold
- Log change: { item_id, old_qty, new_qty, changed_by, reason, timestamp }

POST /api/inventory/deduct (called internally when order is placed):

- Accept: branch_id, order_items array
- Look up ingredient_requirements for each menu item
- Deduct proportional amounts from inventory
- After deduction: check if any item fell below threshold
- If yes: emit 'inventory_low' WebSocket event to manager room
- Send push notification to manager

This endpoint is called by the order creation service, not directly by UI

## 🗺️ M5 — FLOOR & TABLE LAYOUT DESIGNER

Visual drag-and-drop floor plan creator and live table status view

### 🎨 FRONTEND PROMPT: Drag-and-Drop Floor Layout Designer

Tags: #Konva #DragDrop #FloorPlan
Build a visual drag-and-drop floor layout designer for restaurant managers.
Canvas Setup:

- Use Konva.js or React DnD for the canvas
- Grid: 24 × 18 cells, each cell = 50×50px
- Snap-to-grid: tables snap to nearest cell on drop

Table Types (draggable from left sidebar):

- Round table: SVG circle with capacity label
- Square table: SVG square with capacity label
- Rectangle table (2×1 cells): for 6-8 person tables
- Booth: L-shape representation

On table drop to canvas:

- Show config modal: Label (T1, T2...), Capacity (2/4/6/8/custom), Zone (Indoor/Outdoor/VIP/Family/Bar), Upload table photo

Toolbar: Undo | Redo | Delete selected | Clear all | Save | Preview
Floor tabs: Ground Floor, 1st Floor, 2nd Floor etc.
Add/remove floors with + button (max 5 floors)
Save: POST layout as JSON grid to backend
Preview button: toggle to Live View mode (read-only with status colors)
Tech: React.js + Konva.js + react-konva

### ⚙️ BACKEND PROMPT: Floor Layout API — Save, Publish, Live View

Tags: #FloorLayout #WebSocket #Concurrency
Build the floor layout management API.
POST /api/branch/:id/floor-layout:

- Accept: { floors: [{ floor_number, tables: [{ label, x, y, capacity, shape, zone, photo_url }] }] }
- Validate: table labels unique within a floor
- Validate: no overlapping table positions
- Save to floor_layouts table (as JSONB column for flexibility)
- Set status = 'draft' (not yet live)

POST /api/branch/:id/floor-layout/publish:

- Change status from 'draft' to 'active'
- Insert/update tables in the tables table from layout
- Preserve existing table IDs if table label matches (keeps order history)
- Broadcast 'floor_layout_updated' WebSocket event to all branch staff

GET /api/branch/:id/live-layout:

- Return current active layout + real-time status of each table
- JOIN floor_layouts with tables to get positions + statuses
- Include: { table_id, label, x, y, status, capacity, current_order_id }

Optimistic locking:

- layout_version integer in floor_layouts
- Client sends current version with PATCH
- If version mismatch: reject with 409 Conflict

### 🎨 FRONTEND PROMPT: Live Table Status Map — Real-Time View

Tags: #LiveMap #WebSocket #TableStatus
Build the live table status map used by Host, Manager, and Waiter.
This is the READ-ONLY runtime version of the floor designer.
Render the same Konva canvas but in view-only mode.
Table Colors (update in real-time via WebSocket):

- 🟢 Free: bright green fill
- 🔴 Occupied: red fill with order time elapsed shown
- 🟠 Reserved: orange fill with customer name (if available)
- 🟡 Dirty/Cleaning: yellow fill
- ⚫ Maintenance: gray fill

On table tap/click:

- Host view: show 'Assign Customer' action if table is Free
- Manager view: show full table details + override status option
- Waiter view: show 'View Orders' for their assigned tables

WebSocket: subscribe to 'table_status_changed' events

- Smooth CSS color transition animation (0.3s ease) on status change

Add floor selector tabs at top if restaurant has multiple floors
Show legend (color key) in bottom corner

### 🗄️ DATABASE PROMPT: Tables & Floor Layout Schema

Tags: #Tables #Schema #GeoJSON
Design the database schema for floor layouts and tables.
Table: floor_layouts

- id UUID PRIMARY KEY
- branch_id UUID REFERENCES branches(id)
- layout_data JSONB NOT NULL  -- stores full grid as JSON
- status ENUM ('draft', 'active', 'archived') DEFAULT 'draft'
- layout_version INTEGER DEFAULT 1
- created_by UUID REFERENCES users(id)
- published_at TIMESTAMP
- created_at TIMESTAMP DEFAULT NOW()

Table: tables

- id UUID PRIMARY KEY
- branch_id UUID REFERENCES branches(id) ON DELETE CASCADE
- label VARCHAR(10) NOT NULL  -- e.g., 'T1', 'VIP3'
- capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 20)
- floor_number INTEGER DEFAULT 0
- shape ENUM ('round','square','rectangle','booth') DEFAULT 'square'
- zone VARCHAR(50) DEFAULT 'indoor'
- photo_url TEXT
- status ENUM ('free','reserved','occupied','cleaning','maintenance') DEFAULT 'free'
- x_pos INTEGER, y_pos INTEGER  -- grid position

UNIQUE(branch_id, label)  -- label must be unique within a branch
INDEX on (branch_id, status)  -- frequent query pattern

## 📋 M6 — MENU MANAGEMENT

Full menu CRUD, status management, and customer-facing menu display

### 🎨 FRONTEND PROMPT: Menu Management Interface — Owner/Manager Portal

Tags: #Menu #CRUD #Upload
Build the menu management interface in the restaurant portal (React.js).
Left Panel — Category List:

- Drag-to-reorder categories (react-beautiful-dnd or dnd-kit)
- Each category shows item count badge
- + Add Category button at bottom
- Click category to show its items in right panel

Right Panel — Items Grid:

- Cards in 3-column grid (2-column on smaller screens)
- Each item card: food photo, name, price, dietary tag icon, status badge
- Quick actions on hover: Edit, Toggle Sold Out, Delete
- Inline price edit: click price → becomes editable input → blur to save

Add/Edit Item Modal:

- Photo upload with react-easy-crop (enforced 4:3 ratio, max 2MB)
- Name, Description (rich text — bold/italic allowed)
- Price, Discounted Price (optional, shows strike-through on menu)
- Dietary tags: multi-select pills (Veg/Non-Veg/Vegan/Halal/Jain/GF)
- Allergens: multi-select (Nuts/Dairy/Gluten/Eggs/Soy/Shellfish)
- Preparation time estimate (dropdown: 5/10/15/20/30+ minutes)
- Availability: Always / Time-based (set hours) / Hidden
- Add-ons: e.g., 'Extra Cheese +₹30' — dynamic row inputs

Bulk Actions toolbar: select items → change status / adjust price by %

### ⚙️ BACKEND PROMPT: Menu API — Categories, Items, Availability

Tags: #Menu #CRUD #Availability
Build the complete menu management API.
GET /api/menu/branch/:branchId (public — for customer app):

- Return categories with items, filter out Hidden items
- Filter items where: NOT is_hidden AND (no time restriction

OR current time is within availability window)

- Cache in Redis: 'menu:{branchId}', TTL 10 minutes
- Invalidate cache on any menu update for this branch

POST /api/menu/categories (Manager/Owner auth):

- name, description, display_order, branch_id
- Reorder: PATCH /api/menu/categories/reorder with ordered id array

POST /api/menu/items:

- category_id, name, description, price, discounted_price, photo_url
- dietary_tags: ['veg','halal'] (store as TEXT[])
- allergens: TEXT[]
- prep_time_minutes INTEGER
- availability: { type: 'always' | 'time_based', from: '07:00', to: '11:00' }
- addons: [{ name, extra_price }]
- Invalidate menu Redis cache on save

PATCH /api/menu/items/:id/status:

- status: 'available' | 'sold_out' | 'hidden'
- Broadcast 'menu_updated' WebSocket event to customer app subscribers

PATCH /api/menu/items/bulk-price-update:

- Accept: item_ids[], adjustment_type ('percent'|'fixed'), value
- Validate: new price must be > 0

### 🎨 FRONTEND PROMPT: Customer-Facing Digital Menu

Tags: #CustomerMenu #FoodCard #Cart
Build the customer-facing digital menu for the Restaurant Profile page
and the QR code table ordering interface.
Menu Structure:

- Sticky category navigation bar (horizontal scroll, highlight active)
- Scrolling reveals categories in order — tab highlights auto-updates

Food Item Card:

- 4:3 photo (lazy loaded), dietary tag icon (green dot=veg, red=non-veg)
- Name, Description (truncated to 2 lines, expandable)
- Price (show discounted price with original struck-through if applicable)
- Allergen warning icon if item has allergens (tap to expand list)
- '+' Add button — on tap: shows quantity selector if already in cart
- Sold Out overlay on unavailable items (grayed out, no add button)

QR Code ordering mode (table scan):

- Show table number prominently at top: 'Ordering for Table T3'
- Show current active order for this table (if waiter already started one)
- Customer additions merge with existing order

Cart sheet (bottom sheet, slides up):

- Item list, quantities, subtotal, special instructions per item
- 'Place Order' button → sends to kitchen + cashier

### 🤖 AI / ML PROMPT: Smart Menu Pricing Suggestions

Tags: #AI #Revenue #MenuOptimization
Build an AI-powered menu optimization feature for restaurant owners.
Analyze menu performance and generate actionable suggestions:
Slow Seller Detection:

- Items with < avg_orders × 0.3 in last 30 days = 'Slow Seller'
- Suggest: 'Consider adding a ₹20 discount or featuring in promotions'

Bundle Opportunity Detection:

- Find item pairs ordered together > 60% of the time:

SELECT a.item_id, b.item_id, COUNT(*) as co_orders
FROM order_items a JOIN order_items b ON a.order_id = b.order_id
WHERE a.item_id != b.item_id GROUP BY 1,2 HAVING COUNT(*) > threshold

- Suggest: 'Create a combo: [Item A] + [Item B] — 60% of customers order both'

Peak Hour Pricing:

- If item has > 2× avg orders during specific hours:
- Suggest: 'Item X is 3× more popular on Friday evenings.

Consider premium pricing (7-9pm Fri-Sat)'
Display in Owner Portal:

- 'Smart Suggestions' section with each suggestion as a card
- Owner can: Apply Suggestion / Dismiss / Remind Later
- Applied suggestions auto-update menu item settings

## 👥 M7–M12 — STAFF MODULES

Manager, Host, Waiter, Chef, Cashier — Complete Prompt Set

## M8

Manager Module

### 🎨 FRONTEND PROMPT: Manager Dashboard — Live Operations View

Tags: #Manager #Dashboard #LiveOps
Build the Manager's live operations dashboard (mobile-first).
Split Layout (mobile: tabs, desktop: split panels):
Panel 1 — Live Floor Map:

- Mini version of the table layout designer (read-only)
- Tables update color in real-time via WebSocket
- Tap any table: see who's seated, what they ordered, elapsed time
- Quick actions from table tap: Override status, Reassign waiter

Panel 2 — Event Feed:

- Real-time stream of branch events (newest at top)
- Event types with icons: 🍽️ Order Placed | ✅ Payment Done |

⚠️ Low Inventory | 🔔 Customer Request | ⏱️ Overdue Order

- Each event: tap to see details, swipe left to dismiss/resolve

Top Bar — KPI Chips (auto-updating via WebSocket):

- Revenue Today | Active Orders | Tables Occupied | Staff On Duty

Alert Section (above fold, collapsible):

- Red cards for: overdue orders (> 20 min), very low inventory
- Yellow cards for: approaching busy period, low stock warnings
- Each alert has a 'Resolve' or 'View' action button

### ⚙️ BACKEND PROMPT: Manager Dashboard API & Alert System

Tags: #Manager #Alerts #Aggregation
Build the manager dashboard API and automated alert engine.
GET /api/branch/:id/manager-dashboard:

- Single endpoint, use Promise.all() for all concurrent queries:
- tables: count by status (free/occupied/reserved/cleaning)
- active_orders: count and list of orders > 15 minutes old
- staff_on_duty: count by role
- revenue_today: sum from payments where paid_at > today midnight
- inventory_alerts: items below reorder threshold
- unread_alerts: count from branch_alerts table
- No Redis cache for this endpoint — data must be real-time

Alert Engine (cron job every 60 seconds):

- Check orders in status='preparing' WHERE created_at < NOW() - INTERVAL '20 minutes'
- Create 'overdue_order' alert, emit WebSocket event
- Check inventory_items WHERE current_quantity <= reorder_threshold
- Create 'inventory_low' alert if not already alerted in last 2 hours
- All alerts stored in branch_alerts table with: type, branch_id, reference_id, message, is_resolved, created_at

## M9

Host / Queue Management

### 🎨 FRONTEND PROMPT: Host Queue & Table Assignment Interface

Tags: #Host #Queue #GeoFencing
Build the Host interface for managing queue and table assignments.
Two-panel layout (split on tablet, tabs on phone):
LEFT — Queue Panel:

- Numbered list of waiting customers (dine-in queue)
- Each queue card: Queue #, party size badge, time waiting countdown, booking type (pre-booked vs walk-in vs digital queue)
- Status badges: Waiting (gray) | Arrived (green pulse) | No-show (red)
- Geo-fenced arrivals: card glows green + 'Nearby' chip appears
- Manual 'Mark Arrived' button on each card
- No-show: red countdown bar drains over grace period (default 10 min)

RIGHT — Table Map Panel:

## → Live floor map (from M5 live view component)

- To assign: tap a queue card, then tap an available table
- System validates capacity (warns if table too small for party)
- On assignment: queue card disappears, table turns orange (Reserved)

Walk-in Entry form (+ button):

- Quick form: party size, name (optional), phone (optional)
- Adds to bottom of queue instantly

WebSocket: subscribe to queue_updated, table_status_changed,
arrival_detected events for live updates

### ⚙️ BACKEND PROMPT: Queue Management & Geo-Fencing API

Tags: #Queue #FIFO #GeoFencing #NoShow
Build the queue management and geo-fencing arrival API.
POST /api/queue/join (customer or walk-in):

- Create queue entry: { branch_id, user_id, people_count, source }
- Assign position: SELECT COUNT(*) FROM queue WHERE branch_id=?

AND status IN ('waiting','arrived') + 1

- Return: { queue_id, position, estimated_wait_minutes }
- Estimated wait = avg_table_turn_time × (position - 1)
- Emit 'queue_updated' to all customers in this branch's queue

POST /api/queue/:id/mark-arrived (Host or Customer):

- Update status = 'arrived', set arrived_at timestamp
- Emit 'arrival_detected' to Host WebSocket room

POST /api/queue/:id/assign-table (Host only):

- Validate: table status = 'free', table capacity >= people_count
- Atomic transaction: update queue status='seated', table status='reserved'
- Create booking record linking queue, user, and table
- Emit table_status_changed, queue_updated events
- Send push notification to customer: 'Your table T3 is ready!'

No-Show Cron (every 2 minutes):

- Find queue entries: status='arrived' AND arrived_at < NOW() - grace_period
- Update status='no_show', release table back to 'free'
- Notify next in queue: 'A table is now available!'

POST /api/geo/arrival-check (from customer app on location update):

- Use Haversine formula to calculate distance to branch
- If distance < 150m AND has active booking AND not yet marked arrived:
- Emit 'geo_arrival_detected' to customer: prompt to confirm arrival

## M10

Waiter Module

### 🎨 FRONTEND PROMPT: Waiter Interface — Order Taking & Table Management

Tags: #Waiter #Orders #Mobile
Build the mobile-first Waiter interface.
Home Screen — My Tables:

- Grid of table cards (assigned to this waiter only)
- Each card: table label, status badge, time occupied, item count, order total, 'Food Ready' badge if kitchen has items ready
- Tap table → Order Screen for that table

Order Screen (for a specific table):

- Tab 1: Current Order — items added, quantities, special notes
- Tab 2: Menu — browse to add more items
- Tab 3: Table History — previous orders at this table today

Adding Items (Tab 2 → Menu):

- Category filter pills at top
- Item cards with + button
- On + tap: bottom sheet slides up
- Quantity spinner, Special Notes input, Add-on selection
- 'Add to Order' confirmation button

Order Actions bar (fixed at bottom):

- 'Send to Kitchen' button (primary CTA)
- 'Mark Served' per item (after kitchen marks Ready)
- 'Update Table Status' dropdown (Occupied/Cleaning)

'Food Ready' notification: banner slides in from top with table number
Stays visible until waiter taps 'Acknowledged'
'Call Waiter' alert: if customer presses call from app, vibration + banner

### ⚙️ BACKEND PROMPT: Order Creation & Waiter Assignment API

Tags: #Orders #SmartAssignment #Serving
Build the order management API with smart waiter assignment.
POST /api/orders (Waiter or Customer via QR):

- body: { table_id, items: [{ menu_item_id, quantity, notes, addons }] }
- Validate: menu items exist, are available, belong to this branch
- Calculate total, apply any active discounts
- Create order + order_items records
- Emit 'order_created' to branch:{id}:kitchen room (instant KDS update)
- Emit 'order_created' to branch:{id}:cashier room (instant billing)

Smart Waiter Auto-Assignment:

- When table is seated (Host assigns), run assignment:

SELECT s.id, COUNT(wt.id) as active_tables
FROM staff s LEFT JOIN waiter_tables wt ON s.id=wt.waiter_id
WHERE s.branch_id=? AND s.role='waiter' AND s.is_active=true
GROUP BY s.id ORDER BY active_tables ASC LIMIT 1

- Assign waiter, notify them via push: 'Table T5 assigned to you'

PATCH /api/order-items/:id/serve:

- Update status='served', set served_at timestamp
- Check if ALL items for this order are now served:
- If yes: update order status='served'
- Emit 'item_served' event to cashier for bill update

GET /api/waiters/:id/active-tables:

- Return all tables with active orders assigned to this waiter

## M11

Chef / Kitchen Display System

### 🎨 FRONTEND PROMPT: Kitchen Display System (KDS) — Chef Interface

Tags: #KDS #Chef #DarkMode #Tablet
Build the Kitchen Display System optimized for large tablets/screens.
Overall Design: Dark theme (#111111 bg, white text), high contrast
Optimized for 10-12 inch tablet mounted in kitchen
Ticket Layout: 3-column card grid
Each Order Ticket card shows:

- TABLE NUMBER: very large font (32px+), bold, top of card
- Items list: each item on its own line with quantity e.g., '2× Butter Chicken' — large readable font (18px+)
- Special instructions: amber/yellow text, clearly separated
- Timer: elapsed time since order placed (updates every second)
- Status action button (full width, bottom of card):

'START COOKING' → 'MARK READY'
Ticket Colors:

- PENDING: blue border (#2980B9)
- PREPARING: yellow border (#F39C12), slightly elevated shadow
- READY: green border (#1E8449), faded (ready for pickup)

Overdue Alert (> 15 min in PREPARING):

- Red pulsing border animation (CSS keyframe @keyframes pulse-red)
- Play audio alert sound (Web Audio API / HTML5 audio)

New order arrival: ticket slides in from right with animation
Filter buttons: Show ALL | PENDING only | PREPARING only
Tech: React Native (tablet) or React.js (web browser on tablet)
WebSocket: real-time order intake

### ⚡ WEBSOCKET PROMPT: Kitchen Real-Time Order System

Tags: #WebSocket #KDS #Events
Implement the real-time WebSocket system for the Kitchen Display.
Socket.io Server Setup:

- Install: socket.io with Redis adapter (@socket.io/redis-adapter)
- Redis adapter enables multi-server support (horizontal scaling)

Kitchen Room: 'branch:{branchId}:kitchen'

- Chef's device joins this room on KDS app load
- Authentication: verify JWT from socket handshake query params

Events the Kitchen RECEIVES:
Event: 'order_to_kitchen'

- Triggered by: POST /api/orders
- Payload: { order_id, table_label, items, special_notes, created_at }
- KDS: add new ticket to UI with slide-in animation

Event: 'order_cancelled'

- Payload: { order_id }
- KDS: remove ticket with slide-out animation + audio beep

Events the Kitchen EMITS:
Event: 'kitchen_status_updated'

- Triggered by: Chef taps 'START COOKING' or 'MARK READY'
- Payload: { order_id, order_item_ids, new_status, chef_id }
- Server: PATCH /api/orders/:id/kitchen-status
- Server then emits 'food_ready' to 'branch:{id}:waiters' room

Overdue Alert Cron:

- Server-side: check preparing orders every 60 seconds
- If elapsed > threshold: emit 'overdue_order' to kitchen room
- Payload: { order_id, table_label, minutes_elapsed }

## M12

Cashier & Payment Module

### 🎨 FRONTEND PROMPT: Cashier POS Interface & Payment Screens

Tags: #Cashier #POS #Payment #QR
Build the Cashier Point-of-Sale interface.
Home Screen — Tables Awaiting Payment:

- Table card grid sorted by time occupied (longest first)
- Cards with yellow badge for 'Bill Requested'
- Each card: table label, order total, item count, time occupied
- Tap table → Bill Details screen

Bill Details Screen:

- Itemized list: item name, quantity, unit price, subtotal
- Subtotal section: items + GST (show GST % and amount) + service charge
- Discount row (show if coupon applied or manager discount)
- GRAND TOTAL: large, bold

Payment Section — Tab Bar:

- CASH: enter received amount → auto-calculate change
- CARD: show 'Swipe card on physical terminal' message + confirm button
- UPI: show generated QR code (customer scans) + payment status polling
- SPLIT: enter number of people → show per-person amount

OR custom split: assign items to each person
On Payment Confirmed:

- Full-screen ✅ success animation (0.5 seconds)
- Show 'Receipt Sent' confirmation
- Auto-return to home screen with that table now showing 'Cleaning'

UPI QR polling: every 3 seconds call payment status API
Show spinner: 'Waiting for payment...' with animated dots

### ⚙️ BACKEND PROMPT: Payment Processing & Receipt Generation API

Tags: #Payments #PDF #UPI #SplitBill
Build the payment processing and receipt generation API.
POST /api/payments:

- body: { order_id, method: 'cash'|'card'|'upi'|'split', amount_received, coupon_code, split_details }
- Validate: order exists, status != 'paid', amount >= bill total
- Apply coupon if provided: validate, check not expired, check single use
- Create payment record: { order_id, amount, method, status: 'completed' }
- Update order status = 'paid'
- Update table status = 'cleaning'
- Emit 'payment_confirmed' WebSocket event to all branch rooms
- Queue PDF receipt generation job in Bull

UPI QR Code Generation:
POST /api/payments/upi/generate-qr:

- Generate UPI deep link: upi://pay?pa={merchant_upi}&pn={name}

&am={amount}&tr={transaction_ref}&tn={description}

- Convert to QR using qrcode library
- Return base64 QR image + transaction_ref for status polling

GET /api/payments/upi/status/:transactionRef:

- Poll payment gateway for UPI confirmation
- On confirmed: trigger same payment completion flow as above

Bull Job — Receipt PDF Generation:

- Use pdfkit to generate itemized receipt
- Include: restaurant logo, name, address, GSTIN
- Itemized table, tax breakdown, payment method, timestamp
- Upload to S3, store URL in payments.receipt_url
- Send via SendGrid (email) and/or Twilio (WhatsApp/SMS)

## 📱 M13–M17 — CUSTOMER APP

Home, Discovery, Booking, Ordering, Payment, Profile — All Prompts

### 🎨 FRONTEND PROMPT: Customer Home Page — AI Feed & Discovery

Tags: #Home #Feed #InfiniteScroll
Build the customer home page of the Restaurant OS app.
Header (sticky, collapses on scroll):

- Restaurant logo (white-label) or platform logo
- Location indicator: 'Delivering to: Connaught Place ▼' (tappable)
- Notification bell with unread badge

Quick Filter Pills (horizontal scroll, below header):

- Veg | Non-Veg | Nearby | Top Rated | Open Now | Trending | New
- Active filter: filled pill with primary color, others outlined
- Multiple filters combinable

Mood Tiles Section (UNIQUE FEATURE):

- 2×3 grid of visual tiles with food photography backgrounds
- Tiles: Quick Bite | Fine Dining | Late Night | Healthy | Celebration | Date Night
- Tap a tile: applies preset filter combination to restaurant feed

AI Recommendation Strip:

- Horizontal scroll: 'Recommended For You'
- Based on last 5 orders + dietary preferences

Sponsored Banners:

- Auto-playing banner carousel (only if sponsorships active)
- Labeled 'Sponsored' badge — no deceptive placement

Restaurant Feed:

- Infinite scroll vertical list
- Restaurant card: banner image, name, rating, cuisine, distance, delivery time, best-seller dish photo
- Skeleton loading cards while fetching
- Pull-to-refresh

Quick Reorder Section (returning users):

- Horizontal scroll: last 3 orders with 'Reorder' button

Tech: React Native + Infinite scroll + react-query + Lottie

### ⚙️ BACKEND PROMPT: Restaurant Discovery & Search API

Tags: #Search #GeoQuery #Recommendations
Build the restaurant discovery and search API for the customer app.
GET /api/restaurants/nearby:

- Params: lat, lon, radius_km (default 5), page, limit
- Use PostGIS extension for geo-queries:

SELECT *, ST_Distance(location, ST_MakePoint(lon,lat)::geography) as dist
FROM branches WHERE ST_DWithin(location, ..., radius_in_meters)
AND is_active=true

- Join with: restaurants (name, logo, cuisine), live_status (table count)
- Include: avg_rating, price_range, is_open_now (check operating_hours)
- Sort: by distance by default

GET /api/restaurants/search:

- Params: query, cuisine, dietary_tags[], city, sort_by, filters
- Full-text search: use PostgreSQL tsvector on restaurant name + menu items
- Filter by dietary_tags: JOIN menu_items WHERE tags @> dietary_tags_array
- Filter by is_open_now: check operating_hours against current day/time
- Cache: 'search:{hash_of_params}', TTL 5 minutes

GET /api/restaurants/:id/live-status:

- Return: is_open, current_wait_time, available_tables, queue_length, accepting_delivery
- No cache — must be real-time

GET /api/recommendations/personalized (requires auth):

- Fetch user's last 10 orders, extract: restaurant_ids, cuisine_types, dietary_prefs, price_range
- Score nearby restaurants by preference match
- Return top 10 personalized picks with match_reason text

### 🎨 FRONTEND PROMPT: Restaurant Profile & Menu Page

Tags: #RestaurantProfile #Menu #Gallery
Build the Restaurant Profile page in the customer app.
Hero Section:

- Full-width banner image (parallax scroll effect)
- Restaurant name overlaid on banner (bottom-left, white text + shadow)
- Rating badge, cuisine chip, distance

Info Row (below hero):

- Average cost per person | Delivery time | Open/Closed status
- 'More Info' expands: full address, phone, operating hours table

Action Buttons Row:

- 📅 Book Table | 🧍 Join Queue | 🛵 Order Delivery | 📞 Call
- Primary button highlights based on restaurant availability

Photo Gallery Tab:

- Grid of restaurant and dish photos
- Tap opens full-screen lightbox with swipe navigation

Menu Tab (main section):

## → Use the customer-facing digital menu component from M6

- Add to Cart → Cart icon in header updates with count badge

Reviews Tab:

- Summary: star rating distribution bar chart
- Reviews list: photo, rating, comment, dish photos if attached
- Each review shows which dishes were rated

Bottom: Sticky 'View Cart' bar when cart has items

### ⚙️ BACKEND PROMPT: Table Booking API — Conflict Prevention & Validation

Tags: #Booking #Locking #Validation
Build the table booking API with race condition prevention.
POST /api/bookings:

- body: { branch_id, table_id (optional), people_count, arrival_time, special_requests }
- arrival_time: must be during operating hours, min 30 min in future

Double-booking prevention (CRITICAL):

- Use PostgreSQL SELECT ... FOR UPDATE with transaction:

BEGIN;
SELECT id FROM tables WHERE id=? AND status='free' FOR UPDATE;
-- If no row returned: table not available → ROLLBACK + 409 error
INSERT INTO bookings (...);
UPDATE tables SET status='reserved' WHERE id=?;
COMMIT;
If no specific table requested (people_count booking):

- Find smallest available table that fits the party:

SELECT id FROM tables WHERE branch_id=? AND status='free'
AND capacity >= people_count ORDER BY capacity ASC LIMIT 1 FOR UPDATE
After successful booking:

- Send booking confirmation: push notification + SMS (Twilio)
- Schedule reminder: create Bull job for 1-hour-before reminder
- Emit 'new_booking' WebSocket to Host room

PATCH /api/bookings/:id/cancel:

- Check cancellation policy (hours_before_allowed from restaurant settings)
- Release table back to 'free', update booking status='cancelled'
- Initiate refund if payment was made (add to refund queue)

### 🎨 FRONTEND PROMPT: Customer Order Tracking & Live Status

Tags: #Tracking #LiveStatus #Map
Build the Order Tracking screen for the customer app.
For DINE-IN orders (in restaurant):

- Step progress bar at top: Received → Preparing → Ready → Served
- Current step highlighted with animated pulse
- Items list below: each item has its own status indicator (Pending / Preparing / Ready / Served)
- 'Add More Items' button (opens QR menu or browses menu)
- 'Call Waiter' button: sends 'customer_call' WebSocket event to waiter

For DELIVERY orders:

- Map screen: react-native-maps with:
- Restaurant pin (pickup point)
- Delivery partner animated pin (live location — updates every 5s)
- Your delivery address pin
- Route line drawn between current location and destination
- ETA displayed prominently above map
- Delivery partner: name, photo, vehicle number, masked phone
- Status steps: Order Placed → Preparing → Picked Up → On the Way → Delivered

WebSocket: customer joins 'order:{orderId}' room

- Receives: status updates, location updates
- On status change: step progress auto-advances with animation

Push notification fallback: if app is in background

### 🎨 FRONTEND PROMPT: Customer Payment & Item-Level Rating UI

Tags: #Payment #Rating #Receipt
Build the Payment and Rating flow for the customer app.
Payment Screen (for self-pay at table):

- Bill summary: itemized table with quantities and prices
- Tax breakdown, service charge, grand total
- Payment method selector: UPI | Card | Wallet | Pay at Counter
- UPI: show QR + UPI app deep links (GPay, PhonePe, Paytm logos)
- Card: direct payment gateway webview (Razorpay/Stripe checkout)

Split with Friends:

- 'Split Bill' button → enter number of people
- Show per-person amount
- 'Share Link' button: generates shareable link so each person pays their portion via the app

On Payment Success:

- Full-screen success animation (Lottie confetti or checkmark)
- 'Receipt saved to your account' message
- 'Rate your experience?' prompt slides up after 1.5 seconds

Rating Modal (post-payment):

- Overall restaurant rating (1-5 stars)
- Item-level section: each ordered dish with its own 1-5 star selector
- Text review box (optional, min 10 chars if filled)
- Photo upload: attach up to 3 photos from camera/gallery
- 'Skip' and 'Submit Review' buttons

If skipped: show 'Rate past orders' in profile Order History

### 🎨 FRONTEND PROMPT: Customer Profile — Account, History, Support

Tags: #Profile #OrderHistory #Support
Build the Customer Profile screen.
Profile Header:

- Profile photo (tappable to change, camera or gallery)
- Name, phone, email
- Loyalty points balance badge (gold color)

Editable Info Section:

- All fields editable inline (tap → input appears in place)
- Phone change: requires OTP verification
- Email change: requires OTP verification on new email
- 'Save Changes' button appears when any field is modified

Order History Section:

- Filter tabs: All | Dine-in | Delivery | Cancelled
- Sort: Latest First (default) / Oldest First / Restaurant
- Each order card: restaurant name, items preview, total, date, status badge
- Order status: Completed (green) | Cancelled (red) | In Progress (blue)
- Tap order: expand to show full itemized details
- If unrated: 'Rate This Order' chip on the card
- 'Reorder' button: adds all items to cart for same restaurant

Saved Addresses: list with 'Home', 'Work', custom labels. Add/Edit/Delete.
Support Section:

- 'Start Chat' → AI chatbot for common queries
- 'Refund Status' → shows refund tracker for any pending refunds
- 'Terms & Conditions' → links to policy page

Logout Button: red background, full width, at very bottom

- On press: confirmation dialog → clear JWT + navigate to Login

## 🛵 M18 — DELIVERY PARTNER MODULE

Delivery assignment, live location tracking, earnings dashboard

### 🎨 FRONTEND PROMPT: Delivery Partner App Interface

Tags: #Delivery #Maps #Earnings
Build the Delivery Partner mobile app.
Home Screen — Go Online/Offline toggle (large, prominent)
Delivery Card (when assigned):

- ORDER card: restaurant name + address (PICKUP), customer address (DROP)
- Distance, estimated time, earning for this delivery
- 'Accept' and 'Decline' buttons (decline = reassign to another partner)
- Countdown timer: 30 seconds to accept or auto-declined

Active Delivery Screen:

- Full-screen map with route (Google Maps or Mapbox)
- Current step indicator: 'Go to Restaurant' | 'Picked Up — Go to Customer'
- Restaurant address card with 'Navigate' button
- Customer details: name, masked phone, delivery address
- Status buttons: 'Mark as Picked Up' | 'Mark as Delivered'
- 'Call Customer' button (in-app masked call)

Earnings Dashboard:

- Today's earnings, total deliveries today
- Weekly earnings bar chart
- Delivery history list with date, restaurant, earning, rating

Location Sharing:

- When delivery is active: start GPS polling every 5 seconds
- Send to: POST /api/delivery/location
- Stop when delivery is marked complete or partner goes offline

### ⚡ WEBSOCKET PROMPT: Delivery Partner Live Location WebSocket

Tags: #WebSocket #GPS #RealTime
Implement the delivery partner live location real-time system.
Socket.io Rooms:

- Partner joins: 'delivery:{deliveryId}' room on accepting delivery
- Customer joins: 'delivery:{deliveryId}:tracking' room on order screen

Location Update Flow:
1. Partner app POSTs location: POST /api/delivery/location
body: { delivery_id, lat, lon, heading, speed }
2. Server updates last_location in delivery_partners table
3. Server emits 'location_update' to 'delivery:{deliveryId}:tracking' room
payload: { lat, lon, heading, eta_minutes }
4. Customer map pin animates to new location smoothly
Throttling:

- Accept max 1 location update per 5 seconds per partner
- Use Redis key 'location_throttle:{partnerId}' with 5s TTL
- If key exists: drop the update (don't process, don't emit)

ETA Calculation:

- On each location update: calculate ETA using Google Maps Distance API
- Or use: straight-line Haversine distance ÷ avg_speed estimate

Auto-Stop Location on Completion:

- When order status becomes 'delivered': emit 'delivery_complete'
- Client app stops GPS polling on this event

Battery optimization:

- Reduce polling to every 15s when partner is stationary (speed < 2 km/h for > 30s)

### ⚙️ BACKEND PROMPT: Delivery Assignment & Management API

Tags: #Delivery #Assignment #Notifications
Build the delivery management API.
POST /api/delivery/assign (internal — called when order type=delivery):

- Find nearest available delivery partner:

SELECT dp.id, ST_Distance(dp.location, restaurant.location) as dist
FROM delivery_partners dp WHERE dp.is_online=true
AND dp.active_delivery_id IS NULL
ORDER BY dist ASC LIMIT 1

- Create delivery record, assign partner
- Send push notification + WebSocket to partner: show order card
- Start 30-second acceptance timer (Bull delayed job)
- If not accepted: reassign to next nearest partner

PATCH /api/delivery/:id/status:

- allowed transitions: assigned→accepted, accepted→picked_up, picked_up→delivered
- On 'picked_up': notify customer 'Your order has been picked up!'
- On 'delivered': update order status='delivered', trigger payment release to partner (if COD) send rating request push to customer

Phone Number Masking:

- Use virtual number proxy (Exotel/Twilio Proxy) for calls
- Neither customer nor partner sees each other's real number
- Log all call durations for dispute resolution

### 🎨 FRONTEND PROMPT: Delivery Partner Earnings & History

Tags: #Earnings #History #Stats
Build the Delivery Partner earnings and performance dashboard.
Earnings Summary Section:

- Balance card: pending payout amount (large, prominent)
- 3 stat chips: Today | This Week | This Month earnings
- Bar chart: last 7 days earnings (daily bars)

Performance Stats:

- Acceptance rate (%), avg delivery time, total deliveries
- Customer rating (out of 5, with star display)

Delivery History List (paginated):

- Each entry: date, restaurant name, delivery address (truncated), distance, earning, customer rating (if given), duration
- Filter: by date range

Payout Section:

- Payout schedule (e.g., 'Every Monday')
- Bank account details (masked: ****1234)
- Payout history: list of past payouts with dates and amounts

Tech: React Native + Recharts for bar chart

## ⚡ M19 — REAL-TIME WEBSOCKET SYSTEM

Complete Socket.io architecture, rooms, events, and scaling

### ⚡ WEBSOCKET PROMPT: Socket.io Server Architecture Setup

Tags: #SocketIO #Rooms #Authentication
Set up the complete Socket.io server for Restaurant OS.
Installation & Setup:

- npm install socket.io @socket.io/redis-adapter ioredis
- Attach Socket.io to your Express HTTP server

Authentication Middleware (REQUIRED for all connections):
io.use(async (socket, next) => {
const token = socket.handshake.auth.token;
if (!token) return next(new Error('Auth required'));
const user = await verifyJWT(token);
if (!user) return next(new Error('Invalid token'));
socket.user = user;  // attach user to socket
next();
});
Room Auto-Join Logic on Connection:

- All staff: join 'branch:{branchId}'
- Manager: join 'branch:{branchId}:manager'
- Kitchen: join 'branch:{branchId}:kitchen'
- Cashier: join 'branch:{branchId}:cashier'
- Waiters: join 'branch:{branchId}:waiters'
- Host: join 'branch:{branchId}:host'
- Customer with booking: join 'booking:{bookingId}'
- Customer with order: join 'order:{orderId}'

Redis Adapter (for multi-server scaling):
const pubClient = new Redis({ host, port });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

- This ensures events work across multiple Node.js instances

### ⚡ WEBSOCKET PROMPT: Complete WebSocket Event Reference Implementation

Tags: #Events #Rooms #Payloads
Implement all WebSocket events for the Restaurant OS platform.
// ORDER EVENTS
order_created → 'branch:{id}:kitchen' + 'branch:{id}:cashier'
payload: { order_id, table_label, items[], total, waiter_name }
order_cancelled → 'branch:{id}:kitchen' + customer order room
payload: { order_id, reason }
kitchen_status_updated → 'branch:{id}:waiters' + customer order room
payload: { order_id, item_ids[], new_status, table_label }
food_ready → 'branch:{id}:waiters' (specific waiter filtered client-side)
payload: { order_id, table_label, waiter_id, items_ready[] }
// TABLE EVENTS
table_status_changed → 'branch:{id}' (all staff)
payload: { table_id, table_label, old_status, new_status, floor }
// QUEUE EVENTS
queue_updated → 'branch:{id}:host' + individual customer booking rooms
payload: { queue_id, position, estimated_wait, branch_id }
arrival_detected → 'branch:{id}:host'
payload: { queue_id, customer_name, party_size, booking_id }
// PAYMENT EVENTS
payment_confirmed → 'branch:{id}' (all staff)
payload: { order_id, table_id, amount, method, table_label }
// ALERT EVENTS
inventory_low → 'branch:{id}:manager'
payload: { item_name, current_qty, threshold, branch_id }
overdue_order → 'branch:{id}:kitchen' + 'branch:{id}:manager'
payload: { order_id, table_label, minutes_elapsed }
customer_call_waiter → specific waiter socket
payload: { table_id, table_label, message }

### ⚡ WEBSOCKET PROMPT: WebSocket Client — React Native Implementation

Tags: #Client #Reconnection #Hooks
Implement the Socket.io client for the React Native app.
Installation: npm install socket.io-client
Custom Hook — useSocket():
const socket = io(SERVER_URL, {
auth: { token: await AsyncStorage.getItem('access_token') },
transports: ['websocket'],  // skip polling for mobile
reconnection: true,
reconnectionDelay: 1000,
reconnectionAttempts: 10,
});
Connection lifecycle:

- socket.on('connect'): update UI to 'Live' status indicator
- socket.on('disconnect'): show 'Reconnecting...' banner
- socket.on('connect_error'): if JWT expired → refresh token, reconnect

Auto Token Refresh on Auth Error:
socket.on('connect_error', async (err) => {
if (err.message === 'Invalid token') {
const newToken = await refreshAccessToken();
socket.auth.token = newToken;
socket.connect();
}
});
Cleanup on screen unmount:
useEffect(() => {
return () => { socket.off('order_created'); socket.disconnect(); }
}, []);
Platform-specific: use BackgroundFetch for delivery partner location
updates when app is backgrounded (iOS background modes)

### ⚡ WEBSOCKET PROMPT: WebSocket Scaling & Performance

Tags: #Scaling #Redis #Performance
Design the WebSocket infrastructure for high traffic and scaling.
Problem: Single Socket.io server can handle ~50,000 connections
Solution: Horizontal scaling with Redis pub/sub adapter
Load Balancer Configuration (Nginx):

- Enable sticky sessions (ip_hash) so same client hits same server
- Or: use Redis adapter which handles cross-server events automatically

Event Throttling (protect against event floods):

- Location updates: throttle per partner (1 per 5 seconds)
- Dashboard stats: batch updates every 2 seconds (don't emit per event)
- Queue position: debounce 500ms (multiple quick updates = 1 emit)

Room Management Best Practices:

- Auto-leave rooms on disconnect (Socket.io does this automatically)
- Name rooms descriptively: 'branch:{id}:kitchen' not 'kitchen1'
- Never emit to entire server (io.emit) — always target specific rooms

Connection Limits:

- Max 1 active socket per user session (disconnect old on new connect)
- Store socket_id in Redis: 'socket:{userId}' → socket_id, TTL=session

Monitoring:

- Track: io.engine.clientsCount (total connections)
- Log event types and frequencies for capacity planning
- Alert: if connections > 80% of server capacity

### ⚡ WEBSOCKET PROMPT: Notification Push System — FCM & SMS Integration

Tags: #FCM #Twilio #Notifications
Build the push notification and SMS system as fallback for WebSocket.
Firebase Cloud Messaging (FCM) Setup:

- npm install firebase-admin
- Store device FCM tokens in users.device_tokens[] array
- Update token on every app login

Notification Service Class:
sendPush(userId, title, body, data):

- Fetch device_tokens for userId from DB
- Use FCM multicast for users with multiple devices
- Handle token expiry: remove invalid tokens from DB on FCM error

Priority Levels:

- CRITICAL (food ready, payment confirmed): priority='high', sound=true
- INFO (booking reminder, order status): priority='normal'
- SILENT (data sync): priority='normal', content_available=true

SMS via Twilio (for India: MSG91):

- Send SMS for: booking confirmations, OTPs, staff credentials
- Use templates for SMS content (pre-approved DLT templates for India)

Notification Preferences:

- Users can opt out of: promotional, reminders, status updates
- Respect opt-outs in notification service before sending

Notification History:

- Store all sent notifications in notifications table
- Customer can view notification history in profile

### ⚡ WEBSOCKET PROMPT: Real-Time Queue Position Calculator

Tags: #Queue #Algorithm #WebSocket
Implement the real-time queue position and wait time calculator.
Queue Position Update Trigger:

- Any of these events cause a queue recalculation:
- New customer joins queue
- Customer is assigned a table (removed from queue)
- No-show auto-removal
- Manual removal by Host

Wait Time Estimation Algorithm:
const calculateWaitTime = (position, branchId) => {
// avg_table_turn_time: avg time from seated to table cleaning
// free_tables: tables currently in 'free' status
// tables_finishing_soon: occupied tables > avg_turn_time × 0.7
const imminentFreeTables = freeNow + tablesFinishingSoon;
if (position <= imminentFreeTables) return '5-10 minutes';
const extraWaits = position - imminentFreeTables;
return extraWaits × avgTurnTime + ' minutes (estimated)';
};
Broadcast on Queue Change:

- Recalculate positions for ALL remaining queue members
- Emit 'queue_position_update' to each member's booking room: payload: { new_position, estimated_wait, queue_id }

Customer receives this event and updates their tracking screen

- Position number and wait time animate to new values

## 🤖 M20 — AI & SMART FEATURES

Recommendations, geo-fencing, chatbot, demand prediction, analytics AI

### 🤖 AI / ML PROMPT: AI Restaurant Recommendation Engine

Tags: #ML #Recommendations #Personalization
Build the AI-powered restaurant recommendation engine.
Phase 1 — Rule-Based (launch version):
Score each restaurant using weighted factors:

- distance_score = 1 - (distance_km / max_radius)
- rating_score = avg_rating / 5
- popularity_score = orders_last_7d / max_orders_any_restaurant
- final_score = 0.4 × distance + 0.35 × rating + 0.25 × popularity
- If user has dietary_prefs: add 0.2 bonus for matching restaurants

Phase 2 — Collaborative Filtering:

- Build user-item matrix: users × restaurants, value = visit frequency
- Find similar users: cosine similarity on visit patterns
- Recommend restaurants liked by similar users but not yet visited
- Use scikit-learn (Python microservice) or simple JS implementation

Time-Aware Recommendations:

- 6am–11am: weight breakfast places higher
- 12pm–3pm: fast-casual and lunch spots
- 7pm–11pm: fine dining and full service restaurants

Weather-Aware (Phase 3):

- Integrate OpenWeatherMap API
- Rainy day: boost comfort food (soups, hot drinks, delivery)
- Hot day: boost cold desserts, light salads

API: GET /api/recommendations/personalized
Returns: restaurants with 'match_reason' text (shown to user in UI)

### 🤖 AI / ML PROMPT: Geo-Fencing Arrival Detection System

Tags: #GeoFencing #GPS #Haversine
Build the geo-fencing arrival detection system.
Customer App — Background Location Monitoring:

- Only activate when customer has an ACTIVE booking
- React Native: use react-native-background-geolocation library
- Configuration:
- distanceFilter: 20 (meters — only update if moved 20m)
- stopOnTerminate: false (works even when app closed)
- startOnBoot: false (only when active booking exists)

Arrival Detection Logic (client-side):
const haversineDistance = (lat1, lon1, lat2, lon2) => {
const R = 6371000; // Earth radius in meters
const dLat = (lat2-lat1) * Math.PI/180;
const dLon = (lon2-lon1) * Math.PI/180;
const a = Math.sin(dLat/2)² + Math.cos(lat1°) × Math.cos(lat2°) × Math.sin(dLon/2)²;
return R × 2 × Math.atan2(√a, √(1-a));
};

- If distance < 150m AND booking status != 'arrived':

Show prompt: 'You seem to be near [Restaurant]. Mark as arrived?'

- User taps 'Yes' → POST /api/queue/:id/mark-arrived
- User taps 'Later' → re-prompt after 3 minutes if still within range

Battery Optimization:

- Poll every 60s when booking > 2 hours away
- Poll every 30s when booking < 60 minutes away
- Poll every 15s when booking < 15 minutes away
- Stop all polling after arrival confirmed or booking cancelled

### 🤖 AI / ML PROMPT: AI Customer Support Chatbot

Tags: #Chatbot #NLP #Escalation
Build the AI chatbot for customer support.
Architecture:

- Phase 1: Rule-based intent detection (fast, no AI API cost)
- Phase 2: Integrate OpenAI GPT-4o-mini API for complex queries

Phase 1 — Intent Detection Rules:

- If message contains: 'order status', 'where is my order', 'tracking'
- Fetch order status from DB, respond with current status
- If contains: 'cancel', 'refund', 'wrong order', 'complaint', 'damaged'
- Escalate to human agent immediately
- If contains: 'menu', 'what do you serve', 'food items'
- Respond with link to restaurant menu page
- If contains: 'booking', 'reservation', 'table'
- Respond with booking status from DB

Escalation Flow:

- When escalating: create support_ticket with conversation history
- Notify available human agent via push notification
- Agent sees full chat history for context
- Response SLA: 5 minutes (send alert if no agent responds)

Context Awareness:

- Fetch customer's recent orders, active bookings on session start
- Include in prompt: 'Customer has order #{id} from {restaurant}'
- Bot can answer 'Is my order from Barbeque Nation ready?' without customer having to provide order ID

Table: support_tickets

- ticket_id, user_id, restaurant_id, conversation_json, status (open/assigned/resolved), agent_id, created_at

### 🤖 AI / ML PROMPT: Demand Prediction & Staffing Optimization

Tags: #ML #Prediction #Staffing
Build the demand prediction and smart staffing suggestion system.
Prediction Model:

- Use historical order data: SELECT * FROM orders WHERE branch_id=? AND created_at > NOW() - INTERVAL '90 days'
- Features: day_of_week, hour, is_holiday, weather (optional)
- Target: order_count per hour slot

Simple Linear Regression approach (no ML library needed):

- Group by: (day_of_week, hour)
- Calculate: avg_orders and max_orders for each slot
- Next 7 days prediction: use same day-of-week historical average
- Adjust for: upcoming holidays (+20% factor)

Staffing Recommendation Algorithm:
const getRecommendedStaff = (predicted_orders) => {
const waiters = Math.ceil(predicted_orders / 15);  // 1 waiter per 15 orders
const chefs = Math.ceil(predicted_orders / 20);    // 1 chef per 20 orders
const cashiers = Math.ceil(predicted_orders / 40); // 1 cashier per 40 orders
return { waiters, chefs, cashiers };
};
Manager Notification:

- Every Sunday 8pm: send weekly preview to managers
- 'This Saturday dinner (7-10pm) is predicted to be BUSY.', 'Recommended: 5 waiters, 3 chefs. Currently scheduled: 3 waiters, 2 chefs.'
- Include: 'Based on last 4 Saturdays average performance'
- Action button: 'Update Schedule' links to shift planner

### 🤖 AI / ML PROMPT: Sentiment Analysis on Reviews

Tags: #NLP #Sentiment #Reviews
Build automated sentiment analysis for customer and staff reviews.
For Customer Reviews:

- On every new review submission, queue sentiment analysis job in Bull

Sentiment Analysis (3 approaches, choose based on budget):
Option A — Simple keyword scoring (free, fast):

- Positive words: ['amazing', 'great', 'excellent', 'loved', 'perfect', ...]
- Negative words: ['terrible', 'awful', 'worst', 'disgusting', 'cold', ...]
- Score = positive_count - negative_count
- > 0: Positive | 0: Neutral | < 0: Negative

Option B — Hugging Face Inference API (low cost):

- Use 'distilbert-base-uncased-finetuned-sst-2-english' model
- POST https://api-inference.huggingface.co/models/...
- Returns: { label: 'POSITIVE', score: 0.95 }

Option C — OpenAI API (highest accuracy):

- Prompt: 'Classify sentiment as positive/neutral/negative: {review}'
- Also extract: main_topic (food/service/ambiance/value)

Store result: reviews.sentiment_label, reviews.sentiment_score
For Staff Anonymous Feedback:

- Same pipeline — categorize as positive/neutral/negative
- Branch sentiment score = avg of all recent staff reviews
- Trigger admin alert if branch drops below 40% positive

### 🤖 AI / ML PROMPT: Smart Waiter Workload Balancing Algorithm

Tags: #Algorithm #WorkloadBalance #Assignment
Implement the smart waiter assignment and workload balancing system.
Data Required:

- Table: waiter_workload (real-time state) waiter_id, active_tables, active_orders, pending_items_to_serve

Assignment Algorithm (runs when new table needs a waiter):
Step 1 — Calculate workload score for each active waiter:
score = (active_tables × 3) + (active_orders × 1) + (pending_serves × 0.5)
Step 2 — Find waiter with lowest score:
SELECT w.id, w.name,
(COUNT(DISTINCT t.id) × 3 + COUNT(DISTINCT o.id) + COUNT(DISTINCT oi.id) × 0.5) as score
FROM staff w
LEFT JOIN tables t ON t.assigned_waiter = w.id AND t.status='occupied'
LEFT JOIN orders o ON o.waiter_id = w.id AND o.status IN ('confirmed','preparing')
LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.status='ready'
WHERE w.branch_id=? AND w.role='waiter' AND w.is_active=true
GROUP BY w.id ORDER BY score ASC LIMIT 1
Step 3 — Assign and update:

- Update table.assigned_waiter_id
- Increment waiter_workload.active_tables
- Emit 'table_assigned' WebSocket event to that specific waiter

Workload Updates:

- Table seated: +3 to waiter score
- Table cleared: reset all score components for that table
- Order sent to kitchen: +1 per item
- Items served: -0.5 per item

### 🤖 AI / ML PROMPT: Table Preference Memory & Personalization

Tags: #Personalization #UX #Memory
Build the table preference memory and customer personalization system.
Table Preference Storage:
Table: customer_preferences

- user_id UUID
- branch_id UUID
- preferred_table_id UUID REFERENCES tables(id)
- preferred_table_label VARCHAR(10)
- times_selected INTEGER DEFAULT 1
- last_selected TIMESTAMP
- PRIMARY KEY (user_id, branch_id)

Trigger for Remembering:

- After customer successfully dines at a specific table:

Show prompt: 'Remember Table T3 as your preferred table at [Branch]?'

- On 'Yes': INSERT or UPDATE customer_preferences

Auto-Apply on Next Booking:

- POST /api/bookings: check customer_preferences for this branch
- If preferred_table_id exists AND table is available for selected time:
- Pre-select it and show: 'We remembered your favourite table — T3!'
- Customer can override this

Dietary Profile System:
Table: user_dietary_profiles

- user_id, preferences TEXT[] (vegan/gluten_free/halal/jain/nut_allergy...)
- allergies TEXT[]
- When customer opens menu: filter warning if item contains allergen
- Show '⚠️ Contains nuts' on item card if user has nut allergy
- Pre-apply dietary filter on menu load based on primary preference

### 🤖 AI / ML PROMPT: Inventory Auto-Deduction & Waste Analytics

Tags: #Inventory #Analytics #Prediction
Build the automated inventory deduction and waste tracking system.
Ingredient-to-Menu Mapping (setup by manager):
Table: recipe_ingredients

- menu_item_id, ingredient_id, quantity_per_serving, unit

Example: Butter Chicken requires: chicken 200g, butter 30g, cream 50ml
Auto-Deduction Trigger:

- On POST /api/orders: call deductInventory(branch_id, order_items)
- For each order_item:

SELECT ri.ingredient_id, ri.quantity_per_serving × order_item.quantity
FROM recipe_ingredients ri WHERE ri.menu_item_id = ?

- UPDATE inventory_items SET current_quantity = current_quantity - deduct_amount
- After batch update: check thresholds, emit alerts if needed

Waste Tracking:

- Staff can log waste: POST /api/inventory/waste-log body: { ingredient_id, quantity_wasted, reason: 'expired'|'spilled'|'overprep' }

Waste Analytics Report (for manager):

- Total waste per ingredient per week
- Waste cost: quantity_wasted × ingredient_cost_per_unit
- Waste reasons breakdown (pie chart)
- 'High waste items' flag: items where waste > 15% of usage

Purchase Prediction:

- Based on: avg daily usage × 7 = weekly_need
- Suggest reorder: current_stock < weekly_need × 1.5
- 'Predicted stockout in 3 days for Chicken' type alerts

## 🗄️ M21–M22 — DATABASE & API ARCHITECTURE

Full schema design, indexing, query optimization, and API patterns

### 🗄️ DATABASE PROMPT: Complete Core Database Schema

Tags: #PostgreSQL #Schema #Normalization
Design the complete PostgreSQL database for Restaurant OS.
EXTENSIONS TO ENABLE:
CREATE EXTENSION IF NOT EXISTS 'uuid-ossp';  -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS 'postgis';     -- for geo queries
CREATE EXTENSION IF NOT EXISTS 'pg_trgm';     -- for full-text search
ENUMS:
CREATE TYPE user_role AS ENUM ('super_admin','owner','manager','host',
'waiter','chef','cashier','customer','delivery_partner','support');
CREATE TYPE table_status AS ENUM ('free','reserved','occupied','cleaning','maintenance');
CREATE TYPE order_status AS ENUM ('created','confirmed','preparing','ready','served','paid','closed');
CREATE TYPE booking_status AS ENUM ('pending','confirmed','arrived','seated','no_show','cancelled');
PRIMARY TABLES:

- users (id, name, email, phone, password_hash, role, restaurant_id, branch_id, profile_pic_url, dob, gender, address, is_active, force_password_change, created_by_restaurant, created_at)
- restaurants (id, name, owner_id FK, cuisine_type, gst_number, status, created_at)
- branches (id, restaurant_id FK, name, address, lat, lon, manager_id FK, operating_hours JSONB, is_active)
- tables (id, branch_id FK, label, capacity, floor_number, shape, zone, photo_url, status, x_pos, y_pos)
- menu_categories (id, branch_id FK, name, description, display_order, is_active)
- menu_items (id, category_id FK, branch_id FK, name, description, price, discounted_price, photo_url, dietary_tags TEXT[], allergens TEXT[], prep_time_minutes, availability JSONB, addons JSONB, status ENUM, display_order)
- orders (id, table_id FK, customer_id FK, waiter_id FK, branch_id FK, order_type, status, special_instructions, created_at, paid_at)
- order_items (id, order_id FK, menu_item_id FK, quantity, unit_price, notes, addons JSONB, status ENUM, prepared_at, served_at)
- bookings (id, user_id FK, branch_id FK, table_id FK, people_count, arrival_time, status, source, preferred_table_remembered, special_requests, created_at)
- queue (id, branch_id FK, user_id FK, people_count, position, status, source, arrived_at, seated_at, created_at)
- payments (id, order_id FK, amount, method, status, transaction_ref, receipt_url, coupon_id FK, created_at)
- reviews (id, user_id FK, restaurant_id FK, branch_id FK, order_id FK, overall_rating, text_review, sentiment_label, photos TEXT[], item_ratings JSONB, created_at)
- inventory_items (id, branch_id FK, ingredient_name, unit, current_quantity, reorder_threshold, last_updated)
- notifications (id, user_id FK, title, body, type, is_read, reference_id, reference_type, created_at)
- audit_log (id, actor_id FK, action, target_type, target_id, old_value JSONB, new_value JSONB, ip_address, created_at)

### 🗄️ DATABASE PROMPT: Database Indexing Strategy

Tags: #Performance #Indexes #QueryOptimization
Create all necessary indexes for Restaurant OS performance.
Rule: Index columns used in WHERE, JOIN ON, ORDER BY, GROUP BY
// users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_restaurant ON users(restaurant_id, branch_id);
CREATE INDEX idx_users_role ON users(role, is_active);
// orders table (most queried table in the system)
CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);
CREATE INDEX idx_orders_table ON orders(table_id) WHERE status != 'closed';
CREATE INDEX idx_orders_waiter ON orders(waiter_id) WHERE status IN ('confirmed','preparing');
CREATE INDEX idx_orders_created ON orders(branch_id, created_at DESC);
CREATE INDEX idx_orders_customer ON orders(customer_id);
// tables table
CREATE INDEX idx_tables_branch_status ON tables(branch_id, status);
CREATE INDEX idx_tables_branch_floor ON tables(branch_id, floor_number);
// bookings table
CREATE INDEX idx_bookings_branch_arrival ON bookings(branch_id, arrival_time)
WHERE status IN ('pending','confirmed','arrived');
CREATE INDEX idx_bookings_user ON bookings(user_id, status);
// queue table
CREATE INDEX idx_queue_branch_status ON queue(branch_id, status, position);
// menu_items table
CREATE INDEX idx_menu_branch_status ON menu_items(branch_id, status);
CREATE TSVECTOR INDEX idx_menu_search ON menu_items
USING gin(to_tsvector('english', name || ' ' || description));
// reviews table
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id, created_at DESC);
CREATE INDEX idx_reviews_branch ON reviews(branch_id);
// Partial indexes (only index rows you'll query):
CREATE INDEX idx_active_staff ON users(branch_id, role)
WHERE is_active=true AND role IN ('waiter','chef','cashier','host');

### 🗄️ DATABASE PROMPT: Database Query Optimization Patterns

Tags: #QueryOptimization #N+1 #BatchQueries
Implement these query optimization patterns throughout the app.
Anti-Pattern 1 — N+1 Query Problem:
❌ BAD: Loop through orders, then fetch waiter for each order
✅ GOOD: Single JOIN query:
SELECT o.*, u.name as waiter_name, u.phone as waiter_phone
FROM orders o JOIN users u ON o.waiter_id = u.id
WHERE o.branch_id = ? AND o.status = 'confirmed'
Anti-Pattern 2 — Full Table Scans:
❌ BAD: SELECT * FROM orders WHERE DATE(created_at) = TODAY
✅ GOOD: Use index-friendly range query:
WHERE created_at >= '2025-01-15 00:00:00'
AND created_at < '2025-01-16 00:00:00'
Batch Insert Pattern (for order_items):
❌ BAD: INSERT in a loop (N queries)
✅ GOOD: Unnest array for single INSERT:
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
SELECT $1, * FROM unnest($2::uuid[], $3::int[], $4::numeric[])
Materialized Views for Analytics (refresh hourly):
CREATE MATERIALIZED VIEW mv_branch_daily_stats AS
SELECT branch_id, DATE(created_at) as date,
COUNT(*) as order_count, SUM(p.amount) as revenue
FROM orders o JOIN payments p ON o.id = p.order_id
WHERE p.status = 'completed'
GROUP BY branch_id, DATE(created_at);
CREATE UNIQUE INDEX ON mv_branch_daily_stats(branch_id, date);
-- Refresh command: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_branch_daily_stats

### 🗄️ DATABASE PROMPT: Row-Level Security & Multi-Tenant Data Isolation

Tags: #RLS #Security #MultiTenant
Implement Row-Level Security to enforce multi-tenant data isolation.
Why RLS: Even if a bug bypasses application-level auth checks,
PostgreSQL enforces that staff CANNOT see other restaurants' data.
Step 1 — Enable RLS on sensitive tables:
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
Step 2 — Create policies:
-- Staff can only see their own branch's orders
CREATE POLICY orders_branch_isolation ON orders
FOR ALL TO app_user
USING (branch_id = current_setting('app.current_branch_id')::uuid);
Step 3 — Set context variable from JWT on every connection:
-- In Express middleware, after JWT verification:
await db.query('SET app.current_restaurant_id = $1', [user.restaurant_id]);
await db.query('SET app.current_branch_id = $1', [user.branch_id]);
Step 4 — Admin bypass:
CREATE POLICY admin_bypass ON orders
FOR ALL TO admin_role USING (true); -- admins see everything
Test RLS policies:
SET ROLE app_user;
SET app.current_branch_id = 'branch-uuid-1';
SELECT COUNT(*) FROM orders; -- should only return branch-1 orders

### ⚙️ BACKEND PROMPT: RESTful API Architecture & Design Standards

Tags: #API #Standards #Versioning
Define the API architecture standards for Restaurant OS.
URL Structure: /api/v1/{resource}
Version in URL (not header) for simplicity
Response Format (ALL endpoints must follow this):
{
'success': true,
'data': { ... },       // actual response payload
'meta': {              // pagination info when applicable
'page': 1, 'limit': 20, 'total': 150, 'pages': 8
},
'message': 'Order created successfully'
}
Error Response Format:
{
'success': false,
'error': {
'code': 'VALIDATION_ERROR',   // machine-readable
'message': 'Email is required', // human-readable
'field': 'email'              // for form validation
}
}
HTTP Status Codes:

- 200: Success (GET, PATCH, PUT)
- 201: Created (POST)
- 204: Deleted (DELETE — no body)
- 400: Validation error
- 401: Not authenticated (no/invalid JWT)
- 403: Authenticated but not authorized (wrong role)
- 404: Resource not found
- 409: Conflict (double booking, duplicate email)
- 422: Business logic error (e.g., table is occupied)
- 429: Rate limit exceeded
- 500: Internal server error (never expose stack trace in production)

Middleware Stack (in order):
1. helmet() — security headers
2. cors() — restrict to allowed origins
3. rateLimit() — per-IP limits
4. express.json({ limit: '2mb' }) — parse body
5. authenticateJWT() — verify token, inject req.user
6. authorizeRole(...roles) — check role
7. validateRequest(schema) — express-validator
8. route handler
9. errorHandler() — global error catcher

### ⚙️ BACKEND PROMPT: Caching Strategy with Redis

Tags: #Redis #Caching #Performance
Implement a comprehensive caching strategy for Restaurant OS.
Cache Layers (by data type):
1. Restaurant Branding — HIGH cache value

- Key: 'branding:{restaurantId}'
- TTL: 1 hour (branding rarely changes)
- Invalidate on: PATCH /branding

2. Menu Data — MEDIUM cache value

- Key: 'menu:{branchId}'
- TTL: 10 minutes
- Invalidate on: any menu item CRUD operation

3. Restaurant Nearby Search — MEDIUM cache value

- Key: 'nearby:{lat_rounded}:{lon_rounded}:{radius}'
- Round to 2 decimal places (approx 1km accuracy)
- TTL: 5 minutes

4. Admin Dashboard Stats — LOW refresh needed

- Key: 'admin:stats:{date}'
- TTL: 5 minutes

5. User Session Data — CRITICAL

- Key: 'session:{userId}'
- TTL: matches JWT expiry (15 min for access tokens)

6. OTP Codes — TIME CRITICAL

- Key: 'otp:{email}'
- TTL: 600 seconds (10 minutes)
- Delete on successful verification

Pattern for all cache reads:
const getWithCache = async (key, ttl, fetchFn) => {
const cached = await redis.get(key);
if (cached) return JSON.parse(cached);
const fresh = await fetchFn();
await redis.setex(key, ttl, JSON.stringify(fresh));
return fresh;
};

## 🔒 M23 — SECURITY & COMPLIANCE

JWT, rate limiting, input validation, OWASP, PCI compliance

### 🔒 SECURITY PROMPT: Complete Security Middleware Stack

Tags: #OWASP #Helmet #CORS
Implement the complete security middleware stack for Restaurant OS.
npm install helmet cors express-rate-limit express-validator
npm install hpp xss-clean mongo-sanitize (use xss for text sanitization)
Order of middleware (CRITICAL — order matters):
1. Helmet — HTTP Security Headers:
app.use(helmet({
contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
hsts: { maxAge: 31536000, includeSubDomains: true },
noSniff: true, xssFilter: true, hidePoweredBy: true
}));
2. CORS:
app.use(cors({
origin: ['https://yourapp.com', 'https://admin.yourapp.com'],
credentials: true,
methods: ['GET','POST','PATCH','PUT','DELETE'],
allowedHeaders: ['Content-Type', 'Authorization']
}));
3. Rate Limiting:
const generalLimit = rateLimit({ windowMs: 15*60*1000, max: 100 });
const authLimit = rateLimit({ windowMs: 15*60*1000, max: 10 });
const uploadLimit = rateLimit({ windowMs: 60*60*1000, max: 20 });
app.use('/api/', generalLimit);
app.use('/api/auth/', authLimit);
app.use('/api/upload/', uploadLimit);
4. Body Parsing with size limits:
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
5. XSS Protection (sanitize all string inputs):
app.use((req, res, next) => {
req.body = sanitizeObject(req.body); // recursive xss clean
next();
});

### 🔒 SECURITY PROMPT: Input Validation Schema — Critical Endpoints

Tags: #Validation #ExpressValidator #Sanitization
Implement input validation for all critical Restaurant OS endpoints.
Signup validation:
body('email').isEmail().normalizeEmail()
body('phone').matches(/^\+[1-9]\d{9,14}$/).withMessage('Invalid phone')
body('password').isLength({ min: 8 })
.matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])/)
.withMessage('Password needs uppercase, number, special char')
body('name').isLength({ min: 2, max: 50 }).trim().escape()
body('dob').isDate().isBefore(new Date().toISOString())
Order creation validation:
body('table_id').isUUID()
body('items').isArray({ min: 1, max: 50 })
body('items.*.menu_item_id').isUUID()
body('items.*.quantity').isInt({ min: 1, max: 99 })
body('items.*.notes').optional().isLength({ max: 200 }).trim().escape()
Booking validation:
body('arrival_time').isISO8601().isAfter(new Date().toISOString())
body('people_count').isInt({ min: 1, max: 20 })
body('branch_id').isUUID()
Payment validation:
body('order_id').isUUID()
body('method').isIn(['cash','card','upi','split'])
body('amount').isFloat({ min: 0.01 })
Validation error handler:
const validate = (req, res, next) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({
success: false, error: { code: 'VALIDATION_ERROR',
errors: errors.array() }
});
next();
};

### 🔒 SECURITY PROMPT: File Upload Security — S3 Integration

Tags: #FileUpload #S3 #Security
Implement secure file upload for restaurant logos, food photos, etc.
NEVER allow direct file uploads to your server — use S3 pre-signed URLs.
Flow:
1. Client requests upload URL: POST /api/upload/presigned-url
body: { file_type: 'restaurant_logo', content_type: 'image/png',
file_size: 1500000 }
2. Server validates and generates S3 pre-signed URL:

- Validate content_type: only allow ['image/jpeg','image/png','image/webp']
- Validate file_size: max 5MB for banners, 2MB for logos, 10MB for videos
- Generate key: '{restaurant_id}/{upload_type}/{uuid}.{ext}'
- Create S3 presigned PUT URL with 10-minute expiry: const url = await s3.getSignedUrl('putObject', {

Bucket: BUCKET_NAME, Key: key,
ContentType: content_type, Expires: 600,
ACL: 'public-read',
Conditions: [['content-length-range', 0, max_size]]
});
3. Client uploads directly to S3 using the pre-signed URL
(your server never receives the file bytes)
4. After upload: client calls PATCH endpoint with the final S3 URL
Post-Upload Processing (Lambda or Bull job):

- Validate the uploaded file is actually an image (check magic bytes)
- Resize images: logo → 400×400, banner → 1200×400, food → 800×600
- Strip EXIF metadata (privacy — removes location from food photos)
- Convert to WebP for 30% smaller file size
- Delete original after processing

### 🔒 SECURITY PROMPT: GDPR / Privacy Compliance Implementation

Tags: #Privacy #GDPR #DataProtection
Implement privacy and data protection compliance for Restaurant OS.
Data Minimization:

- Only collect what you actually use
- DOB: stored as DATE, never expose full DOB in APIs (use age if needed)
- Phone: stored in E.164 format, masked in most API responses
- GPS location: never store raw location history except for active deliveries
- Delivery locations: delete after 30 days

Customer Data Rights:
GET /api/customer/data-export (logged-in customer):

- Generate ZIP with: profile data, all orders, all bookings, all reviews
- Queue as Bull job, email download link when ready (valid 24h)

DELETE /api/customer/account (logged-in customer):

- Anonymize: replace name with 'Deleted User', email with random hash, phone with null (keep orders for restaurant financial records)
- Delete: profile photo from S3, device tokens, saved addresses
- Keep: order history (anonymized) for restaurant compliance
- Revoke all JWTs immediately

Data Retention Policy:

- Orders: keep 7 years (tax compliance)
- User profiles: delete 2 years after last activity on account deletion
- Audit logs: keep 2 years
- Support chat: keep 1 year
- Session data (Redis): auto-expires with token TTL

Consent Management:

- Marketing notifications: explicit opt-in only
- Location services: prompt with clear explanation, respect revocation
- Cookie consent: implement before any analytics tracking

### 🔒 SECURITY PROMPT: API Security — SQL Injection & Authorization

Tags: #SQLInjection #Authorization #IDOR
Protect Restaurant OS against common API vulnerabilities.
SQL Injection Prevention:
❌ NEVER do this: db.query('SELECT * FROM orders WHERE id = ' + req.params.id)
✅ ALWAYS use parameterized queries:
db.query('SELECT * FROM orders WHERE id = $1', [req.params.id])

- Use an ORM (Prisma/Sequelize) OR pg library with parameterized queries
- NEVER use string concatenation or template literals for SQL values

IDOR (Insecure Direct Object Reference) Prevention:

- NEVER trust IDs from the client alone
- ALWAYS verify ownership:

❌ BAD: SELECT * FROM orders WHERE id = ?
✅ GOOD: SELECT * FROM orders WHERE id = ? AND branch_id = ?
(branch_id comes from JWT, not from client)
Authorization Middleware Pattern:
const ownsResource = (resourceTable, idParam) => async (req, res, next) => {
const resource = await db.query(
'SELECT restaurant_id FROM ' + resourceTable + ' WHERE id=$1',[req.params[idParam]]
);
if (resource.rows[0]?.restaurant_id !== req.user.restaurant_id)
return res.status(403).json({ error: 'Access denied' });
next();
};
Mass Assignment Prevention:

- NEVER do: User.update(req.body)
- ALWAYS whitelist allowed fields: const allowed = ['name', 'phone', 'address', 'profile_pic_url']; const update = pick(req.body, allowed);

User.update(update, { where: { id: req.user.id } });

### 🔒 SECURITY PROMPT: Payment Security & PCI-DSS Compliance

Tags: #PCI #Payments #Tokenization
Implement payment security standards for Restaurant OS.
Golden Rule: NEVER store raw card numbers, CVV, or track data
Use a PCI-DSS certified payment gateway instead.
Recommended Gateways for India:

- Razorpay: great UPI support, wide adoption, good SDKs
- Paytm: familiar to users, handles UPI + wallet
- Cashfree: good for payouts to delivery partners

Payment Flow (Razorpay example):
1. Backend: POST /api/payments/create-order

- Call Razorpay API: create order with amount + currency
- Returns: { razorpay_order_id, amount, key_id }
- Store: razorpay_order_id in your orders table

2. Frontend: Initialize Razorpay checkout with razorpay_order_id

- Customer completes payment on Razorpay's secure screen
- Razorpay returns: { razorpay_payment_id, razorpay_signature }

3. Backend: POST /api/payments/verify

- Verify signature: hmac_sha256(order_id + '|' + payment_id, secret_key)
- ONLY mark payment complete after signature verification
- This prevents payment_id spoofing attacks

Webhook Verification (for background payment events):

- Verify X-Razorpay-Signature header on all webhook requests
- Use constant-time comparison (crypto.timingSafeEqual) not ===

Store only: payment_gateway_order_id, payment_gateway_payment_id,
amount, method, status — NOTHING else payment-related

## 🎯 M25 — UI/UX DESIGN SYSTEM & COMPONENTS

Reusable components, design tokens, animations, and accessibility

### 🎯 UI/UX PROMPT: Design Token System — Colors, Typography, Spacing

Tags: #DesignTokens #DesignSystem #Consistency
Define the complete design token system for Restaurant OS.
COLOR PALETTE:
Primary: #1A3C5E (deep navy — authority, trust)
Accent: #E8A020 (warm amber — energy, food, CTA)
Status Colors (semantic — used consistently across ALL roles):
Success/Available: #1E7E34 (green)
Warning/Pending: #F39C12 (amber)
Danger/Occupied: #C0392B (red)
Info/Reserved: #2980B9 (blue)
Neutral/Inactive: #7F8C8D (gray)
Cleaning: #F1C40F (yellow)
Dark Mode (Kitchen Staff):
Background: #111111, Surface: #1A1A1A, Border: #2D2D2D
Text Primary: #FFFFFF, Text Secondary: #AAAAAA
TYPOGRAPHY:
Primary Font: Inter (clean, readable on screens)
Fallback: Arial, sans-serif
Sizes: xs=10, sm=12, md=14, base=16, lg=18, xl=20, 2xl=24, 3xl=32, 4xl=48
Weights: regular=400, medium=500, semibold=600, bold=700, extrabold=800
SPACING (8px base grid):
xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48, 3xl=64, 4xl=96
BORDER RADIUS:
sm=4, md=8, lg=12, xl=16, pill=9999, circle=50%
SHADOWS:
sm: 0 1px 3px rgba(0,0,0,0.12)
md: 0 4px 12px rgba(0,0,0,0.15)
lg: 0 8px 24px rgba(0,0,0,0.2)
Apply as React Native StyleSheet constants or CSS custom properties
Export as JSON for sharing between web and mobile teams

### 🎯 UI/UX PROMPT: Core Reusable Component Library

Tags: #Components #React Native #Reusable
Build the core reusable component library for Restaurant OS.
1. StatusBadge Component:

- Props: status ('available'|'occupied'|'reserved'|'cleaning'|'maintenance')
- Renders: colored pill with status text
- Uses semantic color tokens — no hardcoded colors
- Sizes: sm (10px text), md (12px), lg (14px)

2. FoodCard Component (customer-facing):

- Props: item (menu_item object), onAddToCart, quantity
- Shows: 4:3 image (lazy loaded), name, description (2 lines), price, dietary icon (🟢 veg / 🔴 non-veg), allergen warning icon
- Add button: shows quantity selector when quantity > 0
- Sold out state: grayed overlay, button disabled

3. OrderTicketCard Component (kitchen-facing):

- Props: order (order object), onStatusChange
- Dark mode card, large fonts, overdue animation prop
- Full-width action button at bottom

4. TableUnit Component (floor map):

- Props: table, onPress, mode ('design'|'live')
- Shape-aware rendering (circle/square/rectangle)
- Color from status, animated transition
- Tap action depends on caller's context

5. QueueCard Component:

- Props: queueEntry, onMarkArrived, onAssignTable
- Shows: queue number, party size badge, wait timer, status
- Geo-arrived state: green glow animation

6. AlertBanner Component:

- Props: type, message, action, onDismiss
- Slides in from top, stays until dismissed
- Red for critical, yellow for warning

### 🎯 UI/UX PROMPT: Animation & Micro-Interaction Guidelines

Tags: #Animations #UX #Performance
Define animation standards and micro-interactions for Restaurant OS.
Animation Principles:

- Purposeful: every animation communicates information (not just decoration)
- Fast: UI animations max 300ms, data animations max 500ms
- Respect 'prefers-reduced-motion' setting

Standard Animations to Implement:
Screen Transitions (React Navigation):

- Stack screens: slide from right (300ms ease-in-out)
- Modal sheets: slide from bottom (400ms spring)
- Tab switches: crossfade (200ms)

Status Changes (WebSocket-driven):

- Table color change: CSS/Animated transition 300ms ease
- Order ticket new arrival: slide in from right (400ms spring)
- Order ticket removal (paid/cancelled): fade out + scale down 300ms

Success/Error States:

- Payment success: Lottie confetti animation (0.8s, play once)
- Form error: shake animation (400ms: translateX -10,10,-10,10,0)
- OTP wrong: red flash on input boxes (200ms)

Loading States:

- Skeleton screens: shimmer animation (1.5s loop, left to right)
- Button loading: spinner replaces text (button stays same size)
- Pull to refresh: standard bounce with spinner

Number Counters (dashboard KPIs):

- On page load: animate from 0 to final value (800ms ease-out)
- On update (WebSocket): animate from old to new value (300ms)

Kitchen overdue alert:
@keyframes pulseRed {
0%, 100% { border-color: #C0392B; box-shadow: 0 0 0 0 rgba(192,57,43,0.4) }
50% { box-shadow: 0 0 0 8px rgba(192,57,43,0) }
}
animation: pulseRed 1.5s ease infinite;

### 🎯 UI/UX PROMPT: Accessibility & Responsive Design Standards

Tags: #Accessibility #WCAG #Responsive
Implement accessibility and responsive design for Restaurant OS.
WCAG 2.1 AA Compliance Requirements:
Color Contrast:

- Normal text: minimum 4.5:1 contrast ratio
- Large text (18px+ or 14px bold): minimum 3:1
- Check all status colors against their background
- Tool: use WebAIM Contrast Checker or axe DevTools

Touch Targets (Mobile):

- Minimum 48×48px for all interactive elements
- Minimum 8px spacing between adjacent touch targets
- Kitchen staff interface: minimum 60×60px (gloved hands / fast tapping)

Screen Reader Support:

- Add accessibilityLabel to all icon buttons:

<TouchableOpacity accessibilityLabel='Mark table as available'>

- Use accessibilityRole: 'button', 'header', 'text', 'image'
- Order status changes: announce via AccessibilityInfo.announceForAccessibility()

Responsive Breakpoints (Web):

- Mobile: < 768px (single column)
- Tablet: 768px–1024px (2-column layouts)
- Desktop: > 1024px (split panels, side drawers)

Font Scaling:

- All font sizes relative (rem not px for web, undefined + allowFontScaling for React Native)
- Test at 200% system font size — no layout breaks

Color-Blind Friendly:

- Never use color as the ONLY way to communicate status
- Add text labels alongside color badges
- Add pattern or icon to table status colors (not just fill)

🚀  RECOMMENDED BUILD ORDER
Use prompts in this sequence for fastest progress:

## Phase 1 — Foundation: M21 (Database) → M23 (Security) → M1 (Auth)

## Phase 2 — Core Ops: M4 (Restaurant Panel) → M5 (Floor Layout) → M6 (Menu)

## Phase 3 — Staff: M8 (Manager) → M9 (Host) → M10 (Waiter) → M11 (Chef) → M12 (Cashier)

## Phase 4 — Customer: M13–M17 (Customer App) → M19 (WebSocket) → M18 (Delivery)

## Phase 5 — Intelligence: M20 (AI Features) → M2 (White-Label) → M3 (Admin Panel)

Total Prompts: 110+  |  Modules: 25  |  Document by: Priyanshu Kumar Gupta & Ronit Gupta