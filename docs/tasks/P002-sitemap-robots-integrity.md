# P002 — Sitemap and robots crawl-discovery integrity

## Goal
Keep sitemap.xml and robots.txt consistent with published GitHub Pages URLs and prevent misleading per-page modification timestamps.

## Diagnosis (2026-10-26)
- Search Console showed "Site haritası okunamadı" with 0 discovered pages.
- Repository main contained a valid-looking XML sitemap with 49 URL entries, matching all 49 published index.html paths in the Git tree.
- robots.txt advertised the correct HTTPS sitemap and allowed crawling.
- Both offline documentation generators rewrote every sitemap `lastmod` to the generator execution date, regardless of which pages changed. This is not a verifiable per-page modification date.
- Search Console's fetch failure cannot be conclusively reproduced from the repository; public HTTP responses and Google's fetch diagnostics must be checked separately.

## Scope
- Preserve all 49 canonical URLs and the existing crawler access policy.
- Omit optional `lastmod` unless a future generator can derive an accurate per-URL significant-content modification date.
- Update both offline docs generators so they do not recreate inaccurate `lastmod`.
- Extend the existing dependency-free `scripts/verify-site.mjs` CI verifier to check sitemap XML envelope/entry structure, complete and unique canonical coverage, HTML canonical/noindex consistency, and the robots sitemap declaration.

## Acceptance criteria and verification
- Exactly one sitemap URL per public HTML page (root + both documentation trees).
- No stale URLs, duplicates, malformed sitemap entries or cross-origin URLs.
- robots.txt continues to allow general crawling and advertises exactly one canonical sitemap.
- `node scripts/verify-site.mjs` and `git diff --check` pass on the PR head.
- The required GitHub Actions `docs-integrity` check passes before squash merge to protected `main`.
- Verify PR merged and `main` contains the change. Preserve local uncommitted work.

## Evidence / operational follow-up
- Baseline repository tree inspection: 49 public HTML pages and 49 matching sitemap locations, with 49 entries dated 2026-10-02.
- Root cause of the Search Console fetch failure remains unconfirmed until the production endpoint responds with HTTP 200/XML from an external network and Google Search Console's live fetch diagnosis is available.
- After deployment, confirm `https://cynrath.github.io/sitemap.xml` returns HTTP 200 with XML, then resubmit `sitemap.xml` to Google Search Console and verify the report updates.
- Google guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google troubleshooting: https://support.google.com/webmasters/answer/7451001
