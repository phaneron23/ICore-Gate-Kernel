// ICore Studyo — UCModels (Universal Canonical Models) v0.1.0
// The ontological backbone — canonical models of constitutional entities.

window.UCModels = {
  version: '0.1.0',

  // Relationship types
  relationshipTypes: {
    DERIVATION: 'derivation',    // A → B (B derived from A)
    DEPENDENCY: 'dependency',    // A ⟶ B (A depends on B)
    COMPOSITION: 'composition',  // A ⊕ B → C (compose to form C)
    SCOPE: 'scope',              // A ⊃ B (A contains B)
    EVOLUTION: 'evolution'        // A ⇒ B (A evolves into B)
  },

  // Lifecycle states
  lifecycleStates: ['Proposed', 'Active', 'Superseded', 'Deprecated', 'Retired'],

  // Constraint categories
  constraintCategories: [
    { id: 'constitutional', source: 'USC', scope: 'All entities' },
    { id: 'epistemic', source: 'UCE', scope: 'Knowledge claims' },
    { id: 'logical', source: 'UCC', scope: 'Derivations' },
    { id: 'mathematical', source: 'UCM', scope: 'Models and graphs' },
    { id: 'linguistic', source: 'UCL', scope: 'Expressions' },
    { id: 'referential', source: 'UCRS', scope: 'References' }
  ],

  // Build a canonical model for a trust claim
  buildModel(claim) {
    return {
      reference: claim.reference || null,
      definition: claim.definition || claim.text || '',
      properties: claim.properties || {},
      relationships: (claim.relationships || []).map(r => ({
        type: r.type,
        target: r.target,
        declared: true
      })),
      lifecycle: {
        state: claim.lifecycle?.state || 'Proposed',
        governed: true,
        transitions: claim.lifecycle?.transitions || []
      },
      constraints: this.getConstraints(claim)
    };
  },

  // Get applicable constraints for a claim
  getConstraints(claim) {
    const applicable = [];
    
    if (claim.text || claim.definition) {
      applicable.push(this.constraintCategories.find(c => c.id === 'constitutional'));
    }
    if (claim.knowledge) {
      applicable.push(this.constraintCategories.find(c => c.id === 'epistemic'));
    }
    if (claim.derivation) {
      applicable.push(this.constraintCategories.find(c => c.id === 'logical'));
      applicable.push(this.constraintCategories.find(c => c.id === 'mathematical'));
    }
    if (claim.expression) {
      applicable.push(this.constraintCategories.find(c => c.id === 'linguistic'));
    }
    if (claim.reference) {
      applicable.push(this.constraintCategories.find(c => c.id === 'referential'));
    }

    return applicable.filter(Boolean);
  },

  // Verify model integrity
  verifyModel(model) {
    const results = [];
    
    results.push({
      test: 'Reference',
      passed: model.reference !== null && model.reference !== undefined,
      detail: model.reference ? `Reference: ${model.reference}` : 'No reference'
    });

    results.push({
      test: 'Definition',
      passed: typeof model.definition === 'string' && model.definition.length > 0,
      detail: model.definition ? 'Definition present' : 'No definition'
    });

    results.push({
      test: 'Relationships',
      passed: Array.isArray(model.relationships),
      detail: `${model.relationships.length} relationship(s) declared`
    });

    results.push({
      test: 'Lifecycle',
      passed: model.lifecycle && typeof model.lifecycle.state === 'string',
      detail: model.lifecycle ? `State: ${model.lifecycle.state}` : 'No lifecycle'
    });

    results.push({
      test: 'Constraints',
      passed: Array.isArray(model.constraints),
      detail: `${model.constraints.length} constraint(s) applied`
    });

    return results;
  }
};
