#!/usr/bin/env node
/**
 * Sync ACKit docs into cynrath.github.io/agent-context-kit/.
 *
 * Usage:
 *   node ./scripts/sync-ackit-docs.mjs --source <path-to-agent-context-kit>
 *
 * Design goals:
 * - canonical product source stays in agent-context-kit (package.json, README.md, docs/**, CHANGELOG.md)
 * - static GitHub Pages output; no runtime build, analytics, telemetry, CDN or remote code
 * - deterministic/idempotent output for a given source version and UTC day
 * - shared docs theme lives in agent-context-kit/assets and is not overwritten by sync
 * - generates HTML pages, sitemap, robots rules and LLM discovery files
 */
import { promises as fsp } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(siteRoot, 'agent-context-kit');
const SITE = 'https://cynrath.github.io';
const REPO = 'https://github.com/Cynrath/agent-context-kit';
const NPM = 'https://www.npmjs.com/package/@cynrath/agent-context-kit';

function parseArgs() {
  const args = process.argv.slice(2);
  let source = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) source = args[++i];
    else if (args[i].startsWith('--source=')) source = args[i].slice(9);
  }
  if (!source) throw new Error('Usage: node ./scripts/sync-ackit-docs.mjs --source <path-to-agent-context-kit>');
  return { source: path.resolve(source) };
}

function esc(value) {
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
async function write(file, content) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, content.replace(/\r\n/g,'\n'), 'utf8');
}
async function readOptional(file) {
  try { return await fsp.readFile(file, 'utf8'); } catch { return ''; }
}
function readVersion(source) {
  const pkg = JSON.parse(fs.readFileSync(path.join(source,'package.json'),'utf8'));
  if (!pkg.version) throw new Error('ACKit package.json has no version');
  return pkg.version;
}

const nav = [
  ['','Overview'],['getting-started','Getting Started'],['cli','CLI'],['readiness','Readiness'],
  ['optimize','Optimize'],['profiles','Profiles'],['instruction-graph','Instruction Graph'],
  ['rule-packs','Rule Packs'],['github-action','GitHub Action'],['mcp','MCP'],['sdk','SDK'],
  ['dashboard','Dashboard'],['diagnostics','Diagnostics'],['vscode','VS Code'],['security','Security'],
  ['benchmarks','Benchmarks'],['migration','Migration']
];

