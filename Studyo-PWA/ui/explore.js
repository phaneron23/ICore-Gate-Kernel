// ICore Studyo — Explore Screen

window.ExploreScreen = {
  selectedLayer: null,

  render() {
    const layers = [
      { num: 'L1', name: 'ICore', desc: 'The founding principle', entities: ['InitialCore — Universal Constitutional Science of Trustworthy Intelligence'], status: 'complete' },
      { num: 'L2', name: 'USCP', desc: '6 Foundational Primitives', entities: ['Existence', 'Identity', 'Relationship', 'Constraint', 'Transformation', 'Verification'], status: 'complete' },
      { num: 'L3', name: 'USC', desc: 'The Constitution v1.0', entities: ['Kernel Part I–V', 'Frozen & timestamped July 14, 2026'], status: 'complete' },
      { num: 'L4', name: 'Sciences', desc: 'UCE · UCC · UCM · UCL', entities: ['Epistemology', 'Calculus', 'Mathematics', 'Language'], status: 'complete' },
      { num: 'L5', name: 'Reference', desc: 'UCRS · UCModels · URS · UVS', entities: ['Reference System', 'Canonical Models', 'Representation', 'Visualization'], status: 'complete' },
      { num: 'ICS', name: 'Conformance', desc: '57 Tests · C3 Certified', entities: ['Tier 1 (15)', 'Tier 2 (32)', 'Tier 3 (10)', 'CR-2026-001'], status: 'complete' },
      { num: 'L6', name: 'Runtime', desc: 'USR · UCA · UCD', entities: ['Runtime', 'Adapters', 'Derivatives'], status: 'complete' },
      { num: 'L7', name: 'Workspace', desc: 'CodeLabs · Studyo', entities: ['Experimentation', 'This App'], status: 'complete' }
    ];

    return `
      <div class="animate-in">
        <div class="card">
          <div class="card-header">
            <span style="font-size: 1.5rem;">🗺️</span>
            <div class="card-title">Constitutional Architecture</div>
          </div>
          <p class="card-description mb-md">
            7 layers. Dependency-driven. Each layer derives from the one below.
            Tap any layer to explore its contents.
          </p>
        </div>

        <!-- Layer Graph -->
        <div class="card" style="padding: var(--space-md);">
          <svg viewBox="0 0 400 500" style="width: 100%; height: auto;" xmlns="http://www.w3.org/2000/svg">
            <!-- Connection lines -->
            <line x1="200" y1="45" x2="200" y2="75" stroke="#2a2a3a" stroke-width="2"/>
            <line x1="200" y1="115" x2="200" y2="145" stroke="#2a2a3a" stroke-width="2"/>
            <line x1="200" y1="185" x2="200" y2="215" stroke="#2a2a3a" stroke-width="2"/>
            <line x1="200" y1="255" x2="200" y2="285" stroke="#2a2a3a" stroke-width="2"/>
            <line x1="200" y1="325" x2="200" y2="355" stroke="#2a2a3a" stroke-width="2"/>
            <line x1="200" y1="395" x2="200" y2="425" stroke="#2a2a3a" stroke-width="2"/>
            <line x1="200" y1="465" x2="200" y2="490" stroke="#2a2a3a" stroke-width="2"/>
            
            <!-- L1 -->
            <rect x="120" y="25" width="160" height="30" rx="6" fill="#1a1a25" stroke="#00e676" stroke-width="1.5"/>
            <text x="200" y="45" text-anchor="middle" fill="#00e676" font-size="11" font-weight="600" font-family="system-ui">L1 · ICore</text>
            
            <!-- L2 -->
            <rect x="120" y="85" width="160" height="30" rx="6" fill="#1a1a25" stroke="#00e676" stroke-width="1.5"/>
            <text x="200" y="105" text-anchor="middle" fill="#00e676" font-size="11" font-weight="600" font-family="system-ui">L2 · USCP (6)</text>
            
            <!-- L3 -->
            <rect x="120" y="155" width="160" height="30" rx="6" fill="#1a1a25" stroke="#00e676" stroke-width="1.5"/>
            <text x="200" y="175" text-anchor="middle" fill="#00e676" font-size="11" font-weight="600" font-family="system-ui">L3 · USC Kernel</text>
            
            <!-- L4 -->
            <rect x="120" y="225" width="160" height="30" rx="6" fill="#1a1a25" stroke="#00e676" stroke-width="1.5"/>
            <text x="200" y="245" text-anchor="middle" fill="#00e676" font-size="11" font-weight="600" font-family="system-ui">L4 · UCE/UCC/UCM/UCL</text>
            
            <!-- L5 -->
            <rect x="120" y="295" width="160" height="30" rx="6" fill="#1a1a25" stroke="#00e676" stroke-width="1.5"/>
            <text x="200" y="315" text-anchor="middle" fill="#00e676" font-size="11" font-weight="600" font-family="system-ui">L5 · Reference Systems</text>
            
            <!-- L6 -->
            <rect x="120" y="365" width="160" height="30" rx="6" fill="#1a1a25" stroke="#00e676" stroke-width="1.5"/>
            <text x="200" y="385" text-anchor="middle" fill="#00e676" font-size="11" font-weight="600" font-family="system-ui">L6 · Runtime</text>
            
            <!-- L7 -->
            <rect x="120" y="435" width="160" height="30" rx="6" fill="#1a1a25" stroke="#00e676" stroke-width="1.5"/>
            <text x="200" y="455" text-anchor="middle" fill="#00e676" font-size="11" font-weight="600" font-family="system-ui">L7 · Workspace</text>
          </svg>
        </div>

        <!-- Layer Details -->
        <div class="layer-grid">
          ${layers.map((l, i) => `
            <div class="layer-item" onclick="ExploreScreen.toggleLayer(${i})">
              <div class="layer-number">${l.num}</div>
              <div class="layer-info">
                <div class="layer-name">${l.name}</div>
                <div class="layer-desc">${l.desc}</div>
              </div>
              <div class="layer-status status-complete">✅</div>
            </div>
            <div id="layer-detail-${i}" class="card" style="display:none; margin-top: -8px; margin-bottom: var(--space-sm);">
              <ul class="test-list">
                ${l.entities.map(e => `
                  <li class="test-item">
                    <span class="test-icon test-pass">•</span>
                    <span>${e}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  toggleLayer(index) {
    const el = document.getElementById(`layer-detail-${index}`);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  }
};
