// ICore Studyo — USCP (Universal Sovereign Core Primitives) v0.1.0
// The 6 foundational primitives of constitutional intelligence.

window.USCP = {
  version: '0.1.0',
  
  primitives: [
    {
      id: 'existence',
      name: 'Existence',
      number: 1,
      definition: 'Nothing can be derived from nothing. Every entity, relationship, and process must have a verifiable origin in the constitutional record.',
      question: 'Does this entity exist in the record?',
      test: (entity) => entity !== null && entity !== undefined && entity !== ''
    },
    {
      id: 'identity',
      name: 'Identity',
      number: 2,
      definition: 'Every entity must be uniquely identifiable. No two distinct entities may share the same identity.',
      question: 'Is this entity uniquely identified?',
      test: (entity) => entity && entity.id && typeof entity.id === 'string' && entity.id.length > 0
    },
    {
      id: 'relationship',
      name: 'Relationship',
      number: 3,
      definition: 'Entities exist only in relation to other entities. Every relationship must be explicitly declared and typed.',
      question: 'Are all relationships explicitly declared?',
      test: (entity) => Array.isArray(entity.relationships)
    },
    {
      id: 'constraint',
      name: 'Constraint',
      number: 4,
      definition: 'Every entity and relationship operates within defined boundaries. Boundaries must be explicit and enforceable.',
      question: 'Are all constraints defined and enforceable?',
      test: (entity) => entity && typeof entity.constraints === 'object'
    },
    {
      id: 'transformation',
      name: 'Transformation',
      number: 5,
      definition: 'Entities change state through governed processes. Every transformation must be traceable and reversible where possible.',
      question: 'Is every transformation traceable?',
      test: (entity) => entity && typeof entity.lifecycle === 'object'
    },
    {
      id: 'verification',
      name: 'Verification',
      number: 6,
      definition: 'Every claim must be independently verifiable. Verification is not optional — it is a primitive.',
      question: 'Can this entity be independently verified?',
      test: (entity) => Array.isArray(entity.verification)
    }
  ],

  // Verify an entity against all 6 primitives
  verify(entity) {
    return this.primitives.map(p => ({
      primitive: p.id,
      name: p.name,
      passed: p.test(entity),
      question: p.question
    }));
  },

  // Get grounding score (0-6)
  groundingScore(entity) {
    return this.verify(entity).filter(r => r.passed).length;
  }
};