function template({ title, description, slug, version, body }) {
  const canonical = `${SITE}/agent-context-kit/${slug ? `${slug}/` : ''}`;
  const navHtml = nav.map(([id,label]) => {
    const href = `/agent-context-kit/${id ? `${id}/` : ''}`;
    return `<a href="${href}"${id===slug?' class="active" aria-current="page"':''}>${esc(label)}</a>`;
  }).join('\n          ');
  const schema = JSON.stringify({
    '@context':'https://schema.org','@type':'TechArticle',headline:`${title} — AgentContextKit`,
    description,url:canonical,isPartOf:{'@type':'WebSite',name:'AgentContextKit Documentation',url:`${SITE}/agent-context-kit/`},
    about:{'@type':'SoftwareSourceCode',name:'AgentContextKit',codeRepository:REPO,programmingLanguage:'TypeScript',softwareVersion:version,license:'https://opensource.org/licenses/MIT'}
  });
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <meta name="theme-color" content="#07111f">
  <title>${esc(title)} — ACKit ${esc(version)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="describedby" href="/agent-context-kit/llms.txt">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${esc(title)} — AgentContextKit">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:site_name" content="Cynrath">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">${schema}</script>
  <link rel="stylesheet" href="/agent-context-kit/assets/ackit-docs.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="shell header-inner">
    <a class="brand" href="/agent-context-kit/">ACKit Docs</a>
    <nav class="docs-nav" aria-label="ACKit documentation">${navHtml}</nav>
    <a class="button button-small" href="${REPO}" rel="noopener" target="_blank">GitHub</a>
  </div></header>
  <main id="main" class="shell docs-main"><article class="docs-article">${body}</article></main>
  <footer class="site-footer"><div class="shell footer-inner"><p>AgentContextKit ${esc(version)} · offline-first · deterministic · MIT</p><p><a href="${NPM}">npm</a> · <a href="${REPO}">GitHub</a> · <a href="${SITE}/">Cynrath</a></p></div></footer>
  <script src="/agent-context-kit/assets/ackit-docs.js" defer></script>
</body>
</html>\n`;
}

function pages(version) {
  const install = `npm install --global @cynrath/agent-context-kit@${version}\nackit --version\nackit --help`;
  return [
    {slug:'',title:'AgentContextKit',description:'Offline-first deterministic toolkit for agent-ready repositories.',body:`
<h1>AgentContextKit ${esc(version)}</h1>
<p><strong>Turn repository context into something agents and humans can inspect.</strong> ACKit combines readiness scoring, instruction graphs, context packs, policy-as-code, security scanning, tasks, MCP, dashboard and editor tooling without sending repository data to a hosted analysis service.</p>
<p><a class="button" href="/agent-context-kit/getting-started/">Getting Started</a><a class="button" href="/agent-context-kit/cli/">CLI Reference</a><a class="button" href="${REPO}">GitHub</a><a class="button" href="${NPM}">npm</a></p>
<h2>Install</h2><pre><code>${esc(install)}</code></pre>
<h2>Quickstart</h2><pre><code>ackit init --dry-run
ackit readiness
ackit instructions --explain
ackit scan --ci
ackit pack --profile codex --max-tokens 50000
ackit dashboard --port 0 --open</code></pre>
<h2>Core capabilities</h2>
<ul><li><strong>Agent Readiness</strong> — explainable 0–100 scoring with strict gates and baselines.</li><li><strong>Instruction Graph v2</strong> — provider-aware scope, precedence, provenance, conflicts and duplicates.</li><li><strong>Context Packs</strong> — deterministic ranking, token budgets and per-file manifests.</li><li><strong>Policy Packs</strong> — machine-checkable repository rules.</li><li><strong>Scanning + SARIF</strong> — secrets, connection strings, entropy, absolute paths, CI pinning and redacted evidence.</li><li><strong>Tasks</strong> — docs-first single-active workflow and completion gates.</li><li><strong>MCP + SDK</strong> — local integrations for agents and tooling.</li><li><strong>Dashboard + VS Code</strong> — local inspection surfaces for readiness, findings, graph, tasks and policy.</li></ul>
<h2>Documentation map</h2><p>Start with <a href="/agent-context-kit/getting-started/">Getting Started</a>, then use the CLI, Readiness, Instruction Graph, Security, MCP and editor pages as references.</p>`},
    {slug:'getting-started',title:'Getting Started',description:'Install and initialize AgentContextKit.',body:`<h1>Getting Started</h1><p>ACKit requires Node.js 22 or newer. Installation is global or via npx; repository analysis runs locally.</p><h2>Install</h2><pre><code>${esc(install)}</code></pre><h2>First pass</h2><pre><code>ackit init --dry-run
ackit readiness
ackit scan --ci
ackit instructions --explain</code></pre><p><code>init --dry-run</code> shows planned repository shims without writing them. Use readiness and scan as the first deterministic checks.</p>`},
    {slug:'cli',title:'CLI Reference',description:'ACKit commands, options and exit behavior.',body:`<h1>CLI Reference</h1><p>The CLI favors stable terminal and JSON output so the same checks can be used interactively and in CI.</p><pre><code>ackit init --dry-run
ackit readiness --fail-below 80 --strict --baseline --compare --json
ackit scan --ci --changed --staged --since --range --baseline --watch
ackit instructions --provider codex --profile codex --for &lt;path&gt; --explain --json
ackit pack --profile codex --max-tokens 50000 --include &lt;glob&gt; --changed
ackit optimize --explain --fix --dry-run --format json
ackit policy check
ackit task create | list | start | complete
ackit diagnostics --json
ackit diagnostics bundle --out ./ackit-diag.zip --redact-check
ackit dashboard --host 127.0.0.1 --port 0 --open
ackit mcp serve</code></pre><h2>Exit codes</h2><p>0 success, 1 threshold failure, 2 usage/configuration, 3 environment, 4 security, 5 internal error.</p>`},
    {slug:'readiness',title:'Readiness',description:'Explainable ACKit repository readiness scoring.',body:`<h1>Readiness</h1><p>Readiness summarizes whether a repository exposes enough instructions, security controls, context discipline, task state, skills and policy for repeatable agent-assisted work.</p><pre><code>ackit readiness
ackit readiness --fail-below 80 --strict
ackit readiness --baseline .ackit/readiness.json --compare</code></pre><h2>Score model</h2><p>Six categories are weighted and renormalized when a category is not applicable. JSON output uses the stable <code>ackit.readiness.v1</code> contract.</p>`},
    {slug:'optimize',title:'Optimize',description:'Instruction and context hygiene advisor.',body:`<h1>Optimize v2</h1><p>Optimize finds redundant, conflicting or expensive repository instructions and produces evidence-backed recommendations.</p><pre><code>ackit optimize --explain
ackit optimize --category instruction --min-severity medium --format json
ackit optimize --fix --dry-run</code></pre><p>Suggestions include evidence, confidence, token-waste estimates, provenance and a proposed plan.</p>`},
    {slug:'profiles',title:'Provider Profiles',description:'Provider-aware context profiles for coding agents.',body:`<h1>Provider Profiles</h1><p>ACKit ships profiles for Codex, Claude, Copilot, Gemini and a generic fallback. Profiles influence provider-aware instruction and context selection.</p><pre><code>ackit pack --profile codex --max-tokens 50000
ackit pack --profile claude
ackit pack --profile copilot
ackit pack --profile gemini</code></pre>`},
    {slug:'instruction-graph',title:'Instruction Graph',description:'Resolve nested agent instructions with provenance and precedence.',body:`<h1>Instruction Graph v2</h1><p>Instruction Graph resolves repository guidance from Codex, Claude, Gemini, Copilot and shared files. It tracks scope, precedence, provenance, shadowing, duplicates and conflicts.</p><pre><code>ackit instructions --explain
ackit instructions --provider codex --for src/app.ts --json</code></pre>`},
    {slug:'rule-packs',title:'Rule Packs',description:'Declarative offline repository policy checks.',body:`<h1>Rule / Policy Packs</h1><p>Rule packs turn repository requirements into machine-checkable presence, pattern, config, dependency and instruction checks.</p><pre><code>ackit policy check</code></pre><pre><code>policy:
  rulePacks:
    - ./packs/security.yml
    - npm:team-pack/rules.yml</code></pre><p>Remote HTTP sources are refused; rule evaluation includes size and ReDoS guards.</p>`},
    {slug:'github-action',title:'GitHub Action',description:'Run ACKit repository checks in GitHub Actions.',body:`<h1>GitHub Action</h1><p>Use the official action for repeatable repository checks in CI with least-privilege permissions.</p><pre><code>permissions:
  contents: read
jobs:
  ackit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a
      - uses: Cynrath/agent-context-kit@v${esc(version)}
        with:
          command: scan
          args: "--json"
          fail-threshold: high
          upload-sarif: "false"</code></pre>`},
    {slug:'mcp',title:'MCP',description:'Local Model Context Protocol integration for ACKit.',body:`<h1>MCP</h1><p>ACKit exposes a local stdio MCP server for read-oriented repository inspection. No remote transport is required.</p><pre><code>{
  "mcpServers": {
    "ackit": { "command": "ackit", "args": ["mcp", "serve"] }
  }
}</code></pre>`},
    {slug:'sdk',title:'SDK',description:'Programmatic ACKit repository analysis.',body:`<h1>SDK</h1><p>The ESM SDK exposes the same deterministic repository analysis primitives used by the CLI.</p><pre><code>import { scanRepository } from "@cynrath/agent-context-kit";

const result = await scanRepository({ canonicalPath: process.cwd() });</code></pre><p>The package is side-effect free and supports cancellation with <code>AbortSignal</code>.</p>`},
    {slug:'dashboard',title:'Dashboard',description:'Local ACKit dashboard and live repository views.',body:`<h1>Dashboard</h1><p>The dashboard binds to localhost by default and provides local views for scan results, graph, readiness, tasks and policy.</p><pre><code>ackit dashboard --port 0 --open
ackit report serve ./report.html --port 0</code></pre><p>Non-loopback binding requires explicit opt-in. The dashboard uses CSP and no analytics.</p>`},
    {slug:'diagnostics',title:'Diagnostics',description:'ACKit environment and support diagnostics.',body:`<h1>Diagnostics</h1><p>Diagnostics describe the local environment, configuration, cache, policy and task state without exposing plaintext secrets.</p><pre><code>ackit diagnostics --json
ackit diagnostics bundle --out ./ackit-diag.zip --redact-check</code></pre><p>Bundles include a deterministic manifest with hashes and redaction counts.</p>`},
    {slug:'vscode',title:'VS Code',description:'AgentContextKit VS Code extension.',body:`<h1>VS Code</h1><p><code>Cynrath.ackit-vscode</code> surfaces readiness, findings, instructions, tasks, policy and diagnostics inside VS Code.</p><pre><code>code --install-extension Cynrath.ackit-vscode</code></pre><p><a href="https://marketplace.visualstudio.com/items?itemName=Cynrath.ackit-vscode">Open the Marketplace listing</a>.</p>`},
    {slug:'security',title:'Security',description:'ACKit offline-first threat model and redaction guarantees.',body:`<h1>Security</h1><p><strong>Offline-first:</strong> product analysis is designed for zero outbound repository-data egress after installation.</p><ul><li>No telemetry or hosted LLM calls in repository analysis.</li><li>Evidence is redacted at construction.</li><li>Path containment and traversal checks protect file access.</li><li>Rule evaluation includes ReDoS and size guards.</li><li>Dashboard defaults to loopback with CSP.</li></ul><pre><code>node scripts/check-offline-egress.mjs
pnpm test tests/security/offline-*.test.ts</code></pre>`},
    {slug:'benchmarks',title:'Benchmarks',description:'Deterministic ACKit performance benchmarks.',body:`<h1>Benchmarks</h1><p>ACKit benchmarks cold scan, warm scan, incremental scan, memory, throughput, context-pack construction, instruction-graph construction and cache behavior.</p><pre><code>node benchmarks/run.mjs --classes small --out /tmp/out
node benchmarks/check-thresholds.mjs</code></pre><p>Public benchmark evidence uses pinned open-source repositories and aggregate results.</p>`},
    {slug:'migration',title:'Migration',description:'Upgrade AgentContextKit to the current release.',body:`<h1>Migration</h1><p>Upgrade the package, GitHub Action and VS Code extension together so repository tooling stays on the same release line.</p><pre><code>npm install --global @cynrath/agent-context-kit@${esc(version)}
ackit --version</code></pre><ul><li>GitHub Action: <code>Cynrath/agent-context-kit@v${esc(version)}</code></li><li>VS Code: <code>Cynrath.ackit-vscode</code></li><li>Run <code>ackit config check</code> after upgrading.</li></ul>`}
  ];
}

function llms(version, pageList) {
  const links = pageList.map(p => `- [${p.title}](${SITE}/agent-context-kit/${p.slug ? `${p.slug}/` : ''}): ${p.description}`).join('\n');
  return `# AgentContextKit\n\n> AgentContextKit (ACKit) ${version} is an offline-first deterministic toolkit for turning repositories into agent-ready working environments.\n\nUse the documentation for exact CLI behavior, readiness, instruction resolution, security and integrations. Canonical product source is the GitHub repository.\n\n## Documentation\n\n${links}\n\n## Source and package\n\n- [GitHub](${REPO}): canonical source, issues, releases and discussions.\n- [npm](${NPM}): package @cynrath/agent-context-kit.\n- [Cynrath](${SITE}/): developer site and project overview.\n`;
}

async function main() {
  const { source } = parseArgs();
  const version = readVersion(source);
  const readme = await readOptional(path.join(source,'README.md'));
  const changelog = await readOptional(path.join(source,'CHANGELOG.md'));
  if (!readme.includes('AgentContextKit') && !readme.includes('ACKit')) throw new Error('Source README does not look like AgentContextKit');
  if (!changelog) console.warn('[sync] CHANGELOG.md not found; continuing');
  const assetCss = path.join(docsRoot,'assets','ackit-docs.css');
  const assetJs = path.join(docsRoot,'assets','ackit-docs.js');
  if (!fs.existsSync(assetCss) || !fs.existsSync(assetJs)) throw new Error('Docs theme assets are missing. Keep agent-context-kit/assets/ackit-docs.css and ackit-docs.js in the site repo.');

  const list = pages(version);
  for (const page of list) {
    const out = path.join(docsRoot, page.slug ? page.slug : '', 'index.html');
    await write(out, template({ ...page, version }));
  }

  await write(path.join(docsRoot,'llms.txt'), llms(version,list));
  await write(path.join(docsRoot,'llms-full.txt'), `# AgentContextKit ${version}\n\n${readme}\n\n---\n\n# Changelog\n\n${changelog}`);

  const today = new Date().toISOString().slice(0,10);
  const urls = [`${SITE}/`, ...list.map(p => `${SITE}/agent-context-kit/${p.slug ? `${p.slug}/` : ''}`)].sort();
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of urls) sitemap += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
  sitemap += '</urlset>\n';
  await write(path.join(siteRoot,'sitemap.xml'), sitemap);

  const robots = `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
  await write(path.join(siteRoot,'robots.txt'), robots);

  const homepagePath = path.join(siteRoot,'index.html');
  const homepage = await readOptional(homepagePath);
  if (homepage && !homepage.includes('/agent-context-kit/')) {
    console.warn('[sync] homepage has no ACKit documentation link; update index.html before publishing');
  }

  console.log(`[sync] ACKit ${version}: ${list.length} pages + llms + sitemap/robots`);
}

main().catch(err => { console.error(err); process.exit(1); });
