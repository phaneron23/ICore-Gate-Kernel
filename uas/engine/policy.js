// UAS — Policy Engine v1.0.0
// Constitutional policy loading, evaluation, and constraint enforcement.
// Every goal and action passes through policy before execution.

window.UASPolicyEngine = (() => {
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

  // ─── Policy Record ─────────────────────────────────────────────────

  const SEVERITY = Object.freeze({
    Critical: 'Critical',   // Violation blocks execution
    Major: 'Major',         // Violation logged, may degrade trust
    Minor: 'Minor'          // Violation logged for audit
  });

  const RULE_TYPES = Object.freeze({
    GoalConstraint: 'GoalConstraint',       // Limits on goal declaration
    ActionConstraint: 'ActionConstraint',   // Blocks/allows specific actions
    PerceptionFilter: 'PerceptionFilter',   // Controls what events are observed
    CommunicationGate: 'CommunicationGate', // Controls message routing
    TrustThreshold: 'TrustThreshold',       // Minimum trust for operations
    ResourceLimit: 'ResourceLimit'          // Caps on agent resources
  });

  class PolicyRule {
    constructor(config) {
      this.id = config.id || generateId();
      this.name = config.name || 'Unnamed Rule';
      this.type = config.type || RULE_TYPES.ActionConstraint;
      this.severity = config.severity || SEVERITY.Major;
      this.condition = config.condition || (() => true);  // (context) → bool
      this.message = config.message || 'Policy rule evaluated';
      this.active = config.active !== false;
      this.createdAt = isoNow();
    }

    evaluate(context) {
      if (!this.active) return { passed: true, rule: this.name, skipped: true };
      const passed = this.condition(context);
      return { passed, rule: this.name, type: this.type, severity: this.severity, message: this.message };
    }

    toJSON() {
      return {
        id: this.id, name: this.name, type: this.type,
        severity: this.severity, message: this.message,
        active: this.active, createdAt: this.createdAt
      };
    }
  }

  // ─── Constitutional Policy ─────────────────────────────────────────

  class Policy {
    constructor(config) {
      this.id = config.id || generateId();
      this.name = config.name || 'Unnamed Policy';
      this.version = config.version || '1.0.0';
      this.description = config.description || '';
      this.rules = [];
      this.constraints = config.constraints || [];
      this.createdAt = isoNow();
      this.updatedAt = isoNow();
    }

    addRule(ruleConfig) {
      const rule = ruleConfig instanceof PolicyRule ? ruleConfig : new PolicyRule(ruleConfig);
      this.rules.push(rule);
      this.updatedAt = isoNow();
      return rule;
    }

    removeRule(ruleId) {
      const idx = this.rules.findIndex(r => r.id === ruleId);
      if (idx === -1) return false;
      this.rules.splice(idx, 1);
      this.updatedAt = isoNow();
      return true;
    }

    getRules(type) {
      if (!type) return [...this.rules];
      return this.rules.filter(r => r.type === type && r.active);
    }

    async fingerprint() {
      const data = `${this.name}:${this.version}:${this.rules.length}:${this.rules.map(r => r.id).join(',')}`;
      return await sha256(data);
    }

    toJSON() {
      return {
        id: this.id, name: this.name, version: this.version,
        description: this.description,
        rules: this.rules.map(r => r.toJSON()),
        constraints: this.constraints,
        createdAt: this.createdAt, updatedAt: this.updatedAt
      };
    }
  }

  // ─── Policy Engine ─────────────────────────────────────────────────

  class PolicyEngine {
    constructor() {
      this.policies = new Map();     // policyId → Policy
      this.evaluationLog = [];       // recent evaluations
      this.maxLogSize = 200;
    }

    createPolicy(config) {
      const policy = config instanceof Policy ? config : new Policy(config);
      this.policies.set(policy.id, policy);
      return policy;
    }

    getPolicy(policyId) {
      return this.policies.get(policyId) || null;
    }

    getAllPolicies() {
      return Array.from(this.policies.values());
    }

    removePolicy(policyId) {
      return this.policies.delete(policyId);
    }

    // ── Evaluation Methods ──────────────────────────────────────────

    evaluateGoal(goal, policyId) {
      const policy = policyId ? this.policies.get(policyId) : this._getDefaultPolicy();
      if (!policy) return { allowed: true, evaluations: [], note: 'No policy loaded' };

      const context = { type: 'goal', data: goal };
      return this._evaluateContext(context, policy, RULE_TYPES.GoalConstraint);
    }

    evaluateAction(action, policyId) {
      const policy = policyId ? this.policies.get(policyId) : this._getDefaultPolicy();
      if (!policy) return { allowed: true, evaluations: [], note: 'No policy loaded' };

      const context = { type: 'action', data: action };
      return this._evaluateContext(context, policy, RULE_TYPES.ActionConstraint);
    }

    evaluatePerception(event, policyId) {
      const policy = policyId ? this.policies.get(policyId) : this._getDefaultPolicy();
      if (!policy) return { allowed: true, evaluations: [], note: 'No policy loaded' };

      const context = { type: 'perception', data: event };
      return this._evaluateContext(context, policy, RULE_TYPES.PerceptionFilter);
    }

    evaluateCommunication(message, policyId) {
      const policy = policyId ? this.policies.get(policyId) : this._getDefaultPolicy();
      if (!policy) return { allowed: true, evaluations: [], note: 'No policy loaded' };

      const context = { type: 'communication', data: message };
      return this._evaluateContext(context, policy, RULE_TYPES.CommunicationGate);
    }

    evaluateTrust(agentTrust, requiredLevel, policyId) {
      const policy = policyId ? this.policies.get(policyId) : this._getDefaultPolicy();
      if (!policy) return { allowed: true, evaluations: [], note: 'No policy loaded' };

      const context = { type: 'trust', data: { agentTrust, requiredLevel } };
      const result = this._evaluateContext(context, policy, RULE_TYPES.TrustThreshold);

      // Additional trust-specific check
      if (result.allowed && agentTrust < requiredLevel) {
        result.allowed = false;
        result.evaluations.push({
          rule: 'TrustThreshold_minimum',
          type: RULE_TYPES.TrustThreshold,
          severity: SEVERITY.Critical,
          passed: false,
          message: `Trust ${agentTrust} below required ${requiredLevel}`
        });
      }

      return result;
    }

    // ── Bulk Evaluation ─────────────────────────────────────────────

    evaluateAll(context, policyId) {
      const policy = policyId ? this.policies.get(policyId) : this._getDefaultPolicy();
      if (!policy) return { allowed: true, evaluations: [], note: 'No policy loaded' };

      const allRules = policy.rules.filter(r => r.active);
      const evaluations = allRules.map(rule => rule.evaluate(context));

      const blocked = evaluations.filter(e => !e.passed);
      const allowed = blocked.length === 0;

      const entry = {
        id: generateId(),
        context: context.type,
        allowed,
        criticalCount: blocked.filter(e => e.severity === SEVERITY.Critical).length,
        majorCount: blocked.filter(e => e.severity === SEVERITY.Major).length,
        timestamp: isoNow()
      };
      this._logEvaluation(entry);

      return { allowed, evaluations, entry };
    }

    // ── Constraint Helpers ──────────────────────────────────────────

    addConstraint(policyId, constraint) {
      const policy = this.policies.get(policyId);
      if (!policy) throw new Error(`Policy '${policyId}' not found`);
      policy.constraints.push(constraint);
      policy.updatedAt = isoNow();
      return constraint;
    }

    getConstraints(policyId, type) {
      const policy = this.policies.get(policyId);
      if (!policy) return [];
      if (!type) return [...policy.constraints];
      return policy.constraints.filter(c => c.type === type);
    }

    checkConstraint(agent, constraintType) {
      const violations = [];
      for (const policy of this.policies.values()) {
        for (const constraint of policy.constraints) {
          if (constraint.type === constraintType) {
            if (constraint.check && !constraint.check(agent)) {
              violations.push({
                policy: policy.name,
                constraint: constraint.name || constraintType,
                message: constraint.message || `Constraint ${constraintType} violated`
              });
            }
          }
        }
      }
      return violations;
    }

    // ── Pre-built Rule Templates ────────────────────────────────────

    static blockedActions(actionList) {
      return {
        name: `Block actions: ${actionList.join(', ')}`,
        type: RULE_TYPES.ActionConstraint,
        severity: SEVERITY.Critical,
        condition: (ctx) => ctx.type !== 'action' || !actionList.includes(ctx.data?.type),
        message: `Blocked actions: ${actionList.join(', ')}`
      };
    }

    static maxGoals(limit) {
      return {
        name: `Max goals: ${limit}`,
        type: RULE_TYPES.GoalConstraint,
        severity: SEVERITY.Critical,
        condition: (ctx) => {
          if (ctx.type !== 'goal') return true;
          return !ctx.data?.currentCount || ctx.data.currentCount < limit;
        },
        message: `Goal limit of ${limit} exceeded`
      };
    }

    static requireTrustLevel(minLevel) {
      return {
        name: `Minimum trust: ${minLevel}`,
        type: RULE_TYPES.TrustThreshold,
        severity: SEVERITY.Critical,
        condition: (ctx) => {
          if (ctx.type !== 'trust') return true;
          return (ctx.data?.agentTrust || 0) >= minLevel;
        },
        message: `Minimum trust level ${minLevel} not met`
      };
    }

    static allowEventTypes(typeList) {
      return {
        name: `Allow events: ${typeList.join(', ')}`,
        type: RULE_TYPES.PerceptionFilter,
        severity: SEVERITY.Major,
        condition: (ctx) => {
          if (ctx.type !== 'perception') return true;
          return typeList.includes(ctx.data?.eventType);
        },
        message: `Event type not in allowed list: ${typeList.join(', ')}`
      };
    }

    static rateLimit(maxPerMinute) {
      let count = 0;
      let windowStart = Date.now();
      return {
        name: `Rate limit: ${maxPerMinute}/min`,
        type: RULE_TYPES.ActionConstraint,
        severity: SEVERITY.Major,
        condition: (ctx) => {
          const now = Date.now();
          if (now - windowStart > 60000) { count = 0; windowStart = now; }
          count++;
          return count <= maxPerMinute;
        },
        message: `Rate limit of ${maxPerMinute} per minute exceeded`
      };
    }

    // ── Internals ───────────────────────────────────────────────────

    _evaluateContext(context, policy, ruleType) {
      const rules = policy.rules.filter(r => r.active && r.type === ruleType);
      const evaluations = rules.map(rule => rule.evaluate(context));
      const blocked = evaluations.filter(e => !e.passed);
      const allowed = blocked.length === 0;

      const entry = {
        id: generateId(),
        context: context.type,
        ruleType,
        allowed,
        blockedCount: blocked.length,
        timestamp: isoNow()
      };
      this._logEvaluation(entry);

      return { allowed, evaluations, entry };
    }

    _getDefaultPolicy() {
      const policies = Array.from(this.policies.values());
      return policies.length > 0 ? policies[0] : null;
    }

    _logEvaluation(entry) {
      this.evaluationLog.push(entry);
      if (this.evaluationLog.length > this.maxLogSize) {
        this.evaluationLog = this.evaluationLog.slice(-this.maxLogSize);
      }
    }

    getEvaluationLog(limit) {
      return limit ? this.evaluationLog.slice(-limit) : [...this.evaluationLog];
    }

    getStats() {
      const all = this.evaluationLog;
      return {
        policies: this.policies.size,
        totalEvaluations: all.length,
        allowed: all.filter(e => e.allowed).length,
        blocked: all.filter(e => !e.allowed).length
      };
    }
  }

  return Object.freeze({
    PolicyEngine,
    Policy,
    PolicyRule,
    SEVERITY,
    RULE_TYPES
  });
})();
