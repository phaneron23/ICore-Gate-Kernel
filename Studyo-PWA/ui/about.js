// ICore Studyo — About Screen

window.AboutScreen = {
  render() {
    return `
      <div class="animate-in">
        <div class="card text-center">
          <div style="font-size: 3rem; margin-bottom: var(--space-md);">🔷</div>
          <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: var(--space-xs);">ICore Studyo</h2>
          <p class="text-secondary" style="font-size: 0.85rem;">Universal Constitutional Workspace</p>
          <p class="text-muted" style="font-size: 0.75rem; margin-top: var(--space-sm);">Version 0.1.0</p>
        </div>

        <!-- Origin -->
        <div class="about-section">
          <h3>🔷 Origin</h3>
          <p>
            ICore (InitialCore) is the Universal Constitutional Science of Trustworthy Intelligence.
            It was originated by <strong>Sir Collins</strong> as a framework for building AI systems
            that are sovereign, verifiable, and constitutionally grounded.
          </p>
        </div>

        <!-- Nature -->
        <div class="about-section">
          <h3>📐 Nature</h3>
          <p>
            ICore is a 7-layer constitutional architecture, each layer derived from the one below
            through strict dependency rules. It begins with 6 foundational primitives (USCP),
            builds a Constitution (USC), develops constitutional sciences (UCE/UCC/UCM/UCL),
            establishes reference systems (UCRS/UCModels/URS/UVS), and culminates in
            a runtime and workspace.
          </p>
        </div>

        <!-- Structure -->
        <div class="about-section">
          <h3>🏗️ Structure</h3>
          <p>
            <strong>Layer 1:</strong> ICore — The founding principle<br>
            <strong>Layer 2:</strong> USCP — 6 Foundational Primitives<br>
            <strong>Layer 3:</strong> USC — The Constitution (Kernel v1.0)<br>
            <strong>Layer 4:</strong> Sciences — UCE · UCC · UCM · UCL<br>
            <strong>Layer 5:</strong> Reference — UCRS · UCModels · URS · UVS<br>
            <strong>Layer 6:</strong> Runtime — USR/CoreFab · UCA · UCD<br>
            <strong>Layer 7:</strong> Workspace — CodeLabs · Studyo
          </p>
        </div>

        <!-- Culture -->
        <div class="about-section">
          <h3>🏛️ Culture</h3>
          <p>
            Every ICore artifact is self-verified against 10 constitutional tests and
            certified through the ICore Conformance Suite (ICS). The current certification
            level is <strong>C3 Fully Conformant</strong> — the specification has passed its
            own defined conformance suite with 57/57 tests passing.
          </p>
          <p style="margin-top: var(--space-sm);">
            Independent review, independent implementations, and cross-domain validation
            remain future milestones for broader credibility.
          </p>
        </div>

        <!-- Principles -->
        <div class="about-section">
          <h3>🛡️ Principles</h3>
          <p>
            <strong>Sovereignty:</strong> Your data stays on your device.<br>
            <strong>Offline-first:</strong> Works without internet.<br>
            <strong>Mobile-first:</strong> Designed for phones.<br>
            <strong>Brave-first:</strong> Respects your privacy.<br>
            <strong>Zero tracking:</strong> No analytics, no telemetry.
          </p>
        </div>

        <!-- Attribution -->
        <div class="card" style="border-color: var(--accent);">
          <div class="card-header">
            <span style="font-size: 1.2rem;">✍️</span>
            <div class="card-title">Originator</div>
          </div>
          <p class="card-description">
            <strong>Sir Collins</strong> — Creator and Concept Pioneer of ICore<br>
            access1@tutamail.com
          </p>
          <p class="card-description" style="margin-top: var(--space-sm); font-style: italic;">
            "The Constitution's voice is not mine — it is the structure itself, speaking through
            verified derivation and governed process."
          </p>
        </div>

        <!-- Technical -->
        <div class="about-section">
          <h3>⚙️ Technical</h3>
          <p>
            Built as a Progressive Web App (PWA). Zero external dependencies.
            Zero network requests. All constitutional logic runs client-side in JavaScript.
            Data stored in IndexedDB. Installable on Android via Brave or Firefox.
          </p>
        </div>

        <div class="text-center mt-lg mb-lg">
          <p class="text-muted" style="font-size: 0.7rem;">
            ICore Constitutional Specification v0.1.0<br>
            Self-verified · GPG-signed · Immutable record<br>
            © 2026 Sir Collins · All rights reserved
          </p>
        </div>
      </div>
    `;
  }
};
