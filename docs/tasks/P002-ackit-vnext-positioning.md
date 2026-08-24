# P002 - ACKit vNext Positioning Refresh

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

## Validation
- Review all edited HTML for stale `.NET`-specific ACKit claims.
- Verify internal anchors and relative asset paths remain unchanged and valid.
- Verify external links point only to public GitHub resources.
- Verify HTML still has one `h1`, semantic sections, canonical metadata, Open Graph metadata, and Twitter metadata.
- Run or reproduce equivalent checks for malformed placeholders, `TODO`, `TBD`, and fake metrics before merging.

## Rollback
Revert the focused commit(s) that implement P002.
