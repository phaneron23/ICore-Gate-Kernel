// UAS — Main Application Controller v1.0.0
// Screen navigation, IndexedDB persistence, event wiring, engine instantiation.

window.UASApp = (() => {
  'use strict';

  // ─── IndexedDB ───────────────────────────────────────────────────────

  const DB_NAME = 'uas-db';
  const DB_VERSION = 1;
  let db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('agents')) {
          db.createObjectStore('agents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('logs')) {
          const logStore = db.createObjectStore('logs', { keyPath: 'id' });
          logStore.createIndex('type', 'type', { unique: false });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
          logStore.createIndex('agentId', 'agentId', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function dbPut(storeName, data) {
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function dbGet(storeName, key) {
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbGetAll(storeName) {
    if (!db) return [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbDelete(storeName, key) {
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function dbQuery(storeName, indexName, value) {
    if (!db) return [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const idx = tx.objectStore(storeName).index(indexName);
      const req = idx.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // ─── Log Helper ──────────────────────────────────────────────────────

  async function addLog(type, message, data) {
    const entry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      type,
      message,
      data: data || null,
      agentId: data?.agentId || null,
      timestamp: new Date().toISOString()
    };
    await dbPut('logs', entry);
    return entry;
  }

  // ─── Engine Instances ────────────────────────────────────────────────

  let registry = null;
  let orchestrator = null;
  let trustEngine = null;
  let runtime = null;

  // ─── Navigation ──────────────────────────────────────────────────────

  const screens = [
    { id: 'dashboard', label: 'Dashboard', render: null },
    { id: 'agents', label: 'Agents', render: null },
    { id: 'builder', label: 'Builder', render: null },
    { id: 'orchestrator', label: 'Orchestrator', render: null },
    { id: 'history', label: 'History', render: null },
    { id: 'about', label: 'About', render: null }
  ];

  let currentScreen = 'dashboard';

  function renderNav() {
    const nav = document.getElementById('appNav');
    if (!nav) return;
    nav.innerHTML = '';
    for (const screen of screens) {
      const btn = document.createElement('button');
      btn.textContent = screen.label;
      btn.className = screen.id === currentScreen ? 'active' : '';
      btn.onclick = () => navigate(screen.id);
      nav.appendChild(btn);
    }
  }

  function navigate(screenId) {
    currentScreen = screenId;
    renderNav();
    renderScreen();
  }

  function renderScreen() {
    const container = document.getElementById('screenContainer');
    if (!container) return;

    const screen = screens.find(s => s.id === currentScreen);
    if (screen && screen.render) {
      container.innerHTML = '';
      screen.render(container, { registry, orchestrator, trustEngine, runtime, db, addLog, navigate });
    }
  }

  // ─── Toast ───────────────────────────────────────────────────────────

  let toastContainer = null;

  function showToast(message, type) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type || 'info'}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ─── Init ────────────────────────────────────────────────────────────

  async function init() {
    // Open database
    try {
      db = await openDB();
    } catch (err) {
      console.error('UAS: Failed to open IndexedDB:', err);
    }

    // Create engine instances
    if (window.CoreFab && CoreFab.executeBlueprint) {
      runtime = new CoreFab.UsrRuntime ? new CoreFab.UsrRuntime() : null;
    }
    registry = new window.UASAgentEngine.AgentRegistry();
    orchestrator = new window.UASOrchestrator.Orchestrator();
    trustEngine = new window.UASTrustEngine.TrustEngine();

    // Load saved agents from IndexedDB
    try {
      const savedAgents = await dbGetAll('agents');
      if (savedAgents.length > 0) {
        registry.fromJSON(savedAgents);
        // Recalculate trust for all loaded agents
        for (const agent of registry.getAll()) {
          trustEngine.calculate(agent);
        }
      }
    } catch (err) {
      console.warn('UAS: Could not load saved agents:', err);
    }

    // Load saved sessions
    try {
      const savedSessions = await dbGetAll('sessions');
      for (const sessionData of savedSessions) {
        // Restore sessions (without full re-execution)
        orchestrator.sessions.push(sessionData);
      }
    } catch (err) {
      console.warn('UAS: Could not load saved sessions:', err);
    }

    // Register UI renderers
    if (window.UASDashboard) screens[0].render = window.UASDashboard.render;
    if (window.UASAgents) screens[1].render = window.UASAgents.render;
    if (window.UASBuilder) screens[2].render = window.UASBuilder.render;
    if (window.UASOrchestratorUI) screens[3].render = window.UASOrchestratorUI.render;
    if (window.UASHistory) screens[4].render = window.UASHistory.render;
    if (window.UASAbout) screens[5].render = window.UASAbout.render;

    // Wire event bus
    if (window.EventBus) {
      EventBus.subscribe('agent.created', async (event) => {
        const agentData = event.payload;
        await dbPut('agents', agentData);
        await addLog('agent', `Agent '${agentData.name}' created`, { agentId: agentData.id });
        if (currentScreen === 'dashboard' || currentScreen === 'agents') renderScreen();
      });

      EventBus.subscribe('agent.attestation', async (event) => {
        const att = event.payload;
        await addLog('attestation', `Attestation: ${att.operation}`, {
          agentId: att.agentId,
          signature: att.signature
        });
      });

      EventBus.subscribe('orchestrator.sessionCreated', async (event) => {
        const session = event.payload;
        await dbPut('sessions', session);
        await addLog('session', `Session '${session.name}' created`, { sessionId: session.id });
      });

      EventBus.subscribe('orchestrator.sessionComplete', async (event) => {
        const data = event.payload;
        await addLog('session', `Session ${data.state}`, { sessionId: data.sessionId });
        // Update session in DB
        const session = orchestrator.getSession(data.sessionId);
        if (session) await dbPut('sessions', session);
        if (currentScreen === 'orchestrator') renderScreen();
      });
    }

    // Expose utilities for UI modules
    window.UASUtils = {
      dbPut,
      dbGet,
      dbGetAll,
      dbDelete,
      dbQuery,
      addLog,
      showToast,
      navigate
    };

    // Initial render
    renderNav();
    renderScreen();

    console.log('UAS: Universal Agentic System initialized');
  }

  return Object.freeze({
    init,
    navigate,
    showToast,
    getRegistry: () => registry,
    getOrchestrator: () => orchestrator,
    getTrustEngine: () => trustEngine,
    getRuntime: () => runtime
  });
})();
