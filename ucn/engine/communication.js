// UCN — Communication Engine (authenticated constitutional event exchange)
const EVENT_TYPES_CN = ['Discovery', 'Message', 'StateUpdate', 'TrustAssertion', 'TrustRevocation', 'SyncRequest', 'SyncResponse'];

class CommunicationEngine {
  constructor(nodeEngine) { this.nodeEngine = nodeEngine; this.events = []; this.channels = new Map(); }

  async createEvent(sourceId, targetId, eventType, payload) {
    if (!EVENT_TYPES_CN.includes(eventType)) throw new Error(`EventError: Unknown type '${eventType}'`);
    const src = this.nodeEngine.getNode(sourceId);
    if (src.state !== NodeState.Active) throw new Error(`IdentityNotDeclared: Source not active`);
    if (targetId) this.nodeEngine.getNode(targetId);
    const prev = this.events.filter(e => e.sourceId === sourceId && e.targetId === targetId).pop();
    const ev = {
      id: await ucn_sha256(`event:${sourceId}:${targetId}:${eventType}:${ucn_ts()}`),
      sourceId, targetId, eventType, payload: payload || {},
      epoch: ucn_epoch(), timestamp: ucn_ts(),
      previousEventId: prev ? prev.id : null,
      signature: await ucn_sha256(`sign:${sourceId}:${eventType}:${JSON.stringify(payload||{})}`),
    };
    this.events.push(ev);
    window.dispatchEvent(new CustomEvent('ucn:comm:event', { detail: { id: ev.id, type: eventType } }));
    return ev;
  }

  verifyEvent(ev) {
    if (!ev.signature) throw new Error(`AuthenticationRequirement: Event ${ev.id} unsigned`);
    const src = this.nodeEngine.getNode(ev.sourceId);
    if (src.state === NodeState.Revoked) throw new Error(`IdentityNotDeclared: Source revoked`);
    return true;
  }

  getEventsBetween(nodeA, nodeB) {
    return this.events.filter(e =>
      (e.sourceId === nodeA && e.targetId === nodeB) ||
      (e.sourceId === nodeB && e.targetId === nodeA));
  }

  getEvents() { return this.events; }
}
window.CommunicationEngine = CommunicationEngine;
window.EVENT_TYPES_CN = EVENT_TYPES_CN;
