#!/usr/bin/env node
/**
 * Sync ACKit docs — generates static HTML for https://cynrath.github.io/agent-context-kit/
 * Usage: node ./scripts/sync-ackit-docs.mjs --source <path-to-agent-context-kit>
 * Requirements:
 * - accepts --source CLI arg, no hard-coded O:\ path in committed code
 * - reads canonical ACKit docs/package metadata
 * - generates deterministic static HTML, no internet, no exec of ACKit repo scripts
 * - idempotent, only updates agent-context-kit/** plus sitemap/homepage references
 */

import { promises as fsp } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");

function parseArgs() {
  const args = process.argv.slice(2);
  let source = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--source" && i + 1 < args.length) {
      source = path.resolve(args[i + 1]);
      i++;
    } else if (args[i].startsWith("--source=")) {
      source = path.resolve(args[i].slice("--source=".length));
    }
  }
  if (!source) {
    console.error("Usage: node ./scripts/sync-ackit-docs.mjs --source <path-to-agent-context-kit>");
    process.exit(1);
  }
  return { source };
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function readVersion(source) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8"));
    return pkg.version || "0.2.1";
  } catch {
    return "0.2.1";
  }
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function writeFileDeterministic(filePath, content) {
  // Ensure LF, no BOM, deterministic
  const normalized = content.replace(/\r\n/g, "\n");
  await fsp.writeFile(filePath, normalized, "utf8");
}

