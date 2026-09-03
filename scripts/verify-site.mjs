#!/usr/bin/env node
/**
 * Site integrity verifier for Cynrath.github.io (TASK-0076).
 *
 * Read-only, no dependencies, no network. Verifies the generated
 * agent-context-kit/ docs without touching design assets:
 *
 * - agent-context-kit/index.html exists
 * - every ACKit nav target resolves to a generated page
 * - every internal ACKit link (href/src) resolves where deterministic
 * - expected CSS/JS theme assets exist and every page references them
 * - sitemap ACKit URLs resolve and cover exactly the generated pages
 * - llms.txt and llms-full.txt exist and are non-empty
 * - no forbidden C0 controls (except TAB/LF/CR) or DEL in scanned text
 * - all generated pages agree on one current software version (derived,
 *   never hard-coded here)
 * - no stale "next release" / "NOT in published" wording
 * - the generator safety contract in scripts/sync-ackit-docs.mjs is intact
 *
 * Exit codes: 0 all checks pass, 1 any failure.
 */

import { promises as fsp } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED_CONTROLS = new Set([0x09, 0x0a, 0x0d]); // TAB LF CR
const VERSION_PATTERN = /(?<![\d.])(\d+\.\d+\.\d+)(?![\d.])/g;
const STALE_PATTERN = /next release|NOT in published/i;
const SITE = "https://cynrath.github.io";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const docsRoot = path.join(siteRoot, "agent-context-kit");

const failures = [];

function fail(message) {
  failures.push(message);
}

function posix(absolute) {
  return path.relative(siteRoot, absolute).split(path.sep).join("/");
}

