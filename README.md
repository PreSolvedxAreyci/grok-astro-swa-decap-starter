# Grok demo — Astro 5 + Decap + Azure SWA

Lookalike marketing shell inspired by the public Grok page (`https://x.ai/grok`), plus Git-backed CMS for **News** and **Products**.

> Demo / practice only. Not an official SpaceXAI product. No proprietary logos ripped — CSS mark + text branding.

## Stack

- Astro 5 static site (`output: static`)
- Content collections: `src/content/news`, `src/content/products`
- Decap CMS at `/admin`
- Azure Static Web Apps (Free) via GitHub Actions
- Optional contact API stub under `api/`

## Local

```bash
nvm use   # Node 20+
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Editors (`/admin`)

1. Open `http://localhost:4321/admin/` (or the deployed `/admin/`).
2. Sign in with GitHub after **one-time OAuth setup** (GitHub OAuth App + Decap/Netlify auth gateway, or equivalent). Update `public/admin/config.yml` `backend.repo` to `OWNER/REPO`.
3. Edit News / Products → Save commits Markdown under `src/content/`.
4. CI rebuilds and deploys.

No secrets belong in this repo. Put the SWA deploy token in GitHub Actions secrets only (`AZURE_STATIC_WEB_APPS_API_TOKEN`).

## Deploy (Azure SWA Free)

1. Create a Static Web App linked to this GitHub repo (or paste the workflow and set the secret).
2. Workflow uses `app_location: /`, `output_location: dist`, `api_location: api`.
3. First preview URL is the default `*.azurestaticapps.net` hostname.

### Custom domain (caller owns DNS)

Intended hostname: **`grokdemo.juankibin.space`**

Caller configures Cloudflare (DNS-only CNAME → the SWA hostname). This scaffold does **not** create Azure or Cloudflare resources.

## Style refs

Visual notes live next to this project at `/workspace/grok-site-style-refs/` (hero, feature card, search, footer screenshots + `STYLE-NOTES.md`). This site targets that light, high-whitespace Grok marketing look: white canvas, black pill CTAs, rounded demo panels.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local Astro dev server |
| `npm run build` | Production static build → `dist/` |
| `npm run preview` | Preview `dist/` |