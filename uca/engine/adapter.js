// UCA — Adapter Engine (core model)
const ADAPTER_DOMAINS = ['naming', 'serialization', 'execution', 'storage', 'communication'];

async function uca_sha256(d) { const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(d)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''); }
function uca_ts() { return new Date().toISOString(); }

class AdapterEngine {
  constructor() { this.adapters = new Map(); this.log = []; }

  async register(name, domain, profile, config) {
    if (!ADAPTER_DOMAINS.includes(domain)) throw new Error(`InvalidDomain: '${domain}'`);
    const id = await uca_sha256(`adapter:${name}:${domain}:${profile}:${uca_ts()}`);
    const adapter = {
      id, name, domain, profile,
      version: config.version || '0.1.0',
      layer: 5, dependencies: ['USR/CoreFab'],
      footprint: config.footprint || [],
      replaceability: config.replaceability || 'swappable',
      active: true,
      registeredAt: uca_ts(),
      operations: config.operations || [],
    };
    this.adapters.set(id, adapter);
    this.log.push({ action: 'register', adapterId: id, name, domain, timestamp: uca_ts() });
    window.dispatchEvent(new CustomEvent('uca:adapter:registered', { detail: { id, name, domain } }));
    return adapter;
  }

  async unregister(id) {
    const a = this._get(id);
    a.active = false;
    this.log.push({ action: 'unregister', adapterId: id, timestamp: uca_ts() });
    window.dispatchEvent(new CustomEvent('uca:adapter:unregistered', { detail: { id } }));
  }

  async replace(oldId, newName, newProfile, config) {
    const old = this._get(oldId);
    await this.unregister(oldId);
    return this.register(newName, old.domain, newProfile, config);
  }

  getAdapter(id) { return this._get(id); }
  list() { return Array.from(this.adapters.values()); }
  listActive() { return this.list().filter(a => a.active); }
  listByDomain(domain) { return this.listActive().filter(a => a.domain === domain); }
  getLog() { return this.log; }

  _get(id) { const a=this.adapters.get(id); if(!a) throw new Error(`AdapterNotDeclared: ${id}`); return a; }
}
window.AdapterEngine = AdapterEngine;
window.ADAPTER_DOMAINS = ADAPTER_DOMAINS;
window.uca_sha256 = uca_sha256;
window.uca_ts = uca_ts;
