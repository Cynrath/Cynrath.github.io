#!/usr/bin/env node
/**
 * Sync ACKit docs into cynrath.github.io/agent-context-kit/.
 *
 * Usage:
 *   node ./scripts/sync-ackit-docs.mjs --source <path-to-agent-context-kit>
 *
 * Safety contract:
 * - canonical product source stays in agent-context-kit (package.json, README.md, docs/**, CHANGELOG.md)
 * - generated HTML may only be written under agent-context-kit/**
 * - root discovery writes are limited to sitemap.xml and robots.txt
 * - root index.html, assets/**, 404.html and every other presentation file are read/write forbidden
 * - shared docs theme assets are hand-maintained and never overwritten by this generator
 * - no network, exec, analytics, telemetry, CDN or remote code
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
const ROOT_WRITE_ALLOWLIST = new Set(['sitemap.xml', 'robots.txt']);
const FAVICON = 'data:image/png;base64,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';

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

function assertWriteAllowed(file) {
  const target = path.resolve(file);
  const relative = path.relative(siteRoot, target).split(path.sep).join('/');
  const insideDocs = target === docsRoot || target.startsWith(`${docsRoot}${path.sep}`);
  const allowedRootFile = !relative.includes('/') && ROOT_WRITE_ALLOWLIST.has(relative);
  if (!insideDocs && !allowedRootFile) {
    throw new Error(`[sync] refused write outside docs sandbox: ${relative || target}`);
  }
  if (insideDocs && /(^|\/)assets\/(ackit-docs\.css|ackit-docs\.js)$/.test(relative)) {
    throw new Error(`[sync] refused write to hand-maintained docs theme asset: ${relative}`);
  }
}

async function write(file, content) {
  assertWriteAllowed(file);
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
  ['rule-packs','Rule Packs'],['workflows','Workflows'],['intent','Intent'],
  ['checkpoints','Checkpoints'],['evidence','Evidence'],['verification','Verification'],
  ['drift','Drift'],['policy','Policy'],['roles','Roles'],['skills','Skills'],
  ['sync','Managed Sync'],['github-action','GitHub Action'],['mcp','MCP'],['sdk','SDK'],
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
  <link rel="icon" type="image/png" href="${FAVICON}">
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
    {slug:'',title:'AgentContextKit',description:'Offline-first deterministic toolkit for agent-ready repositories.',body:`<h1>AgentContextKit ${esc(version)}</h1><p><strong>Turn repository context into something agents and humans can inspect.</strong> ACKit combines readiness scoring, instruction graphs, context packs, policy-as-code, security scanning, tasks, MCP, dashboard and editor tooling without sending repository data to a hosted analysis service.</p><p><a class="button" href="/agent-context-kit/getting-started/">Getting Started</a><a class="button" href="/agent-context-kit/cli/">CLI Reference</a><a class="button" href="${REPO}">GitHub</a><a class="button" href="${NPM}">npm</a></p><h2>Install</h2><pre><code>${esc(install)}</code></pre><h2>Quickstart</h2><pre><code>ackit init --dry-run\nackit readiness\nackit instructions --explain\nackit scan --ci\nackit sync --check\nackit pack --profile codex --max-tokens 50000\nackit dashboard --port 0 --open</code></pre><h2>Core capabilities</h2><ul><li><strong>Agent Readiness</strong> — explainable 0–100 scoring with strict gates and baselines.</li><li><strong>Instruction Graph v2</strong> — provider-aware scope, precedence, provenance, conflicts and duplicates.</li><li><strong>Context Packs</strong> — deterministic ranking, token budgets and per-file manifests.</li><li><strong>Policy Packs</strong> — machine-checkable repository rules.</li><li><strong>Scanning + SARIF</strong> — secrets, connection strings, entropy, absolute paths, CI pinning and redacted evidence.</li><li><strong>Tasks</strong> — docs-first single-active workflow and completion gates.</li><li><strong>Workflows + Intent</strong> — staged lifecycles with gates, committed intent docs with fingerprints.</li><li><strong>Evidence + Verification</strong> — criteria-to-proof registry, verifier bundles, append-only verdicts.</li><li><strong>Checkpoints + Resume</strong> — snapshots, staleness detection, resume context and handoff packs.</li><li><strong>Drift + Policy v2</strong> — deterministic drift findings, risk-tiered autonomy and review policy.</li><li><strong>Roles + Skills</strong> — portable role contracts, managed open-standard skills.</li><li><strong>Managed Sync</strong> — content-driven reconciliation of ACKit-owned assets after upgrades.</li><li><strong>MCP + SDK</strong> — local integrations for agents and tooling.</li><li><strong>Dashboard + VS Code</strong> — local inspection surfaces for readiness, findings, graph, tasks and policy.</li></ul>`},
    {slug:'getting-started',title:'Getting Started',description:'Install and initialize AgentContextKit.',body:`<h1>Getting Started</h1><p>ACKit requires Node.js 22 or newer. Installation is global or via npx; repository analysis runs locally.</p><h2>Install</h2><pre><code>${esc(install)}</code></pre><h2>First pass</h2><pre><code>ackit init --dry-run\nackit readiness\nackit scan --ci\nackit instructions --explain</code></pre>`},
    {slug:'cli',title:'CLI Reference',description:'ACKit commands, options and exit behavior.',body:`<h1>CLI Reference</h1><p>The CLI favors stable terminal and JSON output so the same checks can be used interactively and in CI.</p><pre><code>ackit init --dry-run\nackit sync --check\nackit readiness --fail-below 80 --strict --baseline --compare --json\nackit scan --ci --changed --staged --since --range --baseline --watch\nackit instructions --provider codex --profile codex --for &lt;path&gt; --explain --json\nackit pack --profile codex --max-tokens 50000 --include &lt;glob&gt; --changed\nackit optimize --explain --fix --dry-run --format json\nackit policy check\nackit task create | list | start | complete\nackit workflow set | show | advance | verify\nackit intent new | list | show | validate | fingerprint\nackit checkpoint create | show | validate | export\nackit evidence sync | show | verify | validate\nackit verification bundle | record | show\nackit drift check --ci\nackit role list | show | validate\nackit skills list | validate | install | sync\nackit journal show | validate\nackit diagnostics --json\nackit diagnostics bundle --out ./ackit-diag.zip --redact-check\nackit dashboard --host 127.0.0.1 --port 0 --open\nackit mcp serve</code></pre><h2>Exit codes</h2><p>0 success, 1 threshold failure, 2 usage/configuration, 3 environment, 4 security, 5 internal error.</p>`},
    {slug:'readiness',title:'Readiness',description:'Explainable ACKit repository readiness scoring.',body:`<h1>Readiness</h1><p>Readiness summarizes whether a repository exposes enough instructions, security controls, context discipline, task state, skills and policy for repeatable agent-assisted work.</p><pre><code>ackit readiness\nackit readiness --fail-below 80 --strict\nackit readiness --baseline .ackit/readiness.json --compare</code></pre><h2>Score model</h2><p>Six categories are weighted and renormalized when a category is not applicable. JSON output uses the stable <code>ackit.readiness.v1</code> contract.</p>`},
    {slug:'optimize',title:'Optimize',description:'Instruction and context hygiene advisor.',body:`<h1>Optimize v2</h1><p>Optimize finds redundant, conflicting or expensive repository instructions and produces evidence-backed recommendations.</p><pre><code>ackit optimize --explain\nackit optimize --category instruction --min-severity medium --format json\nackit optimize --fix --dry-run</code></pre>`},
    {slug:'profiles',title:'Provider Profiles',description:'Provider-aware context profiles for coding agents.',body:`<h1>Provider Profiles</h1><p>ACKit ships profiles for Codex, Claude, Copilot, Gemini and a generic fallback.</p><pre><code>ackit pack --profile codex --max-tokens 50000\nackit pack --profile claude\nackit pack --profile copilot\nackit pack --profile gemini</code></pre>`},
    {slug:'instruction-graph',title:'Instruction Graph',description:'Resolve nested agent instructions with provenance and precedence.',body:`<h1>Instruction Graph v2</h1><p>Instruction Graph resolves repository guidance from Codex, Claude, Gemini, Copilot and shared files. It tracks scope, precedence, provenance, shadowing, duplicates and conflicts.</p><pre><code>ackit instructions --explain\nackit instructions --provider codex --for src/app.ts --json</code></pre>`},
    {slug:'rule-packs',title:'Rule Packs',description:'Declarative offline repository policy checks.',body:`<h1>Rule / Policy Packs</h1><p>Rule packs turn repository requirements into machine-checkable presence, pattern, config, dependency and instruction checks.</p><pre><code>ackit policy check</code></pre>`},
    {slug:'workflows',title:'Workflows',description:'Staged ACKit workflow lifecycles with deterministic gates.',body:`<h1>Workflows</h1><p>Workflows run repository work through staged lifecycles (quick, standard, high-risk) with required artifacts and deterministic gates. Optional <code>workflow:</code> keys in <code>ackit.yml</code> tune the built-in profile minimums; repositories without them keep exact prior behavior.</p><pre><code>ackit workflow set --profile standard\nackit workflow show\nackit workflow advance\nackit workflow verify --outcome pass</code></pre>`},
    {slug:'intent',title:'Intent',description:'Committed intent documents with fingerprints.',body:`<h1>Intent</h1><p>Intent documents capture the goal of a work item before implementation, with machine-path-independent fingerprints and secret-gated validation.</p><pre><code>ackit intent new "ship offline packs"\nackit intent list\nackit intent validate\nackit intent fingerprint</code></pre>`},
    {slug:'checkpoints',title:'Checkpoints',description:'Resumable checkpoints with handoff packs.',body:`<h1>Checkpoints / Resume / Handoff</h1><p>Checkpoints snapshot task state with deterministic resume context and handoff packs, so work survives provider switches and interruptions.</p><pre><code>ackit checkpoint create --next-objective "wire gate" --next-path src/core --next-command "pnpm test" --next-expected "green"\nackit checkpoint show\nackit checkpoint validate\nackit checkpoint export\nackit task resume</code></pre>`},
    {slug:'evidence',title:'Evidence',description:'Acceptance criteria linked to typed proof.',body:`<h1>Evidence</h1><p>The evidence registry links acceptance criteria to typed proof. Criteria sync from the task document; checkbox state is never copied, so implementation is never confused with verification.</p><pre><code>ackit evidence sync\nackit evidence show\nackit evidence verify --criterion AC-001 --type test --ref "vitest run"\nackit evidence validate</code></pre>`},
    {slug:'verification',title:'Verification',description:'Independent verification bundles and verdicts.',body:`<h1>Verification / Verdicts</h1><p>Verification bundles give a fresh independent verifier everything needed to judge a task; verdicts are append-only: PASS, PASS_WITH_WARNINGS, REWORK_REQUIRED or BLOCKED.</p><pre><code>ackit verification bundle\nackit verification record --verdict ./verdict.yaml\nackit verification show</code></pre>`},
    {slug:'drift',title:'Drift',description:'Deterministic workflow drift detection.',body:`<h1>Drift</h1><p>Drift detection reports deterministic findings when implementation diverges from the declared plan, with a managed pre-commit gate for the active workflow task.</p><pre><code>ackit drift check\nackit drift check --ci\nackit drift check-active --ci</code></pre>`},
    {slug:'policy',title:'Policy',description:'Risk-tiered autonomy and review policy.',body:`<h1>Policy</h1><p>Policy v2 combines risk-tiered autonomy (tier0 through tier4, allow / ask / deny with deny winning across layers) with review policy on policy documents and configuration.</p><pre><code>ackit policy check</code></pre>`},
    {slug:'roles',title:'Roles',description:'Portable data-only agent role contracts.',body:`<h1>Roles</h1><p>Role contracts describe researcher, architect, implementer, verifier, security-reviewer, documentation-reviewer and release-reviewer responsibilities as portable data-only documents.</p><pre><code>ackit role list\nackit role show verifier\nackit role validate</code></pre>`},
    {slug:'skills',title:'Skills',description:'Open-standard agent skills management.',body:`<h1>Skills</h1><p>ACKit manages open-standard skills with lock-tracked installs, ownership and conflict handling, plus deterministic projections for Claude Code, Copilot and generic layouts.</p><pre><code>ackit skills list\nackit skills validate\nackit skills install\nackit skills sync\nackit skills export --provider claude --out ./skills-out</code></pre>`},
    {slug:'sync',title:'Managed Sync',description:'Reconcile ACKit-owned managed assets after upgrades.',body:`<h1>Managed Asset Sync</h1><p><code>ackit sync</code> reconciles ACKit-owned managed assets (instruction blocks and builtin skills) after upgrades. Write decisions are content-driven: upgrading the package alone never rewrites files.</p><pre><code>ackit sync --dry-run\nackit sync --check\nackit sync\nackit sync --force</code></pre>`},
    {slug:'github-action',title:'GitHub Action',description:'Run ACKit repository checks in GitHub Actions.',body:`<h1>GitHub Action</h1><p>Use the official action for repeatable repository checks in CI with least-privilege permissions.</p><pre><code>permissions:\n  contents: read\njobs:\n  ackit:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a\n      - uses: Cynrath/agent-context-kit@v${esc(version)}\n        with:\n          command: scan\n          args: "--json"\n          fail-threshold: high\n          upload-sarif: "false"</code></pre>`},
    {slug:'mcp',title:'MCP',description:'Local Model Context Protocol integration for ACKit.',body:`<h1>MCP</h1><p>ACKit exposes a local stdio MCP server for read-oriented repository inspection. No remote transport is required.</p><pre><code>{ "mcpServers": { "ackit": { "command": "ackit", "args": ["mcp", "serve"] } } }</code></pre>`},
    {slug:'sdk',title:'SDK',description:'Programmatic ACKit repository analysis.',body:`<h1>SDK</h1><p>The ESM SDK exposes the same deterministic repository analysis primitives used by the CLI.</p><pre><code>import { scanRepository } from "@cynrath/agent-context-kit";\nconst result = await scanRepository({ canonicalPath: process.cwd() });</code></pre>`},
    {slug:'dashboard',title:'Dashboard',description:'Local ACKit dashboard and live repository views.',body:`<h1>Dashboard</h1><p>The dashboard binds to localhost by default and provides local views for scan results, graph, readiness, tasks and policy.</p><pre><code>ackit dashboard --port 0 --open\nackit report serve ./report.html --port 0</code></pre>`},
    {slug:'diagnostics',title:'Diagnostics',description:'ACKit environment and support diagnostics.',body:`<h1>Diagnostics</h1><p>Diagnostics describe the local environment, configuration, cache, policy and task state without exposing plaintext secrets.</p><pre><code>ackit diagnostics --json\nackit diagnostics bundle --out ./ackit-diag.zip --redact-check</code></pre>`},
    {slug:'vscode',title:'VS Code',description:'AgentContextKit VS Code extension.',body:`<h1>VS Code</h1><p><code>Cynrath.ackit-vscode</code> surfaces readiness, findings, instructions, tasks, policy and diagnostics inside VS Code.</p><pre><code>code --install-extension Cynrath.ackit-vscode</code></pre>`},
    {slug:'security',title:'Security',description:'ACKit offline-first threat model and redaction guarantees.',body:`<h1>Security</h1><p><strong>Offline-first:</strong> product analysis is designed for zero outbound repository-data egress after installation.</p><ul><li>No telemetry or hosted LLM calls in repository analysis.</li><li>Evidence is redacted at construction.</li><li>Path containment and traversal checks protect file access.</li><li>Rule evaluation includes ReDoS and size guards.</li><li>Dashboard defaults to loopback with CSP.</li></ul>`},
    {slug:'benchmarks',title:'Benchmarks',description:'Deterministic ACKit performance benchmarks.',body:`<h1>Benchmarks</h1><p>ACKit benchmarks cold scan, warm scan, incremental scan, memory, throughput, context-pack construction, instruction-graph construction and cache behavior.</p><pre><code>node benchmarks/run.mjs --classes small --out /tmp/out\nnode benchmarks/check-thresholds.mjs</code></pre>`},
    {slug:'migration',title:'Migration',description:'Upgrade AgentContextKit to the current release.',body:`<h1>Migration</h1><p>Upgrade the package, GitHub Action and VS Code extension together so repository tooling stays on the same release line.</p><pre><code>npm install --global @cynrath/agent-context-kit@${esc(version)}\nackit --version\nackit sync --check</code></pre><ul><li>GitHub Action: <code>Cynrath/agent-context-kit@v${esc(version)}</code></li><li>VS Code: <code>Cynrath.ackit-vscode</code></li><li>Run <code>ackit config check</code> after upgrading, then <code>ackit sync --check</code> to reconcile ACKit-owned managed assets.</li></ul>`}
  ];
}

function llms(version, pageList) {
  const links = pageList.map(p => `- [${p.title}](${SITE}/agent-context-kit/${p.slug ? `${p.slug}/` : ''}): ${p.description}`).join('\n');
  return `# AgentContextKit\n\n> AgentContextKit (ACKit) ${version} is an offline-first deterministic toolkit for turning repositories into agent-ready working environments.\n\n## Documentation\n\n${links}\n\n## Source and package\n\n- [GitHub](${REPO})\n- [npm](${NPM})\n- [Cynrath](${SITE}/)\n`;
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

  // Intentionally do not read or write root index.html. Homepage integration is maintained separately.
  console.log(`[sync] ACKit ${version}: ${list.length} pages + llms + sitemap/robots (root index protected)`);
}

main().catch(err => { console.error(err); process.exit(1); });
