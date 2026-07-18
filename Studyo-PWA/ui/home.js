// ICore Studyo — Home Screen v1.3.0

window.HomeScreen = {
  render() {
    return `
      <div class="animate-in">
        <!-- Install Banner (shown if not installed) -->
        <div id="install-banner" class="install-banner" style="display:none">
          <h3>📱 Install Studyo</h3>
          <p>Add to your home screen for offline access. Your data never leaves your device.</p>
          <button class="btn btn-primary" onclick="App.installPWA()">
            Install App
          </button>
        </div>

        <!-- Hero -->
        <div class="text-center mb-lg">
          <div style="font-size: 4rem; margin-bottom: var(--space-md);">🔷</div>
          <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: var(--space-xs);">
            ICore Studyo
          </h1>
          <p class="text-secondary" style="font-size: 0.875rem;">
            Universal Constitutional Workspace
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="card" onclick="App.navigate('verify')" style="cursor: pointer;">
          <div class="card-header">
            <span style="font-size: 1.5rem;">🔍</span>
            <div>
              <div class="card-title">Verify a Trust Claim</div>
              <div class="card-description">Test any claim against the constitutional framework</div>
            </div>
          </div>
        </div>

        <div class="card" onclick="App.navigate('explore')" style="cursor: pointer;">
          <div class="card-header">
            <span style="font-size: 1.5rem;">🗺️</span>
            <div>
              <div class="card-title">Explore the Constitution</div>
              <div class="card-description">Navigate the 7-layer constitutional architecture</div>
            </div>
          </div>
        </div>

        <!-- Constitutional Status -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.5rem;">📊</span>
            <div class="card-title">Constitutional Status</div>
          </div>
          <div id="home-stats">
            <div class="layer-grid">
              <div class="layer-item">
                <div class="layer-number">L2</div>
                <div class="layer-info">
                  <div class="layer-name">USCP Primitives</div>
                  <div class="layer-desc">6 Foundational Primitives</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L3</div>
                <div class="layer-info">
                  <div class="layer-name">USC Kernel</div>
                  <div class="layer-desc">The Constitution v1.0</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L4</div>
                <div class="layer-info">
                  <div class="layer-name">Constitutional Sciences</div>
                  <div class="layer-desc">UCE · UCC · UCM · UCL</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L5</div>
                <div class="layer-info">
                  <div class="layer-name">Reference Systems</div>
                  <div class="layer-desc">UCRS · UCModels · URS · UVS</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L6a</div>
                <div class="layer-info">
                  <div class="layer-name">UWA Components</div>
                  <div class="layer-desc">Component Model &amp; Execution</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L6b</div>
                <div class="layer-info">
                  <div class="layer-name">UCN Networking</div>
                  <div class="layer-desc">Discovery · Communication · Trust</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L6c</div>
                <div class="layer-info">
                  <div class="layer-name">USR Orchestration</div>
                  <div class="layer-desc">CoreFab v0.1.0</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L6d</div>
                <div class="layer-info">
                  <div class="layer-name">UCA Adaptation</div>
                  <div class="layer-desc">Constitutional Boundary v0.1.0</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">L7</div>
                <div class="layer-info">
                  <div class="layer-name">Applications</div>
                  <div class="layer-desc">UAS · USDS · UCD · ICS · Studyo</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
              <div class="layer-item">
                <div class="layer-number">ICS</div>
                <div class="layer-info">
                  <div class="layer-name">Conformance Suite</div>
                  <div class="layer-desc">57 Tests · C3 Certified</div>
                </div>
                <div class="layer-status status-complete">✅</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Runtime Demo -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.5rem;">⚙️</span>
            <div>
              <div class="card-title">Constitutional Runtime</div>
              <div class="card-description">USR/CoreFab v0.1.0 — 6 contracts, deterministic execution</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); margin-top: var(--space-md);">
            <div style="padding: var(--space-sm); background: var(--bg-input); border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Contracts</div>
              <div style="font-size: 1.1rem; font-weight: 700;">6</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Identity · Execution · Constraints · Isolation · Attestation · Orchestration</div>
            </div>
            <div style="padding: var(--space-sm); background: var(--bg-input); border-radius: var(--radius-sm); text-align: center;">
              <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Adapter Domains</div>
              <div style="font-size: 1.1rem; font-weight: 700;">5</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">Naming · Serialization · Execution · Storage · Communication</div>
            </div>
          </div>
          <button class="btn btn-secondary" style="margin-top: var(--space-md); width: 100%;" onclick="App.runRuntimeDemo()">
            ⚡ Run Runtime Self-Verification
          </button>
          <div id="runtime-demo-result" style="margin-top: var(--space-sm);"></div>
        </div>

        <!-- Originator -->
        <div class="text-center mt-lg">
          <p class="text-muted" style="font-size: 0.75rem;">
            Originated by Sir Collins · access1@tutamail.com<br>
            Constitutional specification v0.1.0 · Self-verified · GPG-signed
          </p>
        </div>
      </div>
    `;
  }
};
