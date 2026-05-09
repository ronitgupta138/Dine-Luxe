# 04 — Render Hosting Setup Guide

> Render is a **cloud platform** for deploying your Node.js backend.
> It connects to your GitHub repo and auto-deploys on every push.
> **Free tier:** 1 free web service (spins down after 15 min inactivity — fine for dev/testing)

---

## What Gets Deployed

Your Express.js backend (TypeScript) compiled to JavaScript and served as a Node.js web service.

---

## STEP 1 — Push Your Backend to GitHub

Before deploying, your code must be on GitHub.

```bash
# If not already a git repo
cd backend
git init
git add .
git commit -m "Initial backend commit"

# Create repo on GitHub (go to github.com/new)
# Then connect:
git remote add origin https://github.com/YOUR_USERNAME/restaurant-os-backend.git
git branch -M main
git push -u origin main
```

> Make sure your `.env` is in `.gitignore` — **never push secrets to GitHub**

**.gitignore should include:**
```
node_modules/
dist/
.env
.env.local
*.log
```

---

## STEP 2 — Create a Render Account

1. Go to **https://render.com**
2. Click **Get Started for Free**
3. Sign up with **GitHub** (required for auto-deploy)
4. Authorize Render to access your GitHub repos
5. You land on the **Render Dashboard**

---

## STEP 3 — Create a New Web Service

1. Click **New +** (top right)
2. Select **Web Service**
3. In **Connect a repository**:
   - If prompted, click **Configure GitHub** and grant access to your backend repo
   - Select `restaurant-os-backend` repo
   - Click **Connect**

---

## STEP 4 — Configure the Web Service

Fill in the deployment settings:

| Field | Value |
|-------|-------|
| **Name** | `restaurant-os-backend` |
| **Region** | Oregon (US West) or Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `backend` *(if your repo has backend/ folder)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

> Your `package.json` already has:
> - `"build": "tsc"` → compiles TypeScript to `dist/`
> - `"start": "node dist/server.js"` → runs compiled output

---

## STEP 5 — Add Environment Variables

1. Scroll down to **Environment Variables** section
2. Click **Add Environment Variable** for each one:

```
PORT                     = 5001
NODE_ENV                 = production
FRONTEND_URL             = https://your-frontend-domain.com

SUPABASE_URL             = https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET      = your-jwt-secret

DATABASE_URL             = postgresql://postgres:PASSWORD@db.xxxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL               = postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres

REDIS_URL                = rediss://default:PASSWORD@endpoint.upstash.io:6379

RESEND_API_KEY           = re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM               = noreply@yourdomain.com

BCRYPT_SALT_ROUNDS       = 12
OTP_EXPIRY_SECONDS       = 300
GEO_FENCE_RADIUS_METERS  = 200
ADMIN_INVITE_CODE        = PLATFORM_ADMIN_2024
```

> Or use the **Secret Files** feature: paste your entire `.env` content as a secret file mounted at `/etc/secrets/.env`

---

## STEP 6 — Deploy

1. Click **Create Web Service**
2. Render starts building:
   - Pulls code from GitHub
   - Runs `npm install`
   - Runs `npm run build` (TypeScript compilation)
   - Starts `node dist/server.js`
3. Watch the **Logs** tab in real time
4. When you see:
   ```
   ✅ Redis connected
   🚀 Server running on port 5001
   ```
   Your service is live!

---

## STEP 7 — Get Your Live URL

1. At the top of your web service page you'll see:
   ```
   https://restaurant-os-backend.onrender.com
   ```
2. Test it:
```bash
curl https://restaurant-os-backend.onrender.com/api/v1/admin/health
```

**Expected:** `{ "status": "ok" }`

---

## STEP 8 — Update CORS / Frontend URL

Now that you have a live backend URL, update:

1. In Render environment variables, set:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

2. In your Supabase project:
   - Go to **Authentication → Settings**
   - Add to **Additional Redirect URLs:**
     ```
     https://restaurant-os-backend.onrender.com/**
     ```

---

## STEP 9 — Set Up Auto-Deploy

Auto-deploy is enabled by default. Every `git push` to `main` triggers a new deployment.

To verify:
```bash
# Make a small change
echo "# Updated" >> README.md
git add . && git commit -m "test deploy" && git push
```

Watch the **Deploys** tab in Render — a new build starts automatically.

---

## STEP 10 — Keep Service Awake (Free Tier Fix)

Free Render services **sleep after 15 minutes of inactivity** and take ~30 seconds to wake up.

**Option A — Use a free cron ping service:**

1. Go to **https://cron-job.org** (free)
2. Create a free account
3. Create a new cron job:
   - **URL:** `https://restaurant-os-backend.onrender.com/api/v1/admin/health`
   - **Schedule:** Every 14 minutes
   - **Method:** GET
4. Save — your service stays awake!

**Option B — Use UptimeRobot (free):**

1. Go to **https://uptimerobot.com**
2. Create free account
3. Add monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://restaurant-os-backend.onrender.com/api/v1/admin/health`
   - **Monitoring Interval:** Every 5 minutes
4. This pings your service every 5 minutes AND alerts you if it goes down.

---

## Free Tier Notes

| Limit | Value |
|-------|-------|
| Web services | 1 free |
| RAM | 512MB |
| CPU | Shared |
| Bandwidth | 100GB/month |
| Build minutes | 500/month |
| Sleep after inactivity | 15 minutes |
| Custom domain | ✅ Free |
| Auto TLS/HTTPS | ✅ Free |

---

## Alternative Free Hosting Platforms

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Render** | 1 web service | Best DX, recommended |
| **Railway** | $5 credit/month | No sleep, fast deploys |
| **Fly.io** | 3 free VMs | Good for Docker apps |
| **Koyeb** | 2 free services | No sleep on free tier |
| **Cyclic** | Free serverless | Good for Express apps |
| **Vercel** | Serverless functions | Stateless only |
| **Heroku** | Removed free tier | Now paid only |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Build fails: `tsc not found` | Add `typescript` to `dependencies` (not just `devDependencies`) |
| `Cannot find module dist/server.js` | Build command not running — check `npm run build` compiles to `dist/` |
| `Invalid environment variables` | One of your env vars is missing or wrong format — check Render env vars |
| `Port already in use` | Render injects its own PORT — make sure your code uses `process.env.PORT` |
| Service keeps sleeping | Add cron ping (Step 10) |
| Supabase connection fails in prod | Make sure `DATABASE_URL` uses pgBouncer URL (port 6543) not direct (5432) |
