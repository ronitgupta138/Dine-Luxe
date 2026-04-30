# 🍽️ Restaurant OS — Complete Installation Guide
> Stack: Next.js 14 · Express.js · Supabase · Tailwind · shadcn/ui
> 100% Free for Students | Author: Priyanshu & Ronit | 2025

---

## ⚡ PHASE 0 — PREREQUISITES (Install Once on Your Machine)

### 0.1 — Node.js (LTS)
```bash
# Download from: https://nodejs.org (choose LTS v20+)
# Verify after install:
node --version       # should show v20.x.x
npm --version        # should show 10.x.x
```

### 0.2 — pnpm (Package Manager — faster than npm)
```bash
npm install -g pnpm
pnpm --version       # should show 8.x.x or 9.x.x
```

### 0.3 — Git
```bash
# Download from: https://git-scm.com
git --version        # should show git version 2.x.x
```

### 0.4 — Supabase CLI
```bash
npm install -g supabase
supabase --version   # should show 1.x.x
```

### 0.5 — VS Code Extensions (Recommended)
```
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Prisma (if used later)
- GitLens
- Thunder Client (API testing, replaces Postman)
```

---

## 🏗️ PHASE 1 — PROJECT SCAFFOLDING

### 1.1 — Create Monorepo Root
```bash
mkdir restaurant-os
cd restaurant-os
git init
```

### 1.2 — Root package.json (pnpm workspaces)
```bash
# Create root package.json manually:
```
```json
{
  "name": "restaurant-os",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### 1.3 — pnpm Workspace Config
```bash
# Create pnpm-workspace.yaml at root:
```
```yaml
packages:
  - 'frontend'
  - 'backend'
  - 'shared'
```

### 1.4 — Turborepo Config
```bash
pnpm add -D turbo -w
```
```json
// turbo.json at root
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

### 1.5 — Root .gitignore
```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.next/
dist/
.turbo/
*.log
.DS_Store
EOF
```

---

## 🎨 PHASE 2 — FRONTEND SETUP (`/frontend`)

### 2.1 — Create Next.js App
```bash
cd restaurant-os
pnpm create next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd frontend
```
> When prompted:
> - TypeScript → **Yes**
> - ESLint → **Yes**
> - Tailwind CSS → **Yes**
> - `src/` directory → **No**
> - App Router → **Yes**
> - Import alias → **Yes** (`@/*`)

---

### 2.2 — Core UI: shadcn/ui
```bash
# Inside /frontend
pnpm dlx shadcn@latest init
```
> When prompted:
> - Style → **Default**
> - Base color → **Slate**
> - CSS variables → **Yes**

```bash
# Install ALL components used in this project (run once):
pnpm dlx shadcn@latest add \
  button \
  input \
  label \
  card \
  badge \
  avatar \
  dialog \
  sheet \
  tabs \
  toast \
  toaster \
  skeleton \
  table \
  progress \
  switch \
  select \
  dropdown-menu \
  popover \
  separator \
  command \
  scroll-area \
  calendar \
  alert \
  alert-dialog \
  form \
  textarea \
  checkbox \
  radio-group \
  slider \
  tooltip \
  hover-card \
  collapsible \
  accordion
```

---

### 2.3 — Supabase Client (Auth + Realtime)
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

---

### 2.4 — State Management
```bash
# Zustand — global client state (cart, auth, branding, notifications)
pnpm add zustand

# TanStack Query — server state, caching, refetching
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

---

### 2.5 — Forms & Validation
```bash
# React Hook Form — all form handling
pnpm add react-hook-form

# Zod — schema validation (shared with backend)
pnpm add zod

