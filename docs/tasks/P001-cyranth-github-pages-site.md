# P001 - Cyranth GitHub Pages Landing Page

## Purpose
Build a polished, static GitHub Pages landing page for the public developer persona "Cyranth" at `https://cynrath.github.io/`.

## Scope
- Create a plain static site with no build step.
- Add semantic HTML, responsive CSS, minimal JavaScript, SVG assets, robots.txt, sitemap.xml, README, and gitignore.
- Keep all public content centered on "Cyranth" and safe public repositories only.

## Affected Files
- `index.html`
- `assets/css/styles.css`
- `assets/js/main.js`
- `assets/svg/mark.svg`
- `assets/svg/og-image.svg`
- `robots.txt`
- `sitemap.xml`
- `README.md`
- `.gitignore`
- `docs/tasks/P001-cyranth-github-pages-site.md`

## DB Impact
None. The site is static and has no database, migrations, or data storage.

## Admin Impact
None. There is no admin area or CMS.

## Permission Impact
None. There is no authentication, authorization, or role system.

## SEO / i18n Impact
- Add English page metadata, canonical URL, Open Graph tags, Twitter card tags, robots meta, sitemap, and robots.txt.
- Use `lang="en"` and one `h1`.
- No localization system is added.

## Audit / Security Impact
- No secrets, real/legal names, phone numbers, personal emails, private repositories, client names, or fake metrics should be exposed.
- External dependencies, CDNs, external fonts, and package managers are avoided.
- JavaScript is progressive enhancement only; the page remains usable without it.

## Acceptance Criteria
- Required files and folders exist.
- Site works directly from GitHub Pages root.
- Header navigation and mobile navigation work accessibly.
- Theme toggle works and respects stored preference.
- Page remains readable without JavaScript.
- CSS/JS/SVG paths are relative and valid.
- Dark and light themes are readable.
- Motion respects `prefers-reduced-motion`.
- SEO metadata, robots.txt, and sitemap.xml are present and correct.
- Public content follows the privacy rules.

## Tests
- Inspect file paths and references.
- Run a local static HTTP server with `py -m http.server 8080`.
- Open the page in a browser and test desktop/mobile layout, mobile navigation, theme toggle, anchors, and links.
- Run `git diff --stat`.
- Run `git status`.

## Risks
- The git remote currently appears as `Cynrath/cyranth.github.io.git`, while the requested repository name is `Cynrath/Cynrath.github.io`; GitHub Pages behavior may depend on the actual configured repository.
- SVG Open Graph images are accepted by some consumers but PNG/JPG has broader social preview compatibility.

## Rollback
Remove the files added for this task or revert the eventual commit that contains them.
