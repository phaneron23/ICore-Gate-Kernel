// UWA — Component Engine
// The fundamental unit of constitutional existence.

const ComponentLifecycle = {
  Created: 'created', Declared: 'declared', Validated: 'validated',
  Initialized: 'initialized', Running: 'running',
  Suspended: 'suspended', Terminated: 'terminated',
};

const VALID_TRANSITIONS = {
  [ComponentLifecycle.Created]: [ComponentLifecycle.Declared, ComponentLifecycle.Terminated],
  [ComponentLifecycle.Declared]: [ComponentLifecycle.Validated, ComponentLifecycle.Terminated],
  [ComponentLifecycle.Validated]: [ComponentLifecycle.Initialized, ComponentLifecycle.Terminated],
  [ComponentLifecycle.Initialized]: [ComponentLifecycle.Running, ComponentLifecycle.Terminated],
  [ComponentLifecycle.Running]: [ComponentLifecycle.Suspended, ComponentLifecycle.Terminated],
  [ComponentLifecycle.Suspended]: [ComponentLifecycle.Running, ComponentLifecycle.Terminated],
  [ComponentLifecycle.Terminated]: [],
};

const COMPOSITION_TYPES = ['sequential', 'parallel', 'hierarchical', 'delegated'];

const EVENT_TYPES = ['lifecycle', 'data', 'control'];

async function uwa_sha256(data) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function uwa_ts() { return new Date().toISOString(); }

class ComponentEngine {
  constructor() { this.components = new Map(); this.sequenceCounter = 0; }

  async create(name, config = {}) {
    const id = await uwa_sha256(`component:${name}:${config.version || '0.1.0'}:${uwa_ts()}`);
    const comp = {
      id, name,
      lifecycle: ComponentLifecycle.Created,
      interface: config.interface || { operations: [], eventsEmitted: [], eventsConsumed: [], types: [] },
      contract: config.contract || { invariants: [], postconditions: [], preconditions: [], behavioral: [] },
      composition: config.composition || [],
      eventHandlers: config.eventHandlers || [],
      version: config.version || '0.1.0',
      state: config.initialState || {},
      executionHistory: [],
      createdAt: uwa_ts(),
    };
    this.components.set(id, comp);
    window.dispatchEvent(new CustomEvent('uwa:component:created', { detail: { id, name } }));
    return comp;
  }

  async declare(id, iface, contract) {
    const comp = this._get(id);
    this._transition(id, ComponentLifecycle.Declared);
    if (iface) comp.interface = { ...comp.interface, ...iface };
    if (contract) comp.contract = { ...comp.contract, ...contract };
    window.dispatchEvent(new CustomEvent('uwa:component:declared', { detail: { id } }));
    return comp;
  }

  async validate(id) {
    const comp = this._get(id);
    const issues = this._validateComponent(comp);
    if (issues.length > 0) throw new Error(`ValidationFailed: ${issues.join('; ')}`);
    this._transition(id, ComponentLifecycle.Validated);
    window.dispatchEvent(new CustomEvent('uwa:component:validated', { detail: { id } }));
    return true;
  }

  async initialize(id) {
    this._transition(id, ComponentLifecycle.Initialized);
    window.dispatchEvent(new CustomEvent('uwa:component:initialized', { detail: { id } }));
  }

  async start(id) {
    this._transition(id, ComponentLifecycle.Running);
    window.dispatchEvent(new CustomEvent('uwa:component:started', { detail: { id } }));
  }

  async suspend(id) {
    this._transition(id, ComponentLifecycle.Suspended);
    window.dispatchEvent(new CustomEvent('uwa:component:suspended', { detail: { id } }));
  }

  async resume(id) {
    const comp = this._get(id);
    if (comp.lifecycle !== ComponentLifecycle.Suspended) {
      throw new Error(`LifecycleViolation: Can only resume from Suspended, currently ${comp.lifecycle}`);
    }
    this._transition(id, ComponentLifecycle.Running);
    window.dispatchEvent(new CustomEvent('uwa:component:resumed', { detail: { id } }));
  }

  async terminate(id) {
    this._transition(id, ComponentLifecycle.Terminated);
    window.dispatchEvent(new CustomEvent('uwa:component:terminated', { detail: { id } }));
  }

  getState(id) { return this._get(id).lifecycle; }
  getComponent(id) { return this._get(id); }
  list() { return Array.from(this.components.values()); }
  listRunning() { return this.list().filter(c => c.lifecycle === ComponentLifecycle.Running); }

  _get(id) {
    const c = this.components.get(id);
    if (!c) throw new Error(`IdentityNotDeclared: Component ${id} not found`);
    return c;
  }

  _transition(id, target) {
    const comp = this._get(id);
    const valid = VALID_TRANSITIONS[comp.lifecycle] || [];
    if (!valid.includes(target)) {
      throw new Error(`LifecycleViolation: Cannot transition ${comp.name} from ${comp.lifecycle} to ${target}`);
    }
    comp.lifecycle = target;
  }

  _validateComponent(comp) {
    const issues = [];
    if (!comp.name) issues.push('Missing name');
    if (!comp.interface.operations.length && !comp.interface.eventsConsumed.length) {
      issues.push('Interface must declare at least one operation or consumed event');
    }
    return issues;
  }
}

window.ComponentEngine = ComponentEngine;
window.ComponentLifecycle = ComponentLifecycle;
window.COMPOSITION_TYPES = COMPOSITION_TYPES;
window.EVENT_TYPES = EVENT_TYPES;
window.uwa_sha256 = uwa_sha256;
window.uwa_ts = uwa_ts;
