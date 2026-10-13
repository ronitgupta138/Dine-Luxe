# 🛠️ Dine Luxe — Quickstart & Local Setup Guide

> Comprehensive local environment setup for the Dine Luxe full-stack monorepo.  
> Stack: Next.js 14 · Express.js · PostgreSQL · Redis · Turborepo

---

## 📋 System Prerequisites

Ensure the following tools are installed on your workstation:
* **Node.js**: v18.0.0 or higher (v20 LTS recommended)
* **pnpm**: v9+ (`npm install -g pnpm`) or **npm**: v10+
* **Git**: `git --version`
* **Docker & Docker Compose** (optional, for local Postgres/Redis instances)

---

## 🚀 Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/ronitgupta138/dine-luxe.git
cd dine-luxe

# Install dependencies across all monorepo workspaces (frontend, backend, shared)
pnpm install
# or: npm install --legacy-peer-deps
```

---

## 🔑 Step 2: Environment Configuration

Copy the example environment configurations:

```bash
# Monorepo root environment
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env
```

### Essential Configuration Variables (`.env`)

```env
# FRONTEND CONFIGURATION
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# BACKEND CONFIGURATION
PORT=5001
JWT_SECRET=supersecret-local-jwt-key
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
REDIS_URL=redis://127.0.0.1:6379

# PRISMA & DATABASE
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dineluxe?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/dineluxe?schema=public"
```

> **Note on Redis:** If no local or remote Redis instance is running, the backend automatically switches to its in-memory fallback cache to ensure zero startup crashes during local development.

---

## 🧪 Step 3: Run Automated Test Suites

```bash
# Run the core reservation locking and API integration test suite
npm test
# or using the root Makefile:
make test
```

Expected output:
```text
▶ Dine Luxe API Test Suite
  ✔ 1. Valid reservation creation succeeds with 201 Created (18ms)
  ✔ 2. Reservation with invalid party size returns 400 Bad Request (2.8ms)
  ✔ 3. Reservation with missing customerName returns 400 Bad Request (2.6ms)
  ✔ 4. Duplicate reservation for identical table and timeSlot returns 409 Conflict (3.4ms)
  ✔ 5. Redis Lock: client cannot release lock owned by different token (0.5ms)
  ✔ 6. Reservation cancellation updates status to CANCELLED (3.5ms)
  ✔ 7. Menu listing and category filtering works (3.7ms)
  ✔ 8. Order creation and Kitchen Display status updates succeed (3.4ms)
✔ Dine Luxe API Test Suite
```

---

## 💻 Step 4: Run Development Services

Start both the frontend and backend servers concurrently using Turborepo:

```bash
# Launch Turborepo development pipeline
pnpm dev
# or: npm run dev
```

### Active Local Services:
* **Frontend Portal (Next.js 14):** `http://localhost:3000`
  * Customer App: `http://localhost:3000/customer`
  * Owner / Admin Dashboard: `http://localhost:3000/owner`
  * Kitchen Display System (KDS): `http://localhost:3000/kitchen`
* **REST API Gateway (Express.js):** `http://localhost:5001/api/v1`
  * Health Endpoint: `http://localhost:5001/health`

---

## 📦 Step 5: Building for Production

```bash
# Compile TypeScript and production bundles
pnpm build
# or: make build
```
