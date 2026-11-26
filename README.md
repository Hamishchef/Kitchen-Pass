# Kitchen Pass

An offline-first phone app for the kitchen team: recipes, Residences & Yachts (menus, phone numbers and orders per property), and family/guest preferences with allergies.

- Static site (no build step), hosted on GitHub Pages.
- Data lives in Supabase. Each phone keeps a full copy in IndexedDB, so everything works offline; changes queue and sync when the phone is back online.
- Sign-in is by a 6-digit email code. Only emails on the team list (`members` table) can read or change anything. Admins manage the team from **More** in the app.

## Setup
1. Supabase: create a project, open **SQL Editor**, paste `supabase/setup.sql`, change the email on the last line to yours, and run it.
2. Supabase: **Authentication > Email Templates > Magic Link**: make sure the template contains `{{ .Token }}` so the email shows the 6-digit code.
3. Put the Project URL and anon public key in `config.js`.
4. GitHub: **Settings > Pages**, deploy from the `main` branch, root folder.
5. Open the site, sign in, then **More > Import** the file from "Export everything" on the old Recipe Book page.

## Releasing a change
Bump `VERSION` in `sw.js` so phones pick up the new files.
