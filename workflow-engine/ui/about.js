window.AboutScreen = {
  render() {
    return `
      <div class="animate-in">
        <div class="card text-center">
          <div style="font-size:3rem; margin-bottom:var(--space-md);">⚙️</div>
          <h2 style="font-size:1.3rem; font-weight:800; margin-bottom:var(--space-xs);">Workflow Engine</h2>
          <p class="text-secondary" style="font-size:0.85rem;">First UCD Derivative</p>
          <p class="text-muted" style="font-size:0.75rem; margin-top:var(--space-sm);">Version 1.0.0</p>
        </div>

        <div class="about-section card">
          <h3 style="font-size:1rem; font-weight:700; margin-bottom:var(--space-sm);">🔷 What Is This</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary);">
            The Constitutional Workflow Engine is the first derivative produced by the ICore constitutional framework.
            It proves that constitutional specifications can <strong>generate</strong> practical, verifiable systems
            — not merely describe them.
          </p>
        </div>

        <div class="about-section card">
          <h3 style="font-size:1rem; font-weight:700; margin-bottom:var(--space-sm);">⚙️ How It Works</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary);">
            Workflows are built from typed steps (validate, transform, verify, execute, attest).
            Each workflow passes through constitutional validation against the 6 USCP primitives before execution.
            Every step produces attestation records. The complete attestation chain is cryptographically signed.
          </p>
        </div>

        <div class="about-section card">
          <h3 style="font-size:1rem; font-weight:700; margin-bottom:var(--space-sm);">📐 Architecture</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary);">
            Built on the <strong>ICore Platform</strong> — a shared constitutional engine containing:
          </p>
          <ul style="font-size:0.8rem; color:var(--text-secondary); margin-top:var(--space-sm); padding-left:var(--space-md);">
            <li>USR/CoreFab v0.1.0 — Execution runtime (6 contracts)</li>
            <li>UCA v0.1.0 — Adapter boundary (5 domains)</li>
            <li>UCD Derivation Tracker — D1-D5 rule enforcement</li>
            <li>EventBus — Constitutional event system</li>
            <li>ICS — Conformance verification</li>
          </ul>
        </div>

        <div class="about-section card">
          <h3 style="font-size:1rem; font-weight:700; margin-bottom:var(--space-sm);">🛡️ Principles</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary);">
            <strong>Offline-first:</strong> Zero network requests. All logic runs client-side.<br>
            <strong>Sovereign:</strong> Your data never leaves your device.<br>
            <strong>Verifiable:</strong> Every workflow produces cryptographic attestation.<br>
            <strong>Constitutional:</strong> Derived from L1-L6 specifications, not invented independently.
          </p>
        </div>

        <div class="card" style="border-color:var(--accent);">
          <div class="card-header">
            <span style="font-size:1.2rem;">✍️</span>
            <div class="card-title">Originator</div>
          </div>
          <p class="card-description">
            <strong>Sir Collins</strong> — Creator and Concept Pioneer of ICore<br>
            access1@tutamail.com
          </p>
          <p class="card-description" style="margin-top:var(--space-sm); font-style:italic;">
            "The Constitution derives the derivative. The derivative proves the Constitution."
          </p>
        </div>

        <div class="text-center mt-lg mb-lg">
          <p class="text-muted" style="font-size:0.7rem;">
            ICore Workflow Engine v1.0.0<br>
            Built on ICore Platform v1.0.0<br>
            USR/CoreFab Formal Spec v0.1.0 · UCA Formal Spec v0.1.0<br>
            © 2026 Sir Collins · All rights reserved
          </p>
        </div>
      </div>
    `;
  }
};
