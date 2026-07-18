// UCA — Storage Adapter Engine (constitutional state → external storage)
class StorageAdapterEngine {
  constructor(adapterEngine) { this.adapterEngine = adapterEngine; this.stores = new Map(); this.integrityChecks = []; }

  async store(adapterId, key, data) {
    const a = this.adapterEngine.getAdapter(adapterId);
    if (a.domain !== 'storage') throw new Error(`InvalidDomain: Adapter not storage`);
    const hash = await uca_sha256(JSON.stringify(data));
    const ref = { adapterId, key, hash, timestamp: uca_ts(), size: JSON.stringify(data).length };
    this.stores.set(`${adapterId}:${key}`, { data, ref });
    window.dispatchEvent(new CustomEvent('uca:storage:stored', { detail: ref }));
    return ref;
  }

  async retrieve(adapterId, key) {
    const entry = this.stores.get(`${adapterId}:${key}`);
    if (!entry) throw new Error(`StorageNotFound: ${key}`);
    return entry.data;
  }

  async verifyIntegrity(adapterId, key) {
    const entry = this.stores.get(`${adapterId}:${key}`);
    if (!entry) return false;
    const currentHash = await uca_sha256(JSON.stringify(entry.data));
    const valid = currentHash === entry.ref.hash;
    this.integrityChecks.push({ adapterId, key, valid, timestamp: uca_ts() });
    return valid;
  }

  getStores() { return Array.from(this.stores.entries()).map(([k,v]) => v.ref); }
  getIntegrityChecks() { return this.integrityChecks; }
}
window.StorageAdapterEngine = StorageAdapterEngine;
