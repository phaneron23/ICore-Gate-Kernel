// ICore Studyo — UCRS (Universal Constitutional Reference System) v0.1.0
// The reference system that gives every entity a unique address.

window.UCRS = {
  version: '0.1.0',

  // Constitutional entity catalog
  catalog: [
    { ref: 'L2.USCP.primitives', name: 'USCP Primitives', layer: 2, domain: 'USCP', type: 'foundational' },
    { ref: 'L3.USC.constitution', name: 'The Constitution', layer: 3, domain: 'USC', type: 'constitutional' },
    { ref: 'L4.UCE.epistemology', name: 'Epistemology', layer: 4, domain: 'UCE', type: 'science' },
    { ref: 'L4.UCC.calculus', name: 'Calculus', layer: 4, domain: 'UCC', type: 'science' },
    { ref: 'L4.UCM.mathematics', name: 'Mathematics', layer: 4, domain: 'UCM', type: 'science' },
    { ref: 'L4.UCL.language', name: 'Language', layer: 4, domain: 'UCL', type: 'science' },
    { ref: 'L5.UCRS.reference-system', name: 'Reference System', layer: 5, domain: 'UCRS', type: 'reference' },
    { ref: 'L5.UCModels.canonical-models', name: 'Canonical Models', layer: 5, domain: 'UCModels', type: 'reference' },
    { ref: 'L5.URS.representation', name: 'Representation System', layer: 5, domain: 'URS', type: 'reference' },
    { ref: 'L5.UVS.visualization', name: 'Visualization System', layer: 5, domain: 'UVS', type: 'reference' },
    { ref: 'L6.USR.runtime', name: 'Runtime', layer: 6, domain: 'USR', type: 'runtime' },
    { ref: 'L6.UCA.adapters', name: 'Adapters', layer: 6, domain: 'UCA', type: 'runtime' },
    { ref: 'L6.UCD.derivatives', name: 'Derivatives', layer: 6, domain: 'UCD', type: 'runtime' },
    { ref: 'L7.CodeLabs.experimentation', name: 'CodeLabs', layer: 7, domain: 'CodeLabs', type: 'workspace' },
    { ref: 'L7.Studyo.workspace', name: 'Studyo', layer: 7, domain: 'Studyo', type: 'workspace' }
  ],

  // Reference rules
  rules: {
    RR1: 'Uniqueness — every reference identifies exactly one entity',
    RR2: 'Immutability — canonical references never change',
    RR3: 'Traceability — every reference includes derivation chain',
    RR4: 'Layered scope — references bounded by their layer',
    RR5: 'Governance — adding/modifying references follows Part IV'
  },

  // Resolve a reference
  resolve(ref) {
    return this.catalog.find(e => e.ref === ref) || null;
  },

  // Trace a reference back to USCP
  trace(ref) {
    const entity = this.resolve(ref);
    if (!entity) return null;

    const chain = [];
    let current = entity;
    while (current.layer > 2) {
      chain.push(current);
      // Find parent based on domain
      const parentDomain = this.getParentDomain(current.domain);
      current = this.catalog.find(e => e.domain === parentDomain);
      if (!current) break;
    }
    chain.push(current); // L2 USCP
    return chain;
  },

  getParentDomain(domain) {
    const parentMap = {
      'USC': 'USCP',
      'UCE': 'USC',
      'UCC': 'USC',
      'UCM': 'USC',
      'UCL': 'USC',
      'UCRS': 'UCL',
      'UCModels': 'UCL',
      'URS': 'UCModels',
      'UVS': 'URS',
      'USR': 'UVS',
      'UCA': 'UVS',
      'UCD': 'UVS',
      'CodeLabs': 'UCD',
      'Studyo': 'UCD'
    };
    return parentMap[domain] || 'USCP';
  },

  // Verify reference integrity
  verify() {
    const results = [];
    
    // Check completeness — all layers have entities
    const layers = [2, 3, 4, 5, 6, 7];
    const missingLayers = layers.filter(l => !this.catalog.some(e => e.layer === l));
    results.push({
      test: 'Completeness',
      passed: missingLayers.length === 0,
      detail: missingLayers.length > 0 ? `Missing layers: ${missingLayers.join(', ')}` : 'All layers populated'
    });

    // Check uniqueness — no duplicate refs
    const refs = this.catalog.map(e => e.ref);
    const uniqueRefs = new Set(refs);
    results.push({
      test: 'Uniqueness',
      passed: refs.length === uniqueRefs.size,
      detail: refs.length === uniqueRefs.size ? 'All references unique' : 'Duplicate references found'
    });

    // Check traceability — all references trace to L2
    const traces = this.catalog
      .filter(e => e.layer > 2)
      .map(e => this.trace(e.ref));
    const allTraces = traces.every(t => t && t.length > 0 && t[t.length - 1].layer === 2);
    results.push({
      test: 'Traceability',
      passed: allTraces,
      detail: allTraces ? 'All references trace to USCP' : 'Some references fail to trace'
    });

    return results;
  }
};
