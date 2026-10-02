#!/usr/bin/env node
/**
 * Sync ACKit Spec Kit Bridge docs into cynrath.github.io/ackit-spec-kit-bridge/.
 *
 * Usage:
 *   node ./scripts/sync-ackit-spec-kit-bridge-docs.mjs --source <path-to-ackit-spec-kit-bridge>
 *
 * Safety contract (mirrors scripts/sync-ackit-docs.mjs):
 * - canonical product source stays in ackit-spec-kit-bridge
 *   (package.json, README.md, docs/**, CHANGELOG.md)
 * - generated HTML may only be written under ackit-spec-kit-bridge/**
 * - root discovery writes are limited to sitemap.xml and robots.txt,
 *   and sitemap.xml is MERGED: existing non-bridge URLs (root, ACKit)
 *   are preserved verbatim so generator order never drops pages
 * - root index.html, assets/**, 404.html and every other presentation file
 *   are read/write forbidden
 * - shared docs theme assets live under agent-context-kit/assets/ and are
 *   hand-maintained; this generator links to them and never writes them
 * - no network, exec, analytics, telemetry, CDN or remote code
 */
import { promises as fsp } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, '..');
const docsRoot = path.join(siteRoot, 'ackit-spec-kit-bridge');
const SITE = 'https://cynrath.github.io';
const REPO = 'https://github.com/Cynrath/ackit-spec-kit-bridge';
const NPM = 'https://www.npmjs.com/package/@cynrath/ackit-spec-kit-bridge';
const ACKIT_REPO = 'https://github.com/Cynrath/agent-context-kit';
const SPECKIT_REPO = 'https://github.com/github/spec-kit';
const ROOT_WRITE_ALLOWLIST = new Set(['sitemap.xml', 'robots.txt']);
const FAVICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAHI0lEQVR42r1Xa2wU1xX+zr13Zry21w/sjZdHHAcMXiBRgkMbXkEuARYrcYRNLbXKjxC3NCaQRG1UqVRNCq2KRVFVqYKYpJUwUhP6gyJURZXJo5WpDIiWEmJhYt7GuCy2l7Uxu2vPzszpj3141wbXAan31zzOPfc753zncSWmskgIEAgAT02eBIimLj+ZKggpH3i3lBIAPdjm9IM90yvIW/pUwjqaxHICAPKWPg3P9Dn31DX+mHu4W4KI4Ng2hMyV/oYfGc1nTomnVr/0v5Sl/i3zf5s+++oU1W3aCiAbjm2DiCCEwKTo0wS0Z2q+m72j/ZxqC7FqC7HuW1s3ZQBV1d9Bj8XosVhv6fgSVdX1GWGZ6MWxD1RW8VxR/cFW41CAVVuIs3e0HydfZTUAmtT9mWEg8lW+qLd0nEKQGT0Wo6n5r1RWsTSDXxkxdbmn561r2j9tT5Cn7Qly9o72y9qSDd9PhYmEgJASQkwk1nhgY++69De8rrd09CDITGeHHDRu+wAud9GYHBFBGflF9QfPJg4flv6GX0Ez4kJKU8LtyX+oXHK5vWjc9hs6OxRFkBlNze1QWnYKqO5bW5+w+prwli9KbVSGkbeu6eO8dU03pb9hn+5b+wL5KmugDPeYjOaCZ/oTGW7VjFy43IUgIkil0sK7XLWFbqHHYvJVrkllAWmuQgCOOnHsmBO4dAbKMOK8cBwAPs1d5s2v2f1a7taDHxdu/fQvovjRJ1MuJCEAGHGCKQUhBM1ZuBjPrngZzAwhBYgElKbxta526/ifTiJbMntL8tPT0E48M0gIOJYNMMOKseYuMwsXbgAAJ2kJZ0lKs5hJanZcixWD4zhc5X9F3/jrNwBoiI2aYHbiaS1EQg+NrwNjJGLHSYseA7gN4E7u+WAEQATACI3YMZAQYHBirwQA8lWuQVPzUdr8k42xRaXz9JaO86iq3pyKt+M4aeWZAEABgDQnZBfHQ8B2qPXNl0P/eGc2wkPdAJRjRgYxGu5LAwy2YwwAHLzZS//89+f63NpnzbmufPPkR59S4NY5ZscaZ1QmAACYNuBGH8ZlKQMkDV0WzJ5nBj75OwDIglk+NW/182asJ8RdX3wCEiCpCQaA/pudfPj3nSag8Tcqn8O+ps2c2RcwvkGpjN5hivSzk8vKKvvWCgAmaa4sY+aSFeGTe3dp3gXfNKWWDYadCqHSFCAkrFHzfm1ATaWnhfliAAOXjgPQrRlFs4ySxUttjRXYjkFIkSKoFTMBgAPXTyNw/XTSgAxtI9b9PXA/AOo/wVujA1e6AABHr3REXO5imNFh2NYoSOawHXMSJFzN3Rc7qGRGKbJy8hLZBb7a9QVi0TspjRF7Igfuu5ROSUUAILzly1XB7PlylG9Hr31+BAQiqSkGiKv8L1BreFBULF9pP17ipb4Bix8pFgjevIGByNBEok8GIOEoHh2OGjOXLAUgnBxluAoWLwqf3PszWTh/GaSWm+ZixoE9v2Uz0mffvHEex4TGAMNxCGZkGEII2LY9wb57MTOV3fEsUNHBf33l9Jw+DKXr0XK4jJLFLwKwwXYMkCJBKMIrW3dS6+FmXlf3EkpmlAGIAVD0/u5f8q2eznE1J3YvAAxKdDtO622Dw3324I2rAGAPXNnpFM+eb4f7A7CtKJTMTZCQsf93b7EZHcK+phPpRY4BC1IKMHNaOO10AEkm54AdGyQliCSYrbR/EG7Po7Ss5gdioP8Sij21fPbYn53+q50pqK++uZdaD7+HypXV/EjxYwkrBR35cDcHrn8JAMhS0wCwHrDZTAJgM9wNQLjn164d7T2xMdJ1pCU54bA9esd+bNYc1+ia2hEjqORA/yUr3HsD4V6m8NAQhNIIehYDwIE9b7EZGUTvtTMQSkEIAkAcHQ4CIOlve';

