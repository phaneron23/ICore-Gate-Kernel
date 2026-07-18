// UCN — Synchronization Engine (constraint-preserving state alignment)
class SyncEngine {
  constructor(nodeEngine) { this.nodeEngine = nodeEngine; this.states = new Map(); this.deltas = []; this.epochs = new Map(); this.conflicts = []; }

  initState(coreId, data) {
    const node = this.nodeEngine.getNode(coreId);
    if (node.state !== NodeState.Active) throw new Error(`IdentityNotDeclared: Node not active`);
    this.states.set(coreId, JSON.parse(JSON.stringify(data || {})));
    this.epochs.set(coreId, 0);
    return this.states.get(coreId);
  }

  getState(coreId) { return this.states.get(coreId); }

  async createDelta(coreId, changes) {
    const epoch = (this.epochs.get(coreId) || 0) + 1;
    const current = this.states.get(coreId) || {};
    const delta = {
      id: await ucn_sha256(`delta:${coreId}:${epoch}:${JSON.stringify(changes)}`),
      coreId, changes, epoch, timestamp: ucn_ts(),
      signature: await ucn_sha256(`sign:${coreId}:${epoch}:${JSON.stringify(changes)}`),
    };
    this.deltas.push(delta);
    return delta;
  }

  async applyDelta(coreId, delta) {
    const currentEpoch = this.epochs.get(coreId) || 0;
    if (delta.epoch < currentEpoch) {
      throw new Error(`EpochMonotonicity: Delta epoch ${delta.epoch} < current ${currentEpoch}`);
    }
    if (!delta.signature) throw new Error(`SignedDeltas: Delta unsigned`);
    const current = this.states.get(coreId) || {};
    const merged = { ...current, ...delta.changes };
    this.states.set(coreId, merged);
    this.epochs.set(coreId, delta.epoch);
    window.dispatchEvent(new CustomEvent('ucn:sync:applied', { detail: { coreId, epoch: delta.epoch } }));
    return merged;
  }

  async mergeDet(a, b) {
    if (a.epoch === b.epoch && JSON.stringify(a.changes) !== JSON.stringify(b.changes)) {
      this.conflicts.push({ a, b, timestamp: ucn_ts() });
      throw new Error(`ConflictDetected: Concurrent changes at epoch ${a.epoch}`);
    }
    return a.epoch >= b.epoch ? a : b;
  }

  detectConflict(deltaA, deltaB) {
    if (deltaA.epoch === deltaB.epoch && deltaA.coreId === deltaB.coreId &&
        JSON.stringify(deltaA.changes) !== JSON.stringify(deltaB.changes)) {
      return { conflict: true, deltaA, deltaB };
    }
    return { conflict: false };
  }

  getConflicts() { return this.conflicts; }
  getDeltas() { return this.deltas; }
  getEpoch(coreId) { return this.epochs.get(coreId) || 0; }
}
window.SyncEngine = SyncEngine;
