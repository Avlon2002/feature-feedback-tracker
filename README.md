# Feature Feedback Tracker

A small app to log what employees say about each portal feature, and track the decision made:
**action taken, decision date, reason, status, priority, who decided**.

Built with **Next.js** (App Router + Server Actions) and **Postgres**. Runs free on Vercel.

- **Locally** it uses [PGlite](https://pglite.dev), which is Postgres running inside Node. No install and no account are needed, and data is saved in `.data/`.
- **On Vercel** it uses Neon Postgres (free tier). The SQL is identical in both.

## Pages

| URL | What it does |
|---|---|
| `/` | List of all feedback: status counts, search, filters, CSV export |
| `/feedback/new` | Log new feedback |
| `/feedback/[id]` | Edit feedback details, see its decision history, add a new decision |
| `/features` | Add or remove the system features that feedback is logged against |
| `/features/[id]` | One feature: all its feedback, each with its full decision history |

Each piece of feedback can have **many decisions over time**, stored in the `decisions` table
(e.g. Under Review → Approved → Done). The latest one by date is also copied onto the feedback
row, so the main list and CSV show the current status.
| `/export` | CSV download (respects current filters) |

## Project layout

```
app/                  pages + server actions (actions.ts = all database writes)
components/           FeedbackForm (shared by new + edit)
lib/db.ts             all database reads
lib/options.ts        dropdown lists (statuses, priorities, types): edit to customise
db/schema.sql         table definitions
scripts/setup-db.mjs  creates the tables
proxy.ts              optional password protection
```

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000. On first run the tables and four example features are created automatically in `.data/`.

- To start again with an empty database: stop the server and delete the `.data` folder.
- Don't copy `.data` between machines or commit it. It's your local test data only.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On vercel.com: **Add New → Project**, then import the repo (defaults are fine).
3. In the project go to **Storage → Create Database → Neon (Postgres)** and connect it.
   This adds `DATABASE_URL` to the project automatically.
4. Optional: **Settings → Environment Variables**, then add `APP_PASSWORD` to password-protect the site.
5. Create the tables in Neon once, from your machine:
   ```
   npx vercel env pull .env.local
   npm run db:setup -- --seed
   ```
   (After this, `.env.local` contains `DATABASE_URL`, so `npm run dev` will talk to Neon.
   Remove that line to go back to the local database.)
6. Redeploy.

## Ideas for extending (good learning exercises)

- A history table that records every status change
- Real login with Auth.js / Clerk so "Decided by" fills in automatically
- A chart of feedback per feature
- Attach screenshots with Vercel Blob
