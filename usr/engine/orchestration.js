// USR/CoreFab — Orchestration Contract (C6)
// Constitutional Orchestration Engine — lifecycle and communication.

const LifecycleState = {
  Registered: 'registered',
  Initialized: 'initialized',
  Running: 'running',
  Paused: 'paused',
  Stopped: 'stopped',
  Error: 'error',
};

const VALID_TRANSITIONS = {
  [LifecycleState.Registered]: [LifecycleState.Initialized, LifecycleState.Error],
  [LifecycleState.Initialized]: [LifecycleState.Running, LifecycleState.Error],
  [LifecycleState.Running]: [LifecycleState.Paused, LifecycleState.Stopped, LifecycleState.Error],
  [LifecycleState.Paused]: [LifecycleState.Running, LifecycleState.Stopped, LifecycleState.Error],
  [LifecycleState.Stopped]: [],
  [LifecycleState.Error]: [],
};

class OrchestrationEngine {
  constructor() {
    this.components = new Map();
    this.messages = [];
  }

  register(componentId) {
    if (this.components.has(componentId)) {
      throw new Error(`OrchestrationError: Component ${componentId} already registered`);
    }
    this.components.set(componentId, {
      state: LifecycleState.Registered,
      registeredAt: timestamp(),
      lastTransition: timestamp(),
    });
    window.dispatchEvent(new CustomEvent('usr:orchestration:registered', { detail: { componentId } }));
  }

  _transition(componentId, targetState) {
    const comp = this.components.get(componentId);
    if (!comp) throw new Error(`OrchestrationError: Component ${componentId} not found`);
    const valid = VALID_TRANSITIONS[comp.state] || [];
    if (!valid.includes(targetState)) {
      throw new Error(`OrchestrationError: Cannot transition ${componentId} from ${comp.state} to ${targetState}`);
    }
    comp.state = targetState;
    comp.lastTransition = timestamp();
    window.dispatchEvent(new CustomEvent('usr:orchestration:transition', { detail: { componentId, from: comp.state, to: targetState } }));
  }

  initialize(componentId) { this._transition(componentId, LifecycleState.Initialized); }
  start(componentId) { this._transition(componentId, LifecycleState.Running); }
  pause(componentId) { this._transition(componentId, LifecycleState.Paused); }
  stop(componentId) { this._transition(componentId, LifecycleState.Stopped); }

  getState(componentId) {
    const comp = this.components.get(componentId);
    if (!comp) throw new Error(`OrchestrationError: Component ${componentId} not found`);
    return comp.state;
  }

  sendMessage(from, to, payload) {
    const fromComp = this.components.get(from);
    const toComp = this.components.get(to);
    if (!fromComp) throw new Error(`OrchestrationError: Sender ${from} not found`);
    if (!toComp) throw new Error(`OrchestrationError: Recipient ${to} not found`);
    if (fromComp.state !== LifecycleState.Running) throw new Error(`OrchestrationError: Sender ${from} not running`);
    if (toComp.state !== LifecycleState.Running) throw new Error(`OrchestrationError: Recipient ${to} not running`);

    const msg = { from, to, payload, timestamp: timestamp() };
    this.messages.push(msg);
    window.dispatchEvent(new CustomEvent('usr:orchestration:message', { detail: { message: msg } }));
    return msg;
  }

  getMessages(componentId) {
    return this.messages.filter(m => m.to === componentId || m.from === componentId);
  }

  getDependencyGraph() {
    return Array.from(this.components.entries()).map(([id, state]) => ({
      id, state: state.state, registeredAt: state.registeredAt, lastTransition: state.lastTransition,
    }));
  }

  async verifyAll() {
    for (const [id, comp] of this.components) {
      if (comp.state === LifecycleState.Error) {
        throw new Error(`OrchestrationError: Component ${id} is in error state`);
      }
    }
    return true;
  }
}

window.OrchestrationEngine = OrchestrationEngine;
window.LifecycleState = LifecycleState;
