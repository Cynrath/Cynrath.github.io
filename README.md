<div align="center">

# Cyranth GitHub Pages

**Static public landing page centered on ACKit, agent-ready repository tooling, and production engineering.**

The site is intentionally framework-free: plain HTML, CSS, JavaScript, and SVG served directly by GitHub Pages.

<p>
  <img alt="Static site" src="https://img.shields.io/badge/site-static-111827">
  <img alt="No build" src="https://img.shields.io/badge/build-none-16a34a">
  <img alt="GitHub Pages" src="https://img.shields.io/badge/deploy-GitHub%20Pages-0969da?logo=github">
  <img alt="ACKit vNext" src="https://img.shields.io/badge/ACKit-vNext%200.1.0--dev-111827?logo=typescript&logoColor=white">
</p>

</div>

---

## Public Positioning

The site currently reflects the active ACKit rebuild in `Cynrath/agent-context-kit` on branch `rebuild/ackit-vnext`.

| Area | Current public state |
| --- | --- |
| Product | ACKit — AgentContextKit |
| Direction | Turn repositories into agent-ready repositories |
| Architecture | TypeScript / Node.js / ESM |
| Runtime | Node.js `>=22` |
| Development package manager | pnpm 11 |
| Package identity | `@cynrath/agent-context-kit` `0.1.0` |
| npm status | Unpublished; publication is a separate explicit action |
| MCP | Official SDK, read-only server surface |
| Product posture | Offline-first and deterministic |

The frozen .NET/NuGet implementation remains project history; this site presents the active vNext direction without claiming that npm publication has already happened.

---

## ACKit Capabilities Presented on the Site

- Instruction graph analysis across common coding-agent instruction surfaces.
- Agent Skills parsing, validation, installation, and synchronization.
- Secret and repository-hygiene scanning with redacted evidence.
- Token-budgeted context packs with deterministic ranking and manifests.
- Docs-first task workflows and machine-checkable gates.
- Offline policy-as-code, baselines, incremental scanning, and monorepo semantics.
- Terminal, JSON, SARIF 2.1.0, Markdown, HTML, and read-only MCP interfaces.

Public claims must remain aligned with the current `rebuild/ackit-vnext` source and README.

---

## Repository Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Main landing page and SEO/social metadata |
| `assets/css/styles.css` | Responsive design and dark/light themes |
| `assets/js/main.js` | Navigation and progressive theme enhancement |
| `assets/svg/` | Local visual assets |
| `docs/tasks/` | Task-first change records |
| `robots.txt` | Search crawler policy |
| `sitemap.xml` | GitHub Pages sitemap |

No framework, package manager, external font, CDN, analytics SDK, or build pipeline is required to serve this site.

---

## Local Preview

```bash
py -m http.server 8080
```

Open `http://localhost:8080`.

---

## Validation

For site changes, verify at minimum:

```bash
# repository-level checks
git diff --check
git status --short

# then serve locally
py -m http.server 8080
```

Browser review should cover desktop/mobile layout, navigation, theme switching, anchors, external links, relative asset paths, one `h1`, metadata, and readability without JavaScript.

---

## Deployment

GitHub Pages serves the production site from the repository's configured source. Normal publication of site changes should happen only after the focused branch has been reviewed and merged according to repository policy.

---

## Public-Safety Rules

Do not add private client data, personal contact details, private repository references, internal infrastructure, credentials, fake adoption metrics, invented benchmark results, or claims that an unpublished ACKit npm package is already available.
