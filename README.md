# Portal Tracker

Two tools in one app, switched with the top menu:

- **Features**: track issues with each employee portal feature. Each feature holds a list of
  **issue blocks** recording: **current process, issue, action taken, raised by, idea by, status**
  (plus an optional decision date and reason).
- **Projects**: simple project management. Each project has a **board** with
  To do / In progress / Done columns. Tasks can be created straight from a feature issue.

Built with **Next.js** (App Router + Server Actions) and **Postgres**. Runs free on Vercel.

- **Locally** it uses [PGlite](https://pglite.dev), which is Postgres running inside Node. No install and no account are needed, and data is saved in `.data/`.
- **On Vercel** it uses Neon Postgres (free tier). The SQL is identical in both.

## How it works

1. **Home** lists the features. Click **+ New feature** to add one.
2. **Open a feature** to see its issue blocks (Issue 1, Issue 2, ...).
3. **+ Add issue** adds a new block for a different issue with the same feature.
   Each block has its own **Edit** and **Delete**.
4. **Projects** lists projects with progress bars. Open one to see its board.
5. **+ Add task** adds a card. Move cards with the **← / →** buttons; click a card to edit it.
6. On a feature's issue block, **+ Create task** makes a task pre-filled from that issue.
   The task links back to the issue, and the issue lists its tasks and their status.

## Project layout

```
app/page.tsx                          home: list of features
app/features/new                      new feature form
app/features/[id]                     one feature and its issue blocks
app/features/[id]/edit                rename / delete a feature
app/features/[id]/issues/new          add an issue block
app/features/[id]/issues/[issueId]    edit an issue block
app/projects                          list of projects
app/projects/new                      new project form
app/projects/[id]                     a project's board
app/projects/[id]/edit                edit / delete a project
app/tasks/new                         new task (?project=ID or ?issue=ID)
app/tasks/[id]                        edit / delete a task
app/actions.ts                        all database writes
components/                           forms, NavLink (top menu), SubmitButton
lib/db.ts                             database connection + reads
lib/options.ts                        status / priority lists: edit to customise
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
