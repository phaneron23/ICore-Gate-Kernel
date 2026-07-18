// UCN — Discovery Engine (capability-based, not address-based)
const CAPABILITY_TYPES = ['execution', 'storage', 'communication', 'verification'];

class DiscoveryEngine {
  constructor(nodeEngine) { this.nodeEngine = nodeEngine; this.advertisements = []; this.queries = []; }

  async advertise(coreId, capabilities, ttl) {
    const node = this.nodeEngine.getNode(coreId);
    if (node.state !== NodeState.Active) throw new Error(`IdentityNotDeclared: Node not active`);
    for (const cap of capabilities) {
      if (!CAPABILITY_TYPES.includes(cap.type)) throw new Error(`CapabilityNotDeclared: Unknown capability '${cap.type}'`);
    }
    const adv = {
      id: await ucn_sha256(`adv:${coreId}:${ucn_ts()}`),
      coreId, capabilities, epoch: ucn_epoch(),
      timestamp: ucn_ts(), ttl: ttl || 3600,
      signature: await ucn_sha256(`sign:${coreId}:${JSON.stringify(capabilities)}`),
    };
    this.advertisements.push(adv);
    window.dispatchEvent(new CustomEvent('ucn:discovery:advertised', { detail: { id: adv.id } }));
    return adv;
  }

  async query(capabilityType, minTrust) {
    if (capabilityType !== 'any' && !CAPABILITY_TYPES.includes(capabilityType)) {
      throw new Error(`CapabilityNotDeclared: Unknown type '${capabilityType}'`);
    }
    const now = ucn_epoch();
    const results = this.advertisements.filter(adv => {
      if (now - (adv.epoch) > adv.ttl * 1000) return false;
      const node = this.nodeEngine.getNode(adv.coreId);
      if (node.state === NodeState.Revoked) return false;
      if (minTrust && TRUST_ORDER[node.trustLevel] < TRUST_ORDER[minTrust]) return false;
      if (capabilityType === 'any') return true;
      return adv.capabilities.some(c => c.type === capabilityType);
    });
    const query = { query: capabilityType, results: results.map(r => r.coreId), timestamp: ucn_ts() };
    this.queries.push(query);
    window.dispatchEvent(new CustomEvent('ucn:discovery:query', { detail: query }));
    return results;
  }

  getAdvertisements() { return this.advertisements; }
}
window.DiscoveryEngine = DiscoveryEngine;
window.CAPABILITY_TYPES = CAPABILITY_TYPES;
