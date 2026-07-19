// USDS — Main App Controller v0.2.0
// Screen navigation, IndexedDB init, event bus wiring, PWA install, engine instantiation.

window.USDS_App = (() => {
  'use strict';

  // ── Engine References ────────────────────────────
  const PackageEngine = window.USDS_PackageEngine;
  const SigningEngine = window.USDS_SigningEngine;
  const DistributionEngine = window.USDS_DistributionEngine;
  const VerificationEngine = window.USDS_VerificationEngine;

  // ── EventBus Adapter ─────────────────────────────
  // The platform EventBus uses subscribe/publish/off.
  // Our UI modules expect on/emit/off. Create a compatible adapter.
  function createEventBus() {
    const platformBus = (window.ICorePlatform && window.ICorePlatform.EventBus) || window.EventBus;
    if (platformBus && typeof platformBus.subscribe === 'function') {
      // Adapter wrapping the platform EventBus
      return {
        on: (eventType, fn) => platformBus.subscribe(eventType, fn),
        off: (eventType, id) => platformBus.off(eventType, id),
        emit: (eventType, payload) => platformBus.publish(eventType, payload, 'usds-app'),
        _raw: platformBus
      };
    }
    // Fallback local EventBus
    const subs = {};
    return {
      on: (e, fn) => { (subs[e] = subs[e] || []).push(fn); },
      off: (e, fn) => { subs[e] = (subs[e] || []).filter(f => f !== fn); },
      emit: (e, d) => { (subs[e] || []).forEach(fn => fn(d)); }
    };
  }

  const EventBus = createEventBus();

  // ── UI Module References ─────────────────────────
  const UI = {
    dashboard: window.USDS_DashboardUI,
    packages: window.USDS_PackagesUI,
    distribute: window.USDS_DistributeUI,
    verify: window.USDS_VerifyUI,
    history: window.USDS_HistoryUI,
    about: window.USDS_AboutUI
  };

  let currentScreen = 'deferredPrompt' in window ? 'dashboard' : 'dashboard';
  let initialized = false;
  let deferredInstallPrompt = null;

  // ── Service Worker Registration ──────────────────
  function registerSW() {
    if (!('serviceWorker' in navigator)) {
      updateSWStatus('Service Worker not supported');
      return;
    }
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(reg => {
        console.log('[USDS] Service Worker registered, scope:', reg.scope);
        updateSWStatus('Offline Ready ✓');

        // Check for updates periodically
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                updateSWStatus('Update Available — Reload');
                updateSWStatusClick();
              }
            });
          }
        });
      })
      .catch(err => {
        console.warn('[USDS] SW registration failed:', err);
        updateSWStatus('SW Error');
      });

    // Listen for controlling SW change
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  function updateSWStatus(text) {
    const el = document.getElementById('swStatus');
    if (el) el.textContent = text;
  }

  function updateSWStatusClick() {
    const el = document.getElementById('swStatus');
    if (el) {
      el.style.cursor = 'pointer';
      el.style.color = 'var(--accent)';
      el.onclick = () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
      };
    }
  }

  // ── PWA Install Prompt ───────────────────────────
  function setupInstallPrompt() {
    const installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (installBtn) installBtn.style.display = 'inline-flex';
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log('[USDS] Install prompt outcome:', outcome);
        deferredInstallPrompt = null;
        installBtn.style.display = 'none';
      });
    }

    window.addEventListener('appinstalled', () => {
      console.log('[USDS] App installed successfully');
      deferredInstallPrompt = null;
      if (installBtn) installBtn.style.display = 'none';
    });
  }

  // ── Navigation ───────────────────────────────────
  function navigate(screen) {
    if (!UI[screen]) return;
    currentScreen = screen;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screen);
    });

    // Update screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('screen-' + screen);
    if (target) target.classList.add('active');

    // Close mobile menu
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.remove('open');

    // Refresh content
    refreshScreen(screen);
  }

  // ── Refresh Screen Data ──────────────────────────
  async function refreshScreen(screen) {
    try {
      const packages = PackageEngine.getAllPackages ? await PackageEngine.getAllPackages() : [];
      const distRecords = DistributionEngine.getAllRecords ? await DistributionEngine.getAllRecords() : [];

      switch (screen) {
        case 'dashboard': {
          const stats = await PackageEngine.getStats();
          const distStats = await DistributionEngine.getStats();
          UI.dashboard.render(stats, distStats, packages);
          break;
        }
        case 'packages':
          UI.packages.render(packages);
          break;
        case 'distribute':
          UI.distribute.render(packages);
          break;
        case 'verify':
          UI.verify.render(packages);
          break;
        case 'history':
          UI.history.render(packages, distRecords);
          break;
        case 'about':
          UI.about.render();
          break;
      }
    } catch (err) {
      console.error('[USDS] refreshScreen error:', err);
    }
  }

  // ── Event Bus Wiring ─────────────────────────────
  function wireEvents() {
    // Refresh dashboard on any relevant event
    const refreshDashboard = () => {
      if (currentScreen === 'dashboard') refreshScreen('dashboard');
    };
    EventBus.on('usds:package-created', refreshDashboard);
    EventBus.on('usds:package-signed', refreshDashboard);
    EventBus.on('usds:package-distributed', refreshDashboard);
    EventBus.on('usds:package-verified', refreshDashboard);
  }

  // ── Mobile Menu ──────────────────────────────────
  function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenu');
    const nav = document.getElementById('mainNav');
    if (menuBtn && nav) {
      menuBtn.onclick = () => nav.classList.toggle('open');
      // Close on nav click
      nav.addEventListener('click', e => {
        if (e.target.classList.contains('nav-btn')) {
          nav.classList.remove('open');
        }
      });
    }
  }

  // ── Nav Button Bindings ──────────────────────────
  function setupNavigation() {
    document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
      btn.onclick = () => navigate(btn.dataset.screen);
    });
  }

  // ── Hash-based Navigation ────────────────────────
  function handleHashNav() {
    const hash = window.location.hash.replace('#', '');
    if (hash && UI[hash]) {
      navigate(hash);
    }
  }

  // ── Initialize ───────────────────────────────────
  async function init() {
    if (initialized) return;
    initialized = true;

    console.log('[USDS] Initializing USDS v0.1.0');

    registerSW();
    setupInstallPrompt();
    setupNavigation();
    setupMobileMenu();

    // Init engines with timeout so UI always works
    const engineTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Engine init timeout')), 5000));
    try {
      await Promise.race([
        Promise.all([PackageEngine.init(), DistributionEngine.init()]),
        engineTimeout
      ]);
      wireEvents();
    } catch (err) {
      console.warn('[USDS] Engine init skipped:', err.message);
      // UI still works — nav is bound, screens will show empty state
    }

    // Handle hash navigation or default to dashboard (safe — no engine dependency)
    try {
      handleHashNav();
      if (!window.location.hash || !UI[window.location.hash.replace('#', '')]) {
        navigate('dashboard');
      }
    } catch(e) {
      navigate('dashboard');
    }

    window.addEventListener('hashchange', handleHashNav);

    console.log('[USDS] Initialization complete');
  }

  // ── Auto-init on DOM ready ───────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    navigate, refreshScreen, init,
    PackageEngine, SigningEngine, DistributionEngine, VerificationEngine,
    EventBus, UI
  };
})();
