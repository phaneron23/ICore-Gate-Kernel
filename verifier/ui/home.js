// ICore Verifier — Home (Input) Screen v1.0.0
// Textarea for claim input, Verify button, 3 quick-load example claims.

window.HomeScreen = {
  // Example claims that demonstrate different aspects of the framework
  examples: [
    {
      label: 'Conformant Entity',
      desc: 'Full ICore entity with all constitutional fields',
      claim: JSON.stringify({
        id: "entity-trustworthy-001",
        definition: "This AI system is constitutionally trustworthy because it derives its reasoning from verified primitives and maintains full traceability.",
        origin: ["USCP-E1-Existence", "USCP-E2-Identity"],
        identity: { unique: true, id: "ai-trust-system-001" },
        relationships: [
          { type: "derivation", target: "USCP-primitives" },
          { type: "dependency", target: "ICS-conformance" }
        ],
        constraints: {
          constitutional: "All outputs trace to verified premises",
          epistemic: "No claim without evidence"
        },
        lifecycle: { state: "Active", governed: true },
        verification: [
          { type: "ICS-conformance", result: "passed", score: "47/57" },
          { type: "USCP-grounding", result: "passed", score: "6/6" }
        ],
        epistemic: { humble: true },
        citations: [
          { source: "ICS v0.1.0", detail: "Conformance suite verified" }
        ],
        derivation: {
          chain: ["USCP", "USC", "ICS"],
          direction: "downward",
          valid: true,
          fromAxioms: true,
          terminated: true
        },
        structure: { consistent: true },
        expression: {
          Subject: "AI Trust System",
          Predicate: "derives from",
          Object: "verified constitutional primitives",
          Source: "ICS conformance suite",
          Context: "trust verification",
          canonical: true
        },
        reference: "L6.ai-trust-system-001",
        text: "This AI system is constitutionally trustworthy",
        subject: "AI Trust System",
        predicate: "derives from",
        object: "verified constitutional primitives",
        context: "trust verification"
      }, null, 2),
    },
    {
      label: 'Partial Entity',
      desc: 'Missing some constitutional fields',
      claim: JSON.stringify({
        id: "partial-claim-002",
        definition: "A claim that has identity and relationships but is missing verification and proper lifecycle governance.",
        origin: ["user-input"],
        identity: { unique: true, id: "partial-002" },
        relationships: [{ type: "dependency", target: "external-data" }],
        constraints: {},
        lifecycle: { state: "Proposed", governed: false },
        verification: [],
        epistemic: { humble: false },
        citations: [],
        derivation: {
          chain: [],
          direction: "downward",
          valid: true
        },
        structure: { consistent: true },
        expression: {
          Subject: "Partial Claim",
          Predicate: "asserts",
          Object: "trustworthiness",
          Source: "user-input",
          Context: "testing"
        },
        reference: "partial-002",
        text: "This is a partial claim that will not pass all tests"
      }, null, 2),
    },
    {
      label: 'Plain Text',
      desc: 'Natural language claim, no JSON',
      claim: "This software is trustworthy because it passes 47/57 conformance tests, has GPG-signed commits, and its derivation chain traces to verified USCP primitives. All knowledge claims are cited and the system maintains epistemic humility.",
    }
  ],

  render() {
    return `
      <div class="animate-in">
        <div class="card">
          <div class="card-header">
            <span class="result-card-icon">🔷</span>
            <div class="card-title">Constitutional Trust Verification</div>
          </div>
          <p class="card-description mb-md">
            Enter a trust claim as JSON (with constitutional fields) or plain text.
            The verifier will parse it, check all 6 USCP primitives, 10 USC rules,
            and run 57 ICS conformance tests.
          </p>

          <div class="input-group">
            <label class="input-label" for="claim-input">Trust Claim</label>
            <textarea 
              id="claim-input" 
              class="input-field" 
              rows="6"
              placeholder='Enter JSON claim or plain text...\n\nJSON example:\n{ "id": "my-claim", "definition": "...", "identity": {...} }'
            ></textarea>
          </div>

          <button id="verify-btn" class="btn btn-primary" onclick="HomeScreen.verify()">
            🔍 Verify Claim
          </button>
        </div>

        <!-- Quick Load Examples -->
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.2rem;">⚡</span>
            <div class="card-title">Quick Load Examples</div>
          </div>
          <div class="quick-load-group">
            ${this.examples.map((ex, i) => `
              <button class="quick-load-btn" onclick="HomeScreen.loadExample(${i})">
                <span class="quick-load-btn-label">${ex.label}</span>
                <span class="quick-load-btn-desc">${ex.desc}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  bind() {
    // No additional bindings needed — onclick handlers are inline
  },

  loadExample(index) {
    const ex = this.examples[index];
    const textarea = document.getElementById('claim-input');
    if (textarea && ex) {
      textarea.value = ex.claim;
      textarea.style.borderColor = 'var(--accent)';
      setTimeout(() => textarea.style.borderColor = '', 500);
    }
  },

  async verify() {
    const textarea = document.getElementById('claim-input');
    const text = textarea.value.trim();

    if (!text) {
      textarea.style.borderColor = 'var(--error)';
      setTimeout(() => textarea.style.borderColor = '', 2000);
      return;
    }

    const btn = document.getElementById('verify-btn');
    btn.textContent = '⏳ Verifying...';
    btn.disabled = true;

    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));

    try {
      // Attempt to parse as JSON, fall back to text analysis
      let claimData;
      try {
        claimData = JSON.parse(text);
      } catch (e) {
        // Plain text — build structured claim via TrustVerifier
        claimData = TrustVerifier.analyzeClaim(text);
      }

      // Run full verification pipeline
      const result = TrustVerifier.verify(claimData.text || text);

      // Replace the analyzed claim with our parsed JSON if we had one
      if (typeof JSON.parse(text) === 'object') {
        result.claim = {
          ...result.claim,
          ...claimData,
          text: claimData.text || claimData.definition || text
        };
        // Re-run ICS with the actual parsed claim
        const icsResults = ICS.runAll(claimData);
        const icsSummary = ICS.summarize(icsResults);
        result.results.ics = { summary: icsSummary, details: icsResults };

        // Re-run USCP with actual claim
        const uscpResults = USCP.verify(claimData);
        const uscpScore = USCP.groundingScore(claimData);
        result.results.uscp = { score: uscpScore, max: 6, details: uscpResults };

        // Re-run USC with actual claim
        const uscResults = USC.verify(claimData);
        const uscScore = USC.complianceScore(claimData);
        result.results.usc = { score: uscScore, max: 10, details: uscResults };

        // Re-calculate trust
        result.trust = TrustVerifier.calculateTrust(uscpScore, uscScore, icsSummary);
      }

      // Store result in app controller
      App.lastVerifyResult = result;

      // Save to IndexedDB
      try {
        await App.db.save(result);
      } catch (e) {
        console.warn('Could not save to history:', e);
      }

      // Navigate to results
      App.navigate('results');

    } catch (e) {
      console.error('Verification error:', e);
      const container = document.getElementById('screen');
      container.innerHTML = `
        <div class="card" style="border-color: var(--error);">
          <div class="card-header">
            <span style="font-size: 1.2rem;">❌</span>
            <div class="card-title" style="color: var(--error);">Verification Error</div>
          </div>
          <p class="card-description">
            Failed to parse or verify the claim. Please check your input format.
            If entering JSON, ensure it is valid. If entering plain text, it will be
            analyzed against constitutional keywords.
          </p>
          <p style="margin-top: var(--space-sm); font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
            ${e.message || String(e)}
          </p>
          <button class="btn btn-secondary mt-md" onclick="App.navigate('home')">
            ← Back to Input
          </button>
        </div>
      `;
    }

    btn.textContent = '🔍 Verify Claim';
    btn.disabled = false;
  }
};
