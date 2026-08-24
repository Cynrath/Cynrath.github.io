# P002 - ACKit vNext Positioning Refresh

## Status
Completed on working branch `docs/ackit-vnext-site`; pending review/merge.

## Purpose
Update the Cyranth public site to reflect the real AgentContextKit vNext rebuild on `rebuild/ackit-vnext` without implying that the npm package has already been published.

## Source of Truth
- Repository: `Cynrath/agent-context-kit`
- Active rebuild branch: `rebuild/ackit-vnext`
- Package manifest: `@cynrath/agent-context-kit` version `0.1.0`
- Runtime: Node.js >= 22
- Development package manager: pnpm 11
- Distribution status: unpublished; npm publishing, release, and tags require a separate explicit authorization

## Scope
- Refresh `index.html` positioning, ACKit feature summary, commands, technology labels, and project status.
- Refresh the repository `README.md` so the site source describes the current ACKit-focused public positioning.
- Preserve the existing static HTML/CSS/JS architecture and visual design.
- Do not add a framework, build pipeline, package manager, external dependency, analytics, or network call.

## Required Public Claims
- ACKit turns repositories into agent-ready repositories using deterministic local analysis.
- vNext is a TypeScript/Node.js rebuild, not the frozen .NET/NuGet implementation.
- Current vNext capabilities include instruction graph analysis, Agent Skills validation/install/sync, security and hygiene scanning, context budgeting, docs-first tasks, policy-as-code, monorepo awareness, reports, and a read-only MCP server.
- The package name is `@cynrath/agent-context-kit` and the current development version is `0.1.0`.
- The npm package is not published yet.

## Boundaries
- Do not claim npm availability, download counts, release dates, adoption metrics, or benchmark results.
- Do not publish packages, create or move tags, create releases, dispatch workflows, force-push, or rewrite history.
- Do not expose private identity, client, infrastructure, or repository information.
- Do not alter the public ACKit repository itself.

## Acceptance Criteria
- No stale description presents ACKit primarily as a .NET tool.
- The site clearly identifies Node.js, TypeScript, pnpm, MCP, and the vNext rebuild.
- The site clearly says the npm package is currently unpublished.
- ACKit commands shown on the page exist in the vNext README contract.
- Existing navigation, responsive structure, theme support, assets, and public links remain intact.
- No placeholder text remains.

## Validation Evidence
- `main...docs/ackit-vnext-site`: branch is 4 commits ahead and 0 behind after task closure.
- Changed paths are limited to `index.html`, `README.md`, and this task document.
- `index.html` retains one `h1`, canonical metadata, Open Graph metadata, Twitter metadata, existing relative CSS/JS/SVG paths, the same main navigation anchors, and the existing theme/mobile-navigation hooks.
- Public ACKit claims were sourced from `rebuild/ackit-vnext/README.md` and `package.json`: TypeScript/Node.js, Node >=22, pnpm 11, `@cynrath/agent-context-kit` 0.1.0, offline-first/deterministic posture, instruction graph, Agent Skills, scanning, context packs, task workflow, policy-as-code, monorepo support, reports, and read-only MCP.
- The page explicitly states that npm publication has not happened.
- No release, npm publish, tag, workflow dispatch, force-push, history rewrite, or ACKit repository mutation was performed.

## Rollback
Revert the focused commit(s) that implement P002.
