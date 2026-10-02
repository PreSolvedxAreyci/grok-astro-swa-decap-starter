---
title: "How Editors Publish Updates"
description: "Decap CMS commits Markdown; GitHub Actions builds Astro and deploys to Azure SWA."
pubDate: 2026-09-22
author: xAI
draft: false
---

Publishing on this starter:

1. Open `/admin` and sign in with an allowed GitHub account (OAuth setup required once).
2. Edit a **News** or **Products** entry.
3. Save — Decap commits under `src/content/`.
4. GitHub Actions builds and deploys to Azure Static Web Apps.

Preview first on the default `*.azurestaticapps.net` URL. Custom domain `grokdemo.juankibin.space` is documented for handoff only.