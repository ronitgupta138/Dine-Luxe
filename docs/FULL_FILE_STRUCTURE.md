# DineLuxe Full File Structure

> Stack: Next.js 14 · Express.js · Supabase · Tailwind · shadcn/ui
> Author: Priyanshu Kumar Gupta & Ronit Gupta | Version 1.0 — 2025

---

## MONOREPO ROOT

```
DineLuxe/
├── frontend/                        ← Next.js 14 App (UI only)
├── backend/                         ← Express.js API Server
├── shared/                          ← Shared TypeScript types & utils
├── supabase/                        ← DB schema, migrations, RLS, edge fns
├── docs/                            ← All documentation
├── .env.example                     ← All env vars for both apps
├── .gitignore
├── pnpm-workspace.yaml              ← Declares frontend/backend/shared as packages
├── package.json                     ← Workspace root (pnpm workspaces)
├── turbo.json                       ← Turborepo build pipeline config
└── README.md
```

---

## SECTION A — FRONTEND `/frontend/`

```
frontend/
│
├── app/                                      ← Next.js App Router root
│   ├── layout.tsx                    ⭐       ← Root layout: fonts, providers, PWA meta
│   ├── page.tsx                      ⭐       ← Landing page / app entry point
│   ├── not-found.tsx                         ← Global 404 page
│   ├── error.tsx                             ← Global error boundary
│   ├── loading.tsx                           ← Global loading skeleton
│   └── manifest.json                         ← PWA manifest (mobile install)
│
│   ├── (auth)/                               ← Auth group — NO sidebar layout
│   │   ├── layout.tsx                ⭐       ← Centered card, no navigation
│   │   ├── login/
│   │   │   └── page.tsx              ⭐       ← Login: email/username + password
│   │   ├── signup/
│   │   │   ├── page.tsx              ⭐       ← Step 1: First/Last name, email, phone, photo
│   │   │   ├── step-2/
│   │   │   │   └── page.tsx          ⭐       ← Step 2: DOB, gender, address, city, PIN
│   │   │   └── step-3/
│   │   │       └── page.tsx          ⭐       ← Step 3: Password + strength meter + OTP trigger
│   │   ├── verify-otp/
│   │   │   └── page.tsx              ⭐       ← 6-box OTP entry with auto-advance + resend
│   │   ├── forgot-password/
│   │   │   └── page.tsx              ⭐       ← Enter email → trigger OTP recovery
│   │   ├── reset-password/
│   │   │   └── page.tsx              ⭐       ← New password + confirm (post OTP verify)
│   │   ├── first-login/
│   │   │   └── page.tsx              ⭐       ← Force password change for new staff (DOB default)
│   │   └── onboarding/
│   │       ├── page.tsx              ⭐       ← Step 1: Owner account + co-owners array
│   │       ├── step-2/
│   │       │   └── page.tsx          ⭐       ← Step 2: Restaurant name, cuisine, GST, contact
│   │       ├── step-3/
│   │       │   └── page.tsx          ⭐       ← Step 3: Branch setup (multi-branch accordion)
│   │       ├── step-4/
│   │       │   └── page.tsx          ⭐       ← Step 4: Logo, banner, brand colors, tagline
│   │       └── step-5/
│   │           └── page.tsx          ⭐       ← Step 5: Live branded mockup preview + submit
│   │
│   ├── (customer)/                           ← Customer app — PWA bottom nav layout
│   │   ├── layout.tsx                ⭐       ← Bottom nav: Home/Explore/Orders/Profile
│   │   ├── page.tsx                  ⭐       ← Home: nearby restaurants feed + mood tiles
│   │   ├── explore/
│   │   │   └── page.tsx                      ← Mood-based discovery, search, filters
│   │   ├── restaurant/
│   │   │   └── [restaurantId]/
│   │   │       ├── page.tsx          ⭐       ← Restaurant profile: menu, info, photos, reviews
│   │   │       ├── book/
│   │   │       │   └── page.tsx      ⭐       ← Table booking wizard (date/time/guests)
│   │   │       ├── queue/
│   │   │       │   └── page.tsx      ⭐       ← Join digital walk-in queue
│   │   │       └── gallery/
│   │   │           └── page.tsx              ← Restaurant photo gallery
│   │   ├── booking/
│   │   │   ├── [bookingId]/
│   │   │   │   └── page.tsx          ⭐       ← Live booking status + queue position tracker
│   │   │   └── history/
│   │   │       └── page.tsx                  ← All past bookings list
│   │   ├── order/
│   │   │   ├── cart/
│   │   │   │   └── page.tsx          ⭐       ← Cart: items, qty stepper, special instructions
│   │   │   ├── [orderId]/
│   │   │   │   ├── page.tsx          ⭐       ← Live order tracking: Created→Preparing→Ready
│   │   │   │   └── receipt/
│   │   │   │       └── page.tsx              ← Digital receipt with restaurant branding
│   │   │   └── history/
│   │   │       └── page.tsx                  ← All past orders with reorder button
│   │   ├── payment/
│   │   │   ├── [orderId]/
│   │   │   │   └── page.tsx          💸       ← Payment: UPI QR / Card / Split Bill tabs
│   │   │   └── success/
│   │   │       └── page.tsx                  ← Payment success + receipt + loyalty points
│   │   ├── qr-scan/
│   │   │   └── page.tsx              ⭐       ← QR code table scan → loads restaurant + menu
│   │   ├── rate/
│   │   │   └── [orderId]/
│   │   │       └── page.tsx                  ← Post-dining: item-level star rating + photos
│   │   └── profile/
│   │       ├── page.tsx              ⭐       ← Profile overview: avatar, name, stats
│   │       ├── edit/
│   │       │   └── page.tsx                  ← Edit: name, phone, DOB, gender, photo
│   │       ├── addresses/
│   │       │   └── page.tsx                  ← Saved delivery addresses (CRUD)
│   │       ├── favorites/
│   │       │   └── page.tsx                  ← Favorite restaurants + dishes
│   │       ├── loyalty/
│   │       │   └── page.tsx                  ← Loyalty points balance + history
│   │       ├── support/
│   │       │   └── page.tsx                  ← AI chatbot + support ticket list
│   │       └── refunds/
│   │           └── page.tsx                  ← Refund request status tracker
│   │
│   ├── (admin)/                              ← Super Admin panel — platform-wide
│   │   ├── layout.tsx                ⭐       ← Dark sidebar, breadcrumb, alert bell
│   │   ├── dashboard/
│   │   │   └── page.tsx              ⭐       ← Platform KPIs: restaurants, customers, revenue
│   │   ├── restaurants/
│   │   │   ├── page.tsx              ⭐       ← Server-paginated data grid of all restaurants
│   │   │   └── [restaurantId]/
│   │   │       └── page.tsx                  ← Restaurant detail: owners, branches, analytics
│   │   ├── customers/
│   │   │   └── page.tsx                      ← All platform customers (search/filter/suspend)
│   │   ├── reports/
│   │   │   ├── page.tsx                      ← Food trends, geo growth, cancellations
│   │   │   └── export/
│   │   │       └── page.tsx                  ← Async CSV/PDF export with email notification
│   │   ├── feedback/
│   │   │   └── page.tsx                      ← Anonymous staff reviews with sentiment badges
│   │   ├── platform-health/
│   │   │   └── page.tsx                      ← DB, Supabase Realtime, API response metrics
│   │   ├── audit-logs/
│   │   │   └── page.tsx                      ← Full audit trail: who did what + when
│   │   └── settings/
│   │       └── page.tsx                      ← Platform config, admin profile, email settings
│   │
│   ├── (owner)/                              ← Restaurant Owner panel
│   │   ├── layout.tsx                ⭐       ← Sidebar + branch switcher dropdown
│   │   ├── dashboard/
│   │   │   └── page.tsx              ⭐       ← Revenue sparklines, occupancy, top dishes
│   │   ├── branches/
│   │   │   ├── page.tsx              ⭐       ← Branch cards: revenue, occupancy, manager
│   │   │   ├── new/
│   │   │   │   └── page.tsx          ⭐       ← Add branch: address, hours, manager assign
│   │   │   └── [branchId]/
│   │   │       ├── page.tsx                  ← Branch detail: live stats, alerts, staff
│   │   │       ├── edit/
│   │   │       │   └── page.tsx              ← Edit branch details + address (re-geocode)
│   │   │       └── hours/
│   │   │           └── page.tsx              ← Visual weekly hours grid editor
│   │   ├── floor-designer/
│   │   │   └── [branchId]/
│   │   │       └── page.tsx          ⭐       ← dnd-kit drag-and-drop floor layout designer
│   │   ├── menu/
│   │   │   ├── page.tsx              ⭐       ← Menu overview: categories with drag-reorder
│   │   │   ├── categories/
│   │   │   │   └── page.tsx                  ← Category CRUD + drag-to-reorder
│   │   │   └── items/
│   │   │       ├── page.tsx          ⭐       ← Items table: bulk status/price update
│   │   │       ├── new/
│   │   │       │   └── page.tsx      ⭐       ← Add item: photo crop, price, addons, availability
│   │   │       └── [itemId]/
│   │   │           └── edit/
│   │   │               └── page.tsx          ← Edit menu item + photo replace
│   │   ├── staff/
│   │   │   ├── page.tsx              ⭐       ← Staff table: filter by role/branch/status
│   │   │   ├── new/
│   │   │   │   └── page.tsx          ⭐       ← Create staff: role assign + default DOB password
│   │   │   └── [staffId]/
│   │   │       └── page.tsx                  ← Staff profile: performance, access toggle
│   │   ├── shifts/
│   │   │   └── page.tsx              🔮       ← Shift scheduling calendar view
│   │   ├── reports/
│   │   │   └── page.tsx                      ← Sales, menu perf, kitchen perf, customer insights
│   │   ├── customers/
│   │   │   └── page.tsx                      ← Restaurant's own customer CRM data
│   │   ├── branding/
│   │   │   └── page.tsx              ⭐       ← White-label editor: logo, colors, tagline + live preview
│   │   └── settings/
│   │       └── page.tsx                      ← Owner account settings + notification prefs
│   │
│   └── (staff)/                              ← All staff dashboards by role
│       │
│       ├── manager/
│       │   ├── layout.tsx            ⭐       ← Manager layout: sidebar, alert bell, live badge
│       │   ├── dashboard/
│       │   │   └── page.tsx          ⭐       ← Split: live floor map LEFT + event feed RIGHT
│       │   ├── floor/
│       │   │   └── page.tsx          ⭐       ← Real-time floor map (table status colors)
│       │   ├── orders/
│       │   │   └── page.tsx          ⭐       ← All active orders feed with status filters
│       │   ├── queue/
│       │   │   └── page.tsx                  ← Queue oversight + manual override controls
│       │   ├── staff-duty/
│       │   │   └── page.tsx                  ← Who is clocked in: role breakdown live
│       │   ├── menu-status/
│       │   │   └── page.tsx                  ← Quick sold-out toggle grid for all items
│       │   ├── inventory/
│       │   │   └── page.tsx                  ← Stock levels + NORMAL/LOW/CRITICAL badges
│       │   └── reports/
│       │       └── page.tsx                  ← Branch daily summary: revenue, covers, avg time
│       │
│       ├── host/
│       │   ├── layout.tsx            ⭐       ← 2-panel full-screen layout
│       │   ├── queue/
│       │   │   └── page.tsx          ⭐       ← Queue cards: party size, wait time, actions
│       │   └── floor/
│       │       └── page.tsx          ⭐       ← Floor map: tap free table to assign walk-in
│       │
│       ├── waiter/
│       │   ├── layout.tsx            ⭐       ← Mobile-first: large tap targets, bottom nav
│       │   ├── tables/
│       │   │   └── page.tsx          ⭐       ← My assigned tables grid with status colors
│       │   ├── order/
│       │   │   ├── [tableId]/
│       │   │   │   └── page.tsx      ⭐       ← Browse menu + add to order
│       │   │   └── [tableId]/
│       │   │       └── edit/
│       │   │           └── page.tsx          ← Modify existing order (add/remove items)
│       │   └── performance/
│       │       └── page.tsx                  ← My stats: orders today, avg rating, tips
│       │
│       ├── chef/
│       │   ├── layout.tsx            ⭐       ← Dark mode default, full-screen KDS
│       │   └── kitchen/
│       │       └── page.tsx          ⭐       ← Kitchen Display System: 3-col ticket grid
│       │
│       └── cashier/
│           ├── layout.tsx            ⭐       ← POS-style: large numbers, high contrast
│           ├── tables/
│           │   └── page.tsx          ⭐       ← Tables with pending payment (sorted by time)
│           └── payment/
│               └── [tableId]/
│                   └── page.tsx      ⭐       ← Bill view: items, tax, discount, payment
│
│
├── components/
│   │
│   ├── ui/                                   ← shadcn/ui auto-generated base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── modal.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx                         ← Bottom sheet for mobile actions
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── skeleton.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── progress.tsx
│   │   ├── switch.tsx
│   │   ├── calendar.tsx
│   │   ├── popover.tsx
│   │   ├── separator.tsx
│   │   ├── command.tsx                       ← Searchable dropdown (cmdk)
│   │   └── scroll-area.tsx
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx               ⭐       ← Role-aware sidebar (reads role from session)
│   │   ├── TopBar.tsx                ⭐       ← Header: branding + notification bell + user menu
│   │   ├── BottomNav.tsx             ⭐       ← PWA bottom nav for customer app
│   │   ├── BranchSwitcher.tsx                ← Owner panel branch switcher dropdown
│   │   ├── BreadCrumb.tsx                    ← Auto-generated breadcrumb from route
│   │   ├── BrandedHeader.tsx         ⭐       ← Loads restaurant logo + colors from store
│   │   ├── PageWrapper.tsx                   ← Consistent padding + page title heading
│   │   └── ThemeProvider.tsx         ⭐       ← Injects CSS vars from restaurant brand config
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx             ⭐       ← Email/username + password with validation
│   │   ├── SignupWizard.tsx          ⭐       ← Step progress dots + slide transition
│   │   ├── OTPInput.tsx              ⭐       ← 6-box OTP with auto-advance + shake on error
│   │   ├── PasswordStrengthMeter.tsx ⭐       ← Red→Yellow→Green strength bar
│   │   └── BrandingPreview.tsx       ⭐       ← Live phone mockup in onboarding step 5
│   │
│   ├── customer/
│   │   ├── RestaurantCard.tsx        ⭐       ← Home feed card: rating, distance, cuisine tag
│   │   ├── MoodTile.tsx                      ← Mood-based discovery: "Romantic", "Family"...
│   │   ├── FoodCard.tsx              ⭐       ← Menu item: photo, price, veg/non-veg badge
│   │   ├── CartItem.tsx              ⭐       ← Cart line: item + qty stepper + remove
│   │   ├── QueueCard.tsx             ⭐       ← Queue position with animated wait timer
│   │   ├── BookingStatusStepper.tsx  ⭐       ← Created→Confirmed→Arrived→Seated progress
│   │   ├── OrderStatusTracker.tsx    ⭐       ← Live order progress bar via Supabase Realtime
│   │   ├── RatingModal.tsx                   ← Item-level star rating + photo upload
│   │   ├── SplitBillUI.tsx           💸       ← Split by N people or custom amounts
│   │   └── GeoArrivalPrompt.tsx              ← "You're near [Restaurant]. Mark arrived?" prompt
│   │
│   ├── floor/
│   │   ├── FloorCanvas.tsx           ⭐       ← dnd-kit canvas with snap-to-grid
│   │   ├── DraggableTable.tsx        ⭐       ← Draggable: round/square/rectangle/booth
│   │   ├── TableConfigModal.tsx      ⭐       ← Set label, capacity, zone, photo
│   │   ├── TableUnit.tsx             ⭐       ← Read-only: color = live table status
│   │   ├── ZoneLegend.tsx                    ← Color key: Free/Occupied/Reserved/Cleaning
│   │   ├── FloorLiveView.tsx         ⭐       ← Realtime floor map (Supabase subscription)
│   │   └── FloorTabs.tsx                     ← Ground/1st/2nd floor tab switcher (max 5)
│   │
│   ├── menu/
│   │   ├── MenuCategoryRow.tsx       ⭐       ← Drag-reorderable category with items list
│   │   ├── MenuItemCard.tsx          ⭐       ← Item: thumbnail, price, status badge
│   │   ├── MenuItemForm.tsx          ⭐       ← Add/edit: photo crop, addons, time-based avail
│   │   ├── BulkActionBar.tsx                 ← Multi-select: bulk price/status update
│   │   ├── SoldOutToggle.tsx         ⭐       ← Quick inline toggle per item
│   │   └── AddonGroup.tsx                    ← Addon/customization group editor
│   │
│   ├── orders/
│   │   ├── OrderTicket.tsx           ⭐       ← KDS ticket: dark bg, large font, timer
│   │   ├── OrderCard.tsx             ⭐       ← Waiter order summary: table, items, status
│   │   ├── OrderItemRow.tsx          ⭐       ← Single item with serve/mark-done button
│   │   ├── OrderTimeline.tsx                 ← Created→Confirmed→Preparing→Served steps
│   │   ├── KDSGrid.tsx               ⭐       ← 3-column responsive ticket grid for chef
│   │   └── OverdueAlert.tsx                  ← Pulsing red badge on tickets >threshold min
│   │
│   ├── payment/
│   │   ├── PaymentSheet.tsx          💸       ← Bottom sheet: Cash/UPI QR/Card/Split tabs
│   │   ├── QRCodeDisplay.tsx         💸       ← UPI QR generated from order amount
│   │   ├── ReceiptPreview.tsx                ← Branded receipt preview before PDF send
│   │   └── PaymentPlaceholder.tsx    💸       ← TODO: swap in Razorpay/Stripe SDK here
│   │
│   ├── queue/
│   │   ├── QueueList.tsx             ⭐       ← Host queue panel: numbered entry cards
│   │   ├── QueueEntryCard.tsx        ⭐       ← Party info, wait time, Seat/No-Show buttons
│   │   ├── ArrivalAlert.tsx          ⭐       ← Pulsing green banner on geo-fence trigger
│   │   └── NoShowCountdown.tsx               ← Red draining progress bar (15min timer)
│   │
│   ├── charts/
│   │   ├── KPICard.tsx               ⭐       ← Animated counter + sparkline + % change arrow
│   │   ├── RevenueLineChart.tsx      ⭐       ← Recharts area chart: 30-day revenue
│   │   ├── TopRestaurantsBar.tsx             ← Horizontal bar: top 10 by revenue
│   │   ├── PeakHoursHeatMap.tsx              ← 7×24 grid: order volume by day+hour
│   │   ├── OccupancyDoughnut.tsx             ← Dine-in / Delivery / Takeaway split
│   │   └── OrderStatusBreakdown.tsx          ← Stacked bar: completed/pending/cancelled
│   │
│   ├── notifications/
│   │   ├── NotificationBell.tsx      ⭐       ← Bell icon with unread count badge
│   │   ├── AlertBanner.tsx           ⭐       ← Dismissible manager alert bar
│   │   ├── ToastStack.tsx            ⭐       ← Stack of role-appropriate toast alerts
│   │   └── RealtimeToastHandler.tsx  ⭐       ← Subscribes Supabase channel → fires toasts
│   │
│   └── shared/
│       ├── StatusBadge.tsx           ⭐       ← Colored pill for any status (reusable)
│       ├── RoleBadge.tsx                     ← Role name display chip for staff
│       ├── EmptyState.tsx                    ← Illustration + message + optional CTA
│       ├── LoadingOverlay.tsx                ← Full-screen centered spinner
│       ├── SkeletonCard.tsx                  ← Shimmer loading card placeholder
│       ├── ImageCropper.tsx                  ← react-easy-crop with 4:3 constraint
│       ├── ConfirmDialog.tsx                 ← Generic confirm/cancel modal
│       ├── DataTable.tsx                    ← TanStack Table wrapper with sort/filter
│       └── SentimentBadge.tsx               ← 🟢 Positive / 🟡 Neutral / 🔴 Negative
│
│
├── hooks/
│   ├── useAuth.ts                    ⭐       ← Session, user object, role from Supabase
│   ├── useRBAC.ts                    ⭐       ← can(role, 'menu:write') permission checker
│   ├── useBranding.ts                ⭐       ← Fetch + cache restaurant brand config
│   ├── useRealtime.ts                ⭐       ← Subscribe to any Supabase Realtime channel
│   ├── useTableStatus.ts             ⭐       ← Live table status via Realtime subscription
│   ├── useOrderStatus.ts             ⭐       ← Live order updates via Realtime
│   ├── useQueuePosition.ts           ⭐       ← Customer live queue position number
│   ├── useGeoFence.ts                        ← GPS polling + haversine arrival detection
│   ├── useCart.ts                    ⭐       ← Add/remove items, totals, persist to store
│   ├── useNotifications.ts                   ← Browser push permission + service worker
│   ├── useDebounce.ts                        ← Debounce hook for search inputs
│   ├── useInfiniteRestaurants.ts             ← Infinite scroll for home feed
│   └── useMediaQuery.ts                      ← Responsive breakpoint detection helper
│
│
├── store/                                    ← Zustand global client state
│   ├── auth.store.ts                 ⭐       ← user, role, restaurant_id, branch_id
│   ├── cart.store.ts                 ⭐       ← items[], quantities, totals, restaurantId
│   ├── branding.store.ts             ⭐       ← primaryColor, logo, appName, tagline
│   ├── notifications.store.ts        ⭐       ← unreadCount, toastQueue[], alerts[]
│   ├── floor.store.ts                        ← floorLayout, undoStack[], redoStack[]
│   └── orders.store.ts                       ← activeOrders[] for KDS + waiter views
│
│
├── lib/
│   ├── api-client.ts                 ⭐       ← Axios instance: baseURL, auth header injector
│   ├── supabase-client.ts            ⭐       ← Browser Supabase client (auth + realtime)
│   ├── supabase-server.ts            ⭐       ← Server Component Supabase client (SSR)
│   ├── utils.ts                      ⭐       ← cn() classname merger + general helpers
│   ├── constants.ts                          ← API_BASE_URL, ROLE names, route map
│   └── permissions.ts                ⭐       ← PERMISSIONS_MATRIX: role→actions lookup
│
│
├── types/
│   └── index.ts                      ⭐       ← Re-exports all types from shared package
│
│
├── middleware.ts                     ⭐       ← Route protection + role-based redirects
│
├── next.config.ts                    ⭐       ← PWA config, API proxy to backend, image domains
├── tailwind.config.ts                ⭐       ← Tailwind + CSS vars for brand colors
├── postcss.config.js
├── components.json                   ⭐       ← shadcn/ui config (style, paths, aliases)
├── tsconfig.json                     ⭐       ← TypeScript + @ path aliases
├── .env.local                                ← Supabase URL, anon key, backend URL
└── package.json
```

