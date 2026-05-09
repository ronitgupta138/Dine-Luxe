# 01 — Supabase Setup Guide

> Supabase provides your **PostgreSQL database**, **Auth system**, and **File Storage**.
> Your backend uses it via `@supabase/supabase-js` with the Service Role Key.
> **Free tier:** 500MB database, 1GB storage, 50,000 monthly active users, 2 projects

---

## What Your Backend Uses From Supabase

| Feature | Used For |
|---------|---------|
| PostgreSQL (via Prisma) | All data — users, orders, menus, payments etc. |
| Supabase Auth | User signup, OTP verification, JWT tokens |
| Supabase Admin SDK | Creating users server-side, managing auth |
| Supabase Storage | Logo uploads, banner images, report exports |
| Supabase JWT Secret | Signing and verifying your own access tokens |

---

## STEP 1 — Create a Supabase Account

1. Go to **https://supabase.com**
2. Click **Start your project** (top right)
3. Sign up with **GitHub** (recommended) or Email
4. Verify your email if you signed up with email
5. You land on the **Supabase Dashboard**

---

## STEP 2 — Create a New Project

1. Click **New Project**
2. Fill in the form:
   - **Organization:** Select your org (or create one — it's free)
   - **Name:** `restaurant-os` (or any name you like)
   - **Database Password:** Create a strong password — **SAVE THIS**, you need it for `DATABASE_URL`
   - **Region:** Choose the closest to your users (e.g. `Southeast Asia (Singapore)` for India)
   - **Pricing Plan:** Free
3. Click **Create new project**
4. Wait **~2 minutes** for the project to provision (you'll see a loading screen)

---

## STEP 3 — Get Your API Keys

Once the project is ready:

1. Go to **Project Settings** (gear icon, bottom left sidebar)
2. Click **API** in the left menu
3. Copy these values:

```
Project URL          → SUPABASE_URL
anon / public key    → (not used by backend — for frontend only)
service_role key     → SUPABASE_SERVICE_ROLE_KEY  ⚠️ Keep secret!
JWT Secret           → SUPABASE_JWT_SECRET
```

> ⚠️ The `service_role` key has **full database access** — never expose it on the frontend.

---

## STEP 4 — Get Your Database Connection Strings

1. Go to **Project Settings → Database**
2. Scroll to **Connection string**
3. Select the **URI** tab
4. Copy these two URLs — replace `[YOUR-PASSWORD]` with the password from Step 2:

**For `DATABASE_URL`** (connection pooling via PgBouncer — used at runtime):
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:6543/postgres?pgbouncer=true
```

**For `DIRECT_URL`** (direct connection — used for Prisma migrations):
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

> The difference: port `6543` = PgBouncer (pooled, fast for many connections), port `5432` = direct (needed for schema migrations)

---

## STEP 5 — Configure Supabase Auth

1. Go to **Authentication → Settings** in your project
2. Set these:

**Email Settings:**
- ✅ Enable **Email Confirmations** — OFF for development (turn ON for production)
- **OTP Expiry:** `3600` seconds (1 hour)
- **Minimum password length:** `8`

**Site URL (important for redirects):**
- Development: `http://localhost:3000`
- Production: `https://your-frontend-domain.com`

**Additional Redirect URLs:**
```
http://localhost:3000/**
http://localhost:5001/**
```

3. Click **Save**

---

## STEP 6 — Create Supabase Storage Buckets

Your backend needs 2 storage buckets for file uploads:

1. Go to **Storage** in left sidebar
2. Click **New bucket** for each:

**Bucket 1: `restaurant-assets`**
- Name: `restaurant-assets`
- Public: ✅ YES (logos and banners are public)
- File size limit: `5 MB`
- Allowed MIME types: `image/png, image/jpeg, image/webp`

**Bucket 2: `report-exports`**
- Name: `report-exports`
- Public: ❌ NO (private — download via signed URL)
- File size limit: `10 MB`
- Allowed MIME types: `application/pdf, text/csv`

---

## STEP 7 — Set Storage Bucket Policies

For the `restaurant-assets` bucket (public reads, authenticated writes):

1. Click on `restaurant-assets` bucket
2. Go to **Policies** tab
3. Click **New Policy → For full customization**

**Policy 1 — Public Read:**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-assets');
```

**Policy 2 — Authenticated Upload:**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-assets'
  AND auth.role() = 'authenticated'
);
```

**Policy 3 — Owner Can Delete:**
```sql
CREATE POLICY "Owner can delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## STEP 8 — Disable Email Confirmation for Dev (Recommended)

During development you want signups to work without email confirmation:

1. Go to **Authentication → Settings**
2. Under **Email Auth**, toggle OFF **Enable email confirmations**
3. Save

> Turn this back ON before going to production.

---

## STEP 9 — Add Your ENV Values

Open your `.env` file and add:

```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2...
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## STEP 10 — Run Prisma Migrations

With your `.env` set, push your schema to Supabase:

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to Supabase (creates all tables)
npx prisma db push

# Or if using migrations
npx prisma migrate deploy
```

**Expected output:**
```
✅ Your database is now in sync with your Prisma schema.
```

---

## STEP 11 — Verify Connection

Start your backend and check the logs:

```bash
npm run dev
```

**Expected logs:**
```
✅ Redis connected
🚀 Server running on port 5001
```

Then test the health endpoint:
```bash
curl http://localhost:5001/api/v1/admin/health
```

**Expected:** `{ "status": "ok" }`

---

## STEP 12 — View Your Data in Supabase

After running some API calls, check your data:

1. Go to **Table Editor** in Supabase Dashboard
2. You'll see all tables: `users`, `restaurants`, `branches`, `orders` etc.
3. Use the **SQL Editor** for custom queries:

```sql
-- Check all users
SELECT id, name, email, role, is_active, created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;

-- Check all restaurants
SELECT id, name, status, created_at
FROM restaurants
ORDER BY created_at DESC;
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Invalid API key` | Make sure you copied `service_role` key, not `anon` key |
| `Connection refused` | Check `DATABASE_URL` password — special chars need URL encoding (e.g. `@` → `%40`) |
| `JWT expired` | Check `SUPABASE_JWT_SECRET` matches what's in Supabase Dashboard → Settings → API |
| `Row level security violation` | You're using the anon key; switch to service role key for server-side |
| Prisma migration fails | Use `DIRECT_URL` (port 5432) not the pgBouncer URL (port 6543) for migrations |