async function existsFile(absolute) {
  try {
    const stat = await fsp.stat(absolute);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function collectFiles(root, extensions) {
  const out = [];
  const queue = [root];
  while (queue.length > 0) {
    const dir = queue.pop();
    let entries;
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    entries.sort((a, b) => (a.name < b.name ? -1 : 1));
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      if (extensions.has(path.extname(entry.name).toLowerCase())) out.push(absolute);
    }
  }
  return out.sort();
}

function extractRefs(html) {
  const refs = [];
  for (const pattern of [/href="([^"]+)"/g, /src="([^"]+)"/g]) {
    let match = pattern.exec(html);
    while (match !== null) {
      refs.push(match[1]);
      match = pattern.exec(html);
    }
  }
  return refs;
}

function isExternal(ref) {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(ref) || ref.startsWith("//");
}

/** Resolve a site-absolute or page-relative ref to a repo file, or null when not deterministic. */
function resolveRef(ref, pageFile) {
  if (ref === "" || ref.startsWith("#") || ref.startsWith("mailto:") || ref.startsWith("data:")) {
    return null;
  }
  if (isExternal(ref)) return null;
  const bare = ref.split("#")[0].split("?")[0];
  if (bare === "") return null;
  let absolute;
  if (bare.startsWith("/")) {
    absolute = path.join(siteRoot, ...bare.slice(1).split("/"));
  } else {
    absolute = path.resolve(path.dirname(pageFile), ...bare.split("/"));
  }
  const relative = path.relative(siteRoot, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return absolute;
}

async function resolvePage(absolute) {
  if (await existsFile(absolute)) return absolute;
  if (await existsFile(path.join(absolute, "index.html"))) {
    return path.join(absolute, "index.html");
  }
  return null;
}

function scanControls(text) {
  const hits = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    let col = 0;
    for (const char of lines[i]) {
      col += 1;
      const code = char.codePointAt(0);
      if (code === undefined) continue;
      if ((code < 0x20 && !ALLOWED_CONTROLS.has(code)) || code === 0x7f) {
        const hex = code.toString(16).toUpperCase().padStart(4, "0");
        hits.push(`line ${i + 1}, col ${col}: U+${hex}`);
        if (hits.length >= 5) return hits;
      }
    }
  }
  return hits;
}

async function main() {
  // 1. Entry page exists.
  const indexFile = path.join(docsRoot, "index.html");
  if (!(await existsFile(indexFile))) {
    fail("agent-context-kit/index.html is missing");
    return 1;
  }

  const pages = await collectFiles(docsRoot, new Set([".html"]));
  if (pages.length === 0) fail("no generated HTML pages under agent-context-kit/");

  // 2+3. Nav targets + every internal link resolves.
  let navCount = 0;
  for (const page of pages) {
    const html = await fsp.readFile(page, "utf8");
    const isIndex = page === indexFile;
    let pageNav = 0;
    if (isIndex) {
      const nav = html.match(/<nav[\s\S]*?<\/nav>/);
      if (!nav) {
        fail("agent-context-kit/index.html has no <nav>");
      } else {
        for (const ref of extractRefs(nav[0])) {
          if (ref.startsWith("/agent-context-kit/")) pageNav += 1;
        }
      }
      navCount = pageNav;
    }
    for (const ref of extractRefs(html)) {
      const target = resolveRef(ref, page);
      if (target === null) continue;
      const resolved = await resolvePage(target);
      if (resolved === null) {
        fail(`${posix(page)}: broken internal link ${ref}`);
      }
    }
  }
  if (navCount === 0) fail("no /agent-context-kit/ nav targets found in index <nav>");

  // 4+5. Theme assets exist and every page references them.
  const cssFile = path.join(docsRoot, "assets", "ackit-docs.css");
  const jsFile = path.join(docsRoot, "assets", "ackit-docs.js");
  if (!(await existsFile(cssFile))) fail("agent-context-kit/assets/ackit-docs.css is missing");
  if (!(await existsFile(jsFile))) fail("agent-context-kit/assets/ackit-docs.js is missing");
  for (const page of pages) {
    const html = await fsp.readFile(page, "utf8");
    if (!html.includes("assets/ackit-docs.css")) {
      fail(`${posix(page)}: missing ackit-docs.css reference`);
    }
    if (!html.includes("assets/ackit-docs.js")) {
      fail(`${posix(page)}: missing ackit-docs.js reference`);
    }
  }

  // 6. Sitemap ACKit URLs resolve and cover exactly the generated pages.
  const sitemapFile = path.join(siteRoot, "sitemap.xml");
  const sitemapRaw = await fsp.readFile(sitemapFile, "utf8").catch(() => null);
  if (sitemapRaw === null) {
    fail("sitemap.xml is missing");
  } else {
    const locs = [...sitemapRaw.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const ackitLocs = locs.filter((loc) => loc.startsWith(`${SITE}/agent-context-kit`));
    const covered = new Set();
    for (const loc of ackitLocs) {
      const sitePath = new URL(loc).pathname;
      const target = path.join(siteRoot, ...sitePath.slice(1).split("/"));
      const resolved = await resolvePage(target);
      if (resolved === null) {
        fail(`sitemap URL does not resolve: ${loc}`);
      } else {
        covered.add(resolved);
      }
    }
    for (const page of pages) {
      if (!covered.has(page)) fail(`generated page missing from sitemap: ${posix(page)}`);
    }
  }

  // 7. llms.txt files exist and are non-empty.
  for (const name of ["llms.txt", "llms-full.txt"]) {
    const file = path.join(docsRoot, name);
    const stat = await fsp.stat(file).catch(() => null);
    if (stat === null || !stat.isFile()) fail(`agent-context-kit/${name} is missing`);
    else if (stat.size === 0) fail(`agent-context-kit/${name} is empty`);
  }

  // 8. No forbidden controls in scanned text.
  const textFiles = [
    ...(await collectFiles(docsRoot, new Set([".html", ".txt", ".xml", ".css", ".js"]))),
    path.join(siteRoot, "sitemap.xml"),
    path.join(siteRoot, "robots.txt"),
  ];
  for (const file of [...new Set(textFiles)].sort()) {
    if (!(await existsFile(file))) continue;
    const text = await fsp.readFile(file, "utf8");
    const hits = scanControls(text);
    if (hits.length > 0) fail(`${posix(file)}: forbidden control (${hits.join("; ")})`);
  }

  // 9. One consistent version across generated pages (derived, not pinned).
  const foundVersions = new Map();
  for (const page of pages) {
    const html = await fsp.readFile(page, "utf8");
    for (const match of html.matchAll(VERSION_PATTERN)) {
      const version = match[1];
      if (!foundVersions.has(version)) foundVersions.set(version, []);
      foundVersions.get(version).push(posix(page));
    }
  }
  if (foundVersions.size !== 1) {
    const summary = [...foundVersions.entries()]
      .map(([version, files]) => `${version} (${files.length} pages)`)
      .join(", ");
    fail(`expected one consistent version, found: ${summary || "none"}`);
  }

  // 10. No stale pre-release wording.
  for (const page of pages) {
    const html = await fsp.readFile(page, "utf8");
    if (STALE_PATTERN.test(html)) fail(`${posix(page)}: stale pre-release wording`);
  }

  // 11. Generator safety contract intact.
  const syncFile = path.join(siteRoot, "scripts", "sync-ackit-docs.mjs");
  const syncRaw = await fsp.readFile(syncFile, "utf8").catch(() => null);
  if (syncRaw === null) {
    fail("scripts/sync-ackit-docs.mjs is missing");
  } else {
    for (const marker of [
      "ROOT_WRITE_ALLOWLIST",
      "refused write outside docs sandbox",
      "refused write to hand-maintained docs theme asset",
      "sitemap.xml",
      "robots.txt",
    ]) {
      if (!syncRaw.includes(marker)) fail(`generator safety contract marker missing: ${marker}`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) process.stdout.write(`FAIL ${failure}\n`);
    process.stdout.write(`docs-integrity: ${failures.length} failure(s)\n`);
    return 1;
  }
  const version = [...foundVersions.keys()][0];
  process.stdout.write(
    `docs-integrity: PASS (${pages.length} pages, version ${version}, nav ${navCount} targets)\n`,
  );
  return 0;
}

const invokedAsScript =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedAsScript) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(`verify-site failed: ${(error && error.message) || error}\n`);
      process.exitCode = 1;
    },
  );
}
