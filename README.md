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
