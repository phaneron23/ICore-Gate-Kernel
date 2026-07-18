// UCA — Communication Adapter Engine (constitutional messages → external channels)
class CommAdapterEngine {
  constructor(adapterEngine) { this.adapterEngine = adapterEngine; this.messages = []; this.sources = new Map(); }

  async send(adapterId, destination, message) {
    const a = this.adapterEngine.getAdapter(adapterId);
    if (a.domain !== 'communication') throw new Error(`InvalidDomain: Adapter not communication`);
    const msg = {
      id: await uca_sha256(`msg:${adapterId}:${destination}:${uca_ts()}`),
      adapterId, destination, message, timestamp: uca_ts(),
      signature: await uca_sha256(`sign:${JSON.stringify(message)}`),
    };
    this.messages.push(msg);
    window.dispatchEvent(new CustomEvent('uca:comm:sent', { detail: { id: msg.id } }));
    return msg;
  }

  async verifySource(adapterId, sourceId) {
    const known = this.sources.get(adapterId) || [];
    return known.includes(sourceId);
  }

  registerSource(adapterId, sourceId) {
    if (!this.sources.has(adapterId)) this.sources.set(adapterId, []);
    this.sources.get(adapterId).push(sourceId);
  }

  getMessages() { return this.messages; }
}
window.CommAdapterEngine = CommAdapterEngine;
