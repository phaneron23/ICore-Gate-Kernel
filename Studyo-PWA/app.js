// ICore Studyo — Main Application Controller v1.0.0
// Brave-first, Offline-first, Sovereign

const App = {
  currentScreen: 'home',
  deferredInstallPrompt: null,

  init() {
    // Initialize database
    DB.init().catch(e => console.warn('IndexedDB unavailable:', e));

    // Register service worker
    this.registerSW();

    // Setup navigation
    this.setupNav();

    // Setup install prompt
    this.setupInstall();

    // Setup offline detection
    this.setupOffline();

    // Render initial screen
    this.navigate('home');
  },

  // Service Worker Registration
  async registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        console.log('SW registered:', reg.scope);

        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'SW_UPDATED') {
            this.showUpdateBanner(event.data.version);
          }
        });

        if (reg.waiting) {
          this.showUpdateBanner('new');
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateBanner('new');
            }
          });
        });
      } catch (e) {
        console.warn('SW registration failed:', e);
      }
    }
  },

  showUpdateBanner(version) {
    const existing = document.getElementById('update-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 999;
      background: var(--accent); color: var(--bg-primary);
      padding: 12px 16px; text-align: center; font-weight: 600;
      font-family: var(--font-system); font-size: 0.85rem;
      cursor: pointer;
    `;
    banner.textContent = `📱 Update available (${version || 'new'}). Tap to reload.`;
    banner.onclick = () => window.location.reload();
    document.body.prepend(banner);
  },

  // Navigation
  setupNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.screen);
      });
    });
  },

  async navigate(screen) {
    this.currentScreen = screen;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screen);
    });

    // Render screen
    const container = document.getElementById('screen');
    switch (screen) {
      case 'home':
        container.innerHTML = HomeScreen.render();
        break;
      case 'verify':
        container.innerHTML = VerifyScreen.render();
        break;
      case 'explore':
        container.innerHTML = ExploreScreen.render();
        break;
      case 'history':
        container.innerHTML = await HistoryScreen.render();
        break;
      case 'about':
        container.innerHTML = AboutScreen.render();
        break;
      default:
        container.innerHTML = HomeScreen.render();
    }

    window.scrollTo(0, 0);
  },

  // PWA Install
  setupInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const btn = document.getElementById('install-btn');
      if (btn) btn.style.display = 'block';
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      const btn = document.getElementById('install-btn');
      if (btn) btn.style.display = 'none';
    });
  },

  async installPWA() {
    if (!this.deferredInstallPrompt) return;
    this.deferredInstallPrompt.prompt();
    const { outcome } = await this.deferredInstallPrompt.userChoice;
    this.deferredInstallPrompt = null;
  },

  // Offline Detection
  setupOffline() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;

    const updateStatus = () => {
      banner.style.display = navigator.onLine ? 'none' : 'block';
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }
};

// Initialize — handle both early and late DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
