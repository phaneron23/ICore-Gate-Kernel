// ICore Studyo — Main Application Controller v0.1.0
// Brave-first, Offline-first, Sovereign

const App = {
  currentScreen: 'home',
  deferredInstallPrompt: null,

  async init() {
    // Initialize database
    try {
      await DB.init();
    } catch (e) {
      console.warn('IndexedDB unavailable:', e);
    }

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
      } catch (e) {
        console.warn('SW registration failed:', e);
      }
    }
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
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screen);
    });

    // Get screen container
    const container = document.getElementById('screen');
    
    // Render screen
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

    // Scroll to top
    window.scrollTo(0, 0);
  },

  // PWA Install
  setupInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      
      // Show install button in header
      const btn = document.getElementById('install-btn');
      if (btn) btn.style.display = 'block';

      // Show install banner on home
      const banner = document.getElementById('install-banner');
      if (banner) banner.style.display = 'block';
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      const btn = document.getElementById('install-btn');
      if (btn) btn.style.display = 'none';
      const banner = document.getElementById('install-banner');
      if (banner) banner.style.display = 'none';
    });
  },

  async installPWA() {
    if (!this.deferredInstallPrompt) return;
    
    this.deferredInstallPrompt.prompt();
    const { outcome } = await this.deferredInstallPrompt.userChoice;
    console.log('Install outcome:', outcome);
    this.deferredInstallPrompt = null;
  },

  // Offline Detection
  setupOffline() {
    const banner = document.getElementById('offline-banner');
    
    const updateStatus = () => {
      if (!navigator.onLine) {
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
