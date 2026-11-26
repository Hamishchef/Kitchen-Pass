# Kitchen Pass

An offline-first phone app for the kitchen team: recipes, Residences & Yachts (menus, phone numbers and orders per property), and family/guest preferences with allergies.

- Static site (no build step), hosted on GitHub Pages.
- Data lives in Supabase. Each phone keeps a full copy in IndexedDB, so everything works offline; changes queue and sync when the phone is back online.
- Sign-in is by email + password. New chefs join with a one-time invite code that the admin creates in **More**; no emails are sent.

## Setup
1. Supabase: create a project, open **SQL Editor**, paste `supabase/setup.sql`, change the email on the last line to yours, and run it.
2. Supabase: **Authentication > Sign In / Providers > Email**: turn **Confirm email** off (invite codes do the checking).
3. Put the Project URL and anon public key in `config.js`.
4. GitHub: **Settings > Pages**, deploy from the `main` branch, root folder.
5. Open the site, sign in, then **More > Import** the file from "Export everything" on the old Recipe Book page.

## Releasing a change
Bump `VERSION` in `sw.js` so phones pick up the new files.
