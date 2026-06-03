# Development Setup Guide

## Quick start (5 minutes)

### 1. Copy env file
```bash
cp .env.example .env
```

### 2. Start database + Redis

**Option A — Docker (recommended if Docker Desktop is running)**
```bash
docker-compose up -d
```
Postgres will be at `localhost:5432`, Redis at `localhost:6379`.
The `.env.example` DATABASE_URL and REDIS_URL already point here — no change needed.

**Option B — Free cloud (no Docker required)**

- **Postgres → [Neon](https://neon.tech)** — Sign up with GitHub (free, no credit card)
  1. Create a new project
  2. Copy the Connection String from the dashboard
  3. Paste into `.env` as `DATABASE_URL`

- **Redis → [Upstash](https://upstash.com)** — Sign up with GitHub (free, no credit card)
  1. Create Database → Redis → US East
  2. Copy the `UPSTASH_REDIS_URL`
  3. Paste into `.env` as `REDIS_URL`

### 3. Get your Cerebras API key (required)

1. Go to [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Sign in → API Keys → Create New Key
3. Paste into `.env` as `CEREBRAS_API_KEY`

Free tier is available. Model: `llama-3.3-70b` (already set as default).

### 4. Run database migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### 5. Start the backend
```bash
cd backend
npm run dev
```

### 6. Start the frontend (separate terminal)
```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3000

---

## Platform OAuth Setup (optional — needed for live posting)

You can develop and preview everything without these. Only add them when you want to actually publish to a platform.

### Bluesky (easiest — 30 seconds, no app registration)
1. Log in at [bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
2. Click **Add App Password** → name it "smm-dev"
3. Copy the password (format: `xxxx-xxxx-xxxx-xxxx`)
4. Add to `.env`:
   ```
   BLUESKY_HANDLE=yourhandle.bsky.social
   BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

### X (Twitter)
1. Apply at [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App (free Basic tier: 1500 tweets/month)
3. Under **Keys and Tokens** → copy Client ID + Client Secret
4. Set callback URL to `http://localhost:3000/auth/x/callback`
5. Add to `.env`:
   ```
   X_CLIENT_ID=your-client-id
   X_CLIENT_SECRET=your-client-secret
   ```

### LinkedIn
1. Go to [linkedin.com/developers/apps/new](https://www.linkedin.com/developers/apps/new)
2. Create an app → request **Share on LinkedIn** + **Sign In with LinkedIn** products
3. Under **Auth** tab → copy Client ID + Client Secret
4. Add Redirect URL: `http://localhost:3000/auth/linkedin/callback`
5. Add to `.env`:
   ```
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

### Facebook + Instagram
1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) → Create App
2. Add **Instagram Graph API** and **Facebook Login** products
3. Under **Settings → Basic** → copy App ID + App Secret
4. Add to `.env`:
   ```
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   INSTAGRAM_APP_ID=your-app-id
   INSTAGRAM_APP_SECRET=your-app-secret
   ```

### TikTok
1. Go to [developers.tiktok.com](https://developers.tiktok.com/) → Create App
2. Enable **Content Posting API**
3. Add to `.env`:
   ```
   TIKTOK_CLIENT_KEY=your-client-key
   TIKTOK_CLIENT_SECRET=your-client-secret
   ```

---

## Hosting

When ready to deploy, you can host on:
- **Backend + DB**: [Render](https://render.com) (free tier, GitHub deploy)
- **Frontend**: [Vercel](https://vercel.com) (free, GitHub deploy)
- **Redis**: [Upstash](https://upstash.com) (optional, free tier available)

### Backend on Render

1. Go to [render.com/dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub repo. Render reads `render.yaml` at the repo root and
   creates the web service + PostgreSQL database automatically.
3. Set these environment variables in the Render service (marked `sync: false`
   in the blueprint — Render will prompt you for them):

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | (auto-set by the Blueprint from the `smm-db` database) |
   | `CEREBRAS_API_KEY` | your Cerebras key (required) |
   | `SESSION_SECRET` | a random 32+ char string |
   | `CORS_ORIGIN` | your Vercel URL, e.g. `https://project-smm.vercel.app` |
   | `PUBLIC_BACKEND_URL` | your Render URL, e.g. `https://smm-backend.onrender.com` |
   | `GOOGLE_CLIENT_ID` | from Google Cloud Console |
   | `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |
   | `GITHUB_CLIENT_ID` | from GitHub Developer Settings |
   | `GITHUB_CLIENT_SECRET` | from GitHub Developer Settings |
   | `ENCRYPTION_KEY` | a random 32+ char string |
   | `REDIS_URL` | (optional) your Upstash `rediss://...` URL |
   | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | (optional) for Bedrock fallback |

   The start command runs `prisma migrate deploy` automatically, and the app
   bootstraps default post types per-user on first login — no manual seed step needed.
4. Render exposes the service on a `.onrender.com` URL and uses `/health` for
   health checks.

> **Note:** Render free tier sleeps after 15 minutes of inactivity. First request
> after sleep takes ~30s. For always-on, upgrade to the Starter plan ($7/mo).

### Frontend on Vercel

1. Import the same GitHub repo into Vercel.
2. Set the **Root Directory** to `frontend`. The `frontend/vercel.json` handles the
   monorepo install/build (it installs from the repo root so the `@smm/shared`
   workspace resolves).
3. Add this environment variable in the Vercel project settings:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | your Render backend URL **with** `/api`, e.g. `https://smm-backend.onrender.com/api` |
   | `VITE_WS_URL` | (optional) `wss://smm-backend.onrender.com/ws` — derived from `VITE_API_URL` if omitted |

   `VITE_*` vars are baked in at build time, so redeploy after changing them.

The same `.env` variables apply on each hosting platform — just paste them into the
platform's environment settings dashboard.
