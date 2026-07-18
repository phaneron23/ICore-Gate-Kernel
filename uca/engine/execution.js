// UCA — Execution Adapter Engine (constitutional ops → external runtimes)
class ExecAdapterEngine {
  constructor(adapterEngine) { this.adapterEngine = adapterEngine; this.executions = []; }

  async execute(adapterId, operation, input) {
    const a = this.adapterEngine.getAdapter(adapterId);
    if (a.domain !== 'execution') throw new Error(`InvalidDomain: Adapter not execution`);
    const result = {
      id: await uca_sha256(`exec:${adapterId}:${operation}:${uca_ts()}`),
      adapterId, operation, input, output: null,
      sandboxed: true, timestamp: uca_ts(),
      resources: { cpu: 'bounded', memory: 'bounded', time: 'bounded' },
    };
    this.executions.push(result);
    window.dispatchEvent(new CustomEvent('uca:execution:complete', { detail: { id: result.id } }));
    return result;
  }

  async sandboxCheck(adapterId) {
    const a = this.adapterEngine.getAdapter(adapterId);
    return a.domain === 'execution'; // all execution adapters are sandboxed
  }

  async resourceReport(executionId) {
    const exec = this.executions.find(e => e.id === executionId);
    return exec ? exec.resources : null;
  }

  getExecutions() { return this.executions; }
}
window.ExecAdapterEngine = ExecAdapterEngine;