# Hookform resolver — connects RHF + Zod
pnpm add @hookform/resolvers
```

---

### 2.6 — HTTP Client
```bash
# Axios — API calls to backend
pnpm add axios
```

---

### 2.7 — Charts & Data Visualization
```bash
# Recharts — all dashboard charts (free, MIT)
pnpm add recharts
```

---

### 2.8 — Floor Layout Designer
```bash
# dnd-kit — drag-and-drop floor table designer
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
```

---

### 2.9 — Image Handling
```bash
# react-easy-crop — crop uploaded photos to 4:3
pnpm add react-easy-crop
```

---

### 2.10 — QR Code
```bash
# qrcode.react — generate UPI/table QR codes
pnpm add qrcode.react
pnpm add -D @types/qrcode
```

---

### 2.11 — Maps (Free)
```bash
# react-leaflet — free open-source maps (no API key needed for basic)
pnpm add react-leaflet leaflet
pnpm add -D @types/leaflet
```

---

### 2.12 — Date/Time
```bash
# date-fns — lightweight date formatting + manipulation
pnpm add date-fns

# react-day-picker — calendar date picker UI (works with shadcn calendar)
pnpm add react-day-picker
```

---

### 2.13 — Animations
```bash
# framer-motion — page transitions, modal animations, chart entries
pnpm add framer-motion

# lottie-react — food-themed splash screen animation
pnpm add lottie-react
```

---

### 2.14 — Notifications (Toast)
```bash
# Sonner — beautiful toast notifications (works great with shadcn)
pnpm add sonner
```

---

### 2.15 — PWA Support
```bash
# next-pwa — makes the app installable on mobile as PWA
pnpm add next-pwa
pnpm add -D @types/next-pwa
```

---

### 2.16 — Utilities
```bash
# clsx + tailwind-merge — class name merging (already via shadcn)
pnpm add clsx tailwind-merge

# class-variance-authority — variant-based component styling
pnpm add class-variance-authority

# lucide-react — icon library (used by shadcn)
pnpm add lucide-react

# react-intersection-observer — infinite scroll detection
pnpm add react-intersection-observer

# use-debounce — debounce hook for search inputs
pnpm add use-debounce

# nanoid — generate unique IDs client-side
pnpm add nanoid
```

---

### 2.17 — Dev Dependencies (Frontend)
```bash
pnpm add -D \
  @types/node \
  @types/react \
  @types/react-dom \
  typescript \
  eslint \
  eslint-config-next \
  prettier \
  prettier-plugin-tailwindcss \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser
```

---

### 2.18 — Frontend Environment Variables
```bash
# /frontend/.env.local
cat > .env.local << 'EOF'
# Supabase (get from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

---

### 2.19 — Frontend Config Files

**`next.config.ts`**
```typescript
import type { NextConfig } from 'next'
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

module.exports = withPWA(nextConfig)
```

**`tailwind.config.ts`** — add CSS variables for brand colors:
```typescript
// Add to content array and extend theme with brand CSS variables
// (shadcn init already sets up the base — just add brand vars)
theme: {
  extend: {
    colors: {
      brand: {
        primary: 'var(--brand-primary)',
        secondary: 'var(--brand-secondary)',
      }
    }
  }
}
```

**`tsconfig.json`** — path aliases (shadcn sets this up):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## ⚙️ PHASE 3 — BACKEND SETUP (`/backend`)

### 3.1 — Initialize Backend
```bash
cd ../                  # back to restaurant-os root
mkdir backend && cd backend
pnpm init
```

---

### 3.2 — Express Core
```bash
pnpm add express
pnpm add -D @types/express
```

---

### 3.3 — Supabase Admin Client
```bash
# Service-role key — can bypass RLS, used server-side only
pnpm add @supabase/supabase-js
```

---

### 3.4 — Auth & Security
```bash
# JWT verification (Supabase issues JWTs — we verify them)
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken

# bcrypt — hashing DOB default passwords
pnpm add bcryptjs
pnpm add -D @types/bcryptjs

# Helmet — security HTTP headers
pnpm add helmet

# CORS
pnpm add cors
pnpm add -D @types/cors

# express-rate-limit — rate limit auth and sensitive endpoints
pnpm add express-rate-limit
```

---

### 3.5 — Validation
```bash
# Zod — same schemas as frontend (via shared package)
pnpm add zod
```

