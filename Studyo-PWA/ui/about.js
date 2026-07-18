// ICore Studyo — About Screen v1.3.0

window.AboutScreen = {
  render() {
    return `
      <div class="animate-in">
        <div class="card text-center">
          <div style="font-size: 3rem; margin-bottom: var(--space-md);">🔷</div>
          <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: var(--space-xs);">ICore Studyo</h2>
          <p class="text-secondary" style="font-size: 0.85rem;">Universal Constitutional Workspace</p>
          <p class="text-muted" style="font-size: 0.75rem; margin-top: var(--space-sm);">Version 1.3.0</p>
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
            ICore is a constitutional architecture, each layer derived from the one below
            through strict dependency rules. It begins with 6 foundational primitives (USCP),
            builds a Constitution (USC), develops constitutional sciences (UCE/UCC/UCM/UCL),
            establishes reference systems (UCRS/UCModels/URS/UVS), defines component models
            (UWA), networking (UCN), orchestration (USR/CoreFab), adaptation boundary (UCA),
            and culminates in derivatives (UCD) and a workspace.
          </p>
        </div>

        <!-- Structure -->
        <div class="about-section">
          <h3>🏗️ Structure</h3>
          <p>
            <strong>Foundation:</strong> ICore → USCP → USC<br>
            <strong>Sciences:</strong> UCE · UCC · UCM · UCL<br>
            <strong>Reference:</strong> UCRS · UCModels · URS · UVS<br>
            <strong>Platforms:</strong> UWA · UCN · USR/CoreFab · UCA<br>
            <strong>Applications:</strong> UCD · ICS · Studyo
          </p>
        </div>

        <!-- Formal Specifications -->
        <div class="about-section">
          <h3>📜 Formal Specifications</h3>
          <p>
            <strong>USR/CoreFab v0.1.0</strong> — Constitutional execution engine.<br>
            6 contracts (Identity, Execution, Constraints, Isolation, Attestation,
            Orchestration). 5 runtime axioms. 31 invariants. 15 conformance tests.
            Deterministic, capability-based, self-attesting.<br><br>
            <strong>UCA v0.1.0</strong> — Universal adapter boundary.<br>
            4 adapter axioms. 5 domains (Naming, Serialization, Execution, Storage,
            Communication). 13 reference adapters. 12 conformance tests. Sovereignty
            guarantee: constitution never depends on any adapter.
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
            <strong>Zero tracking:</strong> No analytics, no telemetry.<br>
            <strong>Zero external requests:</strong> All assets bundled.
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
            Runtime engine uses SubtleCrypto for SHA-256 attestation chains.
          </p>
        </div>

        <div class="text-center mt-lg mb-lg">
          <p class="text-muted" style="font-size: 0.7rem;">
            ICore Constitutional Specification v0.1.0<br>
            USR/CoreFab Formal Specification v0.1.0<br>
            UCA Formal Specification v0.1.0<br>
            Self-verified · GPG-signed · Immutable record<br>
            © 2026 Sir Collins · All rights reserved
          </p>
        </div>
      </div>
    `;
  }
};
