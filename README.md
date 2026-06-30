# Trailmark — Scout Troop Attendance

A web app for scout troop leaders to manage scout profiles, take attendance,
track points, and get alerted when a scout misses sessions. Each scout has a
QR code that opens their profile directly when scanned.

## What it does

- **Scout profiles.** Each scout has a profile (from their application): name,
  DOB, guardian info, address, join date, notes — plus their group and total
  points.
- **Sessions.** Create a session for any date (normally Friday/Sunday).
- **Attendance entry.** For each session, mark every scout Present / Late /
  Absent, plus a 3-item checklist: arrived early, has copybook, in uniform.
  Each checked item is worth 1 point (max 3 per session); absent scouts score 0.
- **Automatic alerts.** If a scout is marked Absent for 3 sessions *in a row*,
  a notification appears in the bell icon.
- **Groups.** Each scout can be assigned to one of 4 groups via a dropdown on
  their profile.
- **QR codes.** Every scout profile has a QR code. Scanning it opens that
  scout's profile directly in the browser.
- **Search & filter.** The scouts list can be searched by name and filtered
  by group.

There is currently no login — anyone with the site link can view and edit
everything. This was a deliberate simplification for ease of use; if you ever
want access restricted again, that can be re-added.

## Tech stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL (hosted on Supabase) via the `pg` driver
- Deployed on Vercel

## Deploying (Vercel + Supabase)

### 1. Create a Supabase project
1. Go to supabase.com → New Project
2. Set a database password (save it somewhere safe)
3. Once created, go to Project Settings → Database → Connection string → URI
4. Copy it and substitute in your actual password

### 2. Deploy to Vercel
1. Push this project to a GitHub repo
2. Go to vercel.com → New Project → import the repo
3. In the project's Environment Variables settings, add:
   - `DATABASE_URL` = your Supabase connection string from step 1
4. Deploy

The app automatically creates its database tables on first request — no
manual schema setup needed.

### 3. QR codes
QR codes use the page's own URL automatically (`window.location.origin`), so
they'll work correctly on your live Vercel domain with no extra configuration.

## Running it locally

Create a `.env.local` file in the project root:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

Then:
```bash
npm install
npm run build
npm run start
```

Open http://localhost:3000.

## Project structure

```
src/
  app/                 pages (dashboard, scouts, attendance)
  app/api/             REST API routes
  components/          client components (forms, attendance grid, nav, QR code)
  lib/db.ts            Postgres connection + schema setup
```
