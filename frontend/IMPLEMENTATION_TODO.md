# Frontend Implementation TODO - All Phases

## Phase 1: Foundation & Design System
- [ ] Install missing dependencies (framer-motion, lottie-react, react-easy-crop, qrcode.react, date-fns, react-day-picker, next-pwa, class-variance-authority, nanoid, use-debounce, react-intersection-observer)
- [ ] Update tailwind.config.ts with design tokens (colors, typography, spacing, shadows)
- [ ] Update globals.css with CSS custom properties and animation keyframes
- [ ] Create core reusable components:
  - [ ] StatusBadge
  - [ ] FoodCard
  - [ ] OrderTicketCard
  - [ ] TableUnit
  - [ ] QueueCard
  - [ ] AlertBanner
  - [ ] KPICard
  - [ ] SkeletonCard
  - [ ] ImageCropper
  - [ ] ConfirmDialog
  - [ ] DataTable
  - [ ] SentimentBadge
  - [ ] RoleBadge
  - [ ] EmptyState
  - [ ] LoadingOverlay

## Phase 2: Authentication & Onboarding (M1)
- [ ] Splash screen with Lottie animation
- [ ] Enhanced Login screen with show/hide password toggle
- [ ] Enhanced Signup wizard with animations, password strength meter, email check
- [ ] OTP input with 6 boxes, auto-advance, shake animation
- [ ] Forgot password 3-screen flow
- [ ] Restaurant onboarding 5-step wizard with live preview

## Phase 3: Layout & Navigation
- [ ] Role-aware Sidebar
- [ ] TopBar with branding + notifications
- [ ] BottomNav for customer app
- [ ] BrandedHeader
- [ ] ThemeProvider with CSS vars injection
- [ ] PageWrapper

## Phase 4: Customer App (M13-M17)
- [ ] Home page with mood tiles, AI recommendations, infinite scroll
- [ ] Restaurant profile with parallax, gallery, menu, reviews
- [ ] Digital menu with category nav, food cards, cart
- [ ] Cart bottom sheet
- [ ] Booking wizard
- [ ] Order tracking with progress bar
- [ ] Payment with UPI QR, split bill
- [ ] Profile with order history, addresses, support

## Phase 5: Staff Modules (M7-M12)
- [ ] Manager dashboard with live floor map + event feed
- [ ] Host interface with queue + table map
- [ ] Waiter interface with tables, orders, menu
- [ ] Chef KDS with dark theme, ticket grid, timers
- [ ] Cashier POS with payment processing

## Phase 6: Owner Panel (M4)
- [ ] Dashboard with revenue sparklines, occupancy
- [ ] Branch management cards + forms
- [ ] Floor designer with dnd-kit
- [ ] Menu management with drag-reorder
- [ ] Staff management table
- [ ] Reports with charts

## Phase 7: Admin Panel (M3)
- [ ] Dashboard with KPIs, charts, heat-map
- [ ] Restaurant management data grid
- [ ] Reports and analytics
- [ ] Platform health monitoring

## Phase 8: Real-time & WebSocket (M19)
- [ ] useRealtime hook
- [ ] useTableStatus hook
- [ ] useOrderStatus hook
- [ ] useQueuePosition hook
- [ ] RealtimeToastHandler

## Phase 9: AI Features (M20)
- [ ] Smart menu suggestions
- [ ] Geo-fencing arrival detection
- [ ] AI chatbot support
- [ ] Sentiment analysis badges
