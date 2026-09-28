# Feature Tracker

Track issues with each employee portal feature. Each feature holds a list of **issue blocks**,
and each block records: **current process, issue, action taken, raised by, idea by, status**
(plus an optional decision date and reason).

Built with **Next.js** (App Router + Server Actions) and **Postgres**. Runs free on Vercel.

- **Locally** it uses [PGlite](https://pglite.dev), which is Postgres running inside Node. No install and no account are needed, and data is saved in `.data/`.
- **On Vercel** it uses Neon Postgres (free tier). The SQL is identical in both.

## How it works

1. **Home** lists the features. Click **+ New feature** to add one.
2. **Open a feature** to see its issue blocks (Issue 1, Issue 2, ...).
3. **+ Add issue** adds a new block for a different issue with the same feature.
   Each block has its own **Edit** and **Delete**.

## Project layout

```
app/page.tsx                          home: list of features
app/features/new                      new feature form
app/features/[id]                     one feature and its issue blocks
app/features/[id]/edit                rename / delete a feature
app/features/[id]/issues/new          add an issue block
app/features/[id]/issues/[issueId]    edit an issue block
app/actions.ts                        all database writes
components/                           FeatureForm, IssueForm, SubmitButton
lib/db.ts                             database connection + reads
lib/options.ts                        status list: edit to customise
db/schema.sql                         table definitions
proxy.ts                              optional password protection
```

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000. On first run the tables are created automatically in `.data/`.

- To start again with an empty database: stop the server and delete the `.data` folder.
- Don't copy `.data` between machines or commit it. It's your local test data only.
## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. On vercel.com: **Add New → Project**, then import the repo (defaults are fine).
3. In the project go to **Storage → Create Database → Neon (Postgres)** and connect it.
   This adds `DATABASE_URL` to the project automatically.
4. Optional: **Settings → Environment Variables**, then add `APP_PASSWORD` to password-protect the site.
5. Create the tables once: **Neon Console → SQL Editor**, paste all of `db/schema.sql`, click **Run**.
6. Redeploy.

**Upgrading from the old "feedback" version?** Run `db/schema.sql`, then run
`db/migrate-feedback-to-issues.sql` **once**. It copies old feedback into issue blocks.

## Ideas for extending (good learning exercises)

- A history of status changes for each issue
- Real login with Auth.js / Clerk so "Raised by" fills in automatically
- Search across all issues, or a CSV export
- Attach screenshots with Vercel Blob
