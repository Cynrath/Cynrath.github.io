// ACKit docs — vanilla, no CDN, no analytics.
document.addEventListener('DOMContentLoaded', () => {
  for (const pre of document.querySelectorAll('.docs-article pre')) {
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
  document.querySelector('.docs-nav a.active')?.scrollIntoView({inline:'center',block:'nearest'});
});