function parseArgs() {
  const args = process.argv.slice(2);
  let source = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) source = args[++i];
    else if (args[i].startsWith('--source=')) source = args[i].slice(9);
  }
  if (!source) throw new Error('Usage: node ./scripts/sync-ackit-spec-kit-bridge-docs.mjs --source <path-to-ackit-spec-kit-bridge>');
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
    throw new Error(`[sync-bridge] refused write outside docs sandbox: ${relative || target}`);
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
  if (pkg.name !== '@cynrath/ackit-spec-kit-bridge') throw new Error('Source package.json is not the bridge package');
  if (!pkg.version) throw new Error('Bridge package.json has no version');
  return pkg.version;
}

const nav = [
  ['','Overview'],['getting-started','Getting Started'],['cli','CLI'],
  ['lifecycle','Lifecycle'],['verification','Verification'],['profiles','Profiles'],
  ['spec-kit-extension','Spec Kit Extension'],['configuration','Configuration'],
  ['security','Security'],['compatibility','Compatibility'],
  ['architecture','Architecture'],['trust-flow','Trust Flow'],
  ['troubleshooting','Troubleshooting'],['release','Release']
];

function template({ title, description, slug, version, body }) {
  const canonical = `${SITE}/ackit-spec-kit-bridge/${slug ? `${slug}/` : ''}`;
  const navHtml = nav.map(([id,label]) => {
    const href = `/ackit-spec-kit-bridge/${id ? `${id}/` : ''}`;
    return `<a href="${href}"${id===slug?' class="active" aria-current="page"':''}>${esc(label)}</a>`;
  }).join('\n          ');
  const schema = JSON.stringify({
    '@context':'https://schema.org','@type':'TechArticle',headline:`${title} — ACKit Spec Kit Bridge`,
    description,url:canonical,isPartOf:{'@type':'WebSite',name:'ACKit Spec Kit Bridge Documentation',url:`${SITE}/ackit-spec-kit-bridge/`},
    about:{'@type':'SoftwareSourceCode',name:'ACKit Spec Kit Bridge',codeRepository:REPO,programmingLanguage:'TypeScript',softwareVersion:version,license:'https://opensource.org/licenses/MIT'}
  });
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <meta name="theme-color" content="#07111f">
  <link rel="icon" type="image/png" href="${FAVICON}">
  <title>${esc(title)} — Bridge ${esc(version)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="describedby" href="/ackit-spec-kit-bridge/llms.txt">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${esc(title)} — ACKit Spec Kit Bridge">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:site_name" content="Cynrath">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">${schema}</script>
  <link rel="stylesheet" href="/agent-context-kit/assets/ackit-docs.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="shell header-inner">
    <a class="brand" href="/ackit-spec-kit-bridge/">Bridge Docs</a>
    <nav class="docs-nav" aria-label="Bridge documentation">${navHtml}</nav>
    <a class="button button-small" href="${REPO}" rel="noopener" target="_blank">GitHub</a>
  </div></header>
  <main id="main" class="shell docs-main"><article class="docs-article">${body}</article></main>
  <footer class="site-footer"><div class="shell footer-inner"><p>ACKit Spec Kit Bridge ${esc(version)} · offline-first · deterministic · MIT</p><p>Community integration for ACKit and GitHub Spec Kit — not an official GitHub integration.</p><p><a href="${NPM}">npm</a> · <a href="${REPO}">GitHub</a> · <a href="${ACKIT_REPO}">AgentContextKit</a> · <a href="${SITE}/">Cynrath</a></p></div></footer>
  <script src="/agent-context-kit/assets/ackit-docs.js" defer></script>
</body>
</html>\n`;
}

function pages(version) {
  const install = `npm install --global @cynrath/ackit-spec-kit-bridge@${version}\nackit-speckit --version\nackit-speckit --help`;
  const compatRows = `<tr><td>Node</td><td>&gt;= 22 (tested 24.13.0)</td></tr><tr><td>pnpm</td><td>11.22.0</td></tr><tr><td>ACKit</td><td>&gt;= 0.5.0 (tested 0.5.4)</td></tr><tr><td>Spec Kit (<code>specify</code>)</td><td>&gt;= 1.0.0 (tested 1.0.13)</td></tr><tr><td>Windows</td><td>supported (PowerShell 7+)</td></tr><tr><td>Linux (Ubuntu)</td><td>supported (CI)</td></tr><tr><td>macOS</td><td>best-effort</td></tr>`;
  const workflow = `<pre><code>Spec Kit\nspec → plan → tasks → implementation\n             ↓\n       ackit-speckit sync\n             ↓\nACKit task / refs\n             ↓\nverification bundle\n             ↓\nfresh PASS verdict\n             ↓\ncompletion gate\n             ↓\ncheckpoint / handoff</code></pre>`;
  const links = `<p><a class="button" href="/ackit-spec-kit-bridge/getting-started/">Get Started</a><a class="button" href="/ackit-spec-kit-bridge/cli/">CLI</a><a class="button" href="${REPO}">GitHub</a><a class="button" href="${NPM}">npm</a><a class="button" href="${ACKIT_REPO}">AgentContextKit</a></p>`;
  return [
    {slug:'',title:'ACKit Spec Kit Bridge',description:'GitHub Spec Kit intent → ACKit verification trust. State-bound verification, completion gates, checkpoints and handoffs. Offline-first, deterministic.',body:`<h1>ACKit Spec Kit Bridge ${esc(version)}</h1><p><strong>GitHub Spec Kit intent → ACKit verification trust.</strong> The bridge connects Spec Kit's intent-driven workflow to ACKit's deterministic task, evidence, verification, freshness, completion-gate, checkpoint, and handoff system.</p><p>Community integration for ACKit and GitHub Spec Kit. Not an official GitHub integration.</p>${links}<h2>Install</h2><pre><code>${esc(install)}</code></pre><h2>Workflow</h2>${workflow}<h2>Capabilities</h2><ul><li>Active Spec Kit feature resolution and artifact discovery.</li><li>Idempotent Spec Kit → ACKit task/ref synchronization.</li><li>Canonical read-only lifecycle status (never writes).</li><li>State-bound verification with subject + evidence digests.</li><li>Fresh / stale verdicts; <code>stalePolicy: fail</code> completion gate.</li><li><code>quick</code> / <code>standard</code> / <code>high-risk</code> profiles.</li><li>Deterministic checkpoints and human/agent handoffs.</li><li>Native Spec Kit extension + <code>ackit-verified-sdd</code> workflow.</li><li>Offline-first: no network, no telemetry, no LLM/API dependency.</li></ul><h2>Trust flow</h2><p>A verdict binds <code>subjectDigest + evidenceDigest + profile + result</code>. Editing any verified state flips the verdict to <code>STALE</code> and fails the gate until you re-verify. See <a href="/ackit-spec-kit-bridge/verification/">Verification</a> and <a href="/ackit-spec-kit-bridge/trust-flow/">Trust Flow</a>.</p><h2>Compatibility</h2><table><tbody>${compatRows}</tbody></table>`},
    {slug:'getting-started',title:'Getting Started',description:'Install the bridge and run the first sync, verification and gate.',body:`<h1>Getting Started</h1><p>Requires Node.js 22+, the ACKit CLI, the Spec Kit <code>specify</code> CLI, and Git.</p><h2>Install</h2><pre><code>${esc(install)}</code></pre><h2>First pass</h2><pre><code>git init\nackit init\nspecify init --here --integration copilot\nackit-speckit init\nackit-speckit sync\nackit-speckit status --json\nackit-speckit verify --profile standard\nackit-speckit gate</code></pre><p>Then mutate a spec and watch freshness work: <code>status</code> → <code>STALE</code>, <code>gate</code> → <code>FAIL</code>, re-<code>verify</code> → <code>PASS</code>. Full walkthrough: <a href="/ackit-spec-kit-bridge/trust-flow/">Trust Flow</a>.</p>${links}`},
    {slug:'cli',title:'CLI Reference',description:'ackit-speckit commands, options, exit codes and JSON contracts.',body:`<h1>CLI Reference</h1><p>Every <code>--json</code> payload validates against the deterministic schemas shipped in <code>schemas/</code>.</p><pre><code>ackit-speckit init [--dry-run]\nackit-speckit doctor [--json]\nackit-speckit sync [--dry-run]\nackit-speckit status [--json]\nackit-speckit verify --profile quick|standard|high-risk [--json]\nackit-speckit gate [--json]\nackit-speckit checkpoint [--json]\nackit-speckit handoff [--format markdown|json]\nackit-speckit complete [--json]\nackit-speckit explain [--json]\nackit-speckit version [--json]</code></pre><h2>Exit codes</h2><p>0 success/pass, 1 gate/verification failed or stale, 2 usage/config error, 3 environment/dependency error, 4 security boundary violation, 5 internal error.</p>`},
    {slug:'lifecycle',title:'Lifecycle',description:'Canonical bridge lifecycle states and derivation.',body:`<h1>Lifecycle</h1><p>Derived deterministically; <code>BLOCKED</code> wins over everything except <code>UNINITIALIZED</code>; <code>COMPLETE</code> requires a fresh <code>PASS</code> plus a completed ACKit task.</p><ul><li><code>UNINITIALIZED</code> — ACKit or Spec Kit not initialized.</li><li><code>READY</code> — initialized; no active feature (or spec missing).</li><li><code>SPECIFIED</code> — spec present, plan missing.</li><li><code>PLANNED</code> — plan present, tasks/mapping missing.</li><li><code>TASKED</code> — tasks + mapping present, no verdict yet.</li><li><code>IMPLEMENTING</code> — verdict <code>FAIL</code>.</li><li><code>VERIFIED</code> — fresh <code>PASS</code> verdict.</li><li><code>STALE</code> — subject moved; re-verify.</li><li><code>BLOCKED</code> — explicit block reason.</li><li><code>COMPLETE</code> — task completed with a fresh <code>PASS</code>.</li></ul><p><code>status</code> is read-only and never writes.</p>`},
    {slug:'verification',title:'Verification',description:'State-bound verification bundles, digests and freshness.',body:`<h1>Verification</h1><p>A verdict binds <code>subjectDigest + evidenceDigest + profile + result</code>. The subject digest covers Spec Kit artifacts, the ACKit task/config/policy snapshot, bridge config/profile/version, tool versions, and Git HEAD/diffs. The evidence digest covers redacted per-check outputs.</p><pre><code>ackit-speckit verify --profile standard\nackit-speckit gate</code></pre><h2>Freshness</h2><p><code>status</code> / <code>gate</code> recompute the subject digest: equal → <code>FRESH</code>, differ → <code>STALE</code> (gate fails, exit 1), missing → <code>NOT_VERIFIED</code>. <code>stalePolicy: fail</code> is the only supported policy.</p>`},
    {slug:'profiles',title:'Verification Profiles',description:'quick, standard and high-risk verification profiles.',body:`<h1>Verification Profiles</h1><p>Ranked <code>quick &lt; standard &lt; high-risk</code>; a higher-rank verdict satisfies a lower-rank gate.</p><ul><li><code>quick</code> — bridge + ACKit config validation (fast preflight).</li><li><code>standard</code> — quick plus artifact presence, mapping integrity, ACKit scan/policy surface (default; CI recommended).</li><li><code>high-risk</code> — standard plus extended evidence capture and strict completeness (release-grade changes).</li></ul><pre><code>ackit-speckit verify --profile quick\nackit-speckit verify --profile standard\nackit-speckit verify --profile high-risk</code></pre>`},
    {slug:'spec-kit-extension',title:'Spec Kit Extension',description:'Native Spec Kit extension and workflow package.',body:`<h1>Spec Kit Extension</h1><p>Native extension (<code>spec-kit/extension</code>, id <code>ackit</code>) with 7 commands, each delegating to <code>ackit-speckit</code>:</p><pre><code>specify extension add ackit --dev ./spec-kit/extension\nspecify extension list\nspecify artifact list --json</code></pre><p>Commands: <code>speckit.ackit.sync|status|verify|gate|checkpoint|handoff|complete</code>. Hooks: <code>after_specify</code>, <code>after_plan</code>, <code>after_tasks</code> → sync; <code>before_implement</code> → status preflight; <code>after_implement</code> → verify (never auto-completes). Workflow package <code>spec-kit/workflow/workflow.yml</code> (<code>ackit-verified-sdd</code>) encodes the verified SDD cycle.</p>`},
    {slug:'configuration',title:'Configuration',description:'Bridge config file and state layout.',body:`<h1>Configuration</h1><p>Committed config <code>.ackit-spec-kit/config.yml</code> (schema version 1). No executable code, no shell snippets.</p><pre><code>schemaVersion: 1\nackit:\n  command: ackit\n  minVersion: 0.5.0\nspecKit:\n  command: specify\n  minVersion: 1.0.0\nmapping:\n  mode: active-feature\nverification:\n  defaultProfile: standard\n  stalePolicy: fail\nprofiles:\n  quick: {}\n  standard: {}\n  high-risk: {}\nevidence:\n  redact: true</code></pre><p>State lives under <code>.ackit-spec-kit/</code> (<code>state/</code>, <code>verdicts/</code>, <code>bundles/</code>, <code>checkpoints/</code>, <code>handoffs/</code>, <code>evidence/</code>, <code>mapping.json</code>).</p>`},
    {slug:'security',title:'Security',description:'Offline-first threat model and safety guarantees.',body:`<h1>Security</h1><ul><li><strong>Offline-first:</strong> no network calls, no telemetry, no uploads, no LLM/API dependency in product code.</li><li>Subprocesses use argv arrays with <code>shell: false</code>; never interpolate untrusted values into shell strings.</li><li>Path containment anchors all reads/writes to the repository root.</li><li>Reads and outputs are size-bounded; evidence is redacted at construction.</li><li>State writes are atomic.</li></ul><p>Community integration for ACKit and GitHub Spec Kit — not an official GitHub integration.</p>`},
    {slug:'compatibility',title:'Compatibility',description:'Tested ACKit, Spec Kit, Node and OS ranges.',body:`<h1>Compatibility</h1><p>Bridge versioning is independent from ACKit and Spec Kit versions (semver). <code>doctor</code> reports live compatibility.</p><table><tbody>${compatRows}</tbody></table><p>Bridge ${esc(version)} was tested against ACKit 0.5.4 and Spec Kit specify 1.0.13.</p>`},
    {slug:'architecture',title:'Architecture',description:'Adapters, lifecycle mapping and ownership boundaries.',body:`<h1>Architecture</h1><pre><code>GitHub Spec Kit (intent / specify / plan / tasks / implement / converge)\n    ↓ SpecKitAdapter (feature + artifact discovery)\n    ↓ Bridge lifecycle mapping (feature → ACKit task/ref)\n    ↓ AckitAdapter (task / evidence / verification subprocesses)\n    ↓ ACKit task / evidence / verification\n    ↓ State-bound verdict (subjectDigest + evidenceDigest)\n    ↓ Completion gate (FRESH PASS or refuse)\n    ↓ Checkpoint / handoff (deterministic resume)</code></pre><p><strong>Spec Kit owns</strong> intent, specify, plan, tasks, implement, converge. <strong>ACKit owns</strong> repository context, policy, evidence, verification and completion trust, status, checkpoint, handoff. <strong>The bridge coordinates</strong>; it replaces neither.</p>`},
    {slug:'trust-flow',title:'Trust Flow',description:'Verify, mutate, stale, re-verify: the freshness guarantee.',body:`<h1>Trust Flow</h1><pre><code>ackit-speckit verify --profile standard   # PASS (exit 0)\nackit-speckit gate                        # PASS (exit 0)\n# ... edit specs/001-*/spec.md ...\nackit-speckit status                      # STALE\nackit-speckit gate                        # FAIL (exit 1, VERDICT_STALE)\nackit-speckit verify --profile standard   # PASS again\nackit-speckit checkpoint\nackit-speckit handoff\nackit-speckit complete                    # only after fresh PASS gate</code></pre><p>"Verified" means "verified <em>this exact state</em>". Any subject change — spec, plan, tasks, mapped ACKit task, configs, Git diff — stales the verdict by construction.</p>`},
    {slug:'troubleshooting',title:'Troubleshooting',description:'Diagnose init, sync, verify and gate failures.',body:`<h1>Troubleshooting</h1><ul><li>Run <code>ackit-speckit doctor</code> first: stable check IDs pinpoint missing Node/ACKit/Spec Kit/Git prerequisites.</li><li><code>NOT_VERIFIED</code> gate: run <code>verify</code> before <code>gate</code>.</li><li><code>VERDICT_STALE</code> gate: re-run <code>verify</code>; do not bypass — there is no accept-stale flag by design.</li><li><code>exit 2</code>: usage/config error — validate <code>.ackit-spec-kit/config.yml</code> against <code>schemas/config.schema.json</code>.</li><li><code>exit 3</code>: environment/dependency error — check <code>doctor</code> versions against <a href="/ackit-spec-kit-bridge/compatibility/">Compatibility</a>.</li><li><code>exit 4</code>: security boundary violation — a path escaped the repository root.</li></ul>`},
    {slug:'release',title:'Release Model',description:'Tag-driven OIDC releases with no manual npm approval.',body:`<h1>Release Model</h1><p>Push <code>vX.Y.Z</code> → GitHub Actions → OIDC Trusted Publishing (<code>npm publish --provenance</code>, no tokens) → registry/shasum/fresh-consumer verification → GitHub Release. Normal releases require no manual npm approval. Bridge ${esc(version)} is the current release.</p><p>Upstream sources: <a href="${REPO}">GitHub</a>, <a href="${NPM}">npm</a>, <a href="${ACKIT_REPO}">AgentContextKit</a>, <a href="${SPECKIT_REPO}">GitHub Spec Kit</a>.</p>`}
  ];
}

