# Supabase Row Level Security (RLS) Multi-Tenant Branch Isolation

## 1. Security Invariant
Staff and managers belonging to Restaurant Branch A must never access financial orders, customer phone numbers, or reservations from Branch B.

## 2. RLS Policy Definition
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY branch_isolation_policy ON orders
FOR ALL USING (
    branch_id IN (
        SELECT branch_id FROM staff_members
        WHERE user_id = auth.uid()
    )
);
```

## 3. Leakage Prevention
Guarantees database-enforced multi-tenant isolation even if client queries omit branch filter parameters.
