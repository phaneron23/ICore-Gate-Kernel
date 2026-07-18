// UWA — Execution Engine (deterministic state machine)
class UwaExecutionEngine {
  constructor() { this.records = []; }
  async execute(component, event, engine) {
    const source = component.lifecycle;
    const handler = component.eventHandlers.find(h => h.eventType === event.type && h.eventName === event.name);
    let target, result;
    if (handler) {
      target = handler.targetState;
      result = { handled: true, action: handler.action || 'none' };
    } else {
      target = source; result = { handled: false };
    }
    const inputHash = await uwa_sha256(JSON.stringify(event));
    const outputHash = await uwa_sha256(JSON.stringify({ target, result }));
    const record = { componentId: component.id, event: { type: event.type, name: event.name },
      sourceState: source, targetState: target, inputHash, outputHash,
      timestamp: uwa_ts(), success: true, error: null };
    component.executionHistory.push(record);
    this.records.push(record);
    window.dispatchEvent(new CustomEvent('uwa:execution:complete', { detail: { record } }));
    return record;
  }
  getHistory(componentId) { return this.records.filter(r => r.componentId === componentId); }
}
window.UwaExecutionEngine = UwaExecutionEngine;
