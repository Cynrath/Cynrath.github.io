// ACKit docs — vanilla, no CDN, no analytics.
document.addEventListener('DOMContentLoaded', () => {
  const favicon = 'data:image/png;base64,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';

  if (!document.querySelector('link[rel~="icon"]')) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = favicon;
    document.head.append(link);
  }

  if (!document.getElementById('ackit-mobile-drawer-runtime')) {
    const style = document.createElement('style');
    style.id = 'ackit-mobile-drawer-runtime';
    style.textContent = `
.drawer-head{display:none}
@media(max-width:980px){
  body{padding-top:68px}
  .site-header{position:fixed!important;inset:0 0 auto 0!important;width:100%!important;height:68px!important;z-index:60!important;border-right:0!important;border-bottom:1px solid var(--line)!important;overflow:visible!important;background:rgba(5,13,24,.97)!important;backdrop-filter:blur(18px)}
  .site-header .shell{width:min(1120px,calc(100% - 28px))!important;margin:auto!important}
  .header-inner{min-height:68px!important;height:68px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:10px!important;padding:0!important}
  .brand{padding:0!important;border:0!important;flex:1 1 auto!important;font-size:17px!important}.brand-mark{width:34px!important;height:34px!important}.brand-logo{width:25px!important;height:25px!important}.brand::after{display:none!important}
  .header-inner>.button{margin:0!important;width:auto!important;min-height:38px!important;padding:0 11px!important;font-size:11px!important}
  .docs-menu-toggle{display:grid!important;width:42px!important;height:42px!important;flex:0 0 42px!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:10px!important;background:rgba(255,255,255,.035)!important;place-content:center!important;gap:4px!important;cursor:pointer!important;z-index:61!important}
  .docs-menu-toggle span{display:block!important;width:17px!important;height:1.5px!important;border-radius:2px!important;background:#dbe8f7!important;transition:transform .32s var(--ease),opacity .2s!important}
  .docs-menu-toggle[aria-expanded="true"] span:nth-child(1){transform:translateY(5.5px) rotate(45deg)}.docs-menu-toggle[aria-expanded="true"] span:nth-child(2){opacity:0}.docs-menu-toggle[aria-expanded="true"] span:nth-child(3){transform:translateY(-5.5px) rotate(-45deg)}
  body>.docs-nav{position:fixed!important;z-index:101!important;left:0!important;top:0!important;bottom:0!important;width:min(88vw,360px)!important;height:100dvh!important;display:flex!important;flex-direction:column!important;gap:7px!important;padding:0 16px 24px!important;margin:0!important;background:linear-gradient(180deg,#071426,#050b14 78%)!important;border:0!important;border-right:1px solid rgba(255,255,255,.10)!important;box-shadow:28px 0 70px rgba(0,0,0,.42)!important;overflow-y:auto!important;overscroll-behavior:contain!important;transform:translate3d(-104%,0,0)!important;visibility:hidden!important;pointer-events:none!important;transition:transform .42s var(--ease),visibility .42s!important}
  body.docs-menu-open>.docs-nav{transform:translate3d(0,0,0)!important;visibility:visible!important;pointer-events:auto!important}
  .drawer-head{position:sticky;top:0;z-index:2;display:flex!important;align-items:center;gap:11px;min-height:68px;margin:0 -16px 7px;padding:0 14px 0 16px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(7,20,38,.98);backdrop-filter:blur(18px)}
  .drawer-mark{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:9px;border:1px solid rgba(127,184,255,.22);background:linear-gradient(135deg,rgba(127,184,255,.13),rgba(169,140,255,.09))}.drawer-mark img{display:block;width:25px;height:25px;object-fit:contain}.drawer-title{min-width:0;flex:1;color:#f2f7ff;font-size:17px;font-weight:760;letter-spacing:-.025em}.drawer-close{display:grid;place-items:center;width:40px;height:40px;flex:0 0 40px;border:1px solid rgba(255,255,255,.11);border-radius:10px;background:rgba(255,255,255,.035);color:#dce8f7;font-size:27px;line-height:1;cursor:pointer}
  body>.docs-nav .nav-top-link,body>.docs-nav a{font-size:17px!important;min-height:44px!important}.docs-menu-backdrop{display:block!important;position:fixed!important;z-index:100!important;inset:0!important;border:0!important;padding:0!important;background:rgba(0,4,10,.62)!important;backdrop-filter:blur(3px)!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;transition:opacity .3s ease,visibility .3s!important}body.docs-menu-open>.docs-menu-backdrop{opacity:1!important;visibility:visible!important;pointer-events:auto!important}body.docs-menu-open{overflow:hidden!important;touch-action:none}.docs-main.shell{width:min(1120px,calc(100% - 40px))!important;margin:auto!important;padding:54px 0 72px!important}.site-footer{margin-left:0!important}
}
@media(max-width:620px){body>.docs-nav{width:min(91vw,344px)!important}.header-inner>.button{display:none!important}.docs-menu-toggle{margin-left:auto!important}}
`;
    document.head.append(style);
  }

  const brand = document.querySelector('.brand');
  if (brand && !brand.querySelector('.brand-logo')) {
    const label = brand.textContent.trim();
    brand.textContent = '';
    const mark = document.createElement('span'); mark.className = 'brand-mark';
    const image = document.createElement('img'); image.className = 'brand-logo'; image.src = favicon; image.alt = ''; mark.append(image);
    const text = document.createElement('span'); text.className = 'brand-label'; text.textContent = label || 'ACKit';
    brand.append(mark, text);
  }

  const nav = document.querySelector('.docs-nav');
  const routeOf = (anchor) => {
    const url = new URL(anchor.href, location.href);
    const prefix = '/agent-context-kit';
    let route = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : url.pathname;
    return route || '/';
  };

  if (nav && !nav.querySelector('.nav-group')) {
    const links = [...nav.querySelectorAll(':scope > a')];
    const topRoutes = new Set(['/', '/getting-started/']);
    const categories = [
      { label: 'Core', test: (route) => /^\/(cli|readiness|optimize|profiles)\/$/.test(route) },
      { label: 'Context & Policy', test: (route) => /^\/(instruction-graph|rule-packs)\/$/.test(route) || /(context|instruction|policy|rule)/.test(route) },
      { label: 'Integrations', test: (route) => /^\/(github-action|mcp|sdk|dashboard|diagnostics|vscode)\/$/.test(route) || /(github|mcp|sdk|dashboard|diagnostic|vscode|editor|integration)/.test(route) },
      { label: 'Reference', test: () => true },
    ];

    const topLinks = links.filter((anchor) => topRoutes.has(routeOf(anchor)));
    const groupedLinks = links.filter((anchor) => !topRoutes.has(routeOf(anchor)));
    nav.textContent = '';
    topLinks.forEach((anchor) => { anchor.classList.add('nav-top-link'); nav.append(anchor); });

    const buckets = categories.map((category) => ({ ...category, links: [] }));
    groupedLinks.forEach((anchor) => {
      const route = routeOf(anchor);
      (buckets.find((category) => category.test(route)) ?? buckets.at(-1)).links.push(anchor);
    });

    buckets.forEach((group) => {
      if (!group.links.length) return;
      const details = document.createElement('details'); details.className = 'nav-group';
      details.open = group.links.some((anchor) => anchor.classList.contains('active'));
      const summary = document.createElement('summary'); summary.innerHTML = `<span>${group.label}</span><i aria-hidden="true"></i>`;
      const body = document.createElement('div'); body.className = 'nav-group-links'; group.links.forEach((anchor) => body.append(anchor));
      details.append(summary, body); nav.append(details);
    });

    const groups = [...nav.querySelectorAll('.nav-group')];
    let accordionLock = false;
    groups.forEach((details) => details.addEventListener('toggle', () => {
      if (accordionLock || !details.open) return;
      accordionLock = true;
      groups.forEach((other) => { if (other !== details && other.open) other.open = false; });
      queueMicrotask(() => { accordionLock = false; });
    }));
  }

  const headerInner = document.querySelector('.header-inner');
  if (headerInner && nav && !document.querySelector('.docs-menu-toggle')) {
    const navPlaceholder = document.createComment('ackit-docs-nav-home');
    nav.parentNode.insertBefore(navPlaceholder, nav);

    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'docs-menu-toggle'; toggle.setAttribute('aria-label', 'Open documentation menu'); toggle.setAttribute('aria-controls', 'ackit-docs-nav'); toggle.setAttribute('aria-expanded', 'false'); toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.id = 'ackit-docs-nav';

    const drawerHead = document.createElement('div');
    drawerHead.className = 'drawer-head';
    drawerHead.innerHTML = `<span class="drawer-mark"><img src="${favicon}" alt=""></span><span class="drawer-title">ACKit Docs</span><button class="drawer-close" type="button" aria-label="Close documentation menu">×</button>`;
    nav.prepend(drawerHead);

    const backdrop = document.createElement('button'); backdrop.type = 'button'; backdrop.className = 'docs-menu-backdrop'; backdrop.setAttribute('aria-label', 'Close documentation menu'); document.body.append(backdrop);
    const githubButton = headerInner.querySelector(':scope > .button'); headerInner.insertBefore(toggle, githubButton ?? null);

    const setMenu = (open) => {
      document.body.classList.toggle('docs-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close documentation menu' : 'Open documentation menu');
    };

    const media = matchMedia('(max-width: 980px)');
    const syncNavPlacement = () => {
      if (media.matches) {
        if (nav.parentNode !== document.body) document.body.append(nav);
      } else {
        setMenu(false);
        if (nav.parentNode === document.body) navPlaceholder.parentNode.insertBefore(nav, navPlaceholder.nextSibling);
      }
    };

    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('docs-menu-open')));
    backdrop.addEventListener('click', () => setMenu(false));
    drawerHead.querySelector('.drawer-close').addEventListener('click', () => setMenu(false));
    nav.addEventListener('click', (event) => { if (event.target.closest('a') && media.matches) setMenu(false); });
    addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
    media.addEventListener('change', syncNavPlacement);
    syncNavPlacement();
  }

  for (const pre of document.querySelectorAll('.docs-article pre')) {
    if (pre.querySelector('.copy-code')) continue;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-code'; button.textContent = 'copy';
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      try { await navigator.clipboard.writeText(code); button.textContent = 'copied'; setTimeout(() => { button.textContent = 'copy'; }, 1200); }
      catch { button.textContent = 'select'; }
    });
    pre.append(button);
  }
});