---

## SECTION B — BACKEND `/backend/`

```
backend/
│
├── src/
│   │
│   ├── server.ts                     ⭐       ← Express bootstrap: listen, signal handlers
│   ├── app.ts                        ⭐       ← Express app: global middleware, route mounting
│   │
│   ├── config/
│   │   ├── env.ts                    ⭐       ← Zod env validation — crash if vars missing
│   │   ├── supabase.ts               ⭐       ← Supabase admin client (service_role key)
│   │   ├── cors.ts                   ⭐       ← CORS whitelist: frontend origin only
│   │   ├── resend.ts                ⭐       ← Resend email client initializer
│   │   └── payment.ts                💸       ← TODO: Razorpay/Stripe SDK init goes here
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.routes.ts        ⭐       ← POST /auth/signup, login, otp, refresh, logout
│   │   │   ├── auth.controller.ts    ⭐       ← Request handlers, calls service
│   │   │   ├── auth.service.ts       ⭐       ← Supabase Auth calls, OTP logic, token refresh
│   │   │   └── auth.schema.ts        ⭐       ← Zod: signup/login/OTP request validation
│   │   │
│   │   ├── users/
│   │   │   ├── users.routes.ts       ⭐       ← GET/PATCH /users/me, GET /users/:id
│   │   │   ├── users.controller.ts   ⭐
│   │   │   ├── users.service.ts      ⭐       ← Profile CRUD, check-email, first-login flag
│   │   │   └── users.schema.ts
│   │   │
│   │   ├── restaurants/
│   │   │   ├── restaurants.routes.ts ⭐       ← POST /restaurants/register, GET /admin/all
│   │   │   ├── restaurants.controller.ts ⭐
│   │   │   ├── restaurants.service.ts ⭐       ← Register, approve, suspend, status toggle
│   │   │   └── restaurants.schema.ts
│   │   │
│   │   ├── branches/
│   │   │   ├── branches.routes.ts    ⭐       ← CRUD /branches + PATCH /:id/status
│   │   │   ├── branches.controller.ts ⭐
│   │   │   ├── branches.service.ts   ⭐       ← Create, geocode, operating hours, toggle
│   │   │   └── branches.schema.ts
│   │   │
│   │   ├── branding/
│   │   │   ├── branding.routes.ts    ⭐       ← GET + PATCH /restaurants/:id/branding
│   │   │   ├── branding.controller.ts ⭐
│   │   │   ├── branding.service.ts   ⭐       ← Fetch brand config, cache, upload-url gen
│   │   │   └── branding.schema.ts            ← Zod: hex color, URL, max length validators
│   │   │
│   │   ├── staff/
│   │   │   ├── staff.routes.ts       ⭐       ← POST /staff/create, PATCH /staff/:id/toggle
│   │   │   ├── staff.controller.ts   ⭐
│   │   │   ├── staff.service.ts      ⭐       ← Create (DOB default pass), access toggle, paginate
│   │   │   └── staff.schema.ts
│   │   │
│   │   ├── tables/
│   │   │   ├── tables.routes.ts      ⭐       ← CRUD /tables + PATCH /:id/status
│   │   │   ├── tables.controller.ts  ⭐
│   │   │   ├── tables.service.ts     ⭐       ← State machine: free→reserved→occupied→cleaning
│   │   │   └── tables.schema.ts
│   │   │
│   │   ├── floor-layout/
│   │   │   ├── floor-layout.routes.ts ⭐      ← POST /floor-layout, POST /publish, GET /live
│   │   │   ├── floor-layout.controller.ts ⭐
│   │   │   └── floor-layout.service.ts ⭐     ← Save JSON, validate no overlap, publish tables
│   │   │
│   │   ├── bookings/
│   │   │   ├── bookings.routes.ts    ⭐       ← POST /bookings, PATCH /:id/cancel, /:id/arrived
│   │   │   ├── bookings.controller.ts ⭐
│   │   │   ├── bookings.service.ts   ⭐       ← Create (row lock), cancel, arrived, no-show
│   │   │   └── bookings.schema.ts
│   │   │
│   │   ├── queue/
│   │   │   ├── queue.routes.ts       ⭐       ← POST /queue/join, POST /queue/:id/assign-table
│   │   │   ├── queue.controller.ts   ⭐
│   │   │   └── queue.service.ts      ⭐       ← FIFO management, position calc, no-show auto-cancel
│   │   │
│   │   ├── menu/
│   │   │   ├── menu.routes.ts        ⭐       ← Full CRUD /categories + /items + bulk actions
│   │   │   ├── menu.controller.ts    ⭐
│   │   │   ├── menu.service.ts       ⭐       ← Categories, items, addons, availability windows
│   │   │   └── menu.schema.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── orders.routes.ts      ⭐       ← POST /orders, PATCH /:id/status, GET /active
│   │   │   ├── orders.controller.ts  ⭐
│   │   │   ├── orders.service.ts     ⭐       ← Place order, state machine, auto-assign waiter
│   │   │   └── orders.schema.ts
│   │   │
│   │   ├── order-items/
│   │   │   ├── order-items.routes.ts ⭐       ← PATCH /:id/serve, /:id/status
│   │   │   ├── order-items.controller.ts ⭐
│   │   │   └── order-items.service.ts ⭐      ← Item-level serve tracking, partial serve
│   │   │
│   │   ├── kitchen/
│   │   │   ├── kitchen.routes.ts     ⭐       ← GET /kitchen/tickets, PATCH /:id/status
│   │   │   ├── kitchen.controller.ts ⭐
│   │   │   └── kitchen.service.ts    ⭐       ← KDS ticket view, status update, overdue check
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.routes.ts    💸       ← POST /payments/process, /split, /discount
│   │   │   ├── payments.controller.ts 💸
│   │   │   ├── payments.service.ts   💸       ← TODO: gateway integration, split bill logic
│   │   │   └── payments.schema.ts
│   │   │
│   │   ├── delivery/
│   │   │   ├── delivery.routes.ts    🔮       ← POST /delivery/assign, PATCH /:id/status
│   │   │   ├── delivery.controller.ts 🔮
│   │   │   └── delivery.service.ts   🔮       ← Assign partner, GPS update, status machine
│   │   │
│   │   ├── inventory/
│   │   │   ├── inventory.routes.ts           ← GET /inventory, PATCH /:id, POST /deduct
│   │   │   ├── inventory.controller.ts
│   │   │   └── inventory.service.ts          ← Stock deduct on order, threshold alert trigger
│   │   │
│   │   ├── reviews/
│   │   │   ├── reviews.routes.ts             ← POST /reviews, GET /restaurant/:id/reviews
│   │   │   ├── reviews.controller.ts
│   │   │   └── reviews.service.ts            ← Item-level ratings, aggregate score update
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.routes.ts       ← GET /notifications, PATCH /:id/read
│   │   │   ├── notifications.controller.ts
│   │   │   └── notifications.service.ts      ← Email (Resend), push (FCM), in-app insert
│   │   │
│   │   ├── reports/
│   │   │   ├── reports.routes.ts             ← GET /reports/sales, /menu-perf, /kitchen-perf
│   │   │   ├── reports.controller.ts
│   │   │   └── reports.service.ts            ← Owner + admin reports, async CSV/PDF export
│   │   │
│   │   ├── admin/
│   │   │   ├── admin.routes.ts               ← GET /admin/dashboard, /health, /platform-stats
│   │   │   ├── admin.controller.ts
│   │   │   └── admin.service.ts              ← Platform-wide stats, restaurant management
│   │   │
│   │   └── support/
│   │       ├── support.routes.ts             ← POST /support/ticket, GET /tickets, PATCH /:id
│   │       ├── support.controller.ts
│   │       └── support.service.ts            ← Ticket CRUD, refund tracking, escalation
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        ⭐       ← Verify Supabase JWT on every protected route
│   │   ├── rbac.middleware.ts        ⭐       ← requireRole('manager', 'owner') guard
│   │   ├── tenant.middleware.ts      ⭐       ← Inject restaurant_id + branch_id from JWT
│   │   ├── validate.middleware.ts    ⭐       ← Zod schema validation (body/params/query)
│   │   ├── rate-limit.middleware.ts          ← Per-route rate limiting (express-rate-limit)
│   │   ├── upload.middleware.ts              ← Multer config → Supabase Storage upload
│   │   └── error.middleware.ts       ⭐       ← Global error handler: format + log all errors
│   │
│   ├── utils/
│   │   ├── response.ts               ⭐       ← Standard { success, data, error } wrapper
│   │   ├── haversine.ts                      ← Geo-distance formula for arrival geo-fencing
│   │   ├── pagination.ts                     ← Cursor-based pagination helper
│   │   ├── password.ts               ⭐       ← DOB→DDMMYYYY default password generator
│   │   ├── otp.ts                    ⭐       ← 6-digit OTP generator + TTL management
│   │   ├── employee-id.ts                    ← EMP-{BRANCH_CODE}-{SEQUENCE} generator
│   │   ├── waiter-assign.ts                  ← Load-balanced waiter assignment algorithm
│   │   └── audit-log.ts                      ← Insert to audit_logs table on mutations
│   │
│   ├── email/
│   │   ├── send.ts                   ⭐       ← sendEmail(to, template, data) via Resend
│   │   └── templates/
│   │       ├── welcome.ts            ⭐       ← New customer welcome email
│   │       ├── otp-verify.ts         ⭐       ← 6-digit OTP verification email
│   │       ├── booking-confirmed.ts           ← Booking confirmation with details
│   │       ├── booking-reminder.ts            ← 1-hour pre-booking reminder
│   │       └── order-receipt.ts               ← Post-payment digital receipt
│   ├── jobs/                                  ← Supabase Edge Functions (cron jobs)
│   │   ├── overdue-orders.ts                  ← Cron: flag orders past prep threshold
│   │   ├── no-show-cancel.ts                  ← Cron: auto-cancel bookings after 15min
│   │   └── booking-reminder.ts                ← Cron: send reminder 1hr before booking
│   └── types/
│       └── express.d.ts              ⭐       ← Extend Express Request: user, restaurant_id
│
├── tsconfig.json
├── nodemon.json                               ← Nodemon watch config for dev hot-reload
├── .env
└── package.json
```

