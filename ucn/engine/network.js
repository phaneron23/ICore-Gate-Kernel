// UCN — Network Runtime (unified constitutional networking)
const UCN_VERSION = '0.1.0';

class NetworkRuntime {
  constructor() {
    this.node = new NodeEngine();
    this.discovery = new DiscoveryEngine(this.node);
    this.communication = new CommunicationEngine(this.node);
    this.sync = new SyncEngine(this.node);
    this.trust = new TrustEngine(this.node);
  }
  version() { return UCN_VERSION; }

  async joinNetwork(name, layer, capabilities) {
    const n = await this.node.createNode(name, layer, capabilities);
    await this.node.extendNetwork(n.coreId);
    await this.node.activateNetwork(n.coreId);
    return n;
  }

  getStatus() {
    const all = this.node.list();
    return { version: this.version(), nodes: all.length,
      active: all.filter(n => n.state === NodeState.Active).length,
      advertisements: this.discovery.getAdvertisements().length,
      events: this.communication.getEvents().length,
      deltas: this.sync.getDeltas().length,
      assertions: this.trust.getAssertions().length,
      revocations: this.trust.getRevocations().length };
  }
}
window.NetworkRuntime = NetworkRuntime;
window.UCN_VERSION = UCN_VERSION;
