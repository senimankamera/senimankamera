# Local Development Guide

This guide provides step-by-step instructions for setting up and running the Seniman Kamera web application on your local machine.

---

## 💻 Prerequisites

Ensure you have the following installed:
- **Node.js:** `v20.x` or `v22.x` (LTS recommended)
- **Package Manager:** `npm` (or `pnpm`)
- **Database:** PostgreSQL instance running locally (Docker or native) or a remote Supabase Postgres connection
- **Tunneling Tool (for DOKU webhooks):** `ngrok` or `localtunnel`

---

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the template configuration file to create `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and provide your development credentials:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/senimankamera_dev"

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# DOKU Payment Gateway Sandbox
DOKU_CLIENT_ID="MCH-DEV-xxxx"
DOKU_SECRET_KEY="SK-DEV-xxxx"
DOKU_ENV="sandbox"

# Telegram Admin Notification (Optional for local dev)
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Prisma & Database Schema
Apply schema migrations and generate the Prisma Client:
```bash
# Push Prisma schema to your local database
npx prisma db push

# Generate fresh Prisma client types
npx prisma generate
```

*(Optional) Seed the database with starter packages, categories, and site settings:*
```bash
npx tsx prisma/seed.ts
```

*(Optional) Inspect your local database records via Prisma Studio:*
```bash
npx prisma studio
```

### 4. Run Development Server
Start Next.js with Turbopack:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💳 Testing DOKU Webhook Locally

DOKU Sandbox requires a publicly accessible HTTPS endpoint to send payment notification webhooks.

1. Start a local tunnel with `ngrok`:
   ```bash
   ngrok http 3000
   ```
2. Copy the forwarding HTTPS URL (e.g. `https://abc-123.ngrok-free.app`).
3. Set your notification URL in the DOKU Dashboard:
   ```text
   https://abc-123.ngrok-free.app/api/payment/notification
   ```
4. Perform a test checkout in the booking flow and verify the webhook handling in your terminal console.

---

## 🔍 Running Verification Checks

Always verify that your code adheres to TypeScript and linting standards before committing:

```bash
# 1. TypeScript type checking
npx tsc --noEmit

# 2. ESLint code quality
npm run lint

# 3. Production build verification
npm run build
```
