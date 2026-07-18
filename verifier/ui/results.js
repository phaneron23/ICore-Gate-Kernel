// ICore Verifier — Results Screen v1.0.0
// Shows: overall PASS/FAIL badge, per-primitive assessment (6 cards),
// ICS test results breakdown, timestamp, option to save to history.

window.ResultsScreen = {
  render(result) {
    if (!result) {
      return `
        <div class="animate-in">
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <p class="empty-state-text">No verification result yet.</p>
            <p class="text-secondary mt-sm" style="font-size: 0.8rem;">
              Go to the Verify tab to run a trust verification.
            </p>
          </div>
        </div>
      `;
    }

    const { trust, results, claim, timestamp } = result;
    const trustColor = {
      verified: 'var(--trust-verified)',
      partial: 'var(--trust-partial)',
      unverified: 'var(--trust-unverified)',
      unknown: 'var(--trust-unknown)'
    }[trust.level];

    const badgeClass = trust.level === 'verified' ? 'badge-pass' :
                       trust.level === 'partial' ? 'badge-partial' : 'badge-fail';

    // Build the 6 USCP primitive assessment cards
    const primitiveCards = results.uscp.details.map(r => {
      const icon = r.passed ? '✅' : '❌';
      const cardClass = r.passed ? 'primitive-pass' : 'primitive-fail';
      return `
        <div class="primitive-card ${cardClass}">
          <span class="primitive-icon">${icon}</span>
          <div class="primitive-info">
            <div class="primitive-name">${r.name}</div>
            <div class="primitive-question">${r.question}</div>
          </div>
          <span class="badge ${r.passed ? 'badge-pass' : 'badge-fail'}" style="flex-shrink: 0;">
            ${r.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>
      `;
    }).join('');

    // ICS failed tests detail
    const allIcsTests = [
      ...results.ics.details.tier1,
      ...results.ics.details.tier2,
      ...results.ics.details.tier3
    ];
    const failedTests = allIcsTests.filter(r => !r.passed);
    const placeholderTests = allIcsTests.filter(r => r.placeholder);

    const failedSection = failedTests.length > 0 ? `
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-sm);">
        Failed tests (${failedTests.length}):
      </div>
      <ul class="test-list">
        ${failedTests.map(r => `
          <li class="test-item">
            <span class="test-icon test-fail">❌</span>
            <div>
              <strong>${r.id} — ${r.name}</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);"> (${r.severity})</span>
            </div>
          </li>
        `).join('')}
      </ul>
    ` : `
      <div class="text-center" style="padding: var(--space-md); color: var(--trust-verified);">
        ✅ All ${results.ics.summary.realTests} substantive tests passed
      </div>
      <div class="text-center" style="font-size: 0.75rem; color: var(--text-muted); margin-top: var(--space-xs);">
        ${results.ics.summary.placeholders} structural tests (placeholder) also passed
      </div>
    `;

    // USC Rules detail
    const uscDetail = results.usc.details.map(r => `
      <li class="test-item">
        <span class="test-icon ${r.passed ? 'test-pass' : 'test-fail'}">${r.passed ? '✅' : '❌'}</span>
        <div>
          <strong>${r.rule} — ${r.name}</strong>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${r.source}</div>
        </div>
      </li>
    `).join('');

    return `
      <div class="animate-in">
        <!-- Overall Trust Score -->
        <div class="result-card ${trust.level}">
          <div class="trust-score">
            <span class="badge ${badgeClass}" style="font-size: 0.85rem; padding: 6px 16px; margin-bottom: var(--space-md); display: inline-flex;">
              ${trust.label}
            </span>
            <div class="trust-level ${trust.level}">${trust.score}%</div>
            <div class="trust-label" style="color: ${trustColor};">
              Constitutional Trust Assessment
            </div>
            <div class="trust-bar">
              <div class="trust-bar-fill" style="width: ${trust.score}%; background: ${trustColor};"></div>
            </div>
          </div>

          <!-- Score Breakdown -->
          <div class="stats-grid">
            <div class="stats-grid-item">
              <div class="stats-grid-label">USCP</div>
              <div class="stats-grid-value">${trust.breakdown.uscp}%</div>
              <div class="stats-grid-sub">${results.uscp.score}/${results.uscp.max} primitives</div>
            </div>
            <div class="stats-grid-item">
              <div class="stats-grid-label">USC</div>
              <div class="stats-grid-value">${trust.breakdown.usc}%</div>
              <div class="stats-grid-sub">${results.usc.score}/${results.usc.max} rules</div>
            </div>
            <div class="stats-grid-item">
              <div class="stats-grid-label">ICS</div>
              <div class="stats-grid-value">${trust.breakdown.ics}%</div>
              <div class="stats-grid-sub">${results.ics.summary.passed}/${results.ics.summary.total} tests</div>
            </div>
          </div>
        </div>

        <!-- USCP Primitive Assessment (6 cards) -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">🔷</span>
            <div class="card-title">USCP Primitive Assessment</div>
            <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-secondary);">${results.uscp.score}/6</span>
          </div>
          <div class="primitive-grid">
            ${primitiveCards}
          </div>
        </div>

        <!-- USC Rules Compliance -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">📜</span>
            <div class="card-title">USC Constitutional Rules</div>
            <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-secondary);">${results.usc.score}/10</span>
          </div>
          <ul class="test-list">
            ${uscDetail}
          </ul>
        </div>

        <!-- ICS Conformance Suite -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">🧪</span>
            <div class="card-title">ICS Conformance Suite</div>
            <span style="margin-left: auto; font-size: 0.8rem; color: var(--text-secondary);">
              ${results.ics.summary.realPassed}/${results.ics.summary.realTests} real
            </span>
          </div>

          <!-- Tier Summary -->
          <div class="tier-summary">
            <div class="stats-grid-item">
              <div class="stats-grid-label">Tier 1</div>
              <div class="stats-grid-value">${results.ics.summary.details.tier1.passed}</div>
            </div>
            <div class="stats-grid-item">
              <div class="stats-grid-label">Tier 2</div>
              <div class="stats-grid-value">${results.ics.summary.details.tier2.passed}</div>
            </div>
            <div class="stats-grid-item">
              <div class="stats-grid-label">Tier 3</div>
              <div class="stats-grid-value">${results.ics.summary.details.tier3.passed}</div>
            </div>
          </div>

          ${failedSection}

          ${placeholderTests.length > 0 ? `
            <div style="margin-top: var(--space-md); padding: var(--space-sm); background: var(--bg-input); border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--text-muted);">
              ⚠️ ${placeholderTests.length} tests are placeholder implementations (always return true). They test structural compliance only.
            </div>
          ` : ''}
        </div>

        <!-- Timestamp & Claim Info -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">ℹ️</span>
            <div class="card-title">Verification Details</div>
          </div>
          <div style="font-size: 0.85rem;">
            <div class="mb-sm">
              <span class="input-label" style="display: inline;">Timestamp</span>
              <span style="color: var(--text-secondary);">${new Date(timestamp).toLocaleString()}</span>
            </div>
            <div class="mb-sm">
              <span class="input-label" style="display: inline;">Claim ID</span>
              <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem;">${claim.id || 'N/A'}</span>
            </div>
            <div>
              <span class="input-label" style="display: inline;">Conformance Level</span>
              <span class="badge badge-info">${results.ics.summary.level}</span>
            </div>
          </div>
        </div>

        <!-- Important Distinction -->
        <div class="card" style="border-color: var(--warning);">
          <div class="card-header">
            <span style="font-size: 1.2rem;">⚠️</span>
            <div class="card-title" style="color: var(--warning);">Self-Verification Notice</div>
          </div>
          <p class="card-description">
            This is <strong>self-verification</strong> — the claim was tested against ICore's own
            constitutional framework. The strongest supported claim is: "This claim passed
            ICore's defined conformance suite." Broader claims of trustworthiness require
            <strong>independent review, independent implementations, and cross-domain validation</strong>.
          </p>
        </div>

        <!-- Actions -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); margin-top: var(--space-md);">
          <button class="btn btn-secondary" onclick="ResultsScreen.exportJSON()">
            📦 Export JSON
          </button>
          <button class="btn btn-secondary" onclick="ResultsScreen.exportReport()">
            📄 Export Report
          </button>
        </div>

        <div style="margin-top: var(--space-sm);">
          <button class="btn btn-primary" onclick="App.navigate('home')">
            🔍 Verify Another Claim
          </button>
        </div>

        <div id="export-status" style="margin-top: var(--space-sm);"></div>
      </div>
    `;
  },

  bind(result) {
    // No additional bindings needed
  },

  exportJSON() {
    const result = App.lastVerifyResult;
    if (!result) return this._exportNotice('No result to export.');

    const envelope = {
      schema: 'ICore-Verification/v1.0',
      spec: 'ICS v0.1.0',
      runtime: 'ICore Verifier v1.0.0',
      exportedAt: new Date().toISOString(),
      verification: result
    };

    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ICore-Verification-${result.claim.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this._exportNotice('JSON record exported successfully.');
  },

  exportReport() {
    const result = App.lastVerifyResult;
    if (!result) return this._exportNotice('No result to export.');

    const { trust, results: res, claim, timestamp } = result;
    const ts = new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19);

    const lines = [
      '═══════════════════════════════════════════════════════════',
      '  ICore Constitutional Verification Record',
      '  ICS v0.1.0 · Verifier v1.0.0',
      '═══════════════════════════════════════════════════════════',
      '',
      `  Date:      ${ts}`,
      `  Claim ID:  ${claim.id}`,
      '',
      '───────────────────────────────────────────────────────────',
      '  CLAIM',
      '───────────────────────────────────────────────────────────',
      '',
      `  ${claim.text}`,
      '',
      '───────────────────────────────────────────────────────────',
      '  TRUST ASSESSMENT',
      '───────────────────────────────────────────────────────────',
      '',
      `  Score:  ${trust.score}% — ${trust.label}`,
      '',
      `  USCP Grounding:  ${trust.breakdown.uscp}%  (${res.uscp.score}/${res.uscp.max} primitives)`,
      `  USC Compliance:  ${trust.breakdown.usc}%  (${res.usc.score}/${res.usc.max} rules)`,
      `  ICS Conformance: ${trust.breakdown.ics}%  (${res.ics.summary.passed}/${res.ics.summary.total} tests)`,
      '',
      '───────────────────────────────────────────────────────────',
      '  USCP PRIMITIVES (Layer 2)',
      '───────────────────────────────────────────────────────────',
    ];

    for (const r of res.uscp.details) {
      const icon = r.passed ? 'PASS' : 'FAIL';
      lines.push(`  [${icon}]  ${r.name} — ${r.question}`);
    }

    lines.push('');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('  USC RULES (Layer 3)');
    lines.push('───────────────────────────────────────────────────────────');

    for (const r of res.usc.details) {
      const icon = r.passed ? 'PASS' : 'FAIL';
      lines.push(`  [${icon}]  ${r.rule} — ${r.name}`);
      lines.push(`         Source: ${r.source}`);
    }

    lines.push('');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`  ICS CONFORMANCE (${res.ics.summary.realTests} substantive + ${res.ics.summary.placeholders} structural)`);
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('');
    lines.push(`  Tier 1 — Constitutional Core:     ${res.ics.summary.details.tier1.passed} passed`);
    lines.push(`  Tier 2 — Science-Specific:         ${res.ics.summary.details.tier2.passed} passed`);
    lines.push(`  Tier 3 — Cross-Layer Integration:  ${res.ics.summary.details.tier3.passed} passed`);
    lines.push('');
    lines.push(`  Substantive tests: ${res.ics.summary.realPassed}/${res.ics.summary.realTests}`);
    lines.push('');

    const allTests = [...res.ics.details.tier1, ...res.ics.details.tier2, ...res.ics.details.tier3];
    const failed = allTests.filter(r => !r.passed);
    if (failed.length > 0) {
      lines.push('  Failed tests:');
      for (const r of failed) {
        lines.push(`    [FAIL] ${r.id} — ${r.name} (${r.severity})`);
      }
    } else {
      lines.push(`  All ${res.ics.summary.realTests} substantive tests passed.`);
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('  ICore — Universal Constitutional Science of Trustworthy Intelligence');
    lines.push('═══════════════════════════════════════════════════════════');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ICore-Verification-${result.claim.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this._exportNotice('Report exported successfully.');
  },

  _exportNotice(msg) {
    const el = document.getElementById('export-status');
    if (el) {
      el.innerHTML = `<div class="text-center" style="font-size: 0.8rem; color: var(--accent);">✅ ${msg}</div>`;
      setTimeout(() => { el.innerHTML = ''; }, 3000);
    }
  }
};
