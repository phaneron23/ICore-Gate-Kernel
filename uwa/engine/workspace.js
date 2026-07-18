// UWA — Workspace Runtime (unified interface)
const UWA_VERSION = '0.1.0';

class WorkspaceRuntime {
  constructor() {
    this.component = new ComponentEngine();
    this.event = new EventEngine();
    this.execution = new UwaExecutionEngine();
    this.composition = new CompositionEngine();
  }
  version() { return UWA_VERSION; }

  async createComponent(name, config) {
    const comp = await this.component.create(name, config);
    await this.component.declare(comp.id, comp.interface, comp.contract);
    await this.component.validate(comp.id);
    return comp;
  }

  async executeEvent(componentId, eventType, eventName, payload) {
    const comp = this.component.getComponent(componentId);
    if (comp.lifecycle !== ComponentLifecycle.Running) {
      throw new Error(`ExecutionError: Component ${comp.name} not running (${comp.lifecycle})`);
    }
    const ev = { type: eventType, name: eventName, payload: payload || {} };
    return this.execution.execute(comp, ev, this);
  }

  async compose(parentId, childId, type) { return this.composition.addEdge(parentId, childId, type); }

  getStatus() {
    const all = this.component.list();
    return { version: this.version(), components: all.length,
      running: all.filter(c => c.lifecycle === ComponentLifecycle.Running).length,
      events: this.event.log.length, executions: this.execution.records.length,
      compositions: Array.from(this.composition.graph.values()).reduce((s, a) => s + a.length, 0) };
  }
}
window.WorkspaceRuntime = WorkspaceRuntime;
window.UWA_VERSION = UWA_VERSION;
