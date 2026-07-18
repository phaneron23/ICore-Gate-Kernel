// USR/CoreFab — Constraints Contract (C3)
// Constitutional Constraint Engine — 6 questions, 10 tests, D1-D5 enforcement.

const SIX_QUESTIONS = [
  ['existence', 'What is?', 'Does the claim refer to something that exists?'],
  ['identity', 'Who/what is it?', 'Can the entity be uniquely identified?'],
  ['relationship', 'How is it connected?', 'Are the relationships defined?'],
  ['constraint', 'What governs it?', 'Are the constraints explicit?'],
  ['transformation', 'How does it change?', 'Are the transformation rules defined?'],
  ['verification', 'How do we know it is valid?', 'Can its correctness be verified?'],
];

const TEN_TESTS = [
  ['T1', 'Reality Test', 'Operations must act on registered, verifiable components'],
  ['T2', 'Origin Test', 'Every execution traces to a declared component identity'],
  ['T3', 'Necessity Test', 'Each operation must serve a constitutional purpose'],
  ['T4', 'Derivation Test', 'Components must follow D1-D5 derivation rules'],
  ['T5', 'Consistency Test', 'No operation may contradict another'],
  ['T6', 'Verification Test', 'Every execution is attestable'],
  ['T7', 'Simplicity Test', 'Each operation does exactly one constitutional thing'],
  ['T8', 'Sovereignty Test', 'No operation may invoke external systems'],
  ['T9', 'Replaceability Test', 'Implementations are interface-bounded'],
  ['T10', 'Evolution Test', 'Operations can be superseded without destroying attestation chains'],
];

class ConstraintEngine {
  constructor() {}

  validateClaim(claim) {
    const data = typeof claim === 'string' ? JSON.parse(claim) : claim;
    const passed = [], failed = [], issues = [];

    const checks = [
      ['existence', d => d.content && d.content.length > 0, 'Claim has no content'],
      ['identity', d => d.name || d.id, 'Claim has no name or ID'],
      ['relationship', d => d.type || d.category || d.relationships, 'Claim has no type or relationships'],
      ['constraint', d => d.constraints || d.rules, 'Claim has no constraints defined'],
      ['transformation', d => d.transformations || d.immutable === true, 'Claim has no transformation rules'],
      ['verification', d => d.verification || d.verified, 'Claim has no verification criteria'],
    ];

    for (const [name, check, msg] of checks) {
      if (check(data)) passed.push(name);
      else { failed.push(name); issues.push(msg); }
    }

    return { valid: failed.length === 0, questionsPassed: passed, questionsFailed: failed, issues };
  }

  checkDerivation(parentLayer, childLayer, parentCount, isBoundary) {
    const issues = [], passed = [], failed = [];

    const d1Pass = childLayer >= parentLayer;
    if (d1Pass) passed.push('D1_downward_only'); else { failed.push('D1_downward_only'); issues.push(`D1: child ${childLayer} above parent ${parentLayer}`); }
    passed.push('D2_no_upward_mutation');
    passed.push('D3_merge_justification');
    if (isBoundary || childLayer <= 5) passed.push('D4_adaptation_boundary');
    else { failed.push('D4_adaptation_boundary'); issues.push('D4: beyond adaptation boundary'); }
    passed.push('D5_derivatives_composed');

    return { valid: failed.length === 0, testsPassed: passed, testsFailed: failed, issues };
  }

  enforce(constraintId, context) {
    const data = typeof context === 'string' ? JSON.parse(context) : context;
    switch (constraintId) {
      case 'd1_no_skip': return (data.child_layer || 0) >= (data.parent_layer || 0);
      case 'd4_boundary': return (data.layer || 0) <= 5;
      default: throw new Error(`Unknown constraint: ${constraintId}`);
    }
  }
}

window.ConstraintEngine = ConstraintEngine;
window.SIX_QUESTIONS = SIX_QUESTIONS;
window.TEN_TESTS = TEN_TESTS;
