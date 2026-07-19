// ICore Cross-PWA Navigation Bar v1.0.0
// Self-contained — injects styles + HTML. Include via <script src="nav-bar.js"></script>
// Highlights current PWA. Horizontal scroll on mobile. Zero dependencies.

(function() {
  'use strict';

  const PWAS = [
    { slug: 'initialcore',      host: 'initialcore.net',           icon: '🏛️',  name: 'ICore',       color: '#00bfa5' },
    { slug: 'usr',              host: 'usr.initialcore.net',       icon: '⚡',  name: 'USR',         color: '#e040fb' },
    { slug: 'uwa',              host: 'uwa.initialcore.net',       icon: '🧩',  name: 'UWA',         color: '#00bfa5' },
    { slug: 'ucn',              host: 'ucn.initialcore.net',       icon: '🌐',  name: 'UCN',         color: '#ff6d00' },
    { slug: 'uca',              host: 'uca.initialcore.net',       icon: '🔌',  name: 'UCA',         color: '#d500f9' },
    { slug: 'usds',             host: 'usds.initialcore.net',      icon: '⚖️',  name: 'USDS',        color: '#ff6d00' },
    { slug: 'structure',        host: 'structure.initialcore.net', icon: '🏗️',  name: 'Structure',   color: '#00bfa5' },
    { slug: 'studio',           host: 'studio.initialcore.net',    icon: '🎨',  name: 'Studyo',      color: '#e040fb' },
    { slug: 'verifier',         host: 'verifier.initialcore.net',  icon: '🔷',  name: 'Verifier',    color: '#00e676' },
    { slug: 'workflow-engine',  host: 'wfengine.initialcore.net',  icon: '⚙️',  name: 'Workflow',    color: '#00e676' },
    { slug: 'docs',             host: 'docs.initialcore.net',      icon: '📖',  name: 'Docs',        color: '#6c5ce7' },
    { slug: 'api',              host: 'api.initialcore.net',       icon: '📡',  name: 'API',         color: '#ff6d00' },
  ];

  const currentHost = location.hostname;
  const currentSlug = PWAS.find(p => p.host === currentHost)?.slug || '';

  // ── Inject Styles ──────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #icore-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      height: 44px; display: flex; align-items: center;
      background: #0a0a0fee; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid #1e1e2e;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      padding: 0 12px; gap: 4px;
      overflow-x: auto; overflow-y: hidden;
      scrollbar-width: none;
    }
    #icore-nav::-webkit-scrollbar { display: none; }
    #icore-nav-brand {
      display: flex; align-items: center; gap: 6px;
      font-weight: 700; font-size: 0.75rem; color: #00bfa5;
      text-decoration: none; white-space: nowrap; flex-shrink: 0;
      padding-right: 8px; border-right: 1px solid #1e1e2e; margin-right: 4px;
    }
    #icore-nav-brand:hover { text-decoration: none; }
    #icore-nav-brand span { font-size: 1rem; }
    .icore-nav-link {
      display: flex; align-items: center; gap: 4px;
      padding: 6px 10px; border-radius: 6px;
      font-size: 0.7rem; color: #888; text-decoration: none;
      white-space: nowrap; flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .icore-nav-link:hover { color: #e0e0e0; background: #1e1e2e; text-decoration: none; }
    .icore-nav-link.active { color: #fff; background: #1e1e2e; font-weight: 600; }
    .icore-nav-link .nav-icon { font-size: 0.85rem; }
    body { padding-top: 44px !important; }
    @media (max-width: 600px) {
      #icore-nav { padding: 0 8px; gap: 2px; }
      .icore-nav-link { padding: 5px 7px; font-size: 0.65rem; }
      .icore-nav-link .nav-name-full { display: none; }
      #icore-nav-brand .brand-text { display: none; }
    }
  `;
  document.head.appendChild(style);

  // ── Build Nav HTML ─────────────────────────────────
  const nav = document.createElement('nav');
  nav.id = 'icore-nav';

  let html = `<a id="icore-nav-brand" href="https://initialcore.net"><span>🏛️</span><span class="brand-text">ICore</span></a>`;

  for (const p of PWAS) {
    const isActive = p.slug === currentSlug;
    const href = `https://${p.host}`;
    html += `<a class="icore-nav-link${isActive ? ' active' : ''}" href="${href}" style="${isActive ? `--ac:${p.color}` : ''}">
      <span class="nav-icon">${p.icon}</span>
      <span class="nav-name-full">${p.name}</span>
    </a>`;
  }

  nav.innerHTML = html;

  // Insert at very top of body
  if (document.body.firstChild) {
    document.body.insertBefore(nav, document.body.firstChild);
  } else {
    document.body.appendChild(nav);
  }

  // ── Scroll active link into view ───────────────────
  requestAnimationFrame(() => {
    const active = nav.querySelector('.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
  });
})();
