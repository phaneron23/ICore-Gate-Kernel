// ICore Studyo — Main Application Controller v1.1.0
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

    // Setup install
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
    // Capture browser install prompt when available
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      const btn = document.getElementById('install-btn');
      if (btn) {
        btn.textContent = '✅ Installed';
        setTimeout(() => { btn.style.display = 'none'; }, 2000);
      }
    });
  },

  async installPWA() {
    // If browser provides the native install prompt, use it
    if (this.deferredInstallPrompt) {
      try {
        this.deferredInstallPrompt.prompt();
        const { outcome } = await this.deferredInstallPrompt.userChoice;
        this.deferredInstallPrompt = null;
        return;
      } catch (e) {
        // Prompt failed, fall through to manual guide
      }
    }

    // Always show manual install guide
    this.showInstallGuide();
  },

  showInstallGuide() {
    // Detect browser
    const ua = navigator.userAgent;
    const isBrave = ua.includes('Brave');
    const isFirefox = ua.includes('Firefox');
    const isChrome = ua.includes('Chrome') && !isBrave;
    
    let steps = '';
    if (isBrave) {
      steps = `
        <ol>
          <li>Tap the <strong>⋮ menu</strong> (top right)</li>
          <li>Tap <strong>"Add to Home screen"</strong></li>
          <li>Tap <strong>"Install"</strong> or <strong>"Add"</strong></li>
          <li>Studyo will appear on your home screen</li>
        </ol>
        <p style="margin-top:12px; color:var(--text-dim); font-size:0.8rem;">
          ⚠️ Note: Brave Shields "Block Scripts" must be OFF for the app to work.
        </p>
      `;
    } else if (isFirefox) {
      steps = `
        <ol>
          <li>Tap the <strong>⋮ menu</strong> (top right)</li>
          <li>Tap <strong>"Install"</strong> or <strong>"Add to Home screen"</strong></li>
          <li>Confirm the installation</li>
        </ol>
      `;
    } else if (isChrome) {
      steps = `
        <ol>
          <li>Tap the <strong>⋮ menu</strong> (top right)</li>
          <li>Tap <strong>"Add to Home screen"</strong></li>
          <li>Tap <strong>"Install"</strong></li>
        </ol>
      `;
    } else {
      steps = `
        <ol>
          <li>Open your browser menu</li>
          <li>Look for <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong></li>
          <li>Follow the prompts</li>
        </ol>
      `;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'install-overlay';
    overlay.style.cssText = `
      position:fixed; top:0; left:0; right:0; bottom:0;
      background:rgba(0,0,0,0.85); z-index:999;
      display:flex; align-items:center; justify-content:center;
      padding:20px;
    `;
    overlay.innerHTML = `
      <div style="
        background:var(--bg-card); border:1px solid var(--border);
        border-radius:12px; padding:24px; max-width:400px; width:100%;
      ">
        <h3 style="margin:0 0 16px; color:var(--text);">📱 Install Studyo</h3>
        <p style="color:var(--text-secondary); margin:0 0 16px; font-size:0.9rem;">
          Add Studyo to your home screen for the full app experience:
        </p>
        <div style="color:var(--text); font-size:0.9rem; line-height:1.8;">
          ${steps}
        </div>
        <button onclick="document.getElementById('install-overlay').remove()" style="
          margin-top:20px; width:100%; padding:12px;
          background:var(--accent); color:var(--bg-primary);
          border:none; border-radius:8px; font-weight:600;
          font-family:var(--font-system); cursor:pointer;
        ">Got it</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
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
