# 🚀 Dine Luxe — Production Deployment Guide

> Production deployment architecture, cloud service configuration, and hosting guidelines for Dine Luxe.

---

## 🏛️ Deployment Topology

```text
┌─────────────────────────┐          ┌──────────────────────────┐
│   Vercel / Cloudflare   │          │  Render / Railway / OCI  │
│    Frontend Web App     ├─────────►│     Express.js API       │
│    (Next.js 14 SSR)     │  HTTPS   │   (Node.js Container)    │
└─────────────────────────┘          └─────────────┬────────────┘
                                                   │
                          ┌────────────────────────┴───────────────────────┐
                          ▼                                                ▼
             ┌─────────────────────────┐                      ┌─────────────────────────┐
             │   Supabase PostgreSQL   │                      │      Upstash Redis      │
             │   • PgBouncer (6543)    │                      │   • Mutex key locks     │
             │   • Direct (5432)       │                      │   • Distributed caching │
             └─────────────────────────┘                      └─────────────────────────┘
```

---

## 🌐 Tier 1 — Frontend Deployment (Vercel)

1. **Connect GitHub Repository:**
   * Go to **[vercel.com](https://vercel.com)** and import `ronitgupta138/dine-luxe`.
2. **Configure Project Settings:**
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Next.js`
   * **Build Command:** `pnpm run build` (or `npm run build`)
   * **Output Directory:** `.next`
3. **Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

---

## ⚙️ Tier 2 — Backend Deployment (Render / Railway / Docker)

### Option A: Render Web Service
1. **New Web Service:**
   * Create a new Web Service on **[render.com](https://render.com)** connected to `ronitgupta138/dine-luxe`.
2. **Build & Start Commands:**
   * **Root Directory:** `backend`
   * **Environment:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start` (or `node dist/server.js`)
3. **Environment Variables:**
   ```env
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=<strong-random-secret>
   DATABASE_URL="postgresql://postgres:***@db.xxxx.supabase.co:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:***@db.xxxx.supabase.co:5432/postgres"
   REDIS_URL="rediss://default:***@endpoint.upstash.io:6379"
   SUPABASE_URL="https://xxxx.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
   FRONTEND_ORIGIN="https://dineluxe.vercel.app"
   ```

---

## 🗄️ Tier 3 — Database & Cache Providers

### 1. PostgreSQL (Supabase)
* Set up database instance on **[supabase.com](https://supabase.com)** (Region: `ap-south-1` for lowest latency in India).
* Run initial Prisma migrations:
  ```bash
  cd backend
  npx prisma migrate deploy
  ```

### 2. Redis Caching & Mutex Locks (Upstash)
* Create serverless Redis database on **[upstash.com](https://upstash.com)**.
* Enable TLS and use the `rediss://` connection string.
* Configure key expiration policies and monitor active mutex locks under peak load.
