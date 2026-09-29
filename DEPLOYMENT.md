# Deploying Akshara to Vercel

Two routes. **Route A** (GitHub) is what you want if you will keep working on this —
every push redeploys. **Route B** (CLI) is faster if you just want it live in two minutes.

Either way, the settings are the same:

| Setting | Value |
|---|---|
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Node version | 18 or newer |
| Environment variables | none |

`vercel.json` is already in the project with those values and a catch-all rewrite, so in
most cases Vercel needs no configuration from you at all.

---

## Before either route: check it builds locally

```bash
cd akshara
npm install
npm run build
npm run preview
```

Open the URL `preview` prints. If the app works there, it will work on Vercel — `preview`
serves the exact `dist/` folder that gets deployed. Do not skip this; catching a build
error locally takes seconds, catching it in Vercel's log takes minutes.

---

## Route A — GitHub, with automatic redeploys

### 1. Make it a git repo

```bash
cd akshara
git init
git add .
git commit -m "Akshara v2"
```

`node_modules` and `dist` are already in `.gitignore`. Do not commit them.

### 2. Push to a new GitHub repo

Create an empty repo on github.com (no README, no .gitignore — the project has both),
then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/akshara.git
git push -u origin main
```

### 3. Import it into Vercel

1. Go to **vercel.com** → log in → **Add New… → Project**.
2. **Import Git Repository** → pick `akshara`. If you do not see it, click
   **Adjust GitHub App Permissions** and grant access to the repo.
3. Vercel detects Vite and fills in `npm run build` and `dist` on its own. Leave them.
4. Click **Deploy**.

The first build takes about a minute. You get a URL like
`https://akshara-abc123.vercel.app`.

### 4. Set the project name / URL

**Project → Settings → General → Project Name.** The project name is what the
`.vercel.app` subdomain uses, so naming it `akshara-local` gives you
`akshara-local.vercel.app`.

From here, every `git push` to `main` redeploys automatically. Pushes to other branches
get their own preview URL.

---

## Route B — Vercel CLI, no GitHub

```bash
npm i -g vercel
cd akshara
vercel login
vercel          # first run: answers a few setup questions, deploys a preview
vercel --prod   # promotes it to the production URL
```

On the first `vercel` run:

- *Set up and deploy?* → **Y**
- *Which scope?* → your account
- *Link to existing project?* → **N** (or **Y**, see the next section)
- *Project name?* → `akshara-local` (or whatever you want the URL to be)
- *In which directory is your code located?* → `./`
- *Want to modify these settings?* → **N** — the detected Vite settings are correct

To redeploy later, run `vercel --prod` from the same folder.

---

## Replacing the existing akshara-local.vercel.app

You have three options. Pick based on whether you want to keep the old version around.

### Option 1 — Point the existing project at the new repo (keeps the URL, keeps history)

1. Push the new code to a GitHub repo as in Route A step 2.
2. Vercel → open the **akshara-local** project → **Settings → Git**.
3. **Disconnect** the current repository, then **Connect** the new one.
4. **Deployments → Redeploy**, or just push a commit.

The URL stays `akshara-local.vercel.app` and the old deployments remain in the list, so
you can roll back from **Deployments → ⋯ → Promote to Production** if you need to.

### Option 2 — Overwrite from the CLI (fastest)

```bash
cd akshara
vercel link      # choose the existing akshara-local project
vercel --prod
```

### Option 3 — Deploy fresh, then move the domain

Deploy as a new project (Route A or B), confirm it works on its own URL, then:

1. Old project → **Settings → Domains** → remove `akshara-local.vercel.app`
   (or rename the old project, which frees the subdomain).
2. New project → **Settings → Domains** → add `akshara-local.vercel.app`.

This is the safe one if you want the old site reachable until the moment you switch.

---

## Custom domain

New project → **Settings → Domains → Add**. Enter your domain, then add the record Vercel
shows you at your registrar:

- apex (`akshara.com`) → an **A** record to `76.76.21.21`
- subdomain (`www.akshara.com`) → a **CNAME** to `cname.vercel-dns.com`

HTTPS is issued automatically once DNS resolves, usually within minutes.

---

## Things that actually go wrong

**Blank white page, console says "Failed to load module".**
Output directory is not `dist`. Fix it in **Settings → Build & Development Settings**
and redeploy.

**Build fails with "Cannot find module".**
`package-lock.json` was not committed, or `node_modules` was. Commit the lockfile, remove
`node_modules` from git (`git rm -r --cached node_modules`), push again.

**404 on refresh.**
The rewrite in `vercel.json` handles this. If you deleted that file, add it back:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

The app uses hash routes, so this is belt-and-braces rather than load-bearing.

**Speech buttons do nothing on the deployed site.**
The Web Speech API needs HTTPS — which Vercel gives you — and the microphone permission
prompt. Speech *recognition* is Chrome and Edge only; Safari and Firefox will show the
"Speech input needs Chrome or Edge" message instead. Text-to-speech depends on which
voices the visitor's OS has installed: if no Kannada voice is present, the app says so
rather than reading Kannada in an English voice.

**Fonts look wrong for one script.**
The Google Fonts link in `index.html` loads a Noto face per script. If your network blocks
fonts.googleapis.com, self-host: download the Noto families into `public/fonts/` and
replace the `<link>` with local `@font-face` rules in `styles.css`.

---

## Quick reference

```bash
npm install          # once
npm run dev          # local development
npm run build        # production build into dist/
npm run preview      # check the production build before deploying
vercel --prod        # deploy (after vercel link)
```
