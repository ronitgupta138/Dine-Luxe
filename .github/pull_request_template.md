## ⚡ Pull Request Overview

### Summary of Changes
- 

### Modules Modified
- [ ] Reservations & Floor Management (`modules/bookings`, `modules/tables`)
- [ ] Orders & Kitchen Display (`modules/orders`, `modules/kitchen`)
- [ ] Menu & Inventory (`modules/menu`, `modules/inventory`)
- [ ] Authentication & Role-Based Access (`modules/auth`, `middleware/auth`)
- [ ] Payments & Analytics (`modules/payments`, `modules/analytics`)
- [ ] Shared Types & Frontend Components (`frontend/`, `shared/`)

### Verification Checklist
- [ ] `npm test` passes 100% of automated test suites.
- [ ] TypeScript typechecks cleanly without syntax errors (`npm run typecheck`).
- [ ] Concurrency safety verified for reservation table locking (`redisLock` + PostgreSQL constraints).
- [ ] No personal environment paths, API keys, or production database credentials committed.
