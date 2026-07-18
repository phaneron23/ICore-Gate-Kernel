// UCA — Boundary Runtime (the constitutional boundary)
const UCA_VERSION = '0.1.0';

class BoundaryRuntime {
  constructor() {
    this.adapter = new AdapterEngine();
    this.naming = new NamingEngine(this.adapter);
    this.serialization = new SerializationEngine(this.adapter);
    this.execution = new ExecAdapterEngine(this.adapter);
    this.storage = new StorageAdapterEngine(this.adapter);
    this.communication = new CommAdapterEngine(this.adapter);
  }
  version() { return UCA_VERSION; }

  getStatus() {
    const all = this.adapter.list();
    return { version: this.version(), adapters: all.length,
      active: all.filter(a => a.active).length,
      byDomain: ADAPTER_DOMAINS.reduce((acc, d) => { acc[d] = all.filter(a => a.domain === d && a.active).length; return acc; }, {}),
      operations: this.adapter.getLog().length };
  }
}
window.BoundaryRuntime = BoundaryRuntime;
window.UCA_VERSION = UCA_VERSION;
