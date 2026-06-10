<div align="center">

# Cyranth GitHub Pages

**Static landing page for the Cyranth developer identity.**

No build pipeline, no framework lock-in, and no private identity data. The site is intentionally simple, fast, and easy to deploy through GitHub Pages.

<p>
  <img alt="Static site" src="https://img.shields.io/badge/site-static-111827">
  <img alt="No build" src="https://img.shields.io/badge/build-none-16a34a">
  <img alt="GitHub Pages" src="https://img.shields.io/badge/deploy-GitHub%20Pages-0969da?logo=github">
</p>

</div>

---

## Overview

This repository contains the static GitHub Pages landing page for Cyranth. It uses plain HTML, CSS, JavaScript, SVG, `robots.txt`, and `sitemap.xml`.

| Area | Details |
| --- | --- |
| Hosting | GitHub Pages |
| Build step | None |
| Main assets | HTML, CSS, JavaScript, SVG |
| SEO files | `robots.txt`, `sitemap.xml` |
| Privacy posture | No real name, phone number, personal email, or private project data |

---

## Local Preview

```bash
py -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Alternative: use VS Code Live Server.

---

## Deployment

Push changes to the `main` branch. GitHub Pages serves the site from the repository.

---

## Privacy Rule

Do not add real name, phone number, personal email, private client data, internal project links, or non-public infrastructure details.