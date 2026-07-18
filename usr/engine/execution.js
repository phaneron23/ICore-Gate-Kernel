// USR/CoreFab — Execution Contract (C2)
// Constitutional Execution Engine — deterministic operation execution.

class ExecutionEngine {
  constructor() {
    this.registered = new Set();
    this.results = [];
    this._registerBuiltin();
  }

  _registerBuiltin() {
    ['validate-identity', 'check-derivation', 'enforce-constraint', 'compute-hash']
      .forEach(op => this.registered.add(op));
  }

  registerOperation(name) {
    this.registered.add(name);
    window.dispatchEvent(new CustomEvent('usr:execution:registered', { detail: { name } }));
  }

  async execute(operation, input, componentId) {
    if (!this.registered.has(operation)) {
      throw new Error(`ExecutionError: Operation '${operation}' is not registered`);
    }

    const inputHash = await sha256(typeof input === 'string' ? input : JSON.stringify(input));
    const ts = timestamp();
    let output, success = true, error = null;

    try {
      switch (operation) {
        case 'validate-identity':
          output = this._validateIdentity(input);
          break;
        case 'check-derivation':
          output = this._checkDerivation(input);
          break;
        case 'enforce-constraint':
          output = this._enforceConstraint(input);
          break;
        case 'compute-hash':
          output = { hash: await sha256(typeof input === 'string' ? input : JSON.stringify(input)) };
          break;
        default:
          output = {};
          error = `Unknown operation: ${operation}`;
          success = false;
      }
    } catch (e) {
      output = {};
      error = e.message;
      success = false;
    }

    const outputStr = JSON.stringify(output);
    const outputHash = await sha256(outputStr);

    const result = {
      operation, inputHash, output, outputHash,
      timestamp: ts, success, error,
      componentId: componentId || 'unknown',
    };

    this.results.push(result);
    window.dispatchEvent(new CustomEvent('usr:execution:complete', { detail: { result } }));
    return result;
  }

  _validateIdentity(input) {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    const issues = [];
    if (!data.name) issues.push('missing name');
    if (!data.layer) issues.push('missing layer');
    if (!data.question) issues.push('missing question');
    return { valid: issues.length === 0, issues };
  }

  _checkDerivation(input) {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    const parentLayer = data.parent_layer || 0;
    const childLayer = data.child_layer || 0;
    const d1Pass = childLayer >= parentLayer;
    return { d1_downward_only: d1Pass, parent_layer: parentLayer, child_layer: childLayer };
  }

  _enforceConstraint(input) {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    const type = data.type || '';
    switch (type) {
      case 'd1_no_skip': {
        const pass = (data.child_layer || 0) >= (data.parent_layer || 0);
        return { enforced: pass, rule: 'D1' };
      }
      case 'd4_boundary': {
        const pass = (data.layer || 0) <= 5;
        return { enforced: pass, rule: 'D4' };
      }
      default:
        throw new Error(`Unknown constraint type: ${type}`);
    }
  }

  listOperations() { return Array.from(this.registered); }
  getResults() { return this.results.slice(); }
}

window.ExecutionEngine = ExecutionEngine;
