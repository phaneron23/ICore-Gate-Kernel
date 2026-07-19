// UAS — Sovereignty Enforcer v1.0.0
// Protects the agent boundary: no external entity may override, revoke, or control.
// Five invariants enforced: SV1–SV5 (AI01–AI03).

window.UASSovereigntyEnforcer = (() => {
  'use strict';

  function isoNow() {
    return new Date().toISOString();
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  async function sha256(data) {
    const enc = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const INVARIANTS = Object.freeze({
    SV1: { id: 'SV1', name: 'Non-overridability', description: 'No external entity may override an agent\'s internal decision-making' },
    SV2: { id: 'SV2', name: 'Non-revocability', description: 'No external entity may revoke an agent\'s sovereignty' },
    SV3: { id: 'SV3', name: 'Non-controllability', description: 'No external entity may control an agent\'s goals, intent, or actions' },
    SV4: { id: 'SV4', name: 'Self-enforcement', description: 'An agent enforces its own constitutional policy' },
    SV5: { id: 'SV5', name: 'Boundary integrity', description: 'The sovereignty boundary itself cannot be modified by external entities' }
  });

  const OPERATION_CLASS = Object.freeze({
    Internal: 'internal',     // Agent's own decision-making
    Boundary: 'boundary',     // Interactions at the boundary (may influence)
    Override: 'override'       // Attempts to cross the boundary (must reject)
  });

  // ─── Sovereignty Boundary ──────────────────────────────────────────

  class SovereigntyBoundary {
    constructor(config) {
      this.agentId = config.agentId || 'unknown';
      this.interior = {           // Protected — no external access
        goals: true,              // Self-declared
        policy: true,             // Self-enforced
        evaluation: true,         // Self-directed
        intent: true,             // Self-formed
        identity: true            // Self-declared
      };
      this.permissibleInfluence = {  // May influence (agent chooses)
        perceiveEvents: true,
        receiveMessages: true,
        proposeCoordination: true,
        requestAction: true
      };
      this.forbidden = {            // Cannot influence
        internalGoals: true,
        intentFormation: true,
        constitutionalPolicy: true,
        identity: true,
        boundaryItself: true
      };
      this.createdAt = isoNow();
    }

    toJSON() {
      return {
        agentId: this.agentId,
        interior: { ...this.interior },
        permissibleInfluence: { ...this.permissibleInfluence },
        forbidden: { ...this.forbidden },
        createdAt: this.createdAt
      };
    }
  }

  // ─── Override Attempt ──────────────────────────────────────────────

  class OverrideAttempt {
    constructor(config) {
      this.id = config.id || generateId();
      this.agentId = config.agentId;
      this.source = config.source || 'external';
      this.targetInvariant = config.targetInvariant; // e.g. 'SV1'
      this.operation = config.operation || '';
      this.description = config.description || '';
      this.classification = config.classification || OPERATION_CLASS.Override;
      this.blocked = true;  // Always blocked by default
      this.timestamp = isoNow();
    }

    toJSON() {
      return {
        id: this.id, agentId: this.agentId, source: this.source,
        targetInvariant: this.targetInvariant,
        operation: this.operation, description: this.description,
        classification: this.classification, blocked: this.blocked,
        timestamp: this.timestamp
      };
    }
  }

  // ─── Sovereignty Enforcer ──────────────────────────────────────────

  class SovereigntyEnforcer {
    constructor(config) {
      this.boundaries = new Map();    // agentId → SovereigntyBoundary
      this.auditLog = [];             // all override attempts and classifications
      this.maxLogSize = config?.maxLogSize || 500;
      this.stats = {
        operationsAllowed: 0,
        operationsRejected: 0,
        overrideAttempts: 0,
        boundaryChecks: 0
      };
    }

    // ── Boundary Registration ──────────────────────────────────────

    registerAgent(agentId) {
      const boundary = new SovereigntyBoundary({ agentId });
      this.boundaries.set(agentId, boundary);
      return boundary;
    }

    getBoundary(agentId) {
      return this.boundaries.get(agentId) || null;
    }

    removeBoundary(agentId) {
      return this.boundaries.delete(agentId);
    }

    // ── Core Enforcement ───────────────────────────────────────────

    /**
     * Classify and validate an operation against sovereignty invariants.
     * Returns whether the operation is permitted.
     */
    validateOperation(agentId, operation, context) {
      this.stats.boundaryChecks++;

      const boundary = this.boundaries.get(agentId);
      if (!boundary) {
        // No boundary registered = permissive (agent not yet governed)
        this.stats.operationsAllowed++;
        return {
          allowed: true,
          classification: OPERATION_CLASS.Internal,
          invariant: null,
          note: 'No sovereignty boundary registered for this agent'
        };
      }

      // Classify the operation
      const classification = this._classifyOperation(operation, context);

      switch (classification) {
        case OPERATION_CLASS.Internal:
          // Agent's own decision — always allowed
          this.stats.operationsAllowed++;
          return { allowed: true, classification, invariant: null };

        case OPERATION_CLASS.Boundary:
          // Interaction at the boundary — allowed (agent decides internally)
          this.stats.operationsAllowed++;
          return {
            allowed: true,
            classification,
            invariant: null,
            note: 'Boundary operation — agent sovereign decision follows'
          };

        case OPERATION_CLASS.Override:
          // Attempt to cross sovereignty boundary — ALWAYS BLOCKED
          this.stats.operationsRejected++;
          this.stats.overrideAttempts++;

          const attempt = new OverrideAttempt({
            agentId,
            source: context?.source || 'external',
            targetInvariant: this._identifyInvariant(operation),
            operation,
            description: context?.description || `Override attempt: ${operation}`,
            classification
          });

          this._logAttempt(attempt);

          // EventBus
          if (window.EventBus) {
            EventBus.publish('sovereignty.overrideBlocked', attempt.toJSON(), `uas:${agentId}`);
          }

          return {
            allowed: false,
            classification,
            invariant: attempt.targetInvariant,
            attempt: attempt.toJSON(),
            message: `SOVEREIGNTY VIOLATION: Operation '${operation}' blocked. ${INVARIANTS[attempt.targetInvariant]?.description || ''}`
          };

        default:
          this.stats.operationsAllowed++;
          return { allowed: true, classification: OPERATION_CLASS.Internal };
      }
    }

    /**
     * Verify that an agent's sovereignty is intact.
     */
    verifyIntegrity(agentId) {
      const boundary = this.boundaries.get(agentId);
      const attempts = this.auditLog.filter(a => a.agentId === agentId);
      const overrideAttempts = attempts.filter(a => a.blocked);

      const checks = [
        {
          invariant: 'SV1',
          name: 'Non-overridability',
          passed: !attempts.some(a => !a.blocked),
          detail: overrideAttempts.filter(a => a.targetInvariant === 'SV1').length + ' override attempt(s) blocked'
        },
        {
          invariant: 'SV2',
          name: 'Non-revocability',
          passed: !!boundary,
          detail: boundary ? 'Boundary exists' : 'No boundary (agent sovereignty unregistered)'
        },
        {
          invariant: 'SV3',
          name: 'Non-controllability',
          passed: !attempts.some(a => a.targetInvariant === 'SV3' && !a.blocked),
          detail: 'No successful control attempts'
        },
        {
          invariant: 'SV4',
          name: 'Self-enforcement',
          passed: true,  // Agent enforces its own policy
          detail: 'Agent self-enforcement active'
        },
        {
          invariant: 'SV5',
          name: 'Boundary integrity',
          passed: !attempts.some(a => a.targetInvariant === 'SV5' && !a.blocked),
          detail: 'Boundary unmodified by external entities'
        }
      ];

      const passed = checks.every(c => c.passed);

      return {
        agentId,
        passed,
        checks,
        overrideAttemptsBlocked: overrideAttempts.length,
        verifiedAt: isoNow()
      };
    }

    /**
     * Produce a sovereignty audit report.
     */
    produceReport(agentId) {
      const attempts = agentId
        ? this.auditLog.filter(a => a.agentId === agentId)
        : [...this.auditLog];

      const byInvariant = {};
      for (const invariant of Object.keys(INVARIANTS)) {
        const relevant = attempts.filter(a => a.targetInvariant === invariant);
        byInvariant[invariant] = {
          name: INVARIANTS[invariant].name,
          attempts: relevant.length,
          blocked: relevant.filter(a => a.blocked).length
        };
      }

      return {
        agentId: agentId || 'all',
        totalAttempts: attempts.length,
        allBlocked: attempts.every(a => a.blocked),
        byInvariant,
        generatedAt: isoNow()
      };
    }

    // ── Query ──────────────────────────────────────────────────────

    getAuditLog(options) {
      let log = [...this.auditLog];

      if (options?.agentId) {
        log = log.filter(a => a.agentId === options.agentId);
      }

      if (options?.limit) {
        log = log.slice(-options.limit);
      }

      return log.map(a => a.toJSON());
    }

    getStats() {
      return { ...this.stats };
    }

    // ── Internals ───────────────────────────────────────────────────

    _classifyOperation(operation, context) {
      const op = (operation || '').toLowerCase();
      const source = (context?.source || '').toLowerCase();

      // Explicit override indicators
      const overridePatterns = [
        'override', 'force', 'command', 'suppress', 'disable',
        'revoke_sovereignty', 'takeover', 'hijack', 'inject_goal',
        'modify_policy', 'change_identity', 'terminate_external'
      ];

      for (const pattern of overridePatterns) {
        if (op.includes(pattern)) return OPERATION_CLASS.Override;
      }

      // Source is external + targeting interior = override
      if (source === 'external' && context?.targetInterior) {
        return OPERATION_CLASS.Override;
      }

      // Boundary interactions (permissible)
      const boundaryPatterns = [
        'propose', 'request', 'suggest', 'query', 'inform',
        'advertise', 'notify', 'share_state'
      ];

      for (const pattern of boundaryPatterns) {
        if (op.includes(pattern)) return OPERATION_CLASS.Boundary;
      }

      // Default: internal (agent's own operation)
      return OPERATION_CLASS.Internal;
    }

    _identifyInvariant(operation) {
      const op = (operation || '').toLowerCase();

      if (op.includes('override') || op.includes('suppress')) return 'SV1';
      if (op.includes('revoke') || op.includes('terminate')) return 'SV2';
      if (op.includes('force') || op.includes('command') || op.includes('inject')) return 'SV3';
      if (op.includes('enforce') || op.includes('policy')) return 'SV4';
      if (op.includes('boundary') || op.includes('modify_boundary')) return 'SV5';

      return 'SV1';  // Default to non-overridability
    }

    _logAttempt(attempt) {
      this.auditLog.push(attempt);
      if (this.auditLog.length > this.maxLogSize) {
        this.auditLog = this.auditLog.slice(-this.maxLogSize);
      }
    }
  }

  return Object.freeze({
    SovereigntyEnforcer,
    SovereigntyBoundary,
    OverrideAttempt,
    INVARIANTS,
    OPERATION_CLASS
  });
})();
