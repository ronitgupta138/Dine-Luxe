# Backend Test and Fix Report

Date: 2026-05-02
Scope: Backend endpoints (all modules), Supabase DB write verification
Environment: local dev, Supabase service role

## Notes
- This report is updated as tests run.

## Summary
- Pending.

## Tests and Fixes

### Auth module
- Tested: signup, verify-otp, login (customer)
- Result: passes after fixes
- Fixes:
	- Switched from non-existent `profiles` table to `users` table in auth flow.
	- Added error handling for lookup/insert failures.
	- Added `created_at`/`updated_at` on user inserts.
	- Granted Supabase `service_role` access to `public` schema via SQL.
