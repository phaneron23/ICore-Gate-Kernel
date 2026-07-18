// ICore Verifier — Main Application Controller v1.0.0
// Manages 3 screens: Home (input), Results (output), History (past verifications).
// IndexedDB storage for history. Offline-first, sovereign.

const App = {
  currentScreen: 'home',
  deferredInstallPrompt: null,
  lastVerifyResult: null,

  init() {
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

  // ═══ Service Worker ═══
  async registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('./service-worker.js');
        console.log('Verifier SW registered:', reg.scope);

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

  // ═══ Navigation ═══
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
        HomeScreen.bind();
        break;
      case 'results':
        container.innerHTML = ResultsScreen.render(this.lastVerifyResult);
        ResultsScreen.bind(this.lastVerifyResult);
        break;
      case 'history':
        container.innerHTML = await HistoryScreen.render();
        HistoryScreen.bind();
        break;
      default:
        container.innerHTML = HomeScreen.render();
        HomeScreen.bind();
    }

    window.scrollTo(0, 0);
  },

  // ═══ PWA Install ═══
  setupInstall() {
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
    if (this.deferredInstallPrompt) {
      try {
        this.deferredInstallPrompt.prompt();
        const { outcome } = await this.deferredInstallPrompt.userChoice;
        this.deferredInstallPrompt = null;
        return;
      } catch (e) {
        // Fall through
      }
    }
    this.showInstallGuide();
  },

  showInstallGuide() {
    const overlay = document.createElement('div');
    overlay.id = 'install-overlay';
    overlay.style.cssText = `
      position:fixed; top:0; left:0; right:0; bottom:0;
      background:rgba(0,0,0,0.85); z-index:999;
      display:flex; align-items:center; justify-content:center;
      padding:20px;
    `;
    overlay.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:24px; max-width:400px; width:100%;">
        <h3 style="margin:0 0 16px; color:var(--text-primary);">📱 Install Verifier</h3>
        <p style="color:var(--text-secondary); margin:0 0 16px; font-size:0.9rem;">
          Add Verifier to your home screen for the full app experience:
        </p>
        <div style="color:var(--text-primary); font-size:0.9rem; line-height:1.8;">
          <ol>
            <li>Tap the <strong>⋮ menu</strong> (top right)</li>
            <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install"</strong></li>
            <li>Confirm the installation</li>
          </ol>
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

  // ═══ Offline Detection ═══
  setupOffline() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;

    const updateStatus = () => {
      banner.style.display = navigator.onLine ? 'none' : 'block';
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  },

  // ═══ IndexedDB Storage ═══
  db: {
    name: 'icore-verifier',
    version: 1,
    instance: null,

    async init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.name, this.version);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('verifications')) {
            const store = db.createObjectStore('verifications', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('trustLevel', 'trustLevel', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.instance = event.target.result;
          resolve(this.instance);
        };

        request.onerror = (event) => {
          console.error('DB init error:', event.target.error);
          reject(event.target.error);
        };
      });
    },

    async save(result) {
      if (!this.instance) await this.init();

      return new Promise((resolve, reject) => {
        const tx = this.instance.transaction('verifications', 'readwrite');
        const store = tx.objectStore('verifications');

        const record = {
          id: result.claim.id,
          text: result.claim.text,
          timestamp: result.timestamp,
          trustLevel: result.trust.level,
          trustScore: result.trust.score,
          trustLabel: result.trust.label,
          uscpScore: result.results.uscp.score,
          uscScore: result.results.usc.score,
          icsPassed: result.results.ics.summary.passed,
          icsTotal: result.results.ics.summary.total,
          fullResult: result
        };

        const request = store.add(record);
        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
      });
    },

    async get(id) {
      if (!this.instance) await this.init();

      return new Promise((resolve, reject) => {
        const tx = this.instance.transaction('verifications', 'readonly');
        const store = tx.objectStore('verifications');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },

    async getAll() {
      if (!this.instance) await this.init();

      return new Promise((resolve, reject) => {
        const tx = this.instance.transaction('verifications', 'readonly');
        const store = tx.objectStore('verifications');
        const request = store.getAll();

        request.onsuccess = () => {
          const results = request.result || [];
          results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    },

    async remove(id) {
      if (!this.instance) await this.init();

      return new Promise((resolve, reject) => {
        const tx = this.instance.transaction('verifications', 'readwrite');
        const store = tx.objectStore('verifications');
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    },

    async clear() {
      if (!this.instance) await this.init();
      const all = await this.getAll();
      for (const v of all) {
        await this.remove(v.id);
      }
    }
  }
};

// Initialize — handle both early and late DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
