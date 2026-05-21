# The Radio Draft — Web Deploy

A daily radio competition. Two players draft 5 artists each, score live as
songs play on real radio.

## What's in this folder

A complete Vite + React + Tailwind project, ready to deploy.

```
package.json          — dependencies + scripts
vite.config.js        — build config
index.html            — HTML entry + meta tags
tailwind.config.js    — Tailwind setup
postcss.config.js     — PostCSS setup
src/
  main.jsx            — React entry
  App.jsx             — the entire app (~10,700 lines)
  index.css           — Tailwind + base styles + fonts
.gitignore            — standard Node ignores
```

## Deploying to Vercel

You don't need a terminal. Two paths:

### Path A — GitHub web upload (easiest, no terminal)

1. **Create a GitHub account** at github.com (free, ~2 minutes).

2. **Create a new repository.** Top right `+` → `New repository`. Name it
   `radio-draft` (or anything). Visibility: Private is fine.
   Click `Create repository`.

3. **Upload these files.** On the new empty repo page, click
   `uploading an existing file`. Drag in EVERY file from this folder,
   INCLUDING the `src/` folder. GitHub preserves the folder structure.
   Commit message: "initial deploy".

4. **Deploy via Vercel.** Go to vercel.com, sign in with GitHub
   (this connects the two accounts). Click `Add New... → Project`.
   You'll see your `radio-draft` repo in the list. Click `Import`.
   Vercel auto-detects Vite. Leave all defaults. Click `Deploy`.

5. **Wait ~2 minutes.** When you see the rocket animation, your app is
   live at a URL like `radio-draft-abc123.vercel.app`. Tap to open.

### Path B — Terminal-based (if you're comfortable with that)

```bash
npm install
npm run dev     # local preview at localhost:5173
npm run build   # production build in dist/
```

Then push to GitHub and connect to Vercel via their CLI or web UI.

## After Deploy: Install as PWA on Your Phone

iPhone (Safari):
1. Open the deployed URL
2. Tap the share button → `Add to Home Screen`
3. The app icon appears on your home screen, opens like a native app

Android (Chrome):
1. Open the deployed URL
2. Tap the 3-dot menu → `Install app` or `Add to Home Screen`

## Important Notes

**Data scope:** The app stores everything in browser `localStorage`. That
means:
- Data is per-browser, per-device. Installing on a new phone = starting
  fresh.
- Clearing browser data = losing all your weeks of history.
- Two users on the same device share the same data unless they use
  separate profiles inside the app.

**No backend required (yet).** This deploy is entirely client-side. There's
no database, no accounts, no sync. That keeps it free to host but limits
multi-device play to people who can share one phone.

**Playlist ingestion:** The "Paste Playlist" button on the Live screen
parses playlist text from onlineradiobox.com. The app itself cannot fetch
those URLs directly (browser CORS blocks it). To use this feature, copy
the page text from onlineradiobox in another tab and paste it in.

## Future Work

When the deployed version proves out with real users, consider:
- Add a real backend (Firebase, Supabase) for cross-device sync + remote play
- Custom domain ($10-15/year)
- App Store / Play Store wrappers via Capacitor
- Service worker for offline play + push notifications
- Crash reporting (Sentry) + analytics (PostHog)
