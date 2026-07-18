// UCA — Naming Engine (constitutional identity → external names)
class NamingEngine {
  constructor(adapterEngine) { this.adapterEngine = adapterEngine; this.mappings = new Map(); this.bindings = new Map(); }

  async registerMapping(adapterId, entityId, externalName) {
    const a = this.adapterEngine.getAdapter(adapterId);
    if (a.domain !== 'naming') throw new Error(`InvalidDomain: Adapter not naming`);
    const key = `${adapterId}:${entityId}`;
    if (!this.mappings.has(key)) this.mappings.set(key, []);
    this.mappings.get(key).push({ name: externalName, registeredAt: uca_ts(), adapterId });
    window.dispatchEvent(new CustomEvent('uca:naming:registered', { detail: { entityId, externalName } }));
    return { entityId, externalName };
  }

  async resolve(adapterId, entityId) {
    const key = `${adapterId}:${entityId}`;
    return this.mappings.get(key) || [];
  }

  async verify(adapterId, externalName) {
    for (const [key, names] of this.mappings) {
      if (names.some(n => n.name === externalName)) {
        const entityId = key.split(':').slice(1).join(':');
        return { entityId, verified: true };
      }
    }
    return { entityId: null, verified: false };
  }

  getBindings() { return Array.from(this.bindings.entries()).map(([k,v]) => ({key:k, value:v})); }
}
window.NamingEngine = NamingEngine;
