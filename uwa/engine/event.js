// UWA — Event Engine
class EventEngine {
  constructor() { this.queues = new Map(); this.counter = 0; this.log = []; }
  async emit(sourceId, targetId, type, payload) {
    if (!EVENT_TYPES.includes(type)) throw new Error(`EventError: Unknown type '${type}'`);
    const ev = { id: await uwa_sha256(`event:${this.counter}:${sourceId}:${targetId}:${uwa_ts()}`),
      sourceId, targetId, type, payload, timestamp: uwa_ts(), sequenceNumber: ++this.counter };
    if (!this.queues.has(targetId)) this.queues.set(targetId, []);
    this.queues.get(targetId).push(ev);
    this.log.push(ev);
    window.dispatchEvent(new CustomEvent('uwa:event:emitted', { detail: { event: ev } }));
    return ev;
  }
  consume(targetId) {
    const q = this.queues.get(targetId) || [];
    return q.shift() || null;
  }
  peek(targetId) { const q = this.queues.get(targetId) || []; return q[0] || null; }
  pending(targetId) { return (this.queues.get(targetId) || []).length; }
  getLog() { return this.log.slice(); }
}
window.EventEngine = EventEngine;
