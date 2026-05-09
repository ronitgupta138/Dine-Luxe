# 03 — Resend Email Setup Guide

> Resend is a **developer-first transactional email** service.
> Your backend uses it for: OTP verification emails, welcome emails, booking confirmations, booking reminders, and order receipts.
> **Free tier:** 3,000 emails/month, 100 emails/day, 1 custom domain

---

## Email Templates Your Backend Sends

| Template Name | Trigger | Recipient |
|--------------|---------|-----------|
| `otp-verify` | Signup, admin signup | New user |
| `welcome` | After OTP verified | New user |
| `booking-confirmed` | Booking created | Customer |
| `booking-reminder` | 24h before booking | Customer |
| `order-receipt` | Order paid | Customer |

---

## STEP 1 — Create a Resend Account

1. Go to **https://resend.com**
2. Click **Get started for free**
3. Sign up with **GitHub** or Email
4. Verify your email address
5. You land on the **Resend Dashboard**

---

## STEP 2 — Get Your API Key

1. In the left sidebar, click **API Keys**
2. Click **Create API Key**
3. Fill in:
   - **Name:** `restaurant-os-backend`
   - **Permission:** `Sending access` *(Full access is fine too)*
   - **Domain:** Leave as `All domains` for now
4. Click **Add**
5. **Copy the key immediately** — it starts with `re_` and is only shown once

```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> Save it somewhere safe. If you lose it, you must create a new one.

---

## STEP 3 — Add to Your ENV

```env
# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

> **Important:** The `EMAIL_FROM` address must match a domain you verify in Step 4.
> Until you verify a domain, you can only use `onboarding@resend.dev` as the sender (Resend's test address).

**For quick testing without a domain:**
```env
EMAIL_FROM=onboarding@resend.dev
```

---

## STEP 4 — Add & Verify Your Custom Domain (Recommended)

Without a verified domain, emails can only be sent to your own email address (sandbox mode).

1. In Resend Dashboard, click **Domains** in the sidebar
2. Click **Add Domain**
3. Enter your domain (e.g. `spicegarden.in` or `restaurantos.app`)
4. Click **Add**

Resend gives you DNS records to add. You'll need to add these to your domain's DNS provider:

**DNS Records to Add (example):**

| Type | Name | Value |
|------|------|-------|
| TXT | `@` or `resend._domainkey` | `v=spf1 include:amazonses.com ~all` |
| CNAME | `resend._domainkey` | `p.resend.com` |
| CNAME | `resend._bounce` | `feedback.resend.com` |

> Where to add DNS records:
> - **GoDaddy** → Domain → DNS Management
> - **Namecheap** → Domain List → Manage → Advanced DNS
> - **Cloudflare** → DNS → Records
> - **Google Domains** → DNS

5. After adding DNS records, click **Verify DNS Records** in Resend
6. Wait 5–30 minutes for DNS propagation
7. Status changes to ✅ **Verified**

---

## STEP 5 — Test Without a Domain (Dev Mode)

While waiting for domain verification or during development:

```env
EMAIL_FROM=onboarding@resend.dev
```

This only works if you send to your **own email** (the one you used to sign up for Resend).

**Test it:**
```bash
# Trigger OTP email
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "YOUR_OWN_EMAIL@gmail.com",
    "phone": "+919876543210",
    "password": "Test@1234"
  }'
```

Check your inbox — you should receive the OTP email.

---

## STEP 6 — Check Sent Emails in Dashboard

1. Go to **Emails** in left sidebar
2. You can see:
   - All sent emails
   - Delivery status (delivered / bounced / opened)
   - Full email content preview
   - Error messages if sending failed

---

## STEP 7 — Set Up Dev Fallback (Server Logs)

Your backend already prints the OTP to server logs in dev mode:
```
[DEV] OTP for rahul.sharma@gmail.com: 482910
```

This means even if email delivery fails, you can copy the OTP from your terminal logs during development.

---

## STEP 8 — Update ENV for Production

Once your domain is verified:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

Now emails can be sent to anyone (not just yourself).

---

## Free Tier Notes

| Limit | Value |
|-------|-------|
| Emails per month | 3,000 |
| Emails per day | 100 |
| Custom domains | 1 |
| Email logs retention | 3 days |
| Webhooks | ✅ Included |

> 100 emails/day is enough for early users. Each signup = 2 emails (OTP + welcome). Each booking = 2 emails (confirm + reminder). Scale up when needed.

---

## Alternative Free Email Services

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Resend** | 3K/month | Best DX, recommended |
| **Brevo (Sendinblue)** | 300/day (9K/month) | Good alternative |
| **Mailgun** | 100/day (free trial) | Requires credit card |
| **SendGrid** | 100/day forever free | Reliable, good deliverability |
| **Nodemailer + Gmail** | Limited (500/day) | Dev only, not production |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `401 Unauthorized` | Wrong API key — check no extra spaces when copying |
| `You can only send testing emails to your own email address` | Domain not verified; use `onboarding@resend.dev` and send to your own email |
| `Invalid from address` | `EMAIL_FROM` domain must match a verified domain in Resend |
| Emails going to spam | Add SPF, DKIM, DMARC records (Resend guides you through this) |
| `422 Unprocessable Entity` | Recipient email is invalid |