---

## SECTION C — SHARED `/shared/`

```
shared/
│
├── types/
│   ├── models.ts                     ⭐       ← User, Restaurant, Branch, Table, Order,
│   │                                            Booking, QueueEntry, MenuItem, Payment,
│   │                                            Delivery, Inventory, Review, Notification
│   ├── enums.ts                      ⭐       ← UserRole, TableStatus, OrderStatus,
│   │                                            BookingStatus, OrderType, DeliveryStatus,
│   │                                            ItemStatus, NotificationType
│   ├── api.ts                        ⭐       ← Request/Response types for every endpoint
│   └── realtime.ts                            ← Typed Supabase Realtime event payloads
│
├── utils/
│   ├── validators.ts                          ← Zod schemas: email, phone, hex color, GST
│   ├── formatters.ts                          ← ₹ currency, date/time, distance, duration
│   └── constants.ts                  ⭐       ← ROLES array, PERMISSIONS_MATRIX object,
│                                               STATUS_COLORS map, REALTIME_EVENTS list
│
└── package.json
```

---

## SECTION D — SUPABASE `/supabase/`

```
supabase/
│
├── migrations/
│   ├── 001_core_tables.sql           ⭐       ← All 28 tables: enums, columns, constraints, FKs
│   ├── 002_rls_policies.sql          ⭐       ← Row Level Security per table per role
│   ├── 003_realtime_enable.sql       ⭐       ← Enable Realtime: tables, orders, queue,
│   │                                            bookings, inventory, notifications
│   ├── 004_indexes.sql                        ← Perf indexes: FK cols, status, created_at
│   ├── 005_db_functions.sql                   ← waiter_score(), update_restaurant_rating(),
│   │                                            get_queue_position()
│   └── 006_seed.sql                           ← Sample: 1 restaurant, 2 branches, full menu
│
├── functions/
│   ├── send-email/
│   │   └── index.ts                           ← Edge Fn: send via Resend API
│   ├── send-push/
│   │   └── index.ts                           ← Edge Fn: FCM push notification
│   ├── generate-receipt/
│   │   └── index.ts                           ← Edge Fn: PDF receipt generation
│   ├── export-report/
│   │   └── index.ts                           ← Edge Fn: async CSV/Excel export with S3 upload
│   └── overdue-alert/
│       └── index.ts                           ← Edge Fn (cron): scan overdue orders
│
└── config.toml                                ← Supabase CLI project config
```

---

## SECTION E — DOCS `/docs/`

```
docs/
├── SETUP.md                                   ← Local dev: clone, pnpm install, Supabase CLI
├── API_REFERENCE.md                           ← All endpoints: method, path, auth, body, res
├── DATABASE_SCHEMA.md                         ← 28 tables with columns + relationships
├── RLS_POLICIES.md                            ← Every Row Level Security rule explained
├── REALTIME_EVENTS.md                         ← All Supabase Realtime channels + event shapes
├── RBAC_MATRIX.md                             ← Role × Permission matrix (10 roles)
└── DEPLOYMENT.md                              ← Vercel (frontend) + Railway (backend) guide
```

---

## LEGEND

- ⭐ MVP — build this in Phase 1
- 🔮 Phase 2 — build later
- 💸 Payment-related — TBD gateway