function llms(version, pageList) {
  const links = pageList.map(p => `- [${p.title}](${SITE}/ackit-spec-kit-bridge/${p.slug ? `${p.slug}/` : ''}): ${p.description}`).join('\n');
  return `# ACKit Spec Kit Bridge\n\n> ACKit Spec Kit Bridge ${version} connects GitHub Spec Kit's intent-driven workflow to ACKit's deterministic task, evidence, verification, freshness, completion-gate, checkpoint, and handoff system. Community integration — not an official GitHub integration.\n\n## Documentation\n\n${links}\n\n## Source and package\n\n- [GitHub](${REPO})\n- [npm](${NPM})\n- [AgentContextKit](${ACKIT_REPO})\n- [GitHub Spec Kit](${SPECKIT_REPO})\n- [Cynrath](${SITE}/)\n`;
}

function readSitemapLocs(raw) {
  if (!raw) return [];
  return [...raw.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
}

async function main() {
  const { source } = parseArgs();
  const version = readVersion(source);
  const readme = await readOptional(path.join(source,'README.md'));
  const changelog = await readOptional(path.join(source,'CHANGELOG.md'));
  if (!readme.includes('Community integration for ACKit and GitHub Spec Kit')) throw new Error('Source README does not look like the bridge README');
  if (!readme.includes('ackit-speckit')) throw new Error('Source README does not describe ackit-speckit');
  if (!changelog.includes(version)) throw new Error(`Source CHANGELOG has no ${version} section`);

  const assetCss = path.join(siteRoot,'agent-context-kit','assets','ackit-docs.css');
  const assetJs = path.join(siteRoot,'agent-context-kit','assets','ackit-docs.js');
  if (!fs.existsSync(assetCss) || !fs.existsSync(assetJs)) throw new Error('Shared docs theme assets are missing under agent-context-kit/assets/.');

  const list = pages(version);
  for (const page of list) {
    const out = path.join(docsRoot, page.slug ? page.slug : '', 'index.html');
    await write(out, template({ ...page, version }));
  }

  await write(path.join(docsRoot,'llms.txt'), llms(version,list));
  await write(path.join(docsRoot,'llms-full.txt'), `# ACKit Spec Kit Bridge ${version}\n\n${readme}\n\n---\n\n# Changelog\n\n${changelog}`);

  // Merge sitemap: keep existing non-bridge URLs verbatim (root, ACKit),
  // replace the bridge set with the freshly generated one. Sorted+unique
  // so output is deterministic regardless of generator order.
  const today = new Date().toISOString().slice(0,10);
  const existing = readSitemapLocs(await readOptional(path.join(siteRoot,'sitemap.xml')));
  const keep = existing.filter(u => u !== `${SITE}/ackit-spec-kit-bridge/` && !u.startsWith(`${SITE}/ackit-spec-kit-bridge/`));
  const bridgeUrls = list.map(p => `${SITE}/ackit-spec-kit-bridge/${p.slug ? `${p.slug}/` : ''}`);
  const urls = [...new Set([...keep, ...bridgeUrls])].sort();
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of urls) sitemap += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
  sitemap += '</urlset>\n';
  await write(path.join(siteRoot,'sitemap.xml'), sitemap);

  const robots = `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-User\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
  await write(path.join(siteRoot,'robots.txt'), robots);

  // Intentionally do not read or write root index.html. Homepage integration is maintained separately.
  console.log(`[sync-bridge] Bridge ${version}: ${list.length} pages + llms + sitemap/robots (root index protected)`);
}

main().catch(err => { console.error(err); process.exit(1); });
