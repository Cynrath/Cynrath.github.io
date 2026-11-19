<div align="center">

# Cyranth GitHub Pages

**Static landing page for the Cyranth developer identity.**

The site is intentionally simple and framework-free: plain HTML, CSS, JavaScript, and SVG served directly by GitHub Pages.

<p>
  <img alt="Static site" src="https://img.shields.io/badge/site-static-111827">
  <img alt="No build" src="https://img.shields.io/badge/build-none-16a34a">
  <img alt="GitHub Pages" src="https://img.shields.io/badge/deploy-GitHub%20Pages-0969da?logo=github">
</p>

</div>

---

## Overview

This repository contains the public Cyranth landing page.

| Area | Details |
| --- | --- |
| Hosting | GitHub Pages |
| Build step | None |
| Main assets | HTML, CSS, JavaScript, SVG |
| SEO files | `robots.txt`, `sitemap.xml` |
| Featured project | [AgentContextKit](https://github.com/Cynrath/agent-context-kit) |

Product-specific installation, commands, architecture, development status, and release information belong in the AgentContextKit repository rather than this site repository.

---

## Local Preview

```bash
py -m http.server 8080
```

Open `http://localhost:8080`.

---

## Deployment

GitHub Pages serves the site from the repository's configured source.

---

## Repository Rules

- Keep the site lightweight and framework-free unless there is a clear reason to change that architecture.
- Keep product implementation documentation in the relevant product repository.
- Do not add private client data, credentials, private infrastructure details, or unnecessary personal contact information.

## Refresh published documentation

Use verified released product checkouts; the generators stay offline and do
not publish packages. ACKit source version must match its published-stable
pointer. Bridge compatibility is read from its canonical compatibility document.

```bash
node scripts/sync-ackit-docs.mjs --source ../agent-context-kit
node scripts/sync-ackit-spec-kit-bridge-docs.mjs --source ../ackit-spec-kit-bridge
node scripts/verify-site.mjs
```

Root `index.html`, `llms.txt` and `llms-full.txt` are maintained separately;
update their current install/version claims in the same change. The integrity
gate checks them against generated product versions. Keep historical changelog
numbers, supported minima, design assets and canonical URLs intact.

## Branch governance

- `main` changes land via pull request with exact-head `docs-integrity` green
  (`node scripts/verify-site.mjs` + `git diff --check`); direct `main` pushes
  are no longer the normal workflow.
- Hosted-doc release flow: run the generator locally, push a branch, open a PR,
  wait for `docs-integrity`, then merge with linear history.