---

### 3.6 — File Upload
```bash
# Multer — handle multipart/form-data for image uploads
pnpm add multer
pnpm add -D @types/multer
```

---

### 3.7 — Email
```bash
# Resend — 3000 emails/month free, no credit card needed
pnpm add resend
```

---

### 3.8 — PDF Generation (Receipts & Reports)
```bash
# pdf-lib — generate PDF receipts
pnpm add pdf-lib

# exceljs — generate Excel/CSV report exports
pnpm add exceljs
```

---

### 3.9 — Logging
```bash
# Winston — structured logging with levels
pnpm add winston

# morgan — HTTP request logger middleware
pnpm add morgan
pnpm add -D @types/morgan
```

---

### 3.10 — Utilities
```bash
# dotenv — load .env file
pnpm add dotenv

# uuid — generate UUIDs for IDs
pnpm add uuid
pnpm add -D @types/uuid

# date-fns — date manipulation (same as frontend)
pnpm add date-fns

# crypto (built-in Node.js — no install needed)
# Used for: OTP generation (crypto.randomInt)
```

---

### 3.11 — Dev Dependencies (Backend)
```bash
pnpm add -D \
  typescript \
  ts-node \
  nodemon \
  @types/node \
  @types/express \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  prettier
```

---

### 3.12 — Backend Scripts (`package.json`)
```json
{
  "name": "backend",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src/**/*.ts"
  }
}
```

---

### 3.13 — `nodemon.json`
```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node --project tsconfig.json src/server.ts"
}
```

---

### 3.14 — Backend `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 3.15 — Backend Environment Variables
```bash
# /backend/.env
cat > .env << 'EOF'
# Server
PORT=5000
NODE_ENV=development

# Supabase (service_role key — NEVER expose to frontend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Email (Resend)
RESEND_API_KEY=re_your-resend-key
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Payment (TODO — add when decided)
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
# OR
# STRIPE_SECRET_KEY=
EOF
```

---

## 📦 PHASE 4 — SHARED PACKAGE SETUP (`/shared`)

### 4.1 — Initialize Shared
```bash
cd ../
mkdir shared && cd shared
pnpm init
```

```bash
# Install only what shared needs
pnpm add zod
pnpm add -D typescript @types/node
```

### 4.2 — Shared `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["types/**/*", "utils/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4.3 — Add Shared to Both Apps
```bash
# In /frontend/package.json — add:
"dependencies": {
  "shared": "workspace:*"
}

# In /backend/package.json — add:
"dependencies": {
  "shared": "workspace:*"
}

# Then run from root:
cd ../ && pnpm install
```

---

## 🗄️ PHASE 5 — SUPABASE SETUP

### 5.1 — Create Free Supabase Project
```
1. Go to https://supabase.com
2. Sign up with GitHub (free)
3. Click "New Project"
4. Project name: restaurant-os
5. Database password: (save this!)
6. Region: Southeast Asia (Singapore) ← closest to India
7. Free tier: ✅ 500MB DB, 1GB storage, 50MB file uploads
```

### 5.2 — Get Your Keys
```
Supabase Dashboard → Settings → API:
- Project URL        → NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL
- anon public key    → NEXT_PUBLIC_SUPABASE_ANON_KEY
- service_role key   → SUPABASE_SERVICE_ROLE_KEY (backend only, secret!)
- JWT secret         → SUPABASE_JWT_SECRET (backend JWT verification)
```

### 5.3 — Initialize Supabase CLI
```bash
cd restaurant-os/supabase
supabase init
supabase login          # opens browser for auth
supabase link --project-ref your-project-ref-id
```

### 5.4 — Enable Realtime on Key Tables
```sql
-- Run in Supabase SQL editor (Dashboard → SQL Editor):
ALTER TABLE tables REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_items REPLICA IDENTITY FULL;
ALTER TABLE queue_entries REPLICA IDENTITY FULL;
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE inventory_items REPLICA IDENTITY FULL;
```

