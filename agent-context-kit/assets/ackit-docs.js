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

  const brand = document.querySelector('.brand');
  if (brand && !brand.querySelector('.brand-logo')) {
    const label = brand.textContent.trim();
    brand.textContent = '';

    const mark = document.createElement('span');
    mark.className = 'brand-mark';
    const image = document.createElement('img');
    image.className = 'brand-logo';
    image.src = favicon;
    image.alt = '';
    mark.append(image);

    const text = document.createElement('span');
    text.className = 'brand-label';
    text.textContent = label || 'ACKit';

    brand.append(mark, text);
  }

  const nav = document.querySelector('.docs-nav');
  if (nav && !nav.querySelector('.nav-group')) {
    const links = [...nav.querySelectorAll(':scope > a')];
    const groups = [
      { label: 'Start Here', routes: ['/', '/getting-started/'] },
      { label: 'Core', routes: ['/cli/', '/readiness/', '/optimize/', '/profiles/'] },
      { label: 'Context & Policy', routes: ['/instruction-graph/', '/rule-packs/'] },
      { label: 'Integrations', routes: ['/github-action/', '/mcp/', '/sdk/', '/dashboard/', '/diagnostics/', '/vscode/'] },
      { label: 'Reference', routes: ['/security/', '/benchmarks/', '/migration/'] },
    ];

    const routeOf = (anchor) => {
      const url = new URL(anchor.href, location.href);
      const prefix = '/agent-context-kit';
      let route = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : url.pathname;
      if (!route) route = '/';
      return route;
    };

    const linkByRoute = new Map(links.map((anchor) => [routeOf(anchor), anchor]));
    nav.textContent = '';

    groups.forEach((group, index) => {
      const members = group.routes.map((route) => linkByRoute.get(route)).filter(Boolean);
      if (!members.length) return;

      const details = document.createElement('details');
      details.className = 'nav-group';
      const hasActive = members.some((anchor) => anchor.classList.contains('active'));
      details.open = hasActive || (index === 0 && !links.some((anchor) => anchor.classList.contains('active')));

      const summary = document.createElement('summary');
      summary.innerHTML = `<span>${group.label}</span><i aria-hidden="true"></i>`;
      details.append(summary);

      const body = document.createElement('div');
      body.className = 'nav-group-links';
      members.forEach((anchor) => body.append(anchor));
      details.append(body);
      nav.append(details);
    });
  }

  for (const pre of document.querySelectorAll('.docs-article pre')) {
    if (pre.querySelector('.copy-code')) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = 'copy';
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText ?? pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = 'copied';
        setTimeout(() => { button.textContent = 'copy'; }, 1200);
      } catch {
        button.textContent = 'select';
      }
    });
    pre.append(button);
  }

  const active = document.querySelector('.docs-nav a.active');
  if (active && matchMedia('(max-width: 980px)').matches) {
    active.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }
});
