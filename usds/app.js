// USDS — Main App Controller v0.1.0
// Screen navigation, IndexedDB init, event bus wiring, engine instantiation.

window.USDS_App = (() => {
  'use strict';

  // ── Engine References ────────────────────────────
  const PackageEngine = window.USDS_PackageEngine;
  const SigningEngine = window.USDS_SigningEngine;
  const DistributionEngine = window.USDS_DistributionEngine;
  const VerificationEngine = window.USDS_VerificationEngine;

  // Use platform EventBus if available, else minimal local one
  const EventBus = (window.ICorePlatform && window.ICorePlatform.EventBus) || window.EventBus || (() => {
    const subs = {};
    return {
      on: (e, fn) => { (subs[e] = subs[e] || []).push(fn); },
      off: (e, fn) => { subs[e] = (subs[e] || []).filter(f => f !== fn); },
      emit: (e, d) => { (subs[e] || []).forEach(fn => fn(d)); }
    };
  })();

  const UI = {
    dashboard: window.USDS_DashboardUI,
    packages: window.USDS_PackagesUI,
    distribute: window.USDS_DistributeUI,
    verify: window.USDS_VerifyUI,
    history: window.USDS_HistoryUI,
    about: window.USDS_AboutUI
  };

  let currentScreen = 'dashboard';
  let initialized = false;

  // ── Service Worker ───────────────────────────────
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
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
      const packages = await PackageEngine.getAllPackages();
      const distRecords = await DistributionEngine.getAllRecords();

      switch (screen) {
        case 'dashboard': {
          const stats = await PackageEngine.getStats();
          const distStats = await DistributionEngine.getStats();
          UI.dashboard.render(stats, distStats);
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
      console.error('USDS refreshScreen error:', err);
    }
  }

  // ── Event Bus Wiring ─────────────────────────────
  function wireEvents() {
    EventBus.on('usds:package-created', () => {
      if (currentScreen === 'dashboard') refreshScreen('dashboard');
    });
    EventBus.on('usds:package-distributed', () => {
      if (currentScreen === 'dashboard') refreshScreen('dashboard');
    });
  }

  // ── Mobile Menu ──────────────────────────────────
  function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenu');
    const nav = document.getElementById('mainNav');
    if (menuBtn && nav) {
      menuBtn.onclick = () => nav.classList.toggle('open');
    }
  }

  // ── Nav Button Bindings ──────────────────────────
  function setupNavigation() {
    document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
      btn.onclick = () => navigate(btn.dataset.screen);
    });
  }

  // ── Initialize ───────────────────────────────────
  async function init() {
    if (initialized) return;
    initialized = true;
    registerSW();
    await PackageEngine.init();
    await DistributionEngine.init();
    setupNavigation();
    setupMobileMenu();
    wireEvents();
    navigate('dashboard');
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