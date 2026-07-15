// ICore Studyo — Verify Screen

window.VerifyScreen = {
  render() {
    return `
      <div class="animate-in">
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.5rem;">🔍</span>
            <div class="card-title">Verify a Trust Claim</div>
          </div>
          <p class="card-description mb-md">
            Enter any trust claim to verify it against the ICore constitutional framework.
            The claim is parsed, analyzed against 57 conformance tests, and scored.
          </p>

          <div class="input-group">
            <label class="input-label" for="claim-input">Trust Claim</label>
            <textarea 
              id="claim-input" 
              class="input-field" 
              rows="4"
              placeholder="Example: This software is trustworthy because it passes 47/47 conformance tests, has GPG-signed commits, and its derivation chain traces to verified primitives."
            ></textarea>
          </div>

          <button id="verify-btn" class="btn btn-primary" onclick="VerifyScreen.run()">
            🔍 Verify Claim
          </button>
        </div>

        <!-- Results Container -->
        <div id="verify-results"></div>
      </div>
    `;
  },

  async run() {
    const input = document.getElementById('claim-input');
    const text = input.value.trim();
    
    if (!text) {
      input.style.borderColor = 'var(--error)';
      setTimeout(() => input.style.borderColor = '', 2000);
      return;
    }

    const btn = document.getElementById('verify-btn');
    btn.textContent = '⏳ Verifying...';
    btn.disabled = true;

    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));

    // Run verification
    const result = TrustVerifier.verify(text);

    // Store for export
    window._lastVerifyResult = result;

    // Save to IndexedDB
    try {
      await DB.saveVerification(result);
    } catch (e) {
      console.warn('Could not save verification:', e);
    }

    // Render results
    this.renderResults(result);

    btn.textContent = '🔍 Verify Claim';
    btn.disabled = false;
  },

  renderResults(result) {
    const container = document.getElementById('verify-results');
    const { trust, results } = result;

    const trustColor = {
      verified: 'var(--trust-verified)',
      partial: 'var(--trust-partial)',
      unverified: 'var(--trust-unverified)',
      unknown: 'var(--trust-unknown)'
    }[trust.level];

    container.innerHTML = `
      <div class="animate-in">
        <!-- Trust Score -->
        <div class="card">
          <div class="trust-score">
            <div class="trust-level ${trust.level}">${trust.score}%</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: ${trustColor};">
              ${trust.label}
            </div>
            <div class="trust-bar">
              <div class="trust-bar-fill" style="width: ${trust.score}%; background: ${trustColor};"></div>
            </div>
          </div>

          <!-- Breakdown -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm); text-align: center;">
            <div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">USCP</div>
              <div style="font-size: 1.1rem; font-weight: 700;">${trust.breakdown.uscp}%</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">${results.uscp.score}/${results.uscp.max}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">USC</div>
              <div style="font-size: 1.1rem; font-weight: 700;">${trust.breakdown.usc}%</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">${results.usc.score}/${results.usc.max}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">ICS</div>
              <div style="font-size: 1.1rem; font-weight: 700;">${trust.breakdown.ics}%</div>
              <div style="font-size: 0.7rem; color: var(--text-secondary);">${results.ics.summary.passed}/${results.ics.summary.total}</div>
            </div>
          </div>
        </div>

        <!-- USCP Primitives -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">🔷</span>
            <div class="card-title">USCP Grounding</div>
            <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-secondary);">${results.uscp.score}/6</span>
          </div>
          <ul class="test-list">
            ${results.uscp.details.map(r => `
              <li class="test-item">
                <span class="test-icon ${r.passed ? 'test-pass' : 'test-fail'}">${r.passed ? '✅' : '❌'}</span>
                <div>
                  <strong>${r.name}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${r.question}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- USC Rules -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">📜</span>
            <div class="card-title">USC Compliance</div>
            <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-secondary);">${results.usc.score}/10</span>
          </div>
          <ul class="test-list">
            ${results.usc.details.map(r => `
              <li class="test-item">
                <span class="test-icon ${r.passed ? 'test-pass' : 'test-fail'}">${r.passed ? '✅' : '❌'}</span>
                <div>
                  <strong>${r.rule} — ${r.name}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${r.source}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- ICS Conformance -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">🧪</span>
            <div class="card-title">ICS Conformance</div>
            <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-secondary);">
              ${results.ics.summary.passed}/${results.ics.summary.total}
            </span>
          </div>

          <!-- Tier Summary -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm); margin-bottom: var(--space-md); text-align: center;">
            <div style="padding: var(--space-sm); background: var(--bg-input); border-radius: var(--radius-sm);">
              <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Tier 1</div>
              <div style="font-size: 0.9rem; font-weight: 700;">${results.ics.summary.details.tier1.passed}/15</div>
            </div>
            <div style="padding: var(--space-sm); background: var(--bg-input); border-radius: var(--radius-sm);">
              <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Tier 2</div>
              <div style="font-size: 0.9rem; font-weight: 700;">${results.ics.summary.details.tier2.passed}/32</div>
            </div>
            <div style="padding: var(--space-sm); background: var(--bg-input); border-radius: var(--radius-sm);">
              <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Tier 3</div>
              <div style="font-size: 0.9rem; font-weight: 700;">${results.ics.summary.details.tier3.passed}/10</div>
            </div>
          </div>

          <!-- Failed Tests (only show failures) -->
          ${results.ics.summary.failed > 0 ? `
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">
              Failed tests:
            </div>
            <ul class="test-list">
              ${[...results.ics.details.tier1, ...results.ics.details.tier2, ...results.ics.details.tier3]
                .filter(r => !r.passed)
                .map(r => `
                  <li class="test-item">
                    <span class="test-icon test-fail">❌</span>
                    <div>
                      <strong style="font-size: 0.8rem;">${r.id} — ${r.name}</strong>
                      <span style="font-size: 0.7rem; color: var(--text-muted);"> (${r.severity})</span>
                    </div>
                  </li>
                `).join('')}
            </ul>
          ` : `
            <div class="text-center" style="padding: var(--space-md); color: var(--trust-verified);">
              ✅ All ${results.ics.summary.total} tests passed
            </div>
          `}
        </div>

        <!-- Important Note -->
        <div class="card" style="border-color: var(--warning);">
          <div class="card-header">
            <span style="font-size: 1.2rem;">⚠️</span>
            <div class="card-title" style="color: var(--warning);">Important Distinction</div>
          </div>
          <p class="card-description">
            This is <strong>self-verification</strong> — the claim was tested against ICore's own
            constitutional framework. The strongest supported claim is: "This claim passed
            ICore's defined conformance suite." Broader claims of trustworthiness require
            <strong>independent review, independent implementations, and cross-domain validation</strong>.
          </p>
        </div>

        <!-- Export -->
        <button class="btn btn-secondary mt-md" onclick="VerifyScreen.exportResult()">
          📤 Export Verification Record
        </button>
      </div>
    `;
  },

  exportResult() {
    // Get the last verification result from the page
    const result = window._lastVerifyResult;
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icore-verify-${result.claim.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