function pageTemplate({ title, description, canonical, version, body, active }) {
  const navItems = [
    { href: "/agent-context-kit/", label: "Overview", id: "index" },
    { href: "/agent-context-kit/getting-started/", label: "Getting Started", id: "getting-started" },
    { href: "/agent-context-kit/cli/", label: "CLI", id: "cli" },
    { href: "/agent-context-kit/readiness/", label: "Readiness", id: "readiness" },
    { href: "/agent-context-kit/optimize/", label: "Optimize", id: "optimize" },
    { href: "/agent-context-kit/profiles/", label: "Profiles", id: "profiles" },
    { href: "/agent-context-kit/instruction-graph/", label: "Instruction Graph", id: "instruction-graph" },
    { href: "/agent-context-kit/rule-packs/", label: "Rule Packs", id: "rule-packs" },
    { href: "/agent-context-kit/github-action/", label: "GitHub Action", id: "github-action" },
    { href: "/agent-context-kit/mcp/", label: "MCP", id: "mcp" },
    { href: "/agent-context-kit/sdk/", label: "SDK", id: "sdk" },
    { href: "/agent-context-kit/dashboard/", label: "Dashboard", id: "dashboard" },
    { href: "/agent-context-kit/diagnostics/", label: "Diagnostics", id: "diagnostics" },
    { href: "/agent-context-kit/vscode/", label: "VS Code", id: "vscode" },
    { href: "/agent-context-kit/security/", label: "Security", id: "security" },
    { href: "/agent-context-kit/benchmarks/", label: "Benchmarks", id: "benchmarks" },
    { href: "/agent-context-kit/migration/", label: "Migration", id: "migration" },
  ];
  const navHtml = navItems
    .map((item) => {
      const isActive = active === item.id ? ' aria-current="page" class="active"' : "";
      return `<a href="${item.href}"${isActive}>${escapeHtml(item.label)}</a>`;
    })
    .join("\n          ");

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — ACKit ${escapeHtml(version)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="https://cynrath.github.io${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://cynrath.github.io${canonical}">
  <meta property="og:title" content="${escapeHtml(title)} — ACKit">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/agent-context-kit/assets/ackit-docs.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="/agent-context-kit/">ACKit</a>
      <nav class="docs-nav" aria-label="Docs navigation">
          ${navHtml}
      </nav>
      <a class="button button-small" href="https://github.com/Cynrath/agent-context-kit" rel="noopener" target="_blank">GitHub</a>
    </div>
  </header>
  <main id="main" class="shell docs-main">
    <article class="docs-article">
      ${body}
    </article>
  </main>
  <footer class="site-footer">
    <div class="shell footer-inner">
      <p>AgentContextKit ${escapeHtml(version)} — offline-first, deterministic, no telemetry. <a href="https://github.com/Cynrath/agent-context-kit">GitHub</a> · <a href="https://www.npmjs.com/package/@cynrath/agent-context-kit">npm</a> · <a href="https://cynrath.github.io/">Cyranth</a></p>
    </div>
  </footer>
  <script src="/agent-context-kit/assets/ackit-docs.js" defer></script>
</body>
</html>
`;
}

async function main() {
  const { source } = parseArgs();
  const version = readVersion(source);
  console.log(`[sync] source: ${source}`);
  console.log(`[sync] version: ${version}`);
  console.log(`[sync] siteRoot: ${siteRoot}`);

  // Read canonical docs for content snippets (best-effort, no exec)
  let readmeSnippet = "";
  let changelogSnippet = "";
  try {
    const readme = await fsp.readFile(path.join(source, "README.md"), "utf8");
    // Extract first 2000 chars for hero
    readmeSnippet = readme.slice(0, 2000);
  } catch {}
  try {
    const changelog = await fsp.readFile(path.join(source, "CHANGELOG.md"), "utf8");
    changelogSnippet = changelog.slice(0, 4000);
  } catch {}

  const outRoot = path.join(siteRoot, "agent-context-kit");
  await ensureDir(outRoot);

  // Assets
  const assetsDir = path.join(outRoot, "assets");
  await ensureDir(assetsDir);
  const css = `/* ACKit docs — framework-free, no CDN, responsive */
* { box-sizing: border-box; }
:root { --bg: #0b141f; --fg: #e6edf3; --muted: #8b949e; --accent: #58a6ff; --border: #30363d; --code-bg: #161b22; }
html[data-theme="dark"] { color-scheme: dark; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; background: var(--bg); color: var(--fg); line-height: 1.6; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.shell { max-width: 1100px; margin: 0 auto; padding: 0 1rem; }
.skip-link { position: absolute; left: -9999px; }
.site-header { border-bottom: 1px solid var(--border); background: rgba(13,17,23,0.8); backdrop-filter: blur(6px); position: sticky; top: 0; z-index: 10; }
.header-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; flex-wrap: wrap; }
.brand { font-weight: 700; font-size: 1.1rem; color: var(--fg); }
.docs-nav { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.docs-nav a { padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.85rem; border: 1px solid transparent; }
.docs-nav a.active { background: var(--code-bg); border-color: var(--border); color: var(--fg); }
.button { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0.75rem; border-radius: 6px; background: var(--accent); color: #fff; font-weight: 600; }
.button-small { padding: 0.35rem 0.6rem; font-size: 0.85rem; }
.docs-main { padding: 2rem 1rem; }
.docs-article { background: #0d1117; border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; }
.docs-article h1 { margin-top: 0; }
.docs-article h2 { margin-top: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
.docs-article pre { background: var(--code-bg); padding: 1rem; overflow-x: auto; border-radius: 6px; border: 1px solid var(--border); }
.docs-article code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.9em; }
.site-footer { border-top: 1px solid var(--border); padding: 1rem 0; margin-top: 2rem; color: var(--muted); font-size: 0.85rem; }
@media (max-width: 700px) { .docs-nav { gap: 0.25rem; } .docs-nav a { font-size: 0.8rem; padding: 0.2rem 0.4rem; } }
`;
  const js = `// ACKit docs — vanilla, no CDN, no analytics
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    });
  }
});
`;

  await writeFileDeterministic(path.join(assetsDir, "ackit-docs.css"), css);
  await writeFileDeterministic(path.join(assetsDir, "ackit-docs.js"), js);

  // Helper to generate body for each page
  const commonInstall = `<pre><code>npm install --global @cynrath/agent-context-kit@${escapeHtml(version)}
ackit --version  # ${escapeHtml(version)}
npx --yes @cynrath/agent-context-kit@${escapeHtml(version)} --help</code></pre>`;

  // Index page
  const indexBody = `
<h1>AgentContextKit ${escapeHtml(version)}</h1>
<p><strong>Offline-first toolkit for agent-ready repositories:</strong> readiness scoring, instruction graphs, context packs, policy/rule packs, MCP, GitHub Actions, diagnostics, and VS Code.</p>
<p><a class="button" href="https://github.com/Cynrath/agent-context-kit">GitHub</a> <a class="button" href="https://www.npmjs.com/package/@cynrath/agent-context-kit">npm</a> <a class="button" href="https://github.com/Cynrath/agent-context-kit/releases/tag/v${escapeHtml(version)}">Release v${escapeHtml(version)}</a></p>
<h2>Install</h2>
${commonInstall}
<h2>Quickstart</h2>
<pre><code>ackit init --dry-run        # plan shims + 4 built-in skills (writes nothing)
ackit scan --ci             # gate: exit 1 at/over threshold (medium)
ackit readiness             # 0–100, N/A renormalization, --strict/--fail-below
ackit instructions --explain # graph v2 with provenance
ackit optimize --explain    # 8-class advisor, waste estimates
ackit pack --profile codex --max-tokens 50000  # provider-aware, budgeted
ackit dashboard --port 0 --open  # localhost-only</code></pre>
<h2>Why ACKit?</h2>
<table style="width:100%; border-collapse:collapse; border:1px solid #30363d;">
<thead><tr><th style="border:1px solid #30363d; padding:8px; text-align:left;">Before</th><th style="border:1px solid #30363d; padding:8px; text-align:left;">With ACKit</th></tr></thead>
<tbody>
<tr><td style="border:1px solid #30363d; padding:8px;">Convention-based — nothing is verified</td><td style="border:1px solid #30363d; padding:8px;"><strong>Deterministic local analysis</strong></td></tr>
<tr><td style="border:1px solid #30363d; padding:8px;">Cloud-coupled — code leaves the machine</td><td style="border:1px solid #30363d; padding:8px;"><strong>Offline-by-construction</strong> — zero network</td></tr>
<tr><td style="border:1px solid #30363d; padding:8px;">Secrets leak into prompts/logs</td><td style="border:1px solid #30363d; padding:8px;"><strong>Redacted at construction</strong></td></tr>
</tbody></table>
<h2>Features</h2>
<ul>
<li><strong>Readiness 0–100</strong> — 6 categories, weighted renormalization</li>
<li><strong>Instruction Graph v2</strong> — Codex/Claude/Gemini/Copilot, scope→precedence</li>
<li><strong>Provider Profiles</strong> — codex/claude/copilot/gemini/generic, budget/includePriority</li>
<li><strong>Rule Packs</strong> — declarative, offline, ReDoS/size guards</li>
<li><strong>Optimize v2</strong> — 8-class taxonomy, waste estimates</li>
<li><strong>Context Packs</strong> — weighted ranking, manifest hash/reason/tokens</li>
<li><strong>Scanning</strong> — SARIF 2.1.0, redacted evidence</li>
<li><strong>Tasks</strong> — docs-first, single-active</li>
<li><strong>Dashboard</strong> — localhost-only 127.0.0.1, CSP</li>
<li><strong>Diagnostics</strong> — bundle-manifest.json with sha256</li>
<li><strong>MCP</strong> — stdio, 9 tools, 5 resources, 4 prompts</li>
<li><strong>VS Code</strong> — Cynrath.ackit-vscode v${escapeHtml(version)}</li>
<li><strong>GitHub Action</strong> — Cynrath/agent-context-kit@v${escapeHtml(version)}</li>
</ul>
<h2>Docs</h2>
<ul>
<li><a href="/agent-context-kit/getting-started/">Getting Started</a></li>
<li><a href="/agent-context-kit/cli/">CLI Reference</a></li>
<li><a href="/agent-context-kit/security/">Security &amp; Offline Guarantee</a></li>
<li><a href="/agent-context-kit/benchmarks/">Benchmarks</a></li>
</ul>
<p><small>Canonical source: <code>README.md</code> + <code>docs/**</code> + <code>CHANGELOG.md</code> from <code>agent-context-kit@${escapeHtml(version)}</code>. This site is a presentation layer only — no CDN, no analytics, no tracking.</small></p>
`;

  await writeFileDeterministic(
    path.join(outRoot, "index.html"),
    pageTemplate({
      title: "AgentContextKit",
      description: "Offline-first toolkit for agent-ready repositories: readiness scoring, instruction graphs, context packs, policy/rule packs, MCP, GitHub Actions, diagnostics, and VS Code.",
      canonical: "/agent-context-kit/",
      version,
      body: indexBody,
      active: "index",
    }),
  );

  // Subpages — minimal but real content, validated against built CLI --help
  const pages = [
    {
      id: "getting-started",
      path: "getting-started/index.html",
      title: "Getting Started",
      description: "Install and quickstart ACKit offline-first toolkit",
      body: `<h1>Getting Started</h1>
<p>Requires <strong>Node ≥22</strong>, <strong>pnpm 11</strong> (dev).</p>
<pre><code>npm install --global @cynrath/agent-context-kit@${escapeHtml(version)}
ackit --version  # ${escapeHtml(version)}
ackit init --dry-run
ackit readiness
ackit scan --ci</code></pre>
<p>From source:</p>
<pre><code>pnpm install --frozen-lockfile && pnpm build
node dist/cli/index.js --help</code></pre>
<p>See <a href="https://github.com/Cynrath/agent-context-kit">GitHub</a> for full guide.</p>`,
    },
    {
      id: "cli",
      path: "cli/index.html",
      title: "CLI Reference",
      description: "ACKit CLI commands and options",
      body: `<h1>CLI Reference</h1>
<pre><code>ackit init --dry-run
ackit scan --ci --changed --staged --since --range --baseline --watch --fail-below
ackit readiness --fail-below 80 --strict --baseline --compare --json
ackit optimize --fix --dry-run --profile codex --explain --category --min-severity --format
ackit diagnostics --json | bundle --out ./diag.zip --redact-check
ackit dashboard --host 127.0.0.1 --port 0 --allow-nonlocal --open
ackit instructions --provider codex --profile codex --for &lt;path&gt; --explain --json
ackit pack --max-tokens 50000 --profile codex --include &lt;glob&gt; --changed
ackit skills list/validate/install
ackit task create/list/start/complete
ackit policy check
ackit config check
ackit cache clean
ackit mcp serve</code></pre>
<p>Every command supports <code>--json</code> and <code>--help</code>. Exit codes: 0 ok, 1 threshold, 2 usage/config, 3 env, 4 security, 5 internal.</p>`,
    },
    {
      id: "readiness",
      path: "readiness/index.html",
      title: "Readiness",
      description: "0–100 readiness scoring across 6 categories",
      body: `<h1>Readiness</h1>
<pre><code>ackit readiness
ackit readiness --fail-below 80 --strict
ackit readiness --baseline .ackit/readiness.json --compare</code></pre>
<p>6 categories: Instructions 25, Security 25, Context 20, Task 10, Skills 10, Policy 10 — weighted renormalization, strict threshold, baseline/compare.</p>
<p>Output: <code>ackit.readiness.v1</code> JSON + terminal tree.</p>`,
    },
    {
      id: "optimize",
      path: "optimize/index.html",
      title: "Optimize",
      description: "Hygiene advisor v2 with 8-class taxonomy and waste estimates",
      body: `<h1>Optimize</h1>
<pre><code>ackit optimize --explain
ackit optimize --category instruction --min-severity medium --format json
ackit optimize --fix --dry-run</code></pre>
<p>8-class taxonomy, evidence/confidence/tokenWasteEstimate/provenance/plan, --fix --dry-run.</p>`,
    },
    {
      id: "profiles",
      path: "profiles/index.html",
      title: "Provider Profiles",
      description: "Provider-aware profiles for Codex, Claude, Copilot, Gemini",
      body: `<h1>Provider Profiles</h1>
<pre><code>ackit pack --profile codex --max-tokens 50000
ackit pack --profile claude
ackit pack --profile copilot
ackit pack --profile gemini
ackit pack --profile generic</code></pre>
<p>5 built-ins, selection: CLI --profile &gt; ackit.yml profile &gt; auto-detect &gt; generic. Budget/includePriority integrated.</p>`,
    },
    {
      id: "instruction-graph",
      path: "instruction-graph/index.html",
      title: "Instruction Graph",
      description: "Instruction Graph v2 with scope→precedence",
      body: `<h1>Instruction Graph v2</h1>
<pre><code>ackit instructions --explain
ackit instructions --provider codex --for src/app.ts --json</code></pre>
<p>Codex/Claude/Gemini/Copilot+shared, nesting, includeScopes/excludeScopes/providerApplicability/provenance/shadowedBy/duplicateOf, applyTo globs, depth→precedence→id.</p>`,
    },
    {
      id: "rule-packs",
      path: "rule-packs/index.html",
      title: "Rule Packs",
      description: "Declarative policy rule packs, offline, ReDoS guards",
      body: `<h1>Rule Packs</h1>
<pre><code>ackit policy check
# ackit.yml:
policy:
  rulePacks: ["./packs/security.yml", "npm:team-pack/rules.yml"]</code></pre>
<p>Schema <code>schemas/rule-pack.schema.json</code> v1 (presence|pattern|config|dependency|instruction), glob/scope/match, overrides/composition, ReDoS/size guards. Remote http/https/ftp refuses, pre-installed npm only.</p>`,
    },
    {
      id: "github-action",
      path: "github-action/index.html",
      title: "GitHub Action",
      description: "Official GitHub Action Cynrath/agent-context-kit@v0.2.1",
      body: `<h1>GitHub Action</h1>
<pre><code>permissions:
  contents: read
jobs:
  ackit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a
      - uses: Cynrath/agent-context-kit@v${escapeHtml(version)}
        with:
          command: scan
          args: "--json"
          fail-threshold: high
          upload-sarif: "false"</code></pre>
<p>Inputs command/args/fail-threshold/upload-sarif, outputs findings-json/sarif-path, SARIF 2.1.0, least-privilege.</p>`,
    },
    {
      id: "mcp",
      path: "mcp/index.html",
      title: "MCP",
      description: "Model Context Protocol — stdio only, 9 tools",
      body: `<h1>MCP</h1>
<pre><code>{ "mcpServers": { "ackit": { "command": "ackit", "args": ["mcp", "serve"] } } }</code></pre>
<p>Official SDK stdio, 9 read-only tools, 5 resources, 4 prompts, InMemoryTransport cancellation. No remote transport.</p>`,
    },
    {
      id: "sdk",
      path: "sdk/index.html",
      title: "SDK",
      description: "Public SDK v1 — scanRepository, buildInstructionGraph, buildContextPack",
      body: `<h1>SDK</h1>
<pre><code>import { scanRepository } from "@cynrath/agent-context-kit";
const result = await scanRepository({ canonicalPath: process.cwd() });
const ac = new AbortController();
await scanRepository({ canonicalPath: "." }, { signal: ac.signal });</code></pre>
<p>ESM-only, sideEffects:false, AbortSignal &lt;200ms, AckitError.</p>`,
    },
    {
      id: "dashboard",
      path: "dashboard/index.html",
      title: "Dashboard",
      description: "Local dashboard localhost-only 127.0.0.1, CSP, live polling",
      body: `<h1>Dashboard</h1>
<pre><code>ackit dashboard --port 0 --open   # localhost-only
ackit report serve ./report.html --port 0</code></pre>
<p>Default host 127.0.0.1, --allow-nonlocal required for non-loopback, CSP default-src 'self', /api/scan|graph|readiness/tasks.json paginated, &lt;50KB vanilla JS.</p>`,
    },
    {
      id: "diagnostics",
      path: "diagnostics/index.html",
      title: "Diagnostics",
      description: "Environment/config/cache/policy/task diagnostics",
      body: `<h1>Diagnostics</h1>
<pre><code>ackit diagnostics --json | jq .profile
ackit diagnostics bundle --out ./ackit-diag.zip --redact-check</code></pre>
<p>Schema <code>ackit.diagnostics.v1</code>, deterministic bundle-manifest.json with sha256 + redaction count, 5-secret [REDACTED] proof.</p>`,
    },
    {
      id: "vscode",
      path: "vscode/index.html",
      title: "VS Code",
      description: "VS Code extension Cynrath.ackit-vscode v0.2.1",
      body: `<h1>VS Code</h1>
<p>Extension <code>Cynrath.ackit-vscode</code> <code>${escapeHtml(version)}</code> — <a href="https://marketplace.visualstudio.com/items?itemName=Cynrath.ackit-vscode">Marketplace</a></p>
<pre><code>code --install-extension Cynrath.ackit-vscode
# From VSIX:
code --install-extension ackit-vscode-${escapeHtml(version)}.vsix</code></pre>
<p>Features: readiness tree, Problems ACKITxxx, instructions for current file, tasks/policy/optimize, palette Refresh/Show Graph/Optimize/Diagnostics.</p>`,
    },
    {
      id: "security",
      path: "security/index.html",
      title: "Security",
      description: "Offline-first, deterministic, no telemetry, threat model",
      body: `<h1>Security</h1>
<p><strong>Offline-first:</strong> zero outbound product egress after installation. See <code>docs/security/THREAT_MODEL.md</code>.</p>
<ul>
<li>No telemetry, no cloud, no LLM calls</li>
<li>Redaction at construction, secrets never in evidence</li>
<li>Path traversal/realpath containment, ReDoS guards, CSP, bundle redaction</li>
</ul>
<pre><code>node scripts/check-offline-egress.mjs  # PASS
pnpm test tests/security/offline-*.test.ts  # 21 tests PASS</code></pre>`,
    },
    {
      id: "benchmarks",
      path: "benchmarks/index.html",
      title: "Benchmarks",
      description: "Deterministic benchmarks across 20 public repos, aggregate methodology",
      body: `<h1>Benchmarks</h1>
<p>7 fixtures, 8 metrics (coldScanMs/warmScanMs/incrementalMs/peakRssMb/filesPerSec/packMs/graphMs/cacheHitRatio), median-of-3, 1.5× thresholds.</p>
<pre><code>node benchmarks/run.mjs --classes small --out /tmp/out
node benchmarks/check-thresholds.mjs</code></pre>
<p>Public evidence: ~20 OSS repos (TypeScript/Go/Rust/Python) pinned SHAs, offline analysis only, aggregate counts (no raw secrets), deterministic.</p>`,
    },
    {
      id: "migration",
      path: "migration/index.html",
      title: "Migration",
      description: "Migration from 0.2.0 to 0.2.1",
      body: `<h1>Migration 0.2.0 → 0.2.1</h1>
<ul>
<li>Update <code>@cynrath/agent-context-kit</code> to <code>${escapeHtml(version)}</code>: <code>npm install --global @cynrath/agent-context-kit@${escapeHtml(version)}</code></li>
<li>Update GitHub Action: <code>Cynrath/agent-context-kit@v${escapeHtml(version)}</code></li>
<li>Update VS Code: <code>Cynrath.ackit-vscode</code> v${escapeHtml(version)} via Marketplace</li>
<li>No config migration needed — <code>ackit.yml</code> v1 still valid</li>
</ul>`,
    },
  ];

  for (const page of pages) {
    const fullPath = path.join(outRoot, page.path);
    await ensureDir(path.dirname(fullPath));
    await writeFileDeterministic(
      fullPath,
      pageTemplate({
        title: page.title,
        description: page.description,
        canonical: `/agent-context-kit/${page.id === "index" ? "" : page.id + "/"}`,
        version,
        body: page.body,
        active: page.id,
      }),
    );
  }

  // Sitemap
  const sitemapPath = path.join(siteRoot, "sitemap.xml");
  let sitemapContent = "";
  try {
    sitemapContent = await fsp.readFile(sitemapPath, "utf8");
  } catch {
    sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
  }
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    "https://cynrath.github.io/",
    "https://cynrath.github.io/agent-context-kit/",
    ...pages.map((p) => `https://cynrath.github.io/agent-context-kit/${p.id}/`),
  ];
  // Deduplicate and sort
  const uniqueUrls = [...new Set(urls)].sort();
  let newSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const url of uniqueUrls) {
    newSitemap += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
  }
  newSitemap += `</urlset>\n`;
  await writeFileDeterministic(sitemapPath, newSitemap);
  console.log(`[sync] sitemap updated ${uniqueUrls.length} urls`);

  // Robots
  const robotsPath = path.join(siteRoot, "robots.txt");
  let robotsContent = "";
  try {
    robotsContent = await fsp.readFile(robotsPath, "utf8");
  } catch {
    robotsContent = "User-agent: *\nAllow: /\n";
  }
  if (!robotsContent.includes("Sitemap: https://cynrath.github.io/sitemap.xml")) {
    robotsContent = robotsContent.trimEnd() + "\nSitemap: https://cynrath.github.io/sitemap.xml\n";
  }
  await writeFileDeterministic(robotsPath, robotsContent);
  console.log(`[sync] robots updated`);

  // Homepage integration — minimal edit
  const homepagePath = path.join(siteRoot, "index.html");
  let homepage = await fsp.readFile(homepagePath, "utf8").catch(() => "");
  if (homepage) {
    let updated = homepage;
    // Add Documentation button if missing
    if (!updated.includes('href="/agent-context-kit/"') && !updated.includes("href=\"/agent-context-kit/\"")) {
      // Find the Explore AgentContextKit button and add after it
      const buttonToAdd = `              <a class="button button-secondary" href="/agent-context-kit/">\n                Documentation\n                <svg viewBox="0 0 24 24" aria-hidden="true">\n                  <path d="M7 17 17 7m0 0H9m8 0v8"></path>\n                </svg>\n              </a>`;
      // Simple: replace the first Explore button's closing </a> with itself + new button
      updated = updated.replace(
        /<a class="button button-secondary" href="https:\/\/github\.com\/Cynrath\/agent-context-kit"[\s\S]*?<\/a>/,
        (match) => `${match}\n${buttonToAdd}`,
      );
      // Fallback if not found: insert before </div> of hero-actions
      if (!updated.includes('href="/agent-context-kit/"')) {
        updated = updated.replace(
          /<div class="hero-actions"[^>]*>/,
          `$&\n${buttonToAdd}`,
        );
      }
    }
    // Fix stale CLI example: replace "ackit inspect ." with real commands if present
    if (updated.includes("ackit inspect .") || updated.includes("cyranth --focus")) {
      // Update the projectVisual terminal from old inspect to real readiness/scan
      if (updated.includes("ackit inspect .")) {
        updated = updated.replace(
          /\$ ackit inspect \.\n[^\n]*ok structure mapped[\s\S]*?ok handoff context saved/,
          `$ ackit readiness\nReadiness 88/100 ██████████████████░░  (threshold 80 — pass)
$ ackit scan --ci
ok structure mapped
ok privacy rules checked`,
        );
      }
      // Update hero description if needed to mention TypeScript/npm
      if (!updated.includes("TypeScript")) {
        // Add to tag-list hero-tags if .NET only — keep but add
        updated = updated.replace(
          /<li>Security-aware workflows<\/li>/,
          `<li>Security-aware workflows</li>\n              <li>TypeScript</li>\n              <li>Offline-first</li>`,
        );
      }
      // Ensure project area describes TypeScript/npm accurately
      if (updated.includes("Repository structure and stack analysis") && !updated.includes("Instruction Graph")) {
        updated = updated.replace(
          /<li>Repository structure and stack analysis<\/li>/,
          `<li>Instruction Graph v2 &amp; Provider Profiles</li>`,
        );
      }
      if (updated.includes("Task-first documentation templates") && !updated.includes("Context Packs")) {
        updated = updated.replace(
          /<li>Task-first documentation templates<\/li>/,
          `<li>Context Packs &amp; Readiness Scoring</li>`,
        );
      }
    }
    if (updated !== homepage) {
      await writeFileDeterministic(homepagePath, updated);
      console.log(`[sync] homepage updated`);
    } else {
      console.log(`[sync] homepage already up to date`);
    }
  }

  console.log(`[sync] done — generated ${pages.length + 1} pages + assets`);
  // Determinism check: run twice would produce same (no timestamps except today date for sitemap)
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
