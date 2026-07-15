// ICore Studyo — Home Screen

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

        <!-- Stats -->
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