### 5.5 — Push Migrations
```bash
supabase db push          # runs all /supabase/migrations/*.sql files
```

---

## 📧 PHASE 6 — RESEND SETUP (Free Email)

```
1. Go to https://resend.com
2. Sign up (free: 3000 emails/month)
3. Dashboard → API Keys → Create API Key
4. Copy key → paste into backend .env as RESEND_API_KEY
5. Add & verify your domain (or use the free onboarding.resend.dev for dev)
```

---

## 🚀 PHASE 7 — RUNNING THE PROJECT

### 7.1 — Install All Dependencies (from root)
```bash
cd restaurant-os
pnpm install          # installs ALL workspace packages at once
```

### 7.2 — Run Both Apps in Development
```bash
# From root — runs frontend + backend simultaneously
pnpm dev

# Or run individually:
cd frontend && pnpm dev      # → http://localhost:3000
cd backend  && pnpm dev      # → http://localhost:5000
```

---

## 🌐 PHASE 8 — DEPLOYMENT (Free Tiers)

### 8.1 — Frontend → Vercel (Free Hobby Plan)
```bash
# Install Vercel CLI
npm install -g vercel

cd frontend
vercel login
vercel --prod

# Add environment variables in Vercel Dashboard:
# → Project → Settings → Environment Variables
# Add all variables from .env.local
```
> Auto-deploys every time you push to GitHub main branch. ✅

### 8.2 — Backend → Railway (Free $5/month credit)
```
1. Go to https://railway.app
2. Sign up with GitHub (free — $5/month credit included)
3. New Project → Deploy from GitHub Repo → select restaurant-os/backend
4. Add environment variables from /backend/.env
5. Railway auto-detects Node.js and deploys
6. Copy the generated URL → add as NEXT_PUBLIC_API_URL in Vercel
```

### 8.3 — Alternative Backend → Render (Free)
```
1. Go to https://render.com
2. New → Web Service → Connect GitHub
3. Build Command: cd backend && pnpm install && pnpm build
4. Start Command: node backend/dist/server.js
5. Free tier: 750 hours/month (enough for dev)
Note: Free tier sleeps after 15min inactivity — use Railway for always-on
```

---

## 📋 COMPLETE PACKAGE SUMMARY

### Frontend Packages (`/frontend`)
| Package | Purpose | Install Command |
|---------|---------|----------------|
| `next` | Framework | (via create-next-app) |
| `react`, `react-dom` | UI library | (via create-next-app) |
| `typescript` | Type safety | (via create-next-app) |
| `tailwindcss` | Styling | (via create-next-app) |
| `@supabase/supabase-js` | DB + Auth + Realtime | `pnpm add @supabase/supabase-js` |
| `@supabase/ssr` | Server-side auth | `pnpm add @supabase/ssr` |
| `zustand` | Global state | `pnpm add zustand` |
| `@tanstack/react-query` | Server state + cache | `pnpm add @tanstack/react-query` |
| `react-hook-form` | Form handling | `pnpm add react-hook-form` |
| `zod` | Validation schemas | `pnpm add zod` |
| `@hookform/resolvers` | RHF + Zod bridge | `pnpm add @hookform/resolvers` |
| `axios` | HTTP client | `pnpm add axios` |
| `recharts` | Charts/graphs | `pnpm add recharts` |
| `@dnd-kit/core` | Drag-and-drop | `pnpm add @dnd-kit/core` |
| `@dnd-kit/sortable` | Sortable lists | `pnpm add @dnd-kit/sortable` |
| `@dnd-kit/utilities` | DnD helpers | `pnpm add @dnd-kit/utilities` |
| `@dnd-kit/modifiers` | DnD constraints | `pnpm add @dnd-kit/modifiers` |
| `react-easy-crop` | Image cropping | `pnpm add react-easy-crop` |
| `qrcode.react` | QR code generator | `pnpm add qrcode.react` |
| `react-leaflet` | Maps (free) | `pnpm add react-leaflet leaflet` |
| `date-fns` | Date formatting | `pnpm add date-fns` |
| `react-day-picker` | Date picker UI | `pnpm add react-day-picker` |
| `framer-motion` | Animations | `pnpm add framer-motion` |
| `lottie-react` | Lottie animations | `pnpm add lottie-react` |
| `sonner` | Toast notifications | `pnpm add sonner` |
| `next-pwa` | PWA support | `pnpm add next-pwa` |
| `clsx` | Class merging | `pnpm add clsx` |
| `tailwind-merge` | Tailwind dedup | `pnpm add tailwind-merge` |
| `class-variance-authority` | Component variants | `pnpm add class-variance-authority` |
| `lucide-react` | Icons | `pnpm add lucide-react` |
| `react-intersection-observer` | Infinite scroll | `pnpm add react-intersection-observer` |
| `use-debounce` | Debounce hook | `pnpm add use-debounce` |
| `nanoid` | Unique IDs | `pnpm add nanoid` |
| shadcn/ui components | UI components | `pnpm dlx shadcn@latest add ...` |

