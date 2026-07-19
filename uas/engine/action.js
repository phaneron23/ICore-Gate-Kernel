// UAS — Action Executor v1.0.0
// Goal-directed, constraint-validated, attested action execution.
// Every action traces back to: perception → intent → constraint → action → attestation.

window.UASActionExecutor = (() => {
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

  const ACTION_STATES = Object.freeze({
    Declared: 'Declared',     // Intent formed, not yet validated
    Validated: 'Validated',   // Passed constraint checks
    Executing: 'Executing',   // In progress
    Completed: 'Completed',   // Finished successfully
    Failed: 'Failed',         // Execution failed
    Blocked: 'Blocked'        // Rejected by constraint enforcement
  });

  // ─── Intent ────────────────────────────────────────────────────────

  class Intent {
    constructor(config) {
      this.id = config.id || generateId();
      this.agentId = config.agentId || 'unknown';
      this.goalId = config.goalId || null;
      this.operation = config.operation || '';
      this.description = config.description || '';
      this.parameters = config.parameters || {};
      this.componentId = config.componentId || null;  // UWA component to execute through
      this.perceptionId = config.perceptionId || null; // What triggered this intent
      this.state = ACTION_STATES.Declared;
      this.createdAt = isoNow();
    }

    toJSON() {
      return {
        id: this.id, agentId: this.agentId, goalId: this.goalId,
        operation: this.operation, description: this.description,
        parameters: this.parameters, componentId: this.componentId,
        perceptionId: this.perceptionId, state: this.state,
        createdAt: this.createdAt
      };
    }
  }

  // ─── Action Record ────────────────────────────────────────────────

  class ActionRecord {
    constructor(config) {
      this.id = config.id || generateId();
      this.agentId = config.agentId || 'unknown';
      this.goalId = config.goalId || null;
      this.intentId = config.intentId || null;
      this.operation = config.operation || '';
      this.componentId = config.componentId || null;
      this.parameters = config.parameters || {};
      this.input = config.input || null;
      this.output = config.output || null;
      this.success = config.success !== false;
      this.error = config.error || null;
      this.state = config.state || ACTION_STATES.Completed;
      this.attestation = config.attestation || null;
      this.provenance = config.provenance || {};  // Full trace chain
      this.startedAt = config.startedAt || isoNow();
      this.completedAt = config.completedAt || isoNow();
    }

    toJSON() {
      return {
        id: this.id, agentId: this.agentId, goalId: this.goalId,
        intentId: this.intentId, operation: this.operation,
        componentId: this.componentId, parameters: this.parameters,
        input: this.input, output: this.output,
        success: this.success, error: this.error,
        state: this.state, attestation: this.attestation,
        provenance: this.provenance,
        startedAt: this.startedAt, completedAt: this.completedAt
      };
    }
  }

  // ─── Action Executor ──────────────────────────────────────────────

  class ActionExecutor {
    constructor(config) {
      this.agentId = config?.agentId || 'default';
      this.policyEngine = config?.policyEngine || null;
      this.actionLog = [];           // completed actions
      this.maxLogSize = config?.maxLogSize || 500;
      this.pendingIntents = new Map(); // intentId → Intent
      this.handlers = new Map();      // operationName → handler function
      this.stats = {
        declared: 0,
        validated: 0,
        executed: 0,
        completed: 0,
        failed: 0,
        blocked: 0
      };
    }

    // ── Handler Registration ───────────────────────────────────────

    registerHandler(operation, handler) {
      this.handlers.set(operation, handler);
      return this;
    }

    unregisterHandler(operation) {
      return this.handlers.delete(operation);
    }

    // ── Intent Declaration (Step 1: Perception → Intent) ───────────

    declareIntent(config) {
      const intent = new Intent({
        ...config,
        agentId: config.agentId || this.agentId
      });

      this.pendingIntents.set(intent.id, intent);
      this.stats.declared++;

      return intent;
    }

    // ── Constraint Validation (Step 2: Intent → Constraint Check) ──

    validateIntent(intentId) {
      const intent = this.pendingIntents.get(intentId);
      if (!intent) throw new Error(`Intent '${intentId}' not found`);

      const violations = [];

      // Policy engine validation
      if (this.policyEngine) {
        const policyResult = this.policyEngine.evaluateAction({
          type: intent.operation,
          componentId: intent.componentId,
          parameters: intent.parameters,
          goalId: intent.goalId
        });

        if (!policyResult.allowed) {
          violations.push(...policyResult.evaluations
            .filter(e => !e.passed)
            .map(e => ({ rule: e.rule, message: e.message, severity: e.severity })));
        }
      }

      if (violations.length > 0) {
        intent.state = ACTION_STATES.Blocked;
        this.stats.blocked++;
        return {
          valid: false,
          intent: intent.toJSON(),
          violations,
          message: `Intent blocked: ${violations.length} policy violation(s)`
        };
      }

      intent.state = ACTION_STATES.Validated;
      this.stats.validated++;
      return { valid: true, intent: intent.toJSON(), violations: [] };
    }

    // ── Action Execution (Step 3: Constraint → Action) ─────────────

    async executeAction(intentId, context) {
      const intent = this.pendingIntents.get(intentId);
      if (!intent) throw new Error(`Intent '${intentId}' not found`);

      // Auto-validate if not yet validated
      if (intent.state === ACTION_STATES.Declared) {
        const validation = this.validateIntent(intentId);
        if (!validation.valid) {
          return this._createFailedRecord(intent, validation.violations);
        }
      }

      if (intent.state === ACTION_STATES.Blocked) {
        return this._createFailedRecord(intent, [{ message: 'Intent was blocked by policy' }]);
      }

      intent.state = ACTION_STATES.Executing;
      const startTime = isoNow();

      try {
        // Look up handler
        const handler = this.handlers.get(intent.operation);

        let output;
        if (handler) {
          output = await handler({
            intent: intent.toJSON(),
            parameters: intent.parameters,
            componentId: intent.componentId,
            context: context || {}
          });
        } else {
          // Default: simulate execution
          output = {
            status: 'completed',
            operation: intent.operation,
            simulated: true,
            message: `No handler registered for '${intent.operation}' — simulated`
          };
        }

        // Produce attestation (Step 4: Action → Attestation)
        const attestation = await this._attest(intent, output, startTime);

        const record = new ActionRecord({
          agentId: intent.agentId,
          goalId: intent.goalId,
          intentId: intent.id,
          operation: intent.operation,
          componentId: intent.componentId,
          parameters: intent.parameters,
          input: context || null,
          output,
          success: true,
          state: ACTION_STATES.Completed,
          attestation,
          provenance: {
            perceptionId: intent.perceptionId,
            intentId: intent.id,
            validatedAt: startTime,
            executedAt: isoNow()
          },
          startedAt: startTime,
          completedAt: isoNow()
        });

        this.actionLog.push(record);
        this.pendingIntents.delete(intentId);
        this.stats.executed++;
        this.stats.completed++;

        // Log to EventBus
        if (window.EventBus) {
          EventBus.publish('action.completed', record.toJSON(), `uas:${this.agentId}`);
        }

        return record;

      } catch (error) {
        const record = this._createFailedRecord(intent, [
          { message: error.message, severity: 'Critical' }
        ], startTime);

        this.actionLog.push(record);
        this.pendingIntents.delete(intentId);
        this.stats.executed++;
        this.stats.failed++;

        if (window.EventBus) {
          EventBus.publish('action.failed', record.toJSON(), `uas:${this.agentId}`);
        }

        return record;
      }
    }

    // ── Quick Execute (declare + validate + execute in one call) ───

    async quickExecute(config) {
      const intent = this.declareIntent(config);
      return await this.executeAction(intent.id, config.context);
    }

    // ── Provenance Trace ───────────────────────────────────────────

    traceAction(actionId) {
      const record = this.actionLog.find(a => a.id === actionId);
      if (!record) return null;

      return {
        action: record.toJSON(),
        provenance: {
          perception: record.provenance.perceptionId,
          intent: record.provenance.intentId,
          validation: record.provenance.validatedAt,
          execution: record.provenance.executedAt,
          attestation: record.attestation
        }
      };
    }

    traceByGoal(goalId) {
      return this.actionLog
        .filter(a => a.goalId === goalId)
        .map(a => a.toJSON());
    }

    // ── Query ──────────────────────────────────────────────────────

    getActionLog(limit) {
      return limit ? this.actionLog.slice(-limit) : [...this.actionLog];
    }

    getPendingIntents() {
      return Array.from(this.pendingIntents.values()).map(i => i.toJSON());
    }

    getStats() {
      return { ...this.stats };
    }

    // ── Internals ───────────────────────────────────────────────────

    async _attest(intent, output, startTime) {
      const attestation = {
        id: generateId(),
        agentId: intent.agentId,
        operation: intent.operation,
        goalId: intent.goalId,
        componentId: intent.componentId,
        input: intent.parameters,
        output: output,
        startedAt: startTime,
        completedAt: isoNow()
      };

      const signingData = `${attestation.agentId}:${attestation.operation}:${attestation.goalId}:${attestation.startedAt}:${attestation.completedAt}`;
      attestation.signature = await sha256(signingData);

      return attestation;
    }

    _createFailedRecord(intent, violations, startTime) {
      return new ActionRecord({
        agentId: intent.agentId,
        goalId: intent.goalId,
        intentId: intent.id,
        operation: intent.operation,
        componentId: intent.componentId,
        parameters: intent.parameters,
        success: false,
        error: { violations },
        state: ACTION_STATES.Failed,
        startedAt: startTime || isoNow(),
        completedAt: isoNow(),
        provenance: {
          perceptionId: intent.perceptionId,
          intentId: intent.id
        }
      });
    }
  }

  return Object.freeze({
    ActionExecutor,
    Intent,
    ActionRecord,
    ACTION_STATES
  });
})();
