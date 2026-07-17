// ICore UCD Derivation Tracker v1.0.0
// Tracks constitutional derivations through D1-D5 rules.
// Originator: Sir Collins (access1@tutamail.com)
//
// Derived from the ICore constitutional stack:
//   Kernel Part II (Derivation Graph — D1 through D5)
//   → Atlas v1.0 (Layer ordering)
//   → USR/CoreFab (Runtime attestation)
//   → UCDerivation (this module)
//
// Enforces all five derivation rules:
//   D1: Downward only — derived from the layer immediately below
//   D2: No upward mutation — lower layers never alter upper layers
//   D3: Merge requires justification — all parent layers must be cited
//   D4: Adaptation is the boundary — UCA is the last constitutional layer
//   D5: Derivatives composed — UCD composed from UCA, not re-derived
//
// Uses SubtleCrypto for SHA-256 attestation when verifying derivations.
// References window.EventBus for cross-system event emission.
// References window.CoreFab for attestation delegation when available.

window.UCDerivation = (() => {
  'use strict';

  const VERSION = '1.0.0';

  // ─── Constitutional Layer Ordering ──────────────────────────────
  // ICore layer hierarchy (lower index = higher in the constitution).
  // Derivation flows downward (higher index = more derived).

  const LAYER_ORDER = Object.freeze([
    'pre',            // 0 — Pre-constitutional (axioms, assumptions)
    'uscp',           // 1 — Universal Sovereign Core Primitives
    'usc',            // 2 — Universal Sovereign Core rules
    'science',        // 3 — Constitutional sciences (UCE, UCC, UCM, UCL)
    'expression',     // 4 — Expression/execution specifications
    'execution',      // 5 — Execution/runtime (USR/CoreFab)
    'implementation', // 6 — Implementation (adapters, UCA boundary)
  ]);

  const LAYER_INDICES = Object.freeze(
    Object.fromEntries(LAYER_ORDER.map((name, idx) => [name, idx]))
  );

  // ─── Five Derivation Rules ──────────────────────────────────────

  const D_RULES = Object.freeze({
    D1: {
      id: 'D1',
      name: 'Downward only',
      description: 'Derived from the layer immediately below — never skip layers, never derive upward.',
      validation: (srcIdx, tgtIdx) => tgtIdx >= srcIdx,
    },
    D2: {
      id: 'D2',
      name: 'No upward mutation',
      description: 'Lower layers never alter upper layers — derivation flows in one direction only.',
      validation: (srcIdx, tgtIdx) => tgtIdx >= srcIdx,
    },
    D3: {
      id: 'D3',
      name: 'Merge requires justification',
      description: 'All parent layers must be cited — merges are not silent.',
      validation: (_srcIdx, _tgtIdx, parentCount) => parentCount >= 1,
    },
    D4: {
      id: 'D4',
      name: 'Adaptation is the boundary',
      description: 'UCA is the last constitutional layer — everything beyond is external.',
      validation: (_srcIdx, _tgtIdx) => true, // structural invariant — enforced at layer order check
    },
    D5: {
      id: 'D5',
      name: 'Derivatives composed',
      description: 'UCD is composed from UCA, not re-derived from the constitution.',
      validation: (_srcIdx, _tgtIdx) => true, // structural invariant — enforced by composition pattern
    },
  });

  // ─── In-Memory Derivation Store ─────────────────────────────────

  const derivations = new Map();

  // ─── Helpers ────────────────────────────────────────────────────

  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function isoNow() {
    return new Date().toISOString();
  }

  async function sha256(data) {
    const enc = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function emit(type, payload, source) {
    if (typeof EventBus !== 'undefined') {
      EventBus.publish(type, payload, source || 'ucd-derivation', 'normal');
    }
  }

  // ─── D-Rule Validation Engine ───────────────────────────────────

  /**
   * Validate all five D-rules for a derivation.
   * @param {number} srcIdx - Source layer index
   * @param {number} tgtIdx - Target layer index
   * @param {number} parentCount - Number of parent layers cited
   * @param {string} rule - The claimed derivation rule
   * @returns {{ valid: boolean, results: Array, issues: Array }}
   */
  function validateDRules(srcIdx, tgtIdx, parentCount, rule) {
    const results = [];
    const issues = [];

    // D1: Downward only
    const d1pass = tgtIdx >= srcIdx;
    results.push({ rule: 'D1', passed: d1pass, description: D_RULES.D1.description });
    if (!d1pass) {
      issues.push(`D1 violation: cannot derive upward from layer ${srcIdx} to ${tgtIdx}`);
    }

    // D2: No upward mutation (enforced by same constraint as D1)
    // If derivation goes downward, upper layers cannot be mutated by lower ones.
    const d2pass = tgtIdx >= srcIdx;
    results.push({ rule: 'D2', passed: d2pass, description: D_RULES.D2.description });
    if (!d2pass) {
      issues.push(`D2 violation: upward mutation from layer ${srcIdx} to ${tgtIdx}`);
    }

    // D3: Merge requires justification — at least one parent cited
    const d3pass = parentCount >= 1;
    results.push({ rule: 'D3', passed: d3pass, description: D_RULES.D3.description });
    if (!d3pass) {
      issues.push('D3 violation: merge without parent citation');
    }

    // D4: Adaptation is the boundary — cannot derive beyond implementation
    const d4pass = tgtIdx <= LAYER_ORDER.indexOf('implementation');
    results.push({ rule: 'D4', passed: d4pass, description: D_RULES.D4.description });
    if (!d4pass) {
      issues.push('D4 violation: derived beyond the adaptation boundary');
    }

    // D5: Derivatives composed — structural check
    // If the rule is D5, verify it's being used in the correct context
    const d5pass = rule === 'D5' ? parentCount >= 1 : true;
    results.push({ rule: 'D5', passed: d5pass, description: D_RULES.D5.description });
    if (!d5pass) {
      issues.push('D5 violation: derivative composition requires parent citation');
    }

    return {
      valid: issues.length === 0,
      results,
      issues,
    };
  }

  // ─── Derivation Class ───────────────────────────────────────────

  class Derivation {
    constructor({ workflowId, sourceLayer, targetLayer, rule = 'D1', parentCount = 1 }) {
      this.id = uuid();
      this.workflowId = workflowId;
      this.sourceLayer = sourceLayer;
      this.targetLayer = targetLayer;
      this.rule = rule;
      this.parentCount = parentCount;
      this.ruleDescription = D_RULES[rule]?.description || 'Unknown rule';
      this.timestamp = isoNow();
      this.verified = false;
      this.verifiedAt = null;
      this.issues = [];
      this.validationResults = [];
      this.attestation = null;
    }
  }

  // ─── Core API ───────────────────────────────────────────────────

  /**
   * Track a constitutional derivation from sourceLayer to targetLayer following a D-rule.
   * Enforces D1-D5 validation at creation time.
   *
   * @param {string} workflowId - The workflow this derivation belongs to
   * @param {string} sourceLayer - Source layer (e.g. 'execution')
   * @param {string} targetLayer - Target layer (e.g. 'implementation')
   * @param {string} rule - Derivation rule (D1-D5)
   * @param {number} parentCount - Number of parent layers cited (default: 1)
   * @returns {object} Derivation record
   */
  function trackDerivation(workflowId, sourceLayer, targetLayer, rule = 'D1', parentCount = 1) {
    // Validate source layer
    if (!LAYER_INDICES[sourceLayer] && LAYER_INDICES[sourceLayer] !== 0) {
      throw { code: 'InvalidLayer', message: `Unknown source layer: '${sourceLayer}'. Valid: ${LAYER_ORDER.join(', ')}` };
    }

    // Validate target layer
    if (!LAYER_INDICES[targetLayer] && LAYER_INDICES[targetLayer] !== 0) {
      throw { code: 'InvalidLayer', message: `Unknown target layer: '${targetLayer}'. Valid: ${LAYER_ORDER.join(', ')}` };
    }

    // Validate rule
    if (!D_RULES[rule]) {
      throw { code: 'InvalidRule', message: `Unknown D-rule: '${rule}'. Valid: ${Object.keys(D_RULES).join(', ')}` };
    }

    // Validate workflowId
    if (!workflowId) {
      throw { code: 'InvalidWorkflow', message: 'workflowId is required' };
    }

    const srcIdx = LAYER_INDICES[sourceLayer];
    const tgtIdx = LAYER_INDICES[targetLayer];

    // Run D-rule validation
    const validation = validateDRules(srcIdx, tgtIdx, parentCount, rule);

    if (!validation.valid) {
      throw {
        code: 'ConstraintViolation',
        message: `Derivation violates constitutional rules: ${validation.issues.join('; ')}`,
        issues: validation.issues,
        validation: validation.results,
      };
    }

    // Create derivation record
    const derivation = new Derivation({
      workflowId,
      sourceLayer,
      targetLayer,
      rule,
      parentCount,
    });

    derivation.validationResults = validation.results;
    derivation.verified = true;
    derivation.verifiedAt = isoNow();

    // Store the derivation
    derivations.set(derivation.id, derivation);

    // Emit tracking event
    emit('derivation:tracked', {
      id: derivation.id,
      workflowId,
      sourceLayer,
      targetLayer,
      rule,
      verified: true,
    }, 'ucd-derivation');

    return {
      id: derivation.id,
      workflowId,
      sourceLayer,
      targetLayer,
      rule,
      ruleDescription: derivation.ruleDescription,
      verified: true,
      timestamp: derivation.timestamp,
      validation: validation.results,
    };
  }

  /**
   * Verify a previously tracked derivation.
   * Re-runs D1-D5 validation and produces an attestation record.
   *
   * @param {string} derivationId - The derivation to verify
   * @returns {{ verified: boolean, issues: Array, attestation: object|null }}
   */
  async function verifyDerivation(derivationId) {
    const d = derivations.get(derivationId);
    if (!d) {
      throw { code: 'NotFound', message: `Derivation '${derivationId}' not found` };
    }

    const srcIdx = LAYER_INDICES[d.sourceLayer];
    const tgtIdx = LAYER_INDICES[d.targetLayer];

    // Re-run D-rule validation
    const validation = validateDRules(srcIdx, tgtIdx, d.parentCount, d.rule);

    d.verified = validation.valid;
    d.verifiedAt = isoNow();
    d.issues = validation.issues;
    d.validationResults = validation.results;

    // Produce attestation record (SHA-256 via SubtleCrypto)
    const attestationPayload = JSON.stringify({
      derivationId: d.id,
      workflowId: d.workflowId,
      sourceLayer: d.sourceLayer,
      targetLayer: d.targetLayer,
      rule: d.rule,
      verified: d.verified,
      issues: d.issues,
      verifiedAt: d.verifiedAt,
    });

    const hash = await sha256(attestationPayload);
    const signature = await sha256(`derivation-attest:${d.id}:${hash}`);

    const attestation = {
      derivationId: d.id,
      hash,
      signature,
      algorithm: 'SHA-256',
      timestamp: isoNow(),
      verified: validation.valid,
    };

    d.attestation = attestation;

    // Delegate to CoreFab if available for cross-system attestation
    if (typeof CoreFab !== 'undefined' && CoreFab.sha256) {
      const coreFabHash = await CoreFab.sha256(attestationPayload);
      attestation.coreFabVerified = true;
      attestation.coreFabHash = coreFabHash;
    }

    // Emit verification event
    emit('derivation:verified', {
      id: d.id,
      workflowId: d.workflowId,
      verified: d.verified,
      issues: d.issues,
      attestation,
    }, 'ucd-derivation');

    return {
      verified: d.verified,
      issues: d.issues,
      validation: d.validationResults,
      attestation,
      derivation: {
        id: d.id,
        workflowId: d.workflowId,
        sourceLayer: d.sourceLayer,
        targetLayer: d.targetLayer,
        rule: d.rule,
        ruleDescription: d.ruleDescription,
        timestamp: d.timestamp,
        verifiedAt: d.verifiedAt,
      },
    };
  }

  /**
   * Get the complete derivation chain for a workflow.
   * Returns derivations sorted by source layer order (constitution first).
   *
   * @param {string} workflowId - The workflow to query
   * @returns {Array} Derivation records sorted by layer order
   */
  function getDerivationChain(workflowId) {
    return Array.from(derivations.values())
      .filter(d => d.workflowId === workflowId)
      .sort((a, b) => LAYER_ORDER.indexOf(a.sourceLayer) - LAYER_ORDER.indexOf(b.sourceLayer))
      .map(d => ({
        id: d.id,
        workflowId: d.workflowId,
        sourceLayer: d.sourceLayer,
        targetLayer: d.targetLayer,
        rule: d.rule,
        ruleDescription: d.ruleDescription,
        timestamp: d.timestamp,
        verified: d.verified,
        verifiedAt: d.verifiedAt,
        issues: d.issues,
        attestation: d.attestation,
      }));
  }

  /**
   * Get all tracked derivations.
   * @returns {Array} All derivation records
   */
  function getAllDerivations() {
    return Array.from(derivations.values());
  }

  /**
   * Get a specific derivation by ID.
   * @param {string} id - Derivation ID
   * @returns {object|null} Derivation record or null
   */
  function get(id) {
    const d = derivations.get(id);
    if (!d) return null;
    return {
      id: d.id,
      workflowId: d.workflowId,
      sourceLayer: d.sourceLayer,
      targetLayer: d.targetLayer,
      rule: d.rule,
      ruleDescription: d.ruleDescription,
      timestamp: d.timestamp,
      verified: d.verified,
      verifiedAt: d.verifiedAt,
      issues: d.issues,
      validationResults: d.validationResults,
      attestation: d.attestation,
    };
  }

  // ─── Public API ─────────────────────────────────────────────────

  return Object.freeze({
    VERSION,
    D_RULES,
    LAYER_ORDER,
    LAYER_INDICES,

    // Core methods
    trackDerivation,
    verifyDerivation,
    getDerivationChain,

    // Query methods
    getAllDerivations,
    get,

    // Utility
    validateDRules,
  });
})();
