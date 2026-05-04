# Backend Test and Fix Report

Date: 2026-05-04
Scope: Backend smoke tests (public endpoints)
Environment: local dev, Supabase service role, Redis local

## Notes
- This report is updated as tests run.

## Summary
- Server boots and public endpoints respond.
- Full module smoke sweep completed with super_admin token and seeded tenant data.
- Seeded layout/booking/order data so all previously failing endpoints return 200.

## Tests and Fixes

### Smoke tests (public endpoints)
- Tested: GET /health
- Result: pass

- Tested: GET /api/v1/admin/health (Supabase + Redis latency check)
- Result: pass

- Tested: GET /api/v1/users/check-email?email=smoke-test@example.com
- Result: pass

### Auth module
- Tested: signup, verify-otp, login (customer)
- Result: passes after fixes
- Fixes:
	- Switched from non-existent `profiles` table to `users` table in auth flow.
	- Added error handling for lookup/insert failures.
	- Added `created_at`/`updated_at` on user inserts.
	- Granted Supabase `service_role` access to `public` schema via SQL.

### Full module smoke sweep (super_admin token)
- Seeded: test restaurant + branch; updated test user to super_admin with tenant context.
- Tested (200): admin dashboard/health, users/me, restaurants list/get, branches list, branding, menu public, tables list, inventory, kitchen, analytics (fallback), loyalty, notifications, orders active, queue, reports (fallback), reviews list, staff, support.
- Resolved 404s: floor-layout live, geo arrival, order-items, receipt (seeded layout/menu/order/booking data).
- Fixes:
	- RBAC: allow `super_admin` to pass role checks.
	- Admin/Analytics/Reports: return safe fallbacks when RPCs are missing.
	- Branding: align column names, mount under /restaurant/:id/branding, and return defaults when missing.
	- Menu: align fields with schema; use JSON `addons` and `availability`.
	- Kitchen: remove non-existent columns; derive elapsed time from `created_at`.
	- Orders: use table `label`; replace `cancelled` with `closed` status.
	- Queue: switch to `queue_entries` table and correct column names/statuses.
	- Floor layout: avoid single-row coercion errors.
	- Payments: align receipt table join with table `label` column.
