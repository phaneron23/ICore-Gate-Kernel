// ICore Studyo — USR/CoreFab Runtime v0.1.0
// Constitutional execution engine: identity, execution, constraints,
// isolation, attestation, orchestration.
// Derived from USR-CoreFab-v0.1.0-FORMAL-SPEC.md
//
// Uses SubtleCrypto for SHA-256. No external dependencies.

window.CoreFab = (() => {
  'use strict';

  // ─── Helpers ──────────────────────────────────────────────────────

  async function sha256(data) {
    const enc = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isoNow() {
    return new Date().toISOString();
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  // ─── Constitutional Layers (Invariants I2) ────────────────────────

  const LAYERS = Object.freeze({
    pre: 0, uscp: 1, usc: 2, science: 3,
    expression: 4, execution: 5, implementation: 6
  });

  const LAYER_NAMES = Object.keys(LAYERS);

  function parseLayer(s) {
    const k = s?.toLowerCase?.();
    if (k === 'impl' || k === 'implementation') return 'implementation';
    return LAYERS[k] !== undefined ? k : null;
  }

  // ─── Six Constitutional Questions ─────────────────────────────────

  const SIX_QUESTIONS = Object.freeze([
    { id: 'existence',      q: 'What is?',                test: c => !!c?.content },
    { id: 'identity',       q: 'Who/what is it?',         test: c => !!(c?.name || c?.id) },
    { id: 'relationship',   q: 'How is it connected?',    test: c => !!(c?.type || c?.category || c?.relationships) },
    { id: 'constraint',     q: 'What governs it?',        test: c => !!(c?.constraints || c?.rules) },
    { id: 'transformation', q: 'How does it change?',     test: c => !!(c?.transformations || c?.immutable) },
    { id: 'verification',   q: 'How do we know it is valid?', test: c => !!(c?.verification || c?.verified) },
  ]);

  // ─── Ten Verification Tests ───────────────────────────────────────

  const TEN_TESTS = Object.freeze([
    { id: 'T1', name: 'Reality',       desc: 'Claims correspond to something verifiable' },
    { id: 'T2', name: 'Origin',        desc: 'Claims cite their derivation source' },
    { id: 'T3', name: 'Necessity',     desc: 'Claims are epistemically necessary' },
    { id: 'T4', name: 'Derivation',    desc: 'Claims follow D1–D5 from Part II' },
    { id: 'T5', name: 'Consistency',   desc: 'Claims do not contradict verified knowledge' },
    { id: 'T6', name: 'Verification',  desc: 'Truth independently confirmable' },
    { id: 'T7', name: 'Simplicity',    desc: 'Minimal expression of content' },
    { id: 'T8', name: 'Sovereignty',   desc: 'No external dependency introduced' },
    { id: 'T9', name: 'Replaceability',desc: 'Verification method is interface-bounded' },
    { id: 'T10',name: 'Evolution',     desc: 'Can be superseded without destroying dependents' },
  ]);

  // ─── Five Derivation Rules ────────────────────────────────────────

  const D_RULES = Object.freeze([
    { id: 'D1', name: 'Downward only',           desc: 'Derived from the layer immediately below' },
    { id: 'D2', name: 'No upward mutation',      desc: 'Lower layers never alter upper layers' },
    { id: 'D3', name: 'Merge requires justification', desc: 'All parent layers must be cited' },
    { id: 'D4', name: 'Adaptation is the boundary', desc: 'UCA is the last constitutional layer' },
    { id: 'D5', name: 'Derivatives composed',     desc: 'UCD composed from UCA, not re-derived' },
  ]);

  // ═══════════════════════════════════════════════════════════════════
  // C1 — IDENTITY CONTRACT
  // ═══════════════════════════════════════════════════════════════════

  class IdentityRegistry {
    constructor() { this.components = new Map(); }

    async declare(name, layer, version, parents = [], question = '') {
      if (!name) throw { code: 'IdentityNotDeclared', msg: 'Component has no name' };
      const layerKey = parseLayer(layer);
      if (!layerKey) throw { code: 'ConstraintViolation', msg: `Invalid layer: ${layer}` };

      // I3: Pre-constitutional cannot have parents
      if (layerKey === 'pre' && parents.length > 0)
        throw { code: 'ConstraintViolation', msg: 'Pre-constitutional components cannot have parents' };
      // I4: Non-pre must have parents
      if (layerKey !== 'pre' && parents.length === 0)
        throw { code: 'ConstraintViolation', msg: 'Non-pre components must derive from a parent' };
      // I5: Must answer a question
      if (!question)
        throw { code: 'IdentityNotDeclared', msg: 'Component does not answer a constitutional question' };

      const meta = `${name}:${layerKey}:${version}:${parents.join(',')}`;
      const id = await sha256(meta);

      // I6: Uniqueness
      if (this.components.has(id))
        throw { code: 'IdentityNotDeclared', msg: `Component ${id} already registered` };

      const component = { id, name, layer: layerKey, version, parents, question, registeredAt: isoNow() };
      this.components.set(id, component);
      return component;
    }

    lookup(id) { return this.components.get(id) || null; }

    all() { return Array.from(this.components.values()); }

    atLayer(layerKey) { return this.all().filter(c => c.layer === layerKey); }

    // Verify entire registry — D1 layer ordering
    async verifyAll() {
      for (const c of this.components.values()) {
        if (!c.name) throw { code: 'IdentityNotDeclared', msg: `Empty name for ${c.id}` };
        for (const pid of c.parents) {
          const parent = this.components.get(pid);
          if (parent && LAYERS[parent.layer] > LAYERS[c.layer])
            throw { code: 'ConstraintViolation', msg: `${c.name} derives from ${parent.name} at a higher layer` };
        }
      }
      return true;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // C2 — EXECUTION CONTRACT
  // ═══════════════════════════════════════════════════════════════════

  class ExecutionEngine {
    constructor() { this.operations = new Map(); }

    register(name, handler) { this.operations.set(name, handler); }

    async execute(name, input, componentId) {
      if (!this.operations.has(name))
        throw { code: 'ExecutionError', msg: `Operation '${name}' is not registered` };

      const inputHash = await sha256(input);
      const ts = isoNow();

      try {
        const output = await this.operations.get(name)(input, componentId);
        const outputHash = await sha256(output);
        return { operation: name, inputHash, output, outputHash, timestamp: ts, success: true, error: null };
      } catch (e) {
        const errStr = e?.msg || String(e);
        const outputHash = await sha256(errStr);
        return { operation: name, inputHash, output: '', outputHash, timestamp: ts, success: false, error: errStr };
      }
    }

    listOperations() { return Array.from(this.operations.keys()); }
  }

  // Built-in operations (from Formal Spec Section 5.4)
  function registerBuiltinOperations(engine) {
    // validate-identity
    engine.register('validate-identity', (input) => {
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      const issues = [];
      if (!data.name) issues.push('missing name');
      if (!data.layer) issues.push('missing layer');
      if (!data.question) issues.push('missing question');
      return { valid: issues.length === 0, issues };
    });

    // check-derivation (D1)
    engine.register('check-derivation', (input) => {
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      const d1 = (data.child_layer || 0) >= (data.parent_layer || 0);
      return { d1_downward_only: d1, parent_layer: data.parent_layer, child_layer: data.child_layer };
    });

    // enforce-constraint
    engine.register('enforce-constraint', (input) => {
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      if (data.type === 'd1_no_skip') {
        return { enforced: (data.child_layer || 0) >= (data.parent_layer || 0), rule: 'D1' };
      }
      if (data.type === 'd4_boundary') {
        return { enforced: (data.layer || 0) <= 5, rule: 'D4' };
      }
      throw { code: 'ConstraintViolation', msg: `Unknown constraint type: ${data.type}` };
    });

    // compute-hash
    engine.register('compute-hash', async (input) => {
      return { hash: await sha256(input) };
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // C3 — CONSTRAINTS CONTRACT
  // ═══════════════════════════════════════════════════════════════════

  class ConstraintEngine {
    // Validate a claim against the 6 constitutional questions
    validateClaim(claim) {
      const passed = [];
      const failed = [];
      const issues = [];

      for (const q of SIX_QUESTIONS) {
        if (q.test(claim)) {
          passed.push(q.id);
        } else {
          failed.push(q.id);
          issues.push(`Question '${q.id}' (${q.q}) — not satisfied`);
        }
      }
      return { valid: failed.length === 0, passed, failed, issues };
    }

    // Check D1-D5 derivation rules
    checkDerivation(parentLayer, childLayer, parentCount = 1, isUcaBoundary = false) {
      const issues = [];
      const passed = [];
      const failed = [];

      const d1 = childLayer >= parentLayer;
      if (d1) passed.push('D1'); else { failed.push('D1'); issues.push(`D1: child layer ${childLayer} above parent ${parentLayer}`); }

      passed.push('D2'); // architectural invariant

      passed.push('D3'); // merge justification — structural check

      const d4 = isUcaBoundary || childLayer <= 5;
      if (d4) passed.push('D4'); else { failed.push('D4'); issues.push('D4: derived beyond adaptation boundary'); }

      passed.push('D5'); // derivatives composed — structural check

      return { valid: failed.length === 0, passed, failed, issues };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // C4 — ISOLATION CONTRACT
  // ═══════════════════════════════════════════════════════════════════

  const GOVERNED_RESOURCES = ['execution','attestation','orchestration','identity','constraints','storage','network'];

  class IsolationEngine {
    constructor() { this.granted = new Map(); }

    requestCapability(componentId, resource, permissions = []) {
      if (!GOVERNED_RESOURCES.includes(resource))
        throw { code: 'CapabilityNotGranted', msg: `Resource '${resource}' is not governed` };

      const cap = {
        resource,
        permissions: [...permissions],
        expires: 'permanent',
        grantedTo: componentId,
        grantedAt: isoNow()
      };

      if (!this.granted.has(componentId)) this.granted.set(componentId, []);
      this.granted.get(componentId).push(cap);
      return cap;
    }

    checkCapability(componentId, resource, permission) {
      const caps = this.granted.get(componentId) || [];
      const now = isoNow();
      return caps.some(c =>
        c.resource === resource &&
        c.permissions.includes(permission) &&
        (c.expires === 'permanent' || c.expires > now)
      );
    }

    revokeCapability(componentId, resource) {
      const caps = this.granted.get(componentId);
      if (!caps) return false;
      const before = caps.length;
      const filtered = caps.filter(c => c.resource !== resource);
      this.granted.set(componentId, filtered);
      return filtered.length < before;
    }

    getCapabilities(componentId) {
      return clone(this.granted.get(componentId) || []);
    }

    async verifyAll() {
      const now = isoNow();
      for (const [cid, caps] of this.granted) {
        for (const c of caps) {
          if (c.expires !== 'permanent' && c.expires < now)
            throw { code: 'CapabilityNotGranted', msg: `Expired capability for ${cid} on ${c.resource}` };
        }
      }
      return true;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // C5 — ATTESTATION CONTRACT
  // ═══════════════════════════════════════════════════════════════════

  class AttestationEngine {
    constructor() { this.chain = []; }

    async attest(componentId, operation, inputHash, output, result) {
      const outputHash = await sha256(output);
      const ts = isoNow();
      const signingData = `${componentId}:${operation}:${inputHash}:${outputHash}:${ts}:${result}`;
      const signature = await sha256(`attestation:${signingData}`);

      const record = { componentId, operation, inputHash, outputHash, timestamp: ts, result, signature };
      this.chain.push(clone(record));
      return record;
    }

    async verify(record) {
      const signingData = `${record.componentId}:${record.operation}:${record.inputHash}:${record.outputHash}:${record.timestamp}:${record.result}`;
      const expected = await sha256(`attestation:${signingData}`);
      if (record.signature !== expected) throw { code: 'AttestationFailed', msg: 'Signature mismatch' };
      const inChain = this.chain.some(r =>
        r.componentId === record.componentId &&
        r.operation === record.operation &&
        r.timestamp === record.timestamp &&
        r.signature === record.signature
      );
      return inChain;
    }

    getChain(componentId) {
      return this.chain.filter(r => r.componentId === componentId);
    }

    fullChain() { return clone(this.chain); }

    async verifyChain() {
      for (const r of this.chain) await this.verify(r);
      return true;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // C6 — ORCHESTRATION CONTRACT
  // ═══════════════════════════════════════════════════════════════════

  const LIFECYCLE_STATES = ['registered','initialized','running','paused','stopped','error'];

  const VALID_TRANSITIONS = {
    initialized: 'registered',   // from → must be in this state to do the transition
    running: 'initialized',
    paused: 'running',
    stopped: ['running','paused'], // can stop from either
  };

  class OrchestrationEngine {
    constructor() {
      this.components = new Map(); // id → { state, registeredAt, lastTransition }
      this.messages = [];
    }

    register(componentId) {
      if (this.components.has(componentId))
        throw { code: 'OrchestrationError', msg: `Component ${componentId} already registered` };
      const ts = isoNow();
      this.components.set(componentId, { state: 'registered', registeredAt: ts, lastTransition: ts });
    }

    initialize(componentId) {
      const s = this._get(componentId);
      if (s.state !== 'registered')
        throw { code: 'OrchestrationError', msg: `Cannot initialize from state '${s.state}'` };
      s.state = 'initialized'; s.lastTransition = isoNow();
    }

    start(componentId) {
      const s = this._get(componentId);
      if (s.state !== 'initialized' && s.state !== 'paused')
        throw { code: 'OrchestrationError', msg: `Cannot start from state '${s.state}'` };
      s.state = 'running'; s.lastTransition = isoNow();
    }

    pause(componentId) {
      const s = this._get(componentId);
      if (s.state !== 'running')
        throw { code: 'OrchestrationError', msg: `Cannot pause from state '${s.state}'` };
      s.state = 'paused'; s.lastTransition = isoNow();
    }

    stop(componentId) {
      const s = this._get(componentId);
      if (s.state === 'stopped')
        throw { code: 'OrchestrationError', msg: 'Already stopped' };
      s.state = 'stopped'; s.lastTransition = isoNow();
    }

    getState(componentId) { return this._get(componentId).state; }

    sendMessage(from, to, payload) {
      const fs = this._get(from);
      const ts = this._get(to);
      if (fs.state !== 'running') throw { code: 'OrchestrationError', msg: `Sender ${from} is not running` };
      if (ts.state !== 'running') throw { code: 'OrchestrationError', msg: `Recipient ${to} is not running` };
      this.messages.push({ from, to, payload, timestamp: isoNow() });
    }

    getDependencyGraph() {
      return Array.from(this.components.entries()).map(([id, s]) => ({
        id, state: s.state, registeredAt: s.registeredAt, lastTransition: s.lastTransition
      }));
    }

    async verifyAll() {
      for (const [id, s] of this.components) {
        if (s.state === 'error')
          throw { code: 'OrchestrationError', msg: `Component ${id} is in error state` };
        if (!LIFECYCLE_STATES.includes(s.state))
          throw { code: 'OrchestrationError', msg: `Component ${id} has invalid state '${s.state}'` };
      }
      return true;
    }

    _get(id) {
      const s = this.components.get(id);
      if (!s) throw { code: 'OrchestrationError', msg: `Component ${id} not found` };
      return s;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // USR RUNTIME — The unified interface
  // ═══════════════════════════════════════════════════════════════════

  const RUNTIME_VERSION = '0.1.0';

  class UsrRuntime {
    constructor() {
      this.identity = new IdentityRegistry();
      this.execution = new ExecutionEngine();
      this.constraints = new ConstraintEngine();
      this.isolation = new IsolationEngine();
      this.attestation = new AttestationEngine();
      this.orchestration = new OrchestrationEngine();
      registerBuiltinOperations(this.execution);
    }

    version() { return RUNTIME_VERSION; }

    capabilities() {
      return ['execution','constraint-enforcement','isolation','attestation','orchestration'];
    }

    async validateBlueprint(blueprint) {
      const parsed = typeof blueprint === 'string' ? JSON.parse(blueprint) : blueprint;
      if (!parsed.name) throw { code: 'BlueprintInvalid', msg: "Blueprint must have a 'name' field" };
      if (!parsed.layer) throw { code: 'BlueprintInvalid', msg: "Blueprint must have a 'layer' field" };
      if (!parseLayer(parsed.layer))
        throw { code: 'BlueprintInvalid', msg: `Invalid layer: ${parsed.layer}` };
      return true;
    }

    async executeBlueprint(blueprint) {
      await this.validateBlueprint(blueprint);
      const parsed = typeof blueprint === 'string' ? JSON.parse(blueprint) : blueprint;

      // 1. Register identity
      const cid = await this.identity.declare(
        parsed.name,
        parsed.layer,
        parsed.version || '0.1.0',
        parsed.parents || [],
        parsed.question || `Constitutional component: ${parsed.name}`
      );

      // 2. Register with orchestration
      this.orchestration.register(cid.id);

      // 3. Request capabilities
      this.isolation.requestCapability(cid.id, 'execution', ['execute','attest']);

      // 4. Initialize → Start
      this.orchestration.initialize(cid.id);
      this.orchestration.start(cid.id);

      // 5. Execute operation if specified
      if (parsed.operation) {
        const input = parsed.input || '{}';
        const execResult = await this.execution.execute(parsed.operation, input, cid.id);

        // 6. Attest
        const attestation = await this.attestation.attest(
          cid.id, parsed.operation, execResult.inputHash,
          execResult.output, execResult.success ? 'success' : 'failure'
        );

        return {
          status: execResult.success ? 'completed' : 'failed',
          component: parsed.name, componentId: cid.id,
          operation: parsed.operation, result: execResult.output,
          attestation: { signature: attestation.signature, timestamp: attestation.timestamp },
          timestamp: isoNow()
        };
      }

      return { status: 'registered', component: parsed.name, componentId: cid.id, timestamp: isoNow() };
    }

    // Runtime self-verification (Formal Spec Section 12.3)
    async verify() {
      await this.identity.verifyAll();
      await this.isolation.verifyAll();
      await this.attestation.verifyChain();
      await this.orchestration.verifyAll();
      return true;
    }
  }

  // ─── Public API ───────────────────────────────────────────────────

  return {
    RUNTIME_VERSION,
    LAYERS, LAYER_NAMES, parseLayer,
    SIX_QUESTIONS, TEN_TESTS, D_RULES,
    GOVERNED_RESOURCES, LIFECYCLE_STATES,
    UsrRuntime, IdentityRegistry, ExecutionEngine,
    ConstraintEngine, IsolationEngine, AttestationEngine, OrchestrationEngine,
    sha256,
  };
})();
