---
id: "TASK-0001"
title: "Refresh published ACKit and bridge references and generated documentation"
status: active
schemaVersion: 2
dependencies:
  []
createdAt: "2026-11-19"
completedAt: null
---


## Purpose

Align current public pages and discovery data with verified ACKit 0.5.5 and
the user-authorized bridge 0.1.2 patch, using canonical product sources.

## Scope

- Refresh both offline product generators and regenerate their tracked docs.
- Align root HTML/install examples/JSON-LD/fallback labels and llms discovery.
- Read bridge compatibility from its canonical maintained source instead of
  a duplicated hardcoded 0.5.4/1.0.13 matrix; correct current SDK/Action/MCP copy.
- Extend existing integrity checks to catch current root/discovery version drift;
  preserve generator sandbox/theme protection and all 49 canonical URLs.

## Out of scope

- Redesign, CSS/interactive feature work, new hosting/accounts, manual deployment,
  historical changelog rewrite, source product/runtime changes in this repo.

## Affected files

- scripts/sync-ackit-docs.mjs, scripts/sync-ackit-spec-kit-bridge-docs.mjs,
  scripts/verify-site.mjs; generated agent-context-kit/ and bridge docs.
- index.html, llms.txt, llms-full.txt, README.md and task evidence.

## Required tests

- Node syntax/integrity checks; generation idempotence and sandbox preservation;
  negative stale-version probes; ACKit task/doctor/scan and diff checks.
- Required exact-head docs-integrity before protected linear merge; final main
  remote identity and actual public page/discovery/version verification.

## Acceptance criteria

- [~] Current public claims/install pins agree with verified published versions.
- [x] Generated pages/compatibility and root discovery/JSON-LD are consistent;
  historical release data and design assets remain correct.
- [x] Integrity, negative drift, idempotence/safety, ACKit and diff gates pass.
- [ ] Protected PR CI, main integration and public read-back are verified;
  evidence accurately records the resulting state.

## Test steps

1. Commit the complete plan before implementation. Preserve P001/P002 history;
   native ACKit allocated this new record because no existing task covers it.
2. Update owning generators/root sources; use published product source snapshots.
3. Run both generators; verify all pages/links/sitemap/robots/version metadata,
   run a second generation to prove idempotence, and test stale drift rejection.
4. Publish the repository changes only after bridge TASK-0015 verifies npm 0.1.2.
5. Use the existing required-PR/linear-history flow; verify main and public HTTP.

## Dependencies and authorization

Cross-repository dependency: bridge TASK-0015's actual 0.1.2 publication. ACKit
0.5.5 is already published. The user authorizes main updates, commits and pushes.
Primary checkout stays on main; a temporary detached PR transport is needed by
the existing branch protection. Existing configured Pages automation follows
the authorized merge; no manual deployment or account-setting action is made.

## Security and compatibility

Static/offline generators only; no new network/telemetry/runtime dependency,
credentials, privacy data or permissions. Keep semantic HTML and current theme.
Only reviewed task evidence/generated documentation is tracked, not local scans.

## Risks

- Blind replacement would corrupt historical versions/minimum compatibility;
  inspect current claims separately from history and regenerate derived pages.
- Generator order must preserve both product sitemap sets and protected assets.
- Public propagation can lag main; record HTTP evidence instead of assuming it.

## Rollback plan

Forward corrective PR; never rewrite history or overwrite unrelated work.
Canonical product sources remain unchanged by this website task.

## Completion notes

Implementation is prepared locally; no website push advertises bridge 0.1.2
before TASK-0015 proves its actual publication. Hosted CI/main/public read-back
remain to be performed before this task is completed.

- Canonical generators produced 34 ACKit pages (0.5.5) and 14 bridge pages
  (prepared 0.1.2); all 49 URLs, nav/internal links, robots/sitemap checks PASS.
- Bridge compatibility now reads its maintained source table. SDK realpath,
  MCP startup-boundary/ci and source-built Action descriptions match ACKit docs.
  Root HTML/install/JSON-LD/fallback and curated discovery versions agree.
- Both generators run a second time with byte-identical tracked contents;
  root/theme assets are unchanged. No CSS/client interaction change.
- The old verifier accepted a deliberately stale root llms-full current-version
  field (exit 0); the new existing integrity gate rejects it (exit 1), with the
  positive fixture still exit 0. Historical changelog versions remain allowed.
- Node syntax, ACKit doctor/task doctor/scan CI (93 >= 80), diff checks PASS.
  .ackit runtime state is ignored, not tracked; no initialization or hooks ran.

### Initial planning checkpoint

Plan before implementation. Both main checkouts were clean. Site baseline uses
ACKit 0.5.4 and bridge 0.1.1. ACKit doctor/task doctor pass with zero skills;
no new initialization, hook, instruction generation or policy suppression ran.
Bridge publication remains a dependency, not a claimed completed action.
