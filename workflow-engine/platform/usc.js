// ICore Studyo — USC (Universal Sovereign Core) v0.1.0
// The constitutional rules derived from USCP.

window.USC = {
  version: '0.1.0',

  // Constitutional rules (from Kernel Parts I-V)
  rules: [
    {
      id: 'R1',
      name: 'Origin Grounding',
      source: 'USCP-E1',
      description: 'Every entity must trace its origin to a verifiable source in the record.',
      appliesTo: 'all',
      test: (claim) => claim && claim.origin && claim.origin.length > 0
    },
    {
      id: 'R2',
      name: 'Derivation Integrity',
      source: 'Kernel Part II',
      description: 'Every derivation follows approved rules: from parent, not peers or descendants.',
      appliesTo: 'derivation',
      test: (claim) => claim && claim.derivation && claim.derivation.direction === 'downward'
    },
    {
      id: 'R3',
      name: 'Identity Uniqueness',
      source: 'USCP-E2',
      description: 'No two entities share the same identity. Every entity has a unique reference.',
      appliesTo: 'identity',
      test: (claim) => claim && claim.identity && claim.identity.unique === true
    },
    {
      id: 'R4',
      name: 'Explicit Relationships',
      source: 'USCP-E3',
      description: 'All relationships between entities must be explicitly declared and typed.',
      appliesTo: 'relationships',
      test: (claim) => claim && Array.isArray(claim.relationships) && claim.relationships.length > 0
    },
    {
      id: 'R5',
      name: 'Governed Change',
      source: 'Kernel Part IV',
      description: 'Entity state changes follow a 6-stage governance pipeline.',
      appliesTo: 'lifecycle',
      test: (claim) => claim && claim.lifecycle && claim.lifecycle.governed === true
    },
    {
      id: 'R6',
      name: 'Knowledge Citation',
      source: 'UCE-C1',
      description: 'Every knowledge claim requires citation to a verifiable source.',
      appliesTo: 'epistemic',
      test: (claim) => claim && claim.citations && claim.citations.length > 0
    },
    {
      id: 'R7',
      name: 'Logical Traceability',
      source: 'UCC-T2-11',
      description: 'Every derivation chain must be traceable from conclusion to premise.',
      appliesTo: 'logical',
      test: (claim) => claim && claim.derivation && Array.isArray(claim.derivation.chain)
    },
    {
      id: 'R8',
      name: 'Structural Consistency',
      source: 'UCM',
      description: 'All structural representations must be consistent with the canonical models.',
      appliesTo: 'structural',
      test: (claim) => claim && claim.structure && claim.structure.consistent === true
    },
    {
      id: 'R9',
      name: 'Expressive Precision',
      source: 'UCL',
      description: 'All expressions must use the canonical vocabulary and 5-field structure.',
      appliesTo: 'linguistic',
      test: (claim) => claim && claim.expression && claim.expression.canonical === true
    },
    {
      id: 'R10',
      name: 'Reference Integrity',
      source: 'UCRS-RR1-RR5',
      description: 'All references must be unique, immutable, traceable, scoped, and governed.',
      appliesTo: 'referential',
      test: (claim) => claim && claim.reference && (claim.referenceValid === true || typeof claim.reference === 'string')
    }
  ],

  // Verify a claim against all 10 rules
  verify(claim) {
    return this.rules.map(rule => ({
      rule: rule.id,
      name: rule.name,
      source: rule.source,
      passed: rule.test(claim),
      description: rule.description
    }));
  },

  // Get compliance score (0-10)
  complianceScore(claim) {
    return this.verify(claim).filter(r => r.passed).length;
  }
};
