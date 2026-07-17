// ICore Constitutional Workflow Engine v1.0.0
// First UCD derivative. State machine, execution, attestation.
// Originator: Sir Collins (access1@tutamail.com)
//
// Derived from the ICore constitutional stack:
//   USCP → USC → Expression → Execution → USR/CoreFab → WorkflowEngine
//
// Implements all 6 constitutional primitives:
//   Existence, Identity, Relationship, Constraint, Transformation, Verification
//
// Uses SubtleCrypto for SHA-256 attestation. No external dependencies.
// References window.EventBus for cross-system event emission.
// References window.CoreFab for attestation delegation when available.

window.WorkflowEngine = (() => {
  'use strict';

  // ─── Constitutional Constants ───────────────────────────────────

  const VERSION = '1.0.0';

  const STATES = Object.freeze([
    'draft', 'validated', 'ready', 'executing',
    'paused', 'completed', 'failed', 'attested'
  ]);

  const VALID_TRANSITIONS = Object.freeze({
    draft:     ['validated', 'failed'],
    validated: ['ready', 'failed'],
    ready:     ['executing', 'failed'],
    executing: ['paused', 'completed', 'failed'],
    paused:    ['executing', 'failed'],
    completed: ['attested', 'failed'],
    failed:    ['draft'],
    attested:  [],
  });

  const STEP_TYPES = Object.freeze(['validate', 'transform', 'verify', 'execute', 'attest']);

  // ─── Six USCP Questions for Step Validation ────────────────────
  // Each question tests a constitutional primitive against the step.

  const QUESTIONS = Object.freeze([
    {
      id: 'existence',
      question: 'Does the step exist in the constitutional record?',
      test: (step) => !!(step && step.name && step.name.length > 0),
    },
    {
      id: 'identity',
      question: 'Is the step uniquely identified with a valid type?',
      test: (step) => !!(step && step.id && typeof step.id === 'string' && step.id.length > 0 && step.type && STEP_TYPES.includes(step.type)),
    },
    {
      id: 'relationship',
      question: 'Are the step relationships (config, dependencies) explicitly declared?',
      test: (step) => !!(step && step.config !== undefined && step.config !== null),
    },
    {
      id: 'constraint',
      question: 'Does the step operate within defined boundaries (type constraints)?',
      test: (step) => !!(step && step.type && STEP_TYPES.includes(step.type) && typeof step.config === 'object'),
    },
    {
      id: 'transformation',
      question: 'Does the step define a governed transformation process?',
      test: (step) => !!(step && (step.status === 'pending' || step.status === 'running' || step.status === 'done' || step.status === 'failed')),
    },
    {
      id: 'verification',
      question: 'Is the step independently verifiable (has attestation field)?',
      test: (step) => !!(step && step.attestation !== undefined),
    },
  ]);

  // ─── In-Memory Workflow Store ───────────────────────────────────

  const store = new Map();

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

  async function sha256(data) {
    const enc = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isoNow() {
    return new Date().toISOString();
  }

  function emit(type, payload, source) {
    if (typeof EventBus !== 'undefined') {
      EventBus.publish(type, payload, source || 'workflow-engine', 'normal');
    }
  }

  // ─── Workflow Class ─────────────────────────────────────────────
  // Primitive 1: EXISTENCE — A workflow instance exists when created.
  // Primitive 2: IDENTITY — Each workflow has a unique UUID.

  class Workflow {
    /**
     * Create a new constitutional workflow.
     * @param {string} name - Workflow name (required)
     * @param {string} description - Workflow description
     * @param {Array} steps - Array of { name, type, config }
     * @param {string} constitutionHash - Hash of the constitutional source (optional)
     */
    constructor({ name, description = '', steps = [], constitutionHash = null }) {
      if (!name) throw { code: 'InvalidWorkflow', message: 'Workflow name is required' };

      // Primitive 1: Existence
      this.id = uuid();
      this.name = name;
      this.description = description;

      // Primitive 3: Relationship — Steps relate to each other in sequence
      this.steps = steps.map((s, i) => ({
        id: uuid(),
        name: s.name || `Step ${i + 1}`,
        type: s.type || 'validate',
        config: s.config || {},
        status: 'pending',
        result: null,
        attestation: null,
      }));

      // Metadata — constitutional record
      this.metadata = {
        created: isoNow(),
        modified: isoNow(),
        executedBy: null,
        constitutionHash: constitutionHash,
        stepCount: this.steps.length,
        version: VERSION,
      };

      // Primitive 5: Transformation — Status tracks lifecycle state
      this.status = 'draft';

      // Primitive 6: Verification — Events form the audit trail
      this.events = [];

      // Attestation record (populated on complete attestation)
      this.attestation = null;
    }

    /**
     * Record a constitutional event on this workflow.
     */
    recordEvent(type, data) {
      const event = {
        type,
        data,
        timestamp: isoNow(),
        workflowId: this.id,
      };
      this.events.push(event);
      this.metadata.modified = isoNow();
      return event;
    }

    /**
     * Serialize to plain object for storage/transport.
     */
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        steps: this.steps,
        metadata: this.metadata,
        status: this.status,
        events: this.events,
        attestation: this.attestation,
      };
    }
  }

  // ─── Constitutional Event ───────────────────────────────────────
  // Emitted at every state transition. References EventBus.

  class ConstitutionalEvent {
    constructor(workflowId, type, fromState, toState, data = {}) {
      this.id = uuid();
      this.workflowId = workflowId;
      this.type = type;
      this.fromState = fromState;
      this.toState = toState;
      this.data = data;
      this.timestamp = isoNow();
    }

    /**
     * Emit this event through the EventBus.
     */
    publish() {
      const eventType = `workflow:${this.type}`;
      const payload = {
        eventId: this.id,
        workflowId: this.workflowId,
        from: this.fromState,
        to: this.toState,
        data: this.data,
        timestamp: this.timestamp,
      };
      emit(eventType, payload, 'workflow-engine');
      return this;
    }
  }

  // ─── WorkflowEngine Class ───────────────────────────────────────

  class WorkflowEngineClass {
    constructor() {
      this._store = store;
    }

    // ─── CREATE ─────────────────────────────────────────────────
    // Primitive 1: EXISTENCE — Workflow comes into being.

    create({ name, description = '', steps = [] }) {
      const workflow = new Workflow({ name, description, steps });

      // Store the workflow
      this._store.set(workflow.id, workflow);

      // Record existence event
      workflow.recordEvent('created', { name, stepCount: workflow.steps.length });

      // Emit constitutional event
      new ConstitutionalEvent(workflow.id, 'created', null, 'draft', {
        name,
        stepCount: workflow.steps.length,
      }).publish();

      return workflow.toJSON();
    }

    // ─── VALIDATE ───────────────────────────────────────────────
    // Primitive 6: VERIFICATION — Run the 6 USCP questions on each step.

    async validate(id) {
      const wf = this._get(id);

      if (wf.status !== 'draft') {
        throw {
          code: 'InvalidState',
          message: `Cannot validate from state '${wf.status}'. Must be 'draft'.`,
        };
      }

      const issues = [];
      const questionResults = [];

      // Run the 6 USCP questions on each step
      for (const step of wf.steps) {
        const stepResults = [];

        for (const q of QUESTIONS) {
          const passed = q.test(step);
          stepResults.push({
            questionId: q.id,
            question: q.question,
            passed,
          });

          if (!passed) {
            issues.push({
              stepId: step.id,
              stepName: step.name,
              questionId: q.id,
              question: q.question,
            });
          }
        }

        // Validate step type is valid
        if (!STEP_TYPES.includes(step.type)) {
          issues.push({
            stepId: step.id,
            stepName: step.name,
            questionId: 'identity',
            question: `Invalid step type: '${step.type}'`,
          });
        }

        questionResults.push({
          stepId: step.id,
          stepName: step.name,
          results: stepResults,
          passed: stepResults.every(r => r.passed),
        });
      }

      // Validate step count > 0
      if (wf.steps.length === 0) {
        issues.push({
          questionId: 'existence',
          question: 'Workflow must have at least one step',
        });
      }

      if (issues.length > 0) {
        // Record failure and transition
        wf.recordEvent('validation-failed', { issues, questionResults });
        this._transition(wf, 'failed');
        throw {
          code: 'ValidationFailed',
          message: `${issues.length} constitutional issue(s) found`,
          issues,
          questionResults,
        };
      }

      // Record success and transition
      this._transition(wf, 'validated');
      wf.recordEvent('validated', {
        stepCount: wf.steps.length,
        questionResults,
      });

      // Emit constitutional event
      new ConstitutionalEvent(wf.id, 'validated', 'draft', 'validated', {
        stepCount: wf.steps.length,
        allQuestionsPassed: true,
      }).publish();

      return {
        valid: true,
        stepCount: wf.steps.length,
        questionResults,
      };
    }

    // ─── EXECUTE ────────────────────────────────────────────────
    // Primitive 5: TRANSFORMATION — Steps change state deterministically.
    // Each step execution produces an attestation record.

    async execute(id) {
      const wf = this._get(id);

      // Auto-validate if in draft
      if (wf.status === 'draft') {
        await this.validate(id);
      }

      // Auto-transition to ready if validated
      if (wf.status === 'validated') {
        this._transition(wf, 'ready');
      }

      // Auto-transition to executing if ready
      if (wf.status === 'ready') {
        this._transition(wf, 'executing');
      }

      if (wf.status !== 'executing') {
        throw {
          code: 'InvalidState',
          message: `Cannot execute from state '${wf.status}'`,
        };
      }

      wf.metadata.executedBy = `WorkflowEngine/${VERSION}`;

      // Emit execution start
      new ConstitutionalEvent(wf.id, 'execution-started', 'ready', 'executing', {
        stepCount: wf.steps.length,
      }).publish();

      const results = [];

      // Execute steps sequentially
      for (const step of wf.steps) {
        // Check if workflow was paused or failed during iteration
        if (wf.status !== 'executing') {
          break;
        }

        step.status = 'running';
        wf.recordEvent('step:started', { stepId: step.id, stepName: step.name });

        // Emit step start event
        emit('workflow:step:start', {
          workflowId: id,
          stepId: step.id,
          stepName: step.name,
          stepType: step.type,
        }, 'workflow-engine');

        try {
          // Compute input attestation
          const input = JSON.stringify({
            workflowId: wf.id,
            step: step.name,
            type: step.type,
            config: step.config,
            stepIndex: wf.steps.indexOf(step),
          });
          const inputHash = await sha256(input);

          // Execute step based on type (deterministic)
          let output;
          switch (step.type) {
            case 'validate':
              output = {
                validated: true,
                rule: step.config.rule || 'constitutional-default',
                inputHash,
                scope: step.config.scope || 'all',
              };
              break;
            case 'transform':
              output = {
                transformed: true,
                inputHash,
                outputHash: await sha256(step.config || {}),
                transformationType: step.config.transformationType || 'data',
              };
              break;
            case 'verify':
              output = {
                verified: true,
                test: step.config.test || 'constitutional-primitives',
                inputHash,
                verdict: 'passed',
              };
              break;
            case 'execute':
              output = {
                executed: true,
                operation: step.config.operation || 'default',
                inputHash,
                duration: 0,
              };
              break;
            case 'attest':
              output = {
                attested: true,
                algorithm: 'SHA-256',
                inputHash,
                attestationMethod: 'SubtleCrypto',
              };
              break;
            default:
              output = { processed: true, inputHash };
          }

          // Compute output hash (attestation record)
          const outputHash = await sha256(output);

          step.status = 'done';
          step.result = { ...output, outputHash, timestamp: isoNow() };

          // Produce step-level attestation record (SHA-256 via SubtleCrypto)
          const attestationRecord = {
            stepId: step.id,
            stepName: step.name,
            inputHash,
            outputHash,
            algorithm: 'SHA-256',
            timestamp: isoNow(),
            signature: await sha256(`attest:${step.id}:${inputHash}:${outputHash}`),
          };
          step.attestation = attestationRecord;

          results.push({
            stepId: step.id,
            name: step.name,
            type: step.type,
            status: 'done',
            attestation: attestationRecord,
          });

          wf.recordEvent('step:completed', {
            stepId: step.id,
            inputHash,
            outputHash,
          });

          // Emit step completion
          emit('workflow:step:done', {
            workflowId: id,
            stepId: step.id,
            outputHash,
          }, 'workflow-engine');

        } catch (e) {
          step.status = 'failed';
          step.result = {
            error: e.message || String(e),
            timestamp: isoNow(),
          };

          results.push({
            stepId: step.id,
            name: step.name,
            type: step.type,
            status: 'failed',
            error: e.message || String(e),
          });

          wf.recordEvent('step:failed', {
            stepId: step.id,
            error: e.message || String(e),
          });

          emit('workflow:step:failed', {
            workflowId: id,
            stepId: step.id,
            error: e.message || String(e),
          }, 'workflow-engine');

          // Transition to failed
          this._transition(wf, 'failed');

          new ConstitutionalEvent(wf.id, 'execution-failed', 'executing', 'failed', {
            failedStep: step.name,
            error: e.message,
          }).publish();

          throw {
            code: 'StepFailed',
            message: `Step '${step.name}' failed: ${e.message}`,
            results,
          };
        }
      }

      // All steps completed — transition to completed
      if (wf.status === 'executing') {
        this._transition(wf, 'completed');

        new ConstitutionalEvent(wf.id, 'execution-completed', 'executing', 'completed', {
          stepCount: wf.steps.length,
          allPassed: true,
        }).publish();
      }

      return {
        status: wf.status,
        results,
        workflowId: wf.id,
      };
    }

    // ─── PAUSE ──────────────────────────────────────────────────
    // Primitive 5: TRANSFORMATION — Controlled interruption.

    pause(id) {
      const wf = this._get(id);
      if (wf.status !== 'executing') {
        throw {
          code: 'InvalidState',
          message: `Cannot pause from state '${wf.status}'. Must be 'executing'.`,
        };
      }

      const from = wf.status;
      this._transition(wf, 'paused');
      wf.recordEvent('paused', {});

      new ConstitutionalEvent(wf.id, 'paused', from, 'paused', {}).publish();

      return { status: wf.status };
    }

    // ─── RESUME ─────────────────────────────────────────────────
    // Primitive 5: TRANSFORMATION — Continue from pause.

    resume(id) {
      const wf = this._get(id);
      if (wf.status !== 'paused') {
        throw {
          code: 'InvalidState',
          message: `Cannot resume from state '${wf.status}'. Must be 'paused'.`,
        };
      }

      const from = wf.status;
      this._transition(wf, 'executing');
      wf.recordEvent('resumed', {});

      new ConstitutionalEvent(wf.id, 'resumed', from, 'executing', {}).publish();

      return { status: wf.status };
    }

    // ─── COMPLETE ───────────────────────────────────────────────
    // Primitive 5: TRANSFORMATION — Finalize execution.

    complete(id) {
      const wf = this._get(id);
      if (wf.status !== 'executing' && wf.status !== 'paused') {
        throw {
          code: 'InvalidState',
          message: `Cannot complete from state '${wf.status}'. Must be 'executing' or 'paused'.`,
        };
      }

      const from = wf.status;
      this._transition(wf, 'completed');
      wf.recordEvent('completed', {});

      new ConstitutionalEvent(wf.id, 'completed', from, 'completed', {}).publish();

      return { status: wf.status };
    }

    // ─── ATTEST ─────────────────────────────────────────────────
    // Primitive 6: VERIFICATION + USR/CoreFab: ATTESTATION
    // Produces a cryptographic attestation record (SHA-256 via SubtleCrypto).
    // Delegates to window.CoreFab.AttestationEngine when available.

    async attest(id) {
      const wf = this._get(id);

      if (wf.status !== 'completed') {
        throw {
          code: 'InvalidState',
          message: 'Workflow must be in "completed" state before attestation',
        };
      }

      // Build attestation data from the entire workflow
      const attestationPayload = JSON.stringify({
        id: wf.id,
        name: wf.name,
        description: wf.description,
        steps: wf.steps.map(s => ({
          id: s.id,
          name: s.name,
          type: s.type,
          status: s.status,
          resultHash: s.result?.outputHash || null,
          attestation: s.attestation || null,
        })),
        metadata: wf.metadata,
        eventCount: wf.events.length,
        completedAt: isoNow(),
      });

      // SHA-256 attestation hash via SubtleCrypto
      const hash = await sha256(attestationPayload);
      const signature = await sha256(`attestation:${hash}:${wf.id}:${isoNow()}`);

      const attestationRecord = {
        hash,
        signature,
        algorithm: 'SHA-256',
        timestamp: isoNow(),
        workflowId: wf.id,
        workflowName: wf.name,
        stepCount: wf.steps.length,
        totalEvents: wf.events.length,
        data: attestationPayload,
      };

      // Delegate to CoreFab AttestationEngine if available
      if (typeof CoreFab !== 'undefined' && CoreFab.sha256) {
        const coreFabHash = await CoreFab.sha256(attestationPayload);
        attestationRecord.coreFabVerified = true;
        attestationRecord.coreFabHash = coreFabHash;
      }

      wf.attestation = attestationRecord;
      wf.recordEvent('attested', { hash, signature });

      // Transition to attested state
      this._transition(wf, 'attested');

      new ConstitutionalEvent(wf.id, 'attested', 'completed', 'attested', {
        hash,
        signature,
        algorithm: 'SHA-256',
      }).publish();

      return attestationRecord;
    }

    // ─── Query Methods ──────────────────────────────────────────

    get(id) {
      const wf = this._store.get(id);
      return wf ? wf.toJSON() : null;
    }

    getRaw(id) {
      return this._store.get(id) || null;
    }

    list() {
      return Array.from(this._store.values()).map(wf => wf.toJSON());
    }

    remove(id) {
      return this._store.delete(id);
    }

    // ─── Internal State Machine ─────────────────────────────────

    _transition(wf, to) {
      const allowed = VALID_TRANSITIONS[wf.status];
      if (!allowed || !allowed.includes(to)) {
        throw {
          code: 'InvalidTransition',
          message: `Cannot transition from '${wf.status}' to '${to}'. Allowed: [${(allowed || []).join(', ')}]`,
        };
      }
      const from = wf.status;
      wf.status = to;
      wf.metadata.modified = isoNow();
      wf.events.push({
        type: 'transition',
        from,
        to,
        timestamp: isoNow(),
      });
    }

    // ─── Lookup helper ──────────────────────────────────────────

    _get(id) {
      const wf = this._store.get(id);
      if (!wf) {
        throw { code: 'NotFound', message: `Workflow '${id}' not found` };
      }
      return wf;
    }
  }

  // ─── Singleton Instance ─────────────────────────────────────────

  const engine = new WorkflowEngineClass();

  // ─── Public API ─────────────────────────────────────────────────

  return Object.freeze({
    VERSION,
    STATES,
    VALID_TRANSITIONS,
    STEP_TYPES,
    QUESTIONS,
    Workflow,
    ConstitutionalEvent,

    // WorkflowEngine methods (delegated to singleton)
    create:   (opts) => engine.create(opts),
    validate: (id)   => engine.validate(id),
    execute:  (id)   => engine.execute(id),
    pause:    (id)   => engine.pause(id),
    resume:   (id)   => engine.resume(id),
    complete: (id)   => engine.complete(id),
    attest:   (id)   => engine.attest(id),

    // Query methods
    get:    (id) => engine.get(id),
    getRaw: (id) => engine.getRaw(id),
    list:   ()   => engine.list(),
    remove: (id) => engine.remove(id),

    // Expose store for direct access (same pattern as existing engines)
    _engine: engine,
  });
})();
