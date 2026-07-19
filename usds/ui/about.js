// USDS — About UI v0.2.0
window.USDS_AboutUI = (() => {
  'use strict';

  let container;

  function render() {
    if (!container) container = document.getElementById('screen-about');

    const swSupported = 'serviceWorker' in navigator;
    const idbSupported = 'indexedDB' in window;
    const cryptoSupported = 'crypto' in window && 'subtle' in window.crypto;

    container.innerHTML = `
      <div class="section-title">ℹ️ About USDS</div>
      <div class="card">
        <h2>Universal Sovereign Distribution System</h2>
        <p style="font-size:0.88em;color:var(--text-secondary);margin-bottom:16px">
          Constitutional distribution management system — package, sign, distribute, and verify constitutional software.
          Built as a Progressive Web App for offline-first, sovereign operation.
        </p>
        <div class="grid-2col">
          <div>
            <div class="input-group">
              <label>Module</label>
              <div style="font-size:0.9em">USDS — Universal Sovereign Distribution</div>
            </div>
            <div class="input-group">
              <label>Version</label>
              <div style="font-size:0.9em">0.1.0</div>
            </div>
            <div class="input-group">
              <label>Originator</label>
              <div style="font-size:0.9em;color:var(--accent)">Sir Collins</div>
            </div>
          </div>
          <div>
            <div class="input-group">
              <label>Framework</label>
              <div style="font-size:0.9em">ICore — Constitutional Framework</div>
            </div>
            <div class="input-group">
              <label>Platform</label>
              <div style="font-size:0.9em">ICorePlatform v0.1.0</div>
            </div>
            <div class="input-group">
              <label>Architecture</label>
              <div style="font-size:0.9em">PWA · Offline-First · Zero Dependencies</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>🔧 Engine Capabilities</h2>
        <div class="grid-2col" style="font-size:0.85em">
          <div>
            <div class="badge badge-green mb-1">Package Engine</div>
            <p style="color:var(--text-secondary)">SHA-256 integrity hashing, ConstitutionalPackage lifecycle, IndexedDB persistence.</p>
          </div>
          <div>
            <div class="badge badge-green mb-1">Signing Engine</div>
            <p style="color:var(--text-secondary)">HMAC-SHA256 signatures, attestation production and verification.</p>
          </div>
          <div>
            <div class="badge badge-green mb-1">Distribution Engine</div>
            <p style="color:var(--text-secondary)">Multi-channel distribution, chain of custody tracking, revocation support.</p>
          </div>
          <div>
            <div class="badge badge-green mb-1">Verification Engine</div>
            <p style="color:var(--text-secondary)">Full and quick verification, detailed verification reports.</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>🌐 Platform Modules</h2>
        <div style="font-size:0.82em;color:var(--text-secondary)">
          CoreFab · UCA · USCP · USC · Sciences · UCRS · UCModels · ICS · TrustVerify · EventBus
        </div>
      </div>

      <div class="card">
        <h2>📋 System Status</h2>
        <div class="grid-3col" style="font-size:0.85em">
          <div class="flex-row">
            <span class="badge ${swSupported ? 'badge-green' : 'badge-red'}">${swSupported ? '✓' : '✗'}</span>
            <span>Service Worker</span>
          </div>
          <div class="flex-row">
            <span class="badge ${idbSupported ? 'badge-green' : 'badge-red'}">${idbSupported ? '✓' : '✗'}</span>
            <span>IndexedDB</span>
          </div>
          <div class="flex-row">
            <span class="badge ${cryptoSupported ? 'badge-green' : 'badge-red'}">${cryptoSupported ? '✓' : '✗'}</span>
            <span>Web Crypto API</span>
          </div>
        </div>
        <div class="mt-1 mono" style="font-size:0.75em;color:var(--text-muted)">
          User Agent: ${escHtml(navigator.userAgent.substring(0, 100))}…
        </div>
      </div>
    `;
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
  }

  return { render };
})();
