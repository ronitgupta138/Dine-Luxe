# 02 — Upstash Redis Setup Guide

> Upstash is a **serverless Redis** platform — no server to manage, pay only per request.
> Your backend uses Redis for: OTP storage, rate limiting, refresh tokens, session caching, and delivery location tracking.
> **Free tier:** 10,000 commands/day, 256MB data, 1 database

---

## What Your Backend Uses Redis For

| Feature | Redis Key Pattern | TTL |
|---------|------------------|-----|
| OTP verification | `otp:{email}` | 5 minutes |
| Pending signup data | `pending_admin_signup:{email}` | 5 minutes |
| Refresh tokens | `refresh_token:{userId}` | 7 days |
| Rate limiting | `rl:{ip}:{route}` | 1 minute |
| UPI payment polling | `upi_status:{refId}` | 10 minutes |

---

## STEP 1 — Create an Upstash Account

1. Go to **https://upstash.com**
2. Click **Start for free**
3. Sign up with **GitHub** (recommended) or Google or Email
4. Verify your email
5. You land on the **Upstash Console**

---

## STEP 2 — Create a Redis Database

1. Click **Create Database**
2. Fill in:
   - **Name:** `restaurant-os-cache`
   - **Type:** Regional *(for low latency)*
   - **Region:** Choose closest to your server
     - If hosting on Render (Singapore) → `ap-southeast-1`
     - If hosting in US → `us-east-1`
   - **Eviction:** `noeviction` *(don't auto-delete keys — important for OTP)*
3. Click **Create**

---

## STEP 3 — Get Your Redis Connection URL

1. Your database dashboard opens automatically
2. Scroll to **Connect** section
3. Click the **Node.js** tab
4. Find the line that says `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

> **Important:** Your backend uses `ioredis` (not the REST SDK), so you need the **Redis URL**, not the REST URL.

5. Click **Details** tab (or look for **Endpoint** section)
6. Copy the **Redis URL** — it looks like:

```
rediss://default:AXXXXXXXXXXXXXXXXXXXXXXXXXXx@caring-xxx-12345.upstash.io:6379
```

> Note: `rediss://` (double s) = TLS/SSL encrypted connection. This is correct.

---

## STEP 4 — Add to Your ENV

```env
# Upstash Redis
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

---

## STEP 5 — Test the Connection

Start your backend and watch the logs:

```bash
npm run dev
```

**Expected:**
```
✅ Redis connected
🚀 Server running on port 5001
```

**Manual test — verify OTP flow works:**
```bash
# This triggers an OTP being stored in Redis
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+919876543210","password":"Test@1234"}'
```

Then check in Upstash Console → **Data Browser** — you should see a key `otp:test@example.com`

---

## STEP 6 — Monitor Usage (Upstash Console)

1. Go to your database in Upstash Console
2. Click **Metrics** tab
3. You can see:
   - Commands per second
   - Memory usage
   - Hit/miss ratio
   - Daily command count (vs 10K free limit)

---

## STEP 7 — Data Browser (Debug Keys)

Useful during development to inspect what's stored:

1. Go to **Data Browser** in your database
2. You can browse all keys, see values and TTLs
3. Helpful for debugging OTP issues, token problems etc.

---

## Free Tier Notes

| Limit | Value |
|-------|-------|
| Commands per day | 10,000 |
| Max data size | 256MB |
| Max databases | 1 |
| Bandwidth | 10GB/month |
| TLS | ✅ Included |
| Uptime SLA | 99.9% |

> For development and testing, 10K commands/day is plenty.
> Each API request typically uses 3–8 Redis commands (rate limit check + OTP or token ops).

---

## Alternative Free Redis Options

If you hit the Upstash limit:

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Upstash** | 10K cmd/day | Best for serverless |
| **Redis Cloud** (RedisLabs) | 30MB free DB | Good for small apps |
| **Railway** | $5 free credits/month | Self-hosted Redis |
| **Local Redis** (development only) | Unlimited | `brew install redis` or Docker |

**Local Redis for development (no account needed):**
```bash
# macOS
brew install redis && brew services start redis
export REDIS_URL=redis://localhost:6379

# Docker
docker run -d -p 6379:6379 redis:alpine
export REDIS_URL=redis://localhost:6379

# Windows (WSL)
sudo apt install redis-server && sudo service redis start
export REDIS_URL=redis://localhost:6379
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ECONNREFUSED` | Wrong URL format — make sure it starts with `rediss://` (not `redis://`) |
| `WRONGPASS` | Password in URL is incorrect — copy again from Upstash Console |
| `Connection timeout` | Wrong region — your server and Redis should be in the same region |
| `ERR max daily request limit` | Hit 10K free limit — wait for reset or upgrade |
| Redis shows `offline` in logs | Backend falls back to in-memory store automatically (your code handles this) |