### Backend Packages (`/backend`)
| Package | Purpose | Install Command |
|---------|---------|----------------|
| `express` | Web framework | `pnpm add express` |
| `@supabase/supabase-js` | DB admin client | `pnpm add @supabase/supabase-js` |
| `jsonwebtoken` | JWT verification | `pnpm add jsonwebtoken` |
| `bcryptjs` | Password hashing | `pnpm add bcryptjs` |
| `helmet` | Security headers | `pnpm add helmet` |
| `cors` | CORS middleware | `pnpm add cors` |
| `express-rate-limit` | Rate limiting | `pnpm add express-rate-limit` |
| `zod` | Validation | `pnpm add zod` |
| `multer` | File uploads | `pnpm add multer` |
| `resend` | Email sending | `pnpm add resend` |
| `pdf-lib` | PDF generation | `pnpm add pdf-lib` |
| `exceljs` | Excel/CSV export | `pnpm add exceljs` |
| `winston` | Logging | `pnpm add winston` |
| `morgan` | HTTP logging | `pnpm add morgan` |
| `dotenv` | Env vars | `pnpm add dotenv` |
| `uuid` | UUID generation | `pnpm add uuid` |
| `date-fns` | Date utilities | `pnpm add date-fns` |
| `nodemon` (dev) | Hot reload | `pnpm add -D nodemon` |
| `ts-node` (dev) | Run TS directly | `pnpm add -D ts-node` |
| `typescript` (dev) | Type checking | `pnpm add -D typescript` |

### Shared Package (`/shared`)
| Package | Purpose |
|---------|---------|
| `zod` | Shared validation schemas |
| `typescript` | Type compilation |

---

## 🔢 PHASE 9 — FIRST RUN CHECKLIST

```
□ Node.js 20+ installed
□ pnpm installed
□ Supabase project created (free tier)
□ Supabase keys copied to both .env files
□ Resend account created + API key added
□ pnpm install run from root (installs all packages)
□ supabase db push run (creates all 28 tables)
□ pnpm dev run from root (starts both apps)
□ http://localhost:3000 opens frontend
□ http://localhost:5000/api/health returns { status: 'ok' }
□ Supabase Dashboard → Table Editor shows all tables
□ Supabase Dashboard → Realtime → Inspect shows channels
```

---

## 💰 COST BREAKDOWN (Monthly)

| Service | Free Tier | Limit |
|---------|-----------|-------|
| **Supabase** | $0 | 500MB DB, 1GB storage, 2GB bandwidth |
| **Vercel** | $0 | 100GB bandwidth, unlimited deploys |
| **Railway** | $0 | $5/month credit included |
| **Resend** | $0 | 3,000 emails/month |
| **GitHub** | $0 | Unlimited public repos |
| **Total** | **$0/month** | Perfect for student development |

---

*All packages are MIT licensed and free to use commercially.*
